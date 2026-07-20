import SigninForm from "@/components/SigninForm/SigninForm";
import WordLogo from "@/components/Logo/WordLogo";

// Decorative emoji badges that float in the page margins around the sign-in
// card. Purely ornamental, so they are hidden from assistive tech and only
// shown on wide screens where there is room in the margins.
const EMOJI_BADGES = [
  { emoji: "🐂", position: "left-[19%] top-[27%]" },
  { emoji: "🌸", position: "right-[13%] top-[34%]" },
  { emoji: "🚂", position: "left-[7%] top-[55%]" },
  { emoji: "⛰️", position: "right-[8%] top-[57%]" },
];

export default function SigninPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-page">
      {/* Faint background grid lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[8%] w-px bg-line" />
        <div className="absolute inset-y-0 left-[33%] w-px bg-line" />
        <div className="absolute inset-y-0 left-[67%] w-px bg-line" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-line" />
        <div className="absolute inset-x-0 top-[13%] h-px bg-line" />
      </div>

      {/* Giant wordmark watermark, cut off at the bottom edge */}
      <WordLogo
        decorative
        className="pointer-events-none absolute -bottom-30 left-1/2 h-[33vh] w-auto max-w-none -translate-x-1/2 text-[#EDE2D1]"
      />

      {/* Floating emoji badges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        {EMOJI_BADGES.map(({ emoji, position }) => (
          <div
            key={emoji}
            className={`absolute flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-line bg-surface text-[30px] shadow-[0px_10px_24px_-4px_#66381A29] ${position}`}
          >
            {/* leading-[0] collapses the line box so flex centers the glyph
                itself rather than the baseline-aligned text line */}
            <span className="block leading-[0]">{emoji}</span>
          </div>
        ))}
      </div>

      {/* Top-left brand wordmark */}
      <div className="relative z-10 px-8 py-8 pl-16 pt-12 sm:px-12 sm:py-10 sm:pl-28 sm:pt-16">
        <WordLogo className="h-7 text-[#3D2114] sm:h-8" />
      </div>

      {/* Centered sign-in content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-24">
        <SigninForm />
      </div>
    </div>
  );
}
