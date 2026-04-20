import React, { useState, useEffect, useRef } from "react";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  // 1. Lógica para el efecto Tilt 3D
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current || window.innerWidth < 768) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cardRef.current.style.transform = `rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
    };
    const handleMouseLeave = () => {
      if (cardRef.current) cardRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 2. Lógica para generar micro-partículas (Dust Particles)
  useEffect(() => {
    const particleCount = 15;
    const container = document.getElementById("dust-container");
    if (!container) return;

    for (let i = 0; i < particleCount; i++) {
      let dust = document.createElement('div');
      dust.className = 'flavor-dust';
      dust.style.left = Math.random() * 100 + 'vw';
      dust.style.setProperty('--t', (Math.random() * 15 + 15) + 's');
      dust.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(dust);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://wayra-web-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.usuario);
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error: El servidor no responde");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f5f2] perspective-1000 overflow-hidden relative">
      
      {/* --- SISTEMA DE FONDO GPU ACCELERATED --- */}
      <div className="background-texture fixed inset-0 pointer-events-none z-0"></div>
      <div className="nazca-spirit fixed inset-0 pointer-events-none z-0"></div>
      
      <svg className="kintsugi-vessels fixed inset-0 pointer-events-none z-0" width="100%" height="100%" preserveAspectRatio="none">
        <path className="gold-vessel" d="M-100,400 Q200,300 400,500 T800,300 T1200,500" />
        <path className="gold-vessel" d="M1100,600 Q800,700 500,500 T-100,700" style={{ animationDelay: '10s' }} />
      </svg>
      
      <div id="dust-container" className="fixed inset-0 pointer-events-none z-0"></div>
      {/* ---------------------------------------- */}

      <div 
        ref={cardRef}
        className="main-card w-full max-w-[450px] md:max-w-lg rounded-[4px] p-10 md:p-20 relative z-10 transition-transform duration-200 ease-out transform-gpu shadow-2xl scale-95 md:scale-100"
        style={{ transformStyle: "preserve-3d", backgroundColor: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(40px)" }}
      >
        <div className="kintsugi-accent"></div>

        <div className="flex justify-center mb-8">
          <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-sm hover:scale-110 transition-transform duration-500">
            <path d="M80 50 C 80 25, 55 20, 40 25 C 20 35, 20 70, 45 80 C 70 90, 85 75, 80 45" 
                  fill="none" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill="#121212" />
          </svg>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-[0.4em] mb-4 uppercase gold-shimmer italic">Wayra</h1>
          <div className="h-[1.5px] w-10 bg-[#c5a059] mx-auto mb-4"></div>
          <p className="text-[10px] tracking-[0.3em] text-[#555] uppercase font-medium">Experiencia Gastronómica Nikkei</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="input-wrapper group">
            <input 
              type="text" 
              className="input-elegant w-full py-4 text-[11px] tracking-widest uppercase placeholder:text-gray-400 bg-transparent outline-none focus:pl-2 transition-all text-slate-800"
              placeholder="USUARIO"
              onChange={(e) => setFormData({...formData, user: e.target.value})} 
              required 
            />
            <div className="focus-line"></div>
          </div>

          <div className="input-wrapper group">
            <input 
              type="password" 
              className="input-elegant w-full py-4 text-[11px] tracking-widest uppercase placeholder:text-gray-400 bg-transparent outline-none focus:pl-2 transition-all text-slate-800"
              placeholder="CONTRASEÑA"
              onChange={(e) => setFormData({...formData, pass: e.target.value})} 
              required 
            />
            <div className="focus-line"></div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-[#9d0208] p-3">
              <p className="text-[#9d0208] text-center text-[10px] font-bold tracking-widest uppercase">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="btn-luxury w-full py-5 md:py-6 rounded-[2px] text-[10px] tracking-[0.4em] uppercase font-bold text-white bg-[#121212] hover:bg-[#6b0f1a] transition-all duration-500 shadow-xl">
              Iniciar Experiencia
            </button>
          </div>
        </form>

        <div className="mt-10 flex justify-between items-end text-[#666] text-[7px] md:text-[8px] tracking-[0.2em] uppercase font-semibold">
          <div className="leading-relaxed">SISTEMA CONTROL<br /><span className="text-[#c5a059]">V2.5 WAYRA</span></div>
          <div className="text-right leading-relaxed">LIMA — TOKYO<br />PATRIMONIO NIKKEI</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
