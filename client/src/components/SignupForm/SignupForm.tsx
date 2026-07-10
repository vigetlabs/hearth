import { Link, useNavigate } from "react-router";
import { useState } from "react";

import SlackIcon from "@/components/icons/SlackIcon";

import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import { useCreateUserMutation } from "@/util/api/mutations/users/createUserMutation";
import { createUserObjectPayload } from "@/util/api/functions/users";

import type { CreateUserRequest } from "@/types/api/users";

export default function SignupForm() {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const createUserMutation = useCreateUserMutation();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateUserRequest = createUserObjectPayload(
      email,
      firstName,
      lastName,
      password,
    );

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        // Head into the office picker directly after the account is created.
        navigate("/users/office");
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
        Sign up
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className={labelClasses}>
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              placeholder="Enter your name"
              className={inputClasses}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="last-name" className={labelClasses}>
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Enter your last name"
              className={inputClasses}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
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
          disabled={createUserMutation.isPending}
          className="mt-8 w-full rounded-lg bg-gray-500 px-4 py-4 font-bold text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createUserMutation.isPending ? "Creating account..." : "Sign up"}
        </button>

        {createUserMutation.isError && (
          <p className="mt-3 text-center text-error">
            Something went wrong creating your account.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-fg-primary">
        Already have an account?{" "}
        <Link to="/users/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
