import { Link, useNavigate } from "react-router";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import { useLoginUserMutation } from "@/util/api/mutations/users/loginUserMutation";
import { createUserLoginObjectPayload } from "@/util/api/functions/users";

import {
  validateEmail,
  validateRequiredPassword,
} from "@/util/auth/validation";

import {
  createFieldHandlers,
  labelClasses,
  inputClasses,
} from "@/util/forms/formFieldHandlers";

import type { LoginUserRequest } from "@/types/api/users";

import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

interface FieldErrors {
  email: string | null;
  password: string | null;
}

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

  const fieldHandlers = createFieldHandlers(setErrors);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-center text-4xl font-bold text-fg-primary">
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className="mt-8">
        <GoogleSsoButton />

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
