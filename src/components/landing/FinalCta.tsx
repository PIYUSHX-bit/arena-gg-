export function FinalCta() {
  return (
    <section className="text-center px-[5vw] py-36 border-t border-line bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(255,74,28,0.08),transparent)]">
      <h2 className="font-display font-bold uppercase text-[34px] md:text-[64px] max-w-[700px] mx-auto mb-5 leading-tight">
        The Zone Is Closing.
        <br />
        Get In Before It Does.
      </h2>
      <p className="text-muted mb-9">
        Free registration takes under a minute. First match tonight.
      </p>
      <a
        href="#tournaments"
        className="inline-block bg-ember text-base font-semibold text-[15px] px-8 py-[15px] rounded shadow-[0_0_30px_rgba(255,74,28,0.3)] transition-transform hover:-translate-y-0.5"
      >
        Register Your Squad
      </a>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="px-[5vw] py-8 flex justify-between items-center flex-wrap gap-3 border-t border-line text-muted text-[13px]">
      <div className="flex items-center gap-2.5">
        <div className="relative w-[22px] h-[22px] rounded-full border-2 border-ember">
          <span className="absolute inset-[4px] rounded-full bg-ember" />
        </div>
        <span className="font-display font-semibold text-base">
          ARENA<span className="text-ember">.GG</span>
        </span>
      </div>
      <div>© 2026 Arena.gg — Not affiliated with Garena or Free Fire.</div>
    </footer>
  );
}
