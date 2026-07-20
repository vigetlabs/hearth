import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";
import Logo from "@/components/Logo/Logo";
import WordLogo from "@/components/Logo/WordLogo";

export default function SigninForm() {
  return (
    <div className="flex w-full max-w-[520px] flex-col items-center text-center">
      <Logo className="h-28 w-28" />

      <h1 className="mt-16 flex flex-wrap items-center justify-center gap-x-3 text-4xl font-bold text-fg sm:text-5xl">
        Welcome to
        <WordLogo className="h-7 sm:h-9" />
      </h1>

      <p className="mt-6 text-base leading-relaxed text-fg-muted sm:text-lg">
        Find more opportunities to connect in person. Sign in with Google to get
        started or continue with your existing account.
      </p>

      <GoogleSsoButton className="mt-10 w-auto rounded-full px-6 font-bold shadow-sm" />
    </div>
  );
}
