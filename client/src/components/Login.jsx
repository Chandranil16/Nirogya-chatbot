import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Always enable dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { email, password };
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        data,
        { withCredentials: true }
      );
      setIsError(false);
      setMessage(response.data?.message || "Login successful!");
      // Save user info (prefer backend username, fallback to email)
      const user = response.data?.user;
      localStorage.setItem(
        "ayurveda_user",
        JSON.stringify({ name: user?.username || user?.name || email, email })
      );
      setTimeout(() => {
        navigate("/chat");
      }, 800);
    } catch (err) {
      setIsError(true);
      setMessage(
        err.response?.data?.message ||
          "Invalid login due to invalid credentials."
      );
    }
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-500 bg-[#1e2b1a]">
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

      <div className="max-w-md w-full mx-auto mt-20 p-8 rounded-3xl shadow-xl glassmorph relative z-10 border border-[#A8E063]/20 bg-[#232b1a]/80">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3d5223] shadow-neumorph mb-2 hover:animate-pulse">
            <span role="img" aria-label="leaf">
              🌿
            </span>
          </span>
          <h2 className="text-2xl font-bold text-[#A8E063] text-center font-[Mukta] tracking-tight drop-shadow">
            Login to Nirogya
          </h2>
        </div>
        {message && (
          <div
            className={`mb-4 text-center text-sm transition-all duration-300 ${
              isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-[#A8E063] font-medium mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#A8E063]/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#A8E063] bg-[#232b1a] text-[#e0ffe0] transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[#A8E063] font-medium mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#A8E063]/40 rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#A8E063] bg-[#232b1a] text-[#e0ffe0] transition"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="ayur-btn transition duration-200 font-medium text-white py-2 px-8 rounded-xl shadow-neumorph focus:outline-none focus:ring-2 focus:ring-[#A8E063] active:scale-95"
            >
              Login
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-[#a8e063]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#A8E063] hover:text-[#d0e7ff] font-medium underline transition"
          >
            Register
          </Link>
        </p>
        {/* Decorative botanical illustration */}
        <svg
          className="absolute bottom-0 right-0 w-28 md:w-40 opacity-30 pointer-events-none select-none"
          viewBox="0 0 120 60"
          fill="none"
        >
          <path
            d="M20 50 Q60 5 110 40"
            stroke="#A8E063"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="30"
            cy="55"
            rx="10"
            ry="4"
            fill="#A8E063"
            opacity="0.5"
          />
          <ellipse
            cx="100"
            cy="45"
            rx="7"
            ry="3"
            fill="#56AB2F"
            opacity="0.4"
          />
        </svg>
      </div>
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
        @keyframes ayur-parallax {
          0% { transform: translateY(0) scale(1);}
          100% { transform: translateY(30px) scale(1.04);}
        }
        .animate-ayur-parallax {
          animation: ayur-parallax 18s linear infinite alternate;
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
      `}</style>
    </div>
  );
}

export default Login;
