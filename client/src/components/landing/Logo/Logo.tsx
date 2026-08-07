import { cn } from "@/util/cn";

interface LogoProps {
  className?: string;
  // When true, the mark is treated as purely decorative (e.g. a background
  // watermark) and hidden from assistive tech instead of announcing "Hearth".
  decorative?: boolean;
}

// The Hearth brand mark. Rendered as inline SVG (rather than an `<img>` to
// `client/public/favicon.svg`, which is the same shape at a fixed terracotta)
// for the same reason WordLogo is: the path uses `currentColor`, so the mark
// takes whatever text color the surrounding context sets — the hero watermark
// needs it in cream, not brand terracotta. The default `text-strong` is the
// exact fill baked into the favicon, so callers that set no color get the mark
// they would have gotten from the asset.
export default function Logo({ className, decorative }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 29"
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Hearth"}
      className={cn("h-16 w-auto text-strong", className)}
    >
      <path d="M0.0287152 0.0119713C2.07143 -0.00106767 4.1321 0.0337927 6.17098 0.0071456C6.22243 3.77263 6.1755 7.62109 6.18111 11.3929L15.795 11.3952C15.757 9.99858 15.7909 8.38261 15.793 6.97074L15.7948 0.0161253C17.7138 -0.0243122 19.7021 0.0260862 21.6315 0.00965459C21.6414 0.81334 21.6438 1.61709 21.6386 2.42083L21.6436 7.88863L21.6442 21.7586C21.6418 23.8221 21.6061 25.9995 21.6431 28.0586C19.3246 28.1045 16.9859 28.0394 14.6655 28.0631C14.2935 28.0668 13.9266 28.0473 13.5543 28.0751C13.7315 27.7615 13.9378 27.4679 14.1277 27.1599C14.7562 26.0492 15.1976 25.1327 15.3533 23.8376C15.6157 21.6562 14.8452 19.6467 13.3327 18.08C12.8238 17.5528 12.1684 17.0486 11.7166 16.4892C11.0323 15.6419 10.8402 14.6677 10.9724 13.5953C10.3316 13.9416 9.82117 14.4301 9.41814 15.0366C7.7422 17.5586 9.81423 19.4572 9.29788 20.7763C9.25979 20.8737 9.19428 20.9636 9.09567 21.0056C8.97429 21.0573 8.8329 21.0183 8.71671 20.9715C7.76152 20.5873 7.06388 19.7727 6.67544 18.8421C5.29283 21.1606 6.18948 24.1224 7.22336 26.4114C7.48144 26.9826 7.81057 27.5121 8.1117 28.0608C6.21751 28.089 4.29457 28.0431 2.39814 28.0631C1.61285 28.0711 0.797088 28.0466 0.0148799 28.0746C-0.0138668 25.6283 0.0120538 23.1349 0.0120038 20.6844L0.0123284 6.44169L0.0115444 1.71448C0.0114321 1.44626 -0.0235006 0.198142 0.0287152 0.0119713Z" />
    </svg>
  );
}
