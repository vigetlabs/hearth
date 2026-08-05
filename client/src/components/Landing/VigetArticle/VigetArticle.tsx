import { ARTICLE_URL } from "@/components/Landing/links";

import "./VigetArticle.css";

const INTERNS = [
  {
    name: "Silvana Martinez",
    role: "Product Design Intern",
    photo: "/images/landing/Silvana_Portrait_2026.jpg",
  },
  {
    name: "Sam Brothers",
    role: "JavaScript Developer Intern",
    photo: "/images/landing/Sam_Portrait_2026.jpg",
  },
  {
    name: "Ryan Dioneda",
    role: "Application Developer Intern",
    photo: "/images/landing/Ryan_Portrait_2026.jpg",
  },
];

// Viget article section of the sign-in page, sitting between the Slack section
// and the sign-off card — the pitch for the write-up on the left, the three
// people who built the thing on the right.
//
// The deep brown Slack panel ends above this, so the section comes back to the
// page's cream and stays there through the sign-off card below it.
export default function VigetArticle() {
  return (
    <section
      id="viget-article"
      className="article-section flex justify-center bg-page px-4 py-24 sm:py-32"
    >
      {/* Same frame as the Slack section above, so the two panels line up down
          the page. The sign-off card below shares it as well, which is what
          puts its left edge on the eyebrow's. */}
      <div className="flex w-full max-w-[71rem] flex-col gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        {/* The copy column. Left-aligned at every size, like the Slack column
            above: it reads as a column beside the portraits rather than as a
            header over them, and staying left-aligned once the two stack holds
            it flush with the grid's own left edge. */}
        <div className="lg:w-[38%] lg:shrink-0">
          <p className="article-eyebrow font-semibold uppercase tracking-[0.22em] text-strong">
            Article
          </p>

          <h2 className="article-heading mt-6 font-bold leading-[1.15] tracking-tight text-fg">
            Want to see more?
          </h2>

          {/* Measure is set in VigetArticle.css, off the body's own size, so
              this holds the mock's two lines as the type scales. */}
          <p className="article-body mt-6 font-medium leading-[1.5] text-fg-warm">
            Hearth is a three-week intern sprint project created by
            Viget&rsquo;s 2026 intern cohort.
          </p>

          {/* Points at the published write-up on viget.com. It leaves the app,
              so it opens in its own tab and leaves the sign-in page where it is.W

              Every dimension is in `em` off `.article-cta`, so the pill grows
              and shrinks as one piece with its label rather than needing its own
              breakpoints. The border stays in px: a hairline reads the same at
              any size, and scaling it would only thicken the outline on wide
              screens. */}
          <p className="mt-8">
            <a
              href={ARTICLE_URL}
              target="_blank"
              rel="noreferrer"
              className="article-cta inline-flex cursor-pointer items-center rounded-full border-[1.5px] border-fg px-[1.9em] py-[1em] font-bold leading-none text-fg transition-colors hover:bg-surface-sunken"
            >
              Read Article
            </a>
          </p>
        </div>

        {/* The cohort. Three even columns at every size. 
            The captions run wider than the portraits above them, so
            the photo is capped and centered in its column while the names and
            roles get the full cell. */}
        <ul className="grid grid-cols-3 gap-x-4 sm:gap-x-6 lg:w-[54%]">
          {INTERNS.map(({ name, role, photo }) => (
            <li key={name} className="flex flex-col items-center text-center">
              {/* `alt=""` because the name and role are right there in the two
                  lines below: describing the photo as well would only read the
                  same person out twice. */}
              <img
                src={photo}
                alt=""
                className="aspect-square w-full max-w-[10.25rem] object-cover"
              />

              <p className="article-name mt-4 font-bold leading-[1.35] text-fg-warm">
                {name}
              </p>

              <p className="article-role mt-1 font-medium leading-[1.35] text-fg-warm">
                {role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
