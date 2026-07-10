import { Link, useNavigate } from "react-router";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import SlackIcon from "@/components/icons/SlackIcon";

import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import { useLoginUserMutation } from "@/util/api/mutations/users/loginUserMutation";
import { createUserLoginObjectPayload } from "@/util/api/functions/users";

import type { LoginUserRequest } from "@/types/api/users";

import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginUserMutation = useLoginUserMutation();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: LoginUserRequest = createUserLoginObjectPayload(
      email,
      password,
    );

    loginUserMutation.mutate(payload, {
      onSuccess: (user) => {
        queryClient.setQueryData(generateCurrentUserKey(), user);
        navigate("/users/profile");
      },
      onError: async () => {
        // @TODO: Add error handling
      },
    });
  }

  const labelClasses = "mb-2 block text-sm font-bold text-fg-primary";
  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-fg-primary placeholder:text-gray-400 focus:border-gray-500 focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-center text-4xl font-bold text-fg-primary">
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className="mt-8">
        <GoogleSsoButton />

        <button
          type="button"
          // @TODO: Wire up Slack OAuth
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-fg-primary transition-colors hover:bg-gray-50"
        >
          <SlackIcon className="h-5 w-5" />
          Continue with Slack
        </button>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-300" />
          <span className="text-sm text-gray-500">or</span>
          <span className="h-px flex-1 bg-gray-300" />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={inputClasses}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={inputClasses}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loginUserMutation.isPending}
          className="mt-8 w-full rounded-lg bg-gray-500 px-4 py-4 font-bold text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loginUserMutation.isPending ? "Signing in..." : "Continue"}
        </button>

        {loginUserMutation.isError && (
          <p className="mt-3 text-center text-error">
            Something went wrong with logging in.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-fg-primary">
        Don&apos;t have an account?{" "}
        <Link to="/users/signup" className="text-blue-600 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
