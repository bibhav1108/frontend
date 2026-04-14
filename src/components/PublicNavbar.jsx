import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const PublicNavbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO + NAME */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Sahyog Sync Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-outfit font-semibold text-primary tracking-tight">
            Sahyog Sync
          </span>
        </Link>

        {/* BUTTONS */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-bold text-on_surface_variant hover:text-primary transition-colors px-3 py-2"
          >
            Log In
          </Link>

          <Link
            to="/register"
            className="
              px-6 py-2.5 rounded-xl
              bg-primaryGradient
              text-white text-sm font-bold
              shadow-[0_4px_15px_rgba(var(--color-primary),0.3)]
              hover:shadow-[0_6px_20px_rgba(var(--color-primary),0.4)]
              hover:scale-105 active:scale-95
              transition-all duration-300
            "
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
