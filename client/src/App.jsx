import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import './index.css';

function App() {
  return (
    <div className="font-[Mukta] min-h-screen bg-[#FFF8E1] dark:bg-[#1e2b1a] transition-colors duration-500 relative overflow-x-hidden px-2 sm:px-4 md:px-8">
      {/* Responsive botanical background */}
      <svg
        className="fixed top-0 left-0 z-0 pointer-events-none animate-ayur-parallax w-[70vw] max-w-[420px] h-[40vw] max-h-[320px] sm:w-[420px] sm:h-[320px]"
        viewBox="0 0 400 400"
        fill="none"
        style={{ minWidth: '200px', minHeight: '120px' }}
      >
        <ellipse cx="200" cy="200" rx="180" ry="120" fill="url(#leafGrad)" opacity="0.13"/>
        <defs>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A8E063"/>
            <stop offset="1" stopColor="#56AB2F"/>
          </linearGradient>
        </defs>
      </svg>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
      {/* Global style block for glassmorphism, neumorphism, parallax, etc. */}
      <style>{`
        .glassmorph {
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
          background: rgba(255,255,255,0.6);
          border-radius: 1.5rem;
          box-shadow: 0 4px 24px 0 rgba(86,171,47,0.08), 0 1.5px 6px 0 rgba(86,171,47,0.10);
        }
        .dark .glassmorph {
          background: rgba(30,40,30,0.5);
          box-shadow: 0 4px 24px 0 rgba(168,224,99,0.08), 0 1.5px 6px 0 rgba(168,224,99,0.10);
        }
        .shadow-neumorph {
          box-shadow: 8px 8px 24px #e0e0e0, -8px -8px 24px #ffffff;
        }
        .dark .shadow-neumorph {
          box-shadow: 8px 8px 24px #232b1a, -8px -8px 24px #3a4d2c;
        }
        @keyframes ayur-parallax {
          0% { transform: translateY(0) scale(1);}
          100% { transform: translateY(30px) scale(1.04);}
        }
        .animate-ayur-parallax {
          animation: ayur-parallax 18s linear infinite alternate;
        }
        /* Responsive SVG background for mobile */
        @media (max-width: 640px) {
          .animate-ayur-parallax {
            left: -40px !important;
            top: -40px !important;
            width: 90vw !important;
            height: 32vw !important;
            min-width: 140px !important;
            min-height: 80px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App
