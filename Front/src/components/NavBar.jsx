import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import SearchBar from "./SearchBar";

const NavBar = ({ showSearch = true, customClasses = "", forceBg = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const currentPath = location.pathname;

  const navLinkStyle = (path) =>
    `hover:text-gray-500 ${
      currentPath === path ? "border-b-2 border-[#E07A5F]" : ""
    }`;

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        forceBg ? "bg-black shadow-lg" : scrolled ? "bg-black shadow-md" : "bg-transparent"
      } ${customClasses}`}
    >
      <nav className="flex justify-between items-center py-3 px-4 max-w-[1200px] mx-auto w-full">
        {/* Logo */}
        <div>
          <img
            className="w-30 h-auto object-contain object-center cursor-pointer"
            src="../Logo.png"
            alt="Logo"
          />
        </div>

        {/* Links */}
        <div
          className={`duration-500 md:static absolute top-full left-0 md:bg-transparent bg-[#81B29A] md:min-h-fit min-h-[30vh] w-full md:w-auto
    flex items-center ${
      menuOpen
        ? "opacity-100 visible"
        : "opacity-0 invisible md:opacity-100 md:visible"
    }
  `}
        >
          <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8 font-['Nunito'] text-xl">
            <li>
              <a className={navLinkStyle("/")} href="/">
                Home
              </a>
            </li>
            <li>
              <a className={navLinkStyle("/favorites")} href="/favorites">
                Favoritos
              </a>
            </li>
          </ul>
        </div>

        {/* Buscador */}
        <div className="min-w-[192px] flex justify-end items-center">
          {showSearch && <SearchBar />}
        </div>

        {/* Botón menú mobile */}
        <button onClick={handleToggle} className="md:hidden text-white ml-4">
          <FaBars size={24} />
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
