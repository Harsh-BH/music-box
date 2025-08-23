import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import WalletWrapper from "./WalletWrapper";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scrolling to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".navbar", {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "power1.inOut",
    });
  });

  return (
    <nav className={`navbar fixed top-0 left-0 w-full z-50 py-5 md:px-10 px-5 bg-transparent transition-all duration-300 border-b border-milk-yellow/20 ${isScrolled ? 'backdrop-blur-md' : ''}`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="logo z-20">
          <h2 className="text-milk-yellow text-2xl font-bold">ChainMelody</h2>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/music" className={`nav-link ${location.pathname === '/music' ? 'active' : ''}`}>
            Music
          </Link>
          <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
            Leaderboard
          </Link>
          <a href="#about" className="nav-link">
            About
          </a>
          <button className="hero-button small">
          <WalletWrapper
                text="Log in"
                withWalletAggregator={true}
              />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden z-20 text-milk"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile menu */}
        <div
          className={`fixed inset-0 bg-main-bg z-10 flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center gap-8">
            <Link to="/" className="mobile-nav-link">
              Home
            </Link>
            <Link to="/music" className="mobile-nav-link">
              Music
            </Link>
            <Link to="/leaderboard" className="mobile-nav-link">
              Leaderboard
            </Link>
            <a href="#about" className="mobile-nav-link">
              About
            </a>
            {/* <button className="hero-button mt-4"> */}
<WalletWrapper
      text="Log in"
      withWalletAggregator={true}
    />

            {/* </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
