import { Link, useNavigate } from "react-router";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import SlackIcon from "@/components/icons/SlackIcon";

import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import { useLoginUserMutation } from "@/util/api/mutations/users/loginUserMutation";
import { createUserLoginObjectPayload } from "@/util/api/functions/users";

import {
  validateEmail,
  validateRequiredPassword,
} from "@/util/auth/validation";

import type { LoginUserRequest } from "@/types/api/users";

import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

type FieldErrors = {
  email: string | null;
  password: string | null;
};

const NO_ERRORS: FieldErrors = {
  email: null,
  password: null,
};

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginUserMutation = useLoginUserMutation();

  function validate(): FieldErrors {
    return {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
    };
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some((error) => error !== null);
    if (hasErrors) {
      return;
    }

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

  function fieldHandlers<K extends keyof FieldErrors>(
    key: K,
    setValue: (value: string) => void,
    validate: (value: string) => string | null,
  ) {
    return {
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        // only re-validate once the field is already in an error state
        setErrors((prev) =>
          prev[key] ? { ...prev, [key]: validate(event.target.value) } : prev,
        );
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        setErrors((prev) => ({ ...prev, [key]: validate(event.target.value) }));
      },
    };
  }

  const labelClasses = "mb-2 block text-sm font-bold text-fg-primary";
  function inputClasses(hasError: boolean): string {
    const borderClasses = hasError
      ? "border-error focus:border-error"
      : "border-gray-300 focus:border-gray-500";

    return `w-full rounded-lg border px-4 py-3 text-fg-primary placeholder:text-gray-400 focus:outline-none ${borderClasses}`;
  }

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
            className={inputClasses(errors.email !== null)}
            aria-invalid={errors.email !== null}
            value={email}
            {...fieldHandlers("email", setEmail, validateEmail)}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-error">{errors.email}</p>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={inputClasses(errors.password !== null)}
            aria-invalid={errors.password !== null}
            value={password}
            {...fieldHandlers(
              "password",
              setPassword,
              validateRequiredPassword,
            )}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-error">{errors.password}</p>
          )}
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
