import GoogleSsoButton from "@/components/auth/GoogleSsoButton";

export default function SigninForm() {
  return (
    <div className="flex w-[55vw] max-w-none translate-y-12 flex-col items-center text-center">
      <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-4xl lg:text-5xl">
        Good days at the office happen together.
      </h1>

      <div className="mx-auto mt-10 max-w-2xl">
        <p className="text-base font-bold text-fill sm:text-lg">
          Make the most of your in-office days by seeing who&rsquo;ll be there.
        </p>
        <p className="mt-1 text-base text-fill/85 sm:text-lg">
          Sign in with Google to get started or continue with your existing
          account.
        </p>
      </div>

      <GoogleSsoButton className="mt-12 w-auto rounded-full border-2 border-line bg-surface px-8 py-3.5 text-base font-bold shadow-card hover:border-line hover:bg-surface-sunken" />
    </div>
  );
}
