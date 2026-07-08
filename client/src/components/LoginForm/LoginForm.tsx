import { useState } from "react";

import { useLoginUserMutation } from "@/util/api/mutations/users/loginUserMutation";
import type { LoginUserRequest } from "@/types/api/users";
import { createUserLoginObjectPayload } from "@/util/api/functions/users";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const loginUserMutation = useLoginUserMutation();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: LoginUserRequest = createUserLoginObjectPayload(
      email,
      password,
    );

    loginUserMutation.mutate(payload, {
      onSuccess: (user) => {
        // @TODO: Add more functionality
        console.log(user);
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
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button type="submit" disabled={loginUserMutation.isPending}>
        {loginUserMutation.isPending ? "Logging in..." : "Log in"}
      </button>

      {loginUserMutation.isError && <p>Something went wrong with logging.</p>}
    </form>
  );
}
