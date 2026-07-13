import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

import SlackIcon from "@/components/icons/SlackIcon";

import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import { DEFAULT_HERO_IMAGE } from "@/components/OfficePicker/heroImage";

import { useCreateUserMutation } from "@/util/api/mutations/users/createUserMutation";
import { createUserObjectPayload } from "@/util/api/functions/users";

import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validateSignupPassword,
} from "@/util/auth/validation";

import type { CreateUserRequest } from "@/types/api/users";

type FieldErrors = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
};

const NO_ERRORS: FieldErrors = {
  firstName: null,
  lastName: null,
  email: null,
  password: null,
};

export default function SignupForm() {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);

  const navigate = useNavigate();

  const createUserMutation = useCreateUserMutation();

  // The office picker is the next step after signup. Warm its default hero into
  // cache now, while the user fills out the form, so that screen paints the
  // image instantly instead of showing a gray placeholder while it downloads.
  useEffect(() => {
    const image = new Image();
    image.src = DEFAULT_HERO_IMAGE;
  }, []);

  function validate(): FieldErrors {
    return {
      firstName: validateFirstName(firstName),
      lastName: validateLastName(lastName),
      email: validateEmail(email),
      password: validateSignupPassword(password),
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

    const payload: CreateUserRequest = createUserObjectPayload(
      email,
      firstName,
      lastName,
      password,
    );

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/users/office");
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
              className={inputClasses(errors.firstName !== null)}
              aria-invalid={errors.firstName !== null}
              value={firstName}
              {...fieldHandlers("firstName", setFirstName, validateFirstName)}
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-error">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="last-name" className={labelClasses}>
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              placeholder="Enter your last name"
              className={inputClasses(errors.lastName !== null)}
              aria-invalid={errors.lastName !== null}
              value={lastName}
              {...fieldHandlers("lastName", setLastName, validateLastName)}
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-error">{errors.lastName}</p>
            )}
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
            {...fieldHandlers("password", setPassword, validateSignupPassword)}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-error">{errors.password}</p>
          )}
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
