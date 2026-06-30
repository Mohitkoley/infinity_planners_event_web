"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateLoginAction } from "@/app/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.015;
      const y = (e.clientY - window.innerHeight / 2) * 0.015;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const authenticatedUser = await validateLoginAction(email, password);
      if (authenticatedUser) {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 800);
      } else {
        setLoading(false);
        setError("Invalid administrative credentials.");
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      setLoading(false);
      setError("An error occurred during authentication.");
    }
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen flex flex-col items-center justify-center p-6 antialiased relative overflow-hidden">
      {/* Decorative Parallax Background Elements */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none -z-10 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-fixed/30 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* Main card */}
      <main className="w-full max-w-[480px] stagger-in">
        {/* Header / Logo */}
        <div className="text-center mb-12">
          <Link href="/">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight mb-2 hover:opacity-80 transition-opacity">
              Infinity Planners
            </h1>
          </Link>
          <p className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em]">
            Event Software
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md border border-outline-variant p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-none">
          <div className="mb-10 text-center">
            <h2 className="font-headline-md text-headline-md text-deep-charcoal mb-2">Admin Portal</h2>
            <div className="w-12 h-0.5 bg-primary-container mx-auto"></div>
            {error && (
              <p className="text-error text-xs font-sans mt-4 uppercase tracking-widest">{error}</p>
            )}
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="group">
              <label 
                className="block font-label-caps text-label-caps text-deep-charcoal mb-3 uppercase tracking-widest group-focus-within:text-primary transition-colors" 
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 focus:border-primary-container text-body-md font-body-md text-on-surface placeholder:text-secondary/30 transition-colors duration-300 rounded-none"
                  id="email"
                  name="email"
                  placeholder="executive@infinityplanners.nyc"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
                <span className="material-symbols-outlined absolute right-0 top-3 text-outline opacity-40 group-focus-within:text-primary-container group-focus-within:opacity-100 transition-all text-[20px]">
                  mail
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-end mb-3">
                <label 
                  className="block font-label-caps text-label-caps text-deep-charcoal uppercase tracking-widest group-focus-within:text-primary transition-colors" 
                  htmlFor="password"
                >
                  Password
                </label>
                <a 
                  className="font-label-caps text-[10px] text-secondary hover:text-primary transition-colors uppercase tracking-wider" 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 focus:border-primary-container text-body-md font-body-md text-on-surface placeholder:text-secondary/30 transition-colors duration-300 rounded-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <span className="material-symbols-outlined absolute right-0 top-3 text-outline opacity-40 group-focus-within:text-primary-container group-focus-within:opacity-100 transition-all text-[20px]">
                  lock
                </span>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center space-x-3">
              <input
                className="w-4 h-4 text-primary border-outline-variant focus:ring-primary rounded-none cursor-pointer"
                id="remember"
                name="remember"
                type="checkbox"
                disabled={loading || success}
              />
              <label 
                className="font-body-md text-[13px] text-secondary cursor-pointer select-none" 
                htmlFor="remember"
              >
                Remember this station
              </label>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full py-5 px-6 font-label-caps text-label-caps uppercase tracking-[0.2em] shadow-lg transition-all duration-300 active:scale-[0.98] mt-4 flex items-center justify-center rounded-none cursor-pointer ${
                success 
                  ? "bg-status-contacted text-white shadow-status-contacted/20"
                  : "bg-primary-container text-white shadow-primary-container/20 hover:bg-[#C09B2F] hover:tracking-[0.25em]"
              }`}
              type="submit"
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying...</span>
                </span>
              ) : success ? (
                <span className="material-symbols-outlined text-[20px] animate-bounce">
                  check
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer / Security Note */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-2 text-secondary/60 mb-1">
            <span className="material-symbols-outlined text-[16px]">
              verified_user
            </span>
            <p className="font-body-md text-[12px] tracking-wide">Secure Admin Access</p>
          </div>
          <p className="font-body-md text-[11px] text-secondary/40 leading-relaxed px-4">
            Authorized personnel only. All access attempts are monitored and logged.
          </p>
        </div>
      </main>

      {/* Side Decoration (Desktop only) */}
      <div className="hidden lg:block fixed bottom-margin-desktop left-margin-desktop">
        <p className="font-label-caps text-label-caps text-secondary/20 uppercase tracking-[0.5em] select-none [writing-mode:vertical-rl] rotate-180">
          Est. 2024
        </p>
      </div>

      {/* Background Imagery (Subtle Contextual Reference) */}
      <div 
        className="hidden xl:block fixed right-0 top-0 w-1/3 h-full overflow-hidden -z-20 transition-all duration-[3000ms] ease-out pointer-events-none opacity-5 hover:opacity-10"
        style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }}
      >
        <div 
          className="w-full h-full bg-cover bg-center grayscale"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD69lfiAPzbyXH65Im-JMQi4cpbzpziHlPg6LFiACLULtPqNyKpd7BW9zKBOmmFlHWCI1KS3gfdJ2VnvIEipZfiv8YcKyHRCKB89eRRiq8XAalfGnXHH8xnkYtvliFyAA_iPwQEyAO4SCHwpRCY19X2kD9AsOhP6FXUSIexrzI391SJ9dWj-B0nqId1WBea9hbErW8M9VlsjxGx9WCePZuBNmmyIZ3oF6mF-JjI-nnOby-e5vluBSBRksH-o2TMqAYBb0MfxyiSJb8')`,
          }}
        ></div>
      </div>
    </div>
  );
}
