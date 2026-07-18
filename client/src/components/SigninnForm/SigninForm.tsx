import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";
import HearthWordmark from "@/components/HearthWordmark/HearthWordmark";

export default function SigninForm() {
  return (
    <div className="flex w-full max-w-[520px] flex-col items-center text-center">
      <div className="flex flex-row items-center gap-3 bg-[#c85a26] px-10 py-8">
        <span className="text-[2rem] font-bold leading-none text-white">
          Welcome to
        </span>
        <HearthWordmark className="h-8" />
      </div>

      <p className="mt-6 text-base leading-relaxed text-fg-muted sm:text-lg">
        Find more opportunities to connect in person. Sign in with Google to get
        started or continue with your existing account.
      </p>

      <GoogleSsoButton className="mt-10 w-auto rounded-full px-6 font-bold shadow-sm" />
    </div>
  );
}
