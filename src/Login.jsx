import React from "react";

export default function Login({ onLogin }) {
  const canvasRef = React.useRef(null);
  const [tab, setTab] = React.useState("login");

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    let raf = null;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.alpha += s.speed;
        if (s.alpha >= 1 || s.alpha <= 0) s.speed *= -1;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    function onResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    // any validation can go here — requirement was "any command" logs in
    onLogin("user-token");
  };

  return (
    <>
      <style>{`
        /* Login component styles (scoped in component) */
        :root { --container-w: 340px; }
        .login-body {
          height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(circle at center, #050505 0%, #000000 100%);
          color: white;
          font-family: "Poppins", sans-serif;
        }
        header.login-header {
          width: 100%;
          padding: 15px 0;
          background: linear-gradient(90deg, #000000, #0c0c0c, #000000);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0;
          z-index: 5;
        }
        header.login-header h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.2rem, 5vw, 1.8rem);
          letter-spacing: 2px;
          background: linear-gradient(90deg, #00bfff, #00ffaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
          font-weight: 700;
          text-align: center;
        }
        .login-container {
          margin-top: 120px;
          width: 90%;
          max-width: var(--container-w);
          padding: clamp(15px, 5vw, 25px);
          background: rgba(20, 20, 20, 0.7);
          border-radius: 16px;
          backdrop-filter: blur(15px);
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.25);
          text-align: center;
          z-index: 2;
        }
        .login-container h2 { font-size: clamp(1.2rem, 4vw, 1.5rem); margin-bottom: 20px; color: #00bfff; font-weight: 600; }
        .tab-buttons { display:flex; border-radius:30px; overflow:hidden; margin-bottom:15px; border:1px solid rgba(255,255,255,0.2); }
        .tab-buttons button { flex:1; padding:8px; border:none; cursor:pointer; font-weight:600; background:transparent; color:#ccc; font-size:1rem; transition:0.3s; }
        .tab-buttons button.active { background: linear-gradient(90deg, #00bfff, #004aad); color:white; }
        .form { display:none; flex-direction:column; align-items:stretch; }
        .form.active { display:flex; }
        .form input { margin:8px 0; padding:10px; border:none; border-radius:8px; background: rgba(255,255,255,0.1); color:#fff; font-size:15px; outline:none; }
        .form input::placeholder { color:#aaa; }
        .form a { font-size:14px; color:#00bfff; text-decoration:none; align-self:flex-end; }
        .form button { margin-top:10px; padding:10px; border:none; border-radius:8px; background: linear-gradient(90deg, #00bfff, #004aad); color:white; font-weight:bold; cursor:pointer; box-shadow:0 0 15px rgba(0,191,255,0.4); transition:0.3s; }
        .form button:hover { transform: translateY(-2px); box-shadow:0 0 25px rgba(0,191,255,0.6); }
        .google-btn { margin-top:10px; background: rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); display:flex; justify-content:center; align-items:center; gap:10px; transition:0.3s; }
        .google-btn img{ width:18px; }
        .google-btn:hover { background: rgba(255,255,255,0.2); }
        canvas.login-stars { position: fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0; }
        @media (max-width:480px) { .login-container{ margin-top:100px; width:92%; } header.login-header h1{ font-size:1.3rem; } }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
      `}</style>

      <div className="login-body">
        <canvas ref={canvasRef} className="login-stars" />

        <header className="login-header">
          <h1>Get Rich with Hamza</h1>
        </header>

        <div className="login-container" role="main">
          <h2>Login Form</h2>

          <div className="tab-buttons" role="tablist">
            <button
              className={tab === "login" ? "active" : ""}
              onClick={() => setTab("login")}
              id="loginTab"
              aria-selected={tab === "login"}
            >
              Login
            </button>
            <button
              className={tab === "signup" ? "active" : ""}
              onClick={() => setTab("signup")}
              id="signupTab"
              aria-selected={tab === "signup"}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className={tab === "login" ? "form active" : "form"} id="loginForm">
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <a href="#">Forgot password?</a>
            <button type="submit">Login</button>
            <p style={{ fontSize: 13 }}>
              Not a member?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setTab("signup");
                }}
                id="switchToSignup"
              >
                Signup now
              </a>
            </p>
          </form>

          <form onSubmit={(e) => { e.preventDefault(); onLogin("signed-up-token"); }} className={tab === "signup" ? "form active" : "form"} id="signupForm">
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
            <button type="button" className="google-btn" onClick={() => onLogin("google-token")}>
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </>
  );
}