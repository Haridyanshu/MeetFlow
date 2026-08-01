const companies = [
  "Northwind",
  "Quantica",
  "Hexlab",
  "Acme Corp",
  "Globex",
  "Vertex",
  "Umbra",
  "Nova Labs",
];

export function TrustedBy() {
  const row = [...companies, ...companies];

  return (
    <section aria-label="Trusted by leading teams" className="relative py-16">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by fast-moving teams
        </p>
      </div>
      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div
          className="flex w-max items-center gap-16 animate-[marquee_38s_linear_infinite] hover:[animation-play-state:paused]"
          aria-hidden
        >
          {row.map((company, i) => (
            <span
              key={`${company}-${i}`}
              className="whitespace-nowrap text-lg font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
