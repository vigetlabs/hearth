import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

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

import {
  createFieldHandlers,
  labelClasses,
  inputClasses,
} from "@/util/forms/formFieldHandlers";

import type { CreateUserRequest } from "@/types/api/users";

interface FieldErrors {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
}

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

  const fieldHandlers = createFieldHandlers(setErrors);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-center text-4xl font-bold text-fg">Sign up</h1>

      <form onSubmit={handleSubmit} className="mt-8">
        <GoogleSsoButton />

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-line-strong" />
          <span className="text-sm text-fg-subtle">or</span>
          <span className="h-px flex-1 bg-line-strong" />
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
          className="mt-8 w-full rounded-lg bg-fill px-4 py-4 font-bold text-fg-inverse transition-colors hover:bg-fill-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createUserMutation.isPending ? "Creating account..." : "Sign up"}
        </button>

        {createUserMutation.isError && (
          <p className="mt-3 text-center text-error">
            Something went wrong creating your account.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-fg">
        Already have an account?{" "}
        <Link to="/users/login" className="text-link underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
