"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createLeadAction, getConfigAction } from "./actions";

interface Lead {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: number;
  message: string;
  status: "New" | "Contacted" | "Closed";
  createdTime: string;
}

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Juliana Vane",
    email: "juliana@vane.co",
    eventType: "Luxury Wedding",
    eventDate: "2024-10-12",
    guests: 150,
    message: "Planning a grand celebration at the Metropolitan Museum. Looking for bespoke coordination.",
    status: "New",
    createdTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "lead-2",
    name: "Goldman Sachs Exec",
    email: "events@gs.com",
    eventType: "Corporate Gala",
    eventDate: "2024-10-10",
    guests: 300,
    message: "Q4 executive summit. Requires absolute discretion and high-end tech/lounge staging.",
    status: "Contacted",
    createdTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "lead-3",
    name: "The Richardsons",
    email: "richardson@family.org",
    eventType: "Private Celebration",
    eventDate: "2024-10-08",
    guests: 80,
    message: "Intimate estate celebration in Hudson Valley with gold accents and custom fine dining.",
    status: "Closed",
    createdTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");

  // Dynamic configuration states
  const [siteEmail, setSiteEmail] = useState("hello@infinityplanners.nyc");
  const [sitePhone, setSitePhone] = useState("+1 (516) 344-7239");
  const [siteAddress, setSiteAddress] = useState("545 Madison Avenue, 12th Floor\nNew York, NY 10022");

  useEffect(() => {
    // Load config from database config table
    const loadConfig = async () => {
      try {
        const configData = await getConfigAction();
        setSiteEmail(configData.email);
        setSitePhone(configData.phone);
        setSiteAddress(configData.address);
      } catch (err) {
        console.error("Failed to load site branding configuration from database:", err);
      }
    };
    loadConfig();

    // Navigation scroll effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for scroll triggers
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealElements.forEach((el) => observer.observe(el));

    const canvas = canvasRef.current;
    if (canvas) {
      const currentCanvas = canvas;
      const ctx = currentCanvas.getContext("2d");
      let animationFrameId: number;
      let particles: Particle[] = [];

      const resize = () => {
        currentCanvas.width = window.innerWidth;
        currentCanvas.height = window.innerHeight;
      };

      class Particle {
        x = 0;
        y = 0;
        size = 0;
        speedX = 0;
        speedY = 0;
        alpha = 0;

        constructor() {
          this.reset();
        }

        reset() {
          this.x = Math.random() * currentCanvas.width;
          this.y = Math.random() * currentCanvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = (Math.random() - 0.5) * 0.5;
          this.alpha = Math.random() * 0.5 + 0.1;
        }

        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x < 0 || this.x > currentCanvas.width || this.y < 0 || this.y > currentCanvas.height) {
            this.reset();
          }
        }

        draw() {
          if (ctx) {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      resize();
      particles = Array.from({ length: 80 }, () => new Particle());

      const animate = () => {
        if (ctx) {
          ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
          particles.forEach((p) => {
            p.update();
            p.draw();
          });
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
      window.addEventListener("resize", resize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resize);
      };
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await createLeadAction({
        name,
        email,
        eventType: eventType || "Other",
        eventDate: new Date().toISOString().split("T")[0],
        guests: 100, // default guests count
        message,
      });

      // Display modal
      setSuccessModalOpen(true);

      // Reset Form fields
      setName("");
      setEmail("");
      setEventType("");
      setMessage("");
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
    }
  };

  return (
    <div className="bg-luxury-white text-luxury-dark font-sans overflow-x-hidden">

      {/* Success Modal Overlay */}
      {successModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setSuccessModalOpen(false)}
          ></div>
          <div className="relative bg-white border border-luxury-gold p-8 md:p-12 w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] z-10 text-center animate-fade-in rounded-none">
            <div className="w-16 h-16 border border-luxury-gold mx-auto flex items-center justify-center text-luxury-gold mb-6 animate-pulse">
              <span className="material-symbols-outlined text-[36px]">check</span>
            </div>
            <h3 className="font-serif text-3xl text-luxury-dark mb-4 uppercase tracking-wider">Inquiry Received</h3>
            <div className="w-16 h-[1px] bg-luxury-gold mx-auto mb-6"></div>
            <p className="font-sans text-sm text-gray-500 leading-relaxed mb-10 max-w-md mx-auto">
              Your message has been safely received. An Infinity Planners coordinator will review your vision and contact you within the hour to coordinate a private consultation.
            </p>
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="w-full py-4 bg-luxury-dark text-white font-sans text-xs font-bold tracking-widest hover:bg-luxury-gold hover:text-black transition-all duration-300 uppercase cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-8 flex justify-between items-center ${navScrolled || mobileMenuOpen
            ? "py-4 bg-luxury-dark border-b border-luxury-gold/20 backdrop-blur-md"
            : "py-6 bg-transparent"
          }`}
      >
        <div className="flex items-center">
          <Link href="/" className="font-serif text-xl md:text-2xl tracking-widest uppercase text-white hover:text-luxury-gold transition-colors z-50">
            Infinity Planners
          </Link>
        </div>
        <div className="hidden md:flex space-x-12">
          <Link href="#services" className="text-xs font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase">
            Services
          </Link>
          <Link href="#portfolio" className="text-xs font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase">
            NYC Portfolio
          </Link>
          <Link href="#venues" className="text-xs font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase">
            Venues
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className="hidden md:block bg-luxury-gold hover:bg-white text-black px-8 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300"
          >
            Contact Us
          </a>
          {/* Mobile hamburger menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-luxury-gold transition-colors focus:outline-none z-50 flex items-center justify-center p-2"
          >
            <span className="material-symbols-outlined text-[28px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Screen Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-luxury-dark/98 backdrop-blur-md flex flex-col justify-center items-center space-y-10 animate-fade-in md:hidden">
          <Link
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase"
          >
            Services
          </Link>
          <Link
            href="#portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase"
          >
            NYC Portfolio
          </Link>
          <Link
            href="#venues"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-medium tracking-widest text-white/90 hover:text-luxury-gold transition-colors uppercase"
          >
            Venues
          </Link>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-luxury-gold text-black px-10 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Floating Gold Dust Simulation */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10 opacity-60 pointer-events-none"></canvas>

        {/* Cinematic Zoom Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            alt="Luxury Event Hall"
            className="w-full h-full object-cover animate-slow-zoom opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgFOVhcsIwURGWBa-Aq7ixRlBtIiCOfVk9m04XUbFDQKadNuWFQJlVey7RO9t_evqq9SdWqKE7JBoHOeJOFEnawlGQZut_n-w2kCEd_rQMwqmxrZXMBteMUlJl7jku0HhKZcyO2tsoelNVy5yTgOKuyn4SPntumqlxlV78uSWdDKFjoMtdM6G7ZgRIDes5o4IS4n8Nh3cgQQ7WPpNB5X-RtaJPXLN_XXbUchzmN1KCj7vgo2huNcJFy7LUs78UN_0oRquO6zNMiPI"
          />
        </div>

        {/* Hero content overlay */}
        <div className="relative z-20 text-center px-4 max-w-5xl">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight reveal">
            Bespoke New York Events,<br />
            <span className="italic text-luxury-gold">Masterfully Orchestrated</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase font-light mb-12 reveal transition-delay-200">
            Infinity Planners — Redefining Sophistication
          </p>
          <div className="reveal transition-delay-400">
            <a
              className="inline-block border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black px-10 py-4 tracking-widest uppercase text-xs transition-all duration-500"
              href="#services"
            >
              Discover Our Craft
            </a>
          </div>
        </div>

        {/* Scroll indicator chevron */}
        <a
          href="#services"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white text-center animate-bounce cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white/50 w-8 h-8">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </a>
      </section>

      {/* Services Grid Section */}
      <section className="py-24 px-8 md:px-16 lg:px-32 bg-white" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center reveal">
            <h2 className="font-serif text-3xl md:text-5xl mb-4">Our Expertise</h2>
            <div className="w-20 h-[1px] bg-luxury-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Corporate Events */}
            <div className="service-card group reveal transition-delay-100">
              <div className="relative overflow-hidden mb-8 aspect-[4/5]">
                <div
                  className="service-img w-full h-full bg-cover bg-center grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBd5XmBC1akXEtKi4SzHRqpB_vLg-E9bQb3jWcNUqmLM92mqkd12l5Md268j_3K80fUBi15FZ-cG_r99WH7DQDSs9NihtwheEvFT4HPIZCbftMn3MLil8U5Ol7BAylzFcwqL2ISMGyuTb-HVVPOeFEHt9KAyxH2_BtNJ8qIeTXx47RDdsA12_AKdQlkXre176NlFbx2r1lE1jjVBbehx6Nf_zlQjx-tthrbDWxIGuxeQcLFqG2so33B7S9fiP6RWlLzFu3NtDJF1po')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500"></div>
              </div>
              <h3 className="font-serif text-2xl mb-4 group-hover:text-luxury-gold transition-colors">
                Corporate Events
              </h3>
              <p className="text-gray-500 leading-relaxed font-light text-sm">
                Elevating brand narratives through meticulously designed galas, summits, and executive retreats across NYC's premier landmarks.
              </p>
            </div>

            {/* Luxury Weddings */}
            <div className="service-card group reveal transition-delay-300">
              <div className="relative overflow-hidden mb-8 aspect-[4/5]">
                <div
                  className="service-img w-full h-full bg-cover bg-center grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJun35tSSBmicejBkBy04W3tNjugUe7jpynGDuh2NH-2bq8I1XRO4wQlI6vilPUt-FigryrrCOpqbmTHDd_k5LaloDRhLFiaHzxTmNYE-RSzJrkn5MapPKgnneRng4-WXpys_nELz0xz8vVrC2euRNmXRBKBNFuCmsulq8mv2DzpON6IQtb7m5uVNIBzyffmDLeNSQnSkeBb84pkspIIrsqNqAE_yZDP8t5p5a54zkL8Dgwwu0SkGs7KmRPbERFokzq06hIVwGiQw')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500"></div>
              </div>
              <h3 className="font-serif text-2xl mb-4 group-hover:text-luxury-gold transition-colors">
                Luxury Weddings
              </h3>
              <p className="text-gray-500 leading-relaxed font-light text-sm">
                Transforming visions into timeless celebrations. We orchestrate intimate ceremonies and grand ballroom receptions with effortless grace.
              </p>
            </div>

            {/* Private Galas */}
            <div className="service-card group reveal transition-delay-500">
              <div className="relative overflow-hidden mb-8 aspect-[4/5]">
                <div
                  className="service-img w-full h-full bg-cover bg-center grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwwexES34bDaeAj90xOfiC_vA9pxmNW1_63qRJW3UzXdbeKjjG8wDOG3kdnktVfKmZVi5vWuy9_9wQepZeBoxrkg0ANAYztG_wrgingoA53C6axmT3RM_Kz_OjUi9ztQXdBoKq5JwYCr8UYyMOT76_1Bznw4gB9HTXW_nf-5CZDIG2GPlBL0wKlWGeL_gYve0-3kG7xkJ9n0D_GYbsjyJXw6hsY7VcvIVYYVRodboPD3Nu-d6YsdNcGKziP55f2jMq14e_BUdWcZQ')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500"></div>
              </div>
              <h3 className="font-serif text-2xl mb-4 group-hover:text-luxury-gold transition-colors">
                Private Galas
              </h3>
              <p className="text-gray-500 leading-relaxed font-light text-sm">
                Exclusive social gatherings curated for the discerning host, where every detail reflects a commitment to absolute excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NYC Portfolio Section */}
      <section className="py-24 bg-luxury-dark text-white overflow-hidden" id="portfolio">
        <div className="px-8 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 reveal">
            <div className="md:w-1/2">
              <p className="text-luxury-gold tracking-[0.3em] uppercase text-xs mb-4">Selected Works</p>
              <h2 className="font-serif text-3xl md:text-5xl">NYC Portfolio</h2>
            </div>
            <div className="w-full md:w-1/3 text-left md:text-right">
              <Link
                className="group text-xs tracking-widest uppercase inline-flex items-center hover:text-luxury-gold transition-colors"
                href="#contact"
              >
                <span>Inquire For Full List</span>
                <span className="material-symbols-outlined ml-2 transform group-hover:translate-x-1.5 transition-transform text-[16px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 reveal">
            {/* The Plaza Hotel */}
            <div className="relative group cursor-pointer overflow-hidden aspect-video border border-white/5">
              <img
                alt="Plaza Hotel Gala"
                className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD8w8Yhah_jBfULiZrwme8pJbB5KR6FVLX5rd3Xba4xCFF6tTnzAh4vNOkgylq-Zh9-EXI11jHowPiOeXvwuL17FjUU9G1Dn2rBqo2z5vk4e6ivhgi-9qJ52-L8ZQG9vczCoFUpIz3lNDeH_6_0TGKAA4xGKrhVYwByppUOBzPlDjQssYg6tyyta_XEKftUxgzIz5J6sb2rmyLC3uCyb7I2IMOZZfoXYm__UuYj_yglMACxuq8GqyqjDctU2XKDIuaFN4cFpU52IE"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h4 className="font-serif text-2xl mb-2 text-white">The Plaza Gala</h4>
                <p className="text-xs text-luxury-gold tracking-widest uppercase">Upper East Side</p>
              </div>
            </div>

            {/* SoHo Skylines */}
            <div className="relative group cursor-pointer overflow-hidden aspect-video border border-white/5">
              <img
                alt="Soho Rooftop Event"
                className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1-hV5LXxxXJMuUCWsBq-mOnDWpNCmJ-1xBgzgTy1HjAyoWwg3j9FTrSdx4R38Tqdr3T0igEIYjgqX8mrOnMkciLzU_j-qWxO9T9R1corJJxXqfhOkf9YXUUtx8D1KYuv0K5QRLuvbBIA5GwAIMhlPclaDRYP8iRYu7df4QJKI1o-nMtkh0kHqpOalUNK1XmY9n61AZlCw3qUTYQv1I_NE6VBPHyvKn6MbsX8oYdfTrxoc4yQHdtrVwhigKPXZXUF1_NxDT5w6yjQ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h4 className="font-serif text-2xl mb-2 text-white">SoHo Skylines</h4>
                <p className="text-xs text-luxury-gold tracking-widest uppercase">Creative Loft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Break Section */}
      <section className="py-24 bg-white border-y border-luxury-gold/15 text-center px-6">
        <div className="max-w-4xl mx-auto reveal">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl italic text-luxury-dark leading-relaxed mb-6">
            "We do not merely plan events. We architect experiences that linger in the memory long after the music fades."
          </p>
          <div className="w-16 h-[1px] bg-luxury-gold mx-auto mb-4"></div>
          <p className="font-sans text-[10px] tracking-[0.25em] text-gray-500 uppercase">
            Infinity Planners Philosophy
          </p>
        </div>
      </section>

      {/* Venues Section (Chrysler/Statue context maps) */}
      <section className="py-24 bg-transparent" id="venues">
        <div className="px-8 md:px-16 lg:px-32 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative reveal">
              <div className="aspect-square bg-surface-container-high w-full">
                <img
                  alt="Architectural NYC Skyline Crown"
                  className="w-full h-full object-cover p-4 border border-outline-variant/30 bg-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUfMkm0P7yO-bhIRAt0tWMtGFuMdKoySEQTX6Nnl36iQreri2Qm9KvhgFy_aW_Q03nbjPfdumi4IAbB1l1uCokK5yc-vFm7Cneh5_KnJxILkiEkFC4ESu4Sdx0MhOrUmKYtKq_vsNo0VhTrhEdHQvGs7BXXGIJrcDBK9JU6wgcLSf9oGNTWC0lKLJethBa9od9iNI65wO9o50H6hhYa7orOtgj7pxHmaWdzaGisrGpUkuN73QFuNypchG1B0GADfDX5WRinkDuKGw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden md:block w-48 h-48 border border-luxury-gold p-6 bg-white shadow-lg">
                <div className="flex flex-col justify-center h-full text-center">
                  <span className="font-serif text-3xl text-luxury-gold block mb-1">15+</span>
                  <span className="font-sans text-[9px] text-gray-500 uppercase tracking-widest">
                    Years in Manhattan
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 reveal">
              <span className="font-sans text-xs text-luxury-gold tracking-[0.3em] uppercase mb-4 block">
                Exclusive Venues
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-luxury-dark mb-8 leading-tight">
                Architectural Venues Staged to Perfection
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">
                From historical Madison Avenue ballrooms to open SoHo industrial lofts, we collaborate with elite Manhattan structures to draft, coordinate, and execute custom events. We hold exclusive staging access, allowing you to curate spaces normally inaccessible to the public.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed italic border-l border-luxury-gold pl-4 mb-8">
                "Our canvas is the city of New York. The architecture tells the story, we compose the soundtrack."
              </p>
              <a
                href="#contact"
                className="font-sans text-xs text-luxury-dark font-bold border-b border-luxury-gold pb-2 hover:text-luxury-gold transition-all duration-300 uppercase tracking-widest"
              >
                Inquire For Venue Partnerships
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section (Split Screen) */}
      <section className="flex flex-col md:flex-row h-auto md:h-screen" id="contact">
        {/* Left: Map/Imagery */}
        <div className="w-full md:w-1/2 h-[400px] md:h-full relative overflow-hidden bg-gray-200 border-r border-outline-variant/30">
          <img
            alt="Manhattan Aerial"
            className="w-full h-full object-cover grayscale brightness-[0.35]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiKG200T98nx2zDmX6xe39myRcPD_p0zuyWji7WMiQrvcSj4mMDQJVlXOohT8aVe_jrsPkZr7LKnOtIx9hp3rNsD3Fx6hGjRUDtAbj0JhF1B49icM-E8uejJYQIeOi-bli5Yd1nD72fJHZxewzdAsjVqYOKOoq5x1pTjuI20FlNj6CYcWa2aMDMguOFrFt7-K6m03MfGbCS8ze6mNWQ-aFTwL6PudOc6MYBF807JDbieVY7Y47AAFwqxAxxBIt8SXJHew2VE7RLs4"
          />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-white bg-black/40">
            <div className="text-center reveal">
              <h3 className="font-serif text-3xl md:text-4xl mb-6 uppercase tracking-wider">Visit Our Studio</h3>
              <p className="text-sm tracking-widest uppercase font-light leading-relaxed whitespace-pre-line">
                {siteAddress}
              </p>
              <div className="mt-12 space-y-3 text-sm">
                <p className="text-luxury-gold font-mono">{siteEmail}</p>
                <p className="text-white/80 font-mono">{sitePhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-16 lg:p-24">
          <div className="w-full max-w-lg reveal">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Start Your Journey</h2>
            <p className="text-gray-500 font-light mb-12 text-sm leading-relaxed">
              Share your vision with us and we will orchestrate a proposal that exceeds all expectations.
            </p>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="relative group">
                <input
                  className="w-full border-t-0 border-x-0 border-b border-gray-300 focus:ring-0 focus:border-luxury-gold py-4 px-0 bg-transparent placeholder-gray-400 font-light text-sm rounded-none text-luxury-dark uppercase tracking-widest"
                  placeholder="Full Name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative group">
                <input
                  className="w-full border-t-0 border-x-0 border-b border-gray-300 focus:ring-0 focus:border-luxury-gold py-4 px-0 bg-transparent placeholder-gray-400 font-light text-sm rounded-none text-luxury-dark uppercase tracking-widest"
                  placeholder="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <select
                  className="w-full border-t-0 border-x-0 border-b border-gray-300 focus:ring-0 focus:border-luxury-gold py-4 px-0 bg-transparent text-gray-400 font-light text-sm appearance-none rounded-none cursor-pointer uppercase tracking-widest"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option disabled value="">TYPE OF EVENT</option>
                  <option value="Corporate Gala" className="bg-white text-luxury-dark uppercase">Corporate Gala</option>
                  <option value="Luxury Wedding" className="bg-white text-luxury-dark uppercase">Luxury Wedding</option>
                  <option value="Private Celebration" className="bg-white text-luxury-dark uppercase">Private Celebration</option>
                  <option value="Other" className="bg-white text-luxury-dark uppercase">Other</option>
                </select>
              </div>
              <div className="relative group">
                <textarea
                  className="w-full border-t-0 border-x-0 border-b border-gray-300 focus:ring-0 focus:border-luxury-gold py-4 px-0 bg-transparent placeholder-gray-400 font-light text-sm resize-none rounded-none text-luxury-dark uppercase tracking-widest"
                  placeholder="Describe Your Vision"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <button
                className="w-full bg-luxury-dark text-white hover:bg-luxury-gold hover:text-black transition-all duration-500 py-5 tracking-[0.3em] font-bold text-xs uppercase mt-8 rounded-none cursor-pointer"
                type="submit"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-luxury-dark text-white/60 py-12 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div className="mb-4 md:mb-0">
            <span className="font-serif text-xl tracking-widest text-white block mb-2 uppercase">Infinity Planners</span>
            <p className="text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} Infinity Planners. All Rights Reserved.</p>
          </div>
          <div className="flex space-x-8 text-[10px] tracking-widest uppercase">
            <Link className="hover:text-luxury-gold transition-colors" href="/admin/login">Admin Panel</Link>
            <Link className="hover:text-luxury-gold transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-luxury-gold transition-colors" href="#">Terms</Link>
            <a className="hover:text-luxury-gold transition-colors" href="#">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
