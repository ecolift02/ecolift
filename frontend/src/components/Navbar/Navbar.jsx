import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-20 transition-all duration-300">
      <div className="max-w-9xl mx-auto px-8 h-full flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="text-3xl font-bold text-green-700 tracking-wide"
          >
            EcoLift
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <a
              href="#how-it-works"
              className="text-green-700 font-semibold border-b-2 border-green-700 pb-1"
            >
              How it Works
            </a>

            <a
              href="#support"
              className="text-gray-600 hover:text-green-700 transition"
            >
              Support
            </a>

            <a
              href="#blog"
              className="text-gray-600 hover:text-green-700 transition"
            >
              Blog
            </a>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2 rounded-full text-green-700 hover:bg-green-50 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-6 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition shadow"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
