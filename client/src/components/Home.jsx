import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  // Always enable dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  // Simulated auth check (replace with real auth logic)
  const isLoggedIn = !!localStorage.getItem("ayurveda_user");

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-[#1e2b1a]">
      {/* Botanical Parallax SVG */}
      <svg
        className="fixed top-0 left-0 w-[420px] h-[320px] z-0 pointer-events-none animate-ayur-parallax"
        viewBox="0 0 400 400"
        fill="none"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="120"
          fill="url(#leafGrad)"
          opacity="0.13"
        />
        <defs>
          <linearGradient
            id="leafGrad"
            x1="0"
            y1="0"
            x2="400"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A8E063" />
            <stop offset="1" stopColor="#56AB2F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Navbar */}
      <nav className="backdrop-blur-lg bg-[#232b1a]/60 fixed w-full z-20 top-0 left-0 shadow-sm glassmorph">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-[#A8E063] font-semibold text-xl font-[Mukta] flex items-center gap-2 drop-shadow">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3d5223] shadow-neumorph hover:animate-pulse">
              <span role="img" aria-label="leaf">
                🌿
              </span>
            </span>
            Nirogya
          </span>
          <div className="hidden md:flex gap-4">
            <Link
              to="/login"
              className="ayur-btn transition duration-200 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="ayur-btn transition duration-200 font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-xl w-full bg-[#232b1a]/80 rounded-3xl shadow-xl glassmorph p-8 text-center border border-[#A8E063]/20">
          <h1 className="text-3xl md:text-4xl font-bold text-[#A8E063] font-[Mukta] mb-4 tracking-tight drop-shadow">
            Welcome to Nirogya
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3d5223] shadow-neumorph mb-2 ml-2 hover:animate-pulse">
              <span role="img" aria-label="leaf">
                🌿
              </span>
            </span>
          </h1>
          <p className="mb-6 font-medium text-[#e0ffe0]">
            Your personal Ayurvedic assistant. Chat with our bot to get natural
            remedies, wellness tips, and holistic health advice rooted in
            ancient Indian wisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="ayur-btn transition duration-200 font-medium text-white py-2 px-8 rounded-xl shadow-neumorph focus:outline-none focus:ring-2 focus:ring-[#A8E063] active:scale-95"
            >
              Get Started
            </button>
          </div>
          {!isLoggedIn && (
            <p className="mt-6 text-sm text-[#a8e063]">
              Please{" "}
              <Link
                to="/register"
                className="text-[#A8E063] hover:text-[#d0e7ff] underline transition"
              >
                register
              </Link>
              <span className="mx-2">or</span>
              <Link
                to="/login"
                className="text-[#A8E063] hover:text-[#d0e7ff] underline transition"
              >
                login
              </Link>{" "}
              to chat with Nirogya.
            </p>
          )}
        </div>
        {/* Decorative botanical illustration */}
        <svg
          className="absolute bottom-0 right-0 w-40 md:w-64 opacity-40 pointer-events-none select-none"
          viewBox="0 0 200 120"
          fill="none"
        >
          <path
            d="M40 100 Q100 10 180 80"
            stroke="#A8E063"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="60"
            cy="110"
            rx="18"
            ry="8"
            fill="#A8E063"
            opacity="0.5"
          />
          <ellipse
            cx="170"
            cy="90"
            rx="12"
            ry="5"
            fill="#56AB2F"
            opacity="0.4"
          />
        </svg>
      </main>

      {/* Custom styles for neumorphism, glassmorphism, parallax, etc. */}
      <style>{`
        .glassmorph {
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
          background: rgba(30,40,30,0.5);
          border-radius: 1.5rem;
          box-shadow: 0 4px 24px 0 rgba(168,224,99,0.08), 0 1.5px 6px 0 rgba(168,224,99,0.10);
        }
        .shadow-neumorph {
          box-shadow: 8px 8px 24px #232b1a, -8px -8px 24px #3a4d2c;
        }
        .ayur-btn {
          background: var(--ayur-green-light, #A8E063);
          color: #234d20;
          border: none;
          border-radius: 1.2rem;
          padding: 0.5rem 1.2rem;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 8px 8px 24px #232b1a, -8px -8px 24px #3a4d2c;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          outline: none;
          position: relative;
          text-decoration: none;
          display: inline-block;
        }
        .ayur-btn:hover, .ayur-btn:focus {
          background: var(--ayur-green, #56AB2F);
          color: #fff;
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 24px 0 #a8e06344;
        }
        @keyframes ayur-parallax {
          0% { transform: translateY(0) scale(1);}
          100% { transform: translateY(30px) scale(1.04);}
        }
        .animate-ayur-parallax {
          animation: ayur-parallax 18s linear infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default Home;
