import { useNavigate } from "react-router";
import { useState } from "react";

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
        // LOG RIGHT NOW TO DO SOMETHING
        // @TODO: Add more functionality
        navigate("/users/login");
      },
      onError: async () => {
        // @TODO: Add error handling
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="first-name">First name</label>
        <input
          id="first-name"
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="last-name">Last name</label>
        <input
          id="last-name"
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? "Creating account..." : "Sign up"}
      </button>

      {createUserMutation.isError && (
        <p>Something went wrong creating your account.</p>
      )}
    </form>
  );
}
