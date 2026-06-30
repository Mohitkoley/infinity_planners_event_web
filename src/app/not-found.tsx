import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-luxury-dark text-white flex items-center justify-center px-6 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.82))]"></div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/70 to-transparent"></div>
      <section className="relative z-10 w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border border-luxury-gold/60 bg-black/30 text-luxury-gold shadow-[0_0_44px_rgba(212,175,55,0.16)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-9 w-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4h10l-1.1 6.1A4 4 0 0 1 12 13.4a4 4 0 0 1-3.9-3.3L7 4Z" />
            <path d="M8.5 8h7" />
            <path d="M12 13.5V19" />
            <path d="M9 20h6" />
          </svg>
        </div>
        <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.35em] text-luxury-gold">
          Page Not Found
        </p>
        <h1 className="mb-6 font-serif text-4xl leading-tight md:text-6xl">
          This event space is not on the guest list.
        </h1>
        <p className="mx-auto mb-10 max-w-xl font-sans text-sm leading-7 text-white/70">
          The address you entered does not match an available page. Return to the Infinity Planners landing page to continue exploring our services.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-luxury-gold bg-luxury-gold px-8 py-4 font-sans text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white hover:border-white"
        >
          Back to Landing Page
        </Link>
      </section>
    </main>
  );
}
