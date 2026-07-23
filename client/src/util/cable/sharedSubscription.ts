import type { Subscription } from "@rails/actioncable";

import { cable } from "./cable";

/*
 * A thin ref-counting layer over a single shared Action Cable consumer.
 *
 * Every channel hook used to call `cable.subscriptions.create(...)` in a
 * `useEffect` and `subscription.unsubscribe()` in its cleanup. Under React
 * StrictMode (dev only) every effect runs mount -> cleanup -> mount
 * synchronously, which fired an interleaved subscribe/unsubscribe/subscribe
 * burst for the SAME identifier on the SAME consumer. That burst races the
 * WebSocket open and the server's subscription bookkeeping, and can leave a
 * channel torn down and never re-confirmed -> the client `connected()` never
 * fires. See useOfficePlanning / useOfficeAttending.
 *
 * `subscribeShared` removes the race instead of trying to win it: it keeps ONE
 * underlying subscription per identifier, fans its callbacks out to every
 * listener, and DEFERS teardown by a tick so the StrictMode remount reuses the
 * live subscription instead of recreating it.
 */

type ChannelParams = Record<string, unknown> & { channel: string };

interface SharedListener<M> {
  connected?: () => void;
  disconnected?: () => void;
  rejected?: () => void;
  received?: (message: M) => void;
}

export interface SharedSubscription {
  perform: (action: string, data?: Record<string, unknown>) => void;
  unsubscribe: () => void;
}

interface Entry {
  subscription: Subscription;
  listeners: Set<SharedListener<unknown>>;
  connected: boolean;
  teardownTimer: ReturnType<typeof setTimeout> | null;
}

const registry = new Map<string, Entry>();

export function subscribeShared<M>(
  params: ChannelParams,
  listener: SharedListener<M>,
): SharedSubscription {
  const identifier = JSON.stringify(params);
  let entry = registry.get(identifier);

  if (!entry) {
    const created: Entry = {
      subscription: undefined as unknown as Subscription,
      listeners: new Set(),
      connected: false,
      teardownTimer: null,
    };

    created.subscription = cable.subscriptions.create(params, {
      connected() {
        created.connected = true;
        created.listeners.forEach((current) => current.connected?.());
      },
      disconnected() {
        created.connected = false;
        created.listeners.forEach((current) => current.disconnected?.());
      },
      rejected() {
        created.connected = false;
        created.listeners.forEach((current) => current.rejected?.());
      },
      received(message: M) {
        created.listeners.forEach((current) => current.received?.(message));
      },
    });

    entry = created;
    registry.set(identifier, entry);
  }

  const activeEntry = entry;

  // A (re)mount is reusing this subscription — cancel any pending teardown.
  if (activeEntry.teardownTimer !== null) {
    clearTimeout(activeEntry.teardownTimer);
    activeEntry.teardownTimer = null;
  }

  const typedListener = listener as SharedListener<unknown>;
  activeEntry.listeners.add(typedListener);

  // If the underlying subscription already confirmed before this listener
  // joined (e.g. a StrictMode remount reusing a live subscription), replay
  // `connected` so the listener still learns the state. Deferred to a microtask
  // so the caller has its handle assigned before its callback runs.
  if (activeEntry.connected) {
    queueMicrotask(() => {
      if (activeEntry.listeners.has(typedListener)) {
        listener.connected?.();
      }
    });
  }

  return {
    perform(action, data = {}) {
      activeEntry.subscription.perform(action, data);
    },
    unsubscribe() {
      activeEntry.listeners.delete(typedListener);

      if (activeEntry.listeners.size > 0) {
        return;
      }

      // Defer the real teardown so a synchronous StrictMode unmount -> remount
      // doesn't tear down a subscription we're about to reuse.
      activeEntry.teardownTimer = setTimeout(() => {
        if (activeEntry.listeners.size === 0) {
          activeEntry.subscription.unsubscribe();
          registry.delete(identifier);
        }
      }, 0);
    },
  };
}
