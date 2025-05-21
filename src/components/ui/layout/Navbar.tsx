"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaUserShield } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const routes = [
    { name: "Tableau de bord", path: "/" },
    { name: "Départements", path: "/departements" },
    { name: "Enseignants", path: "/enseignants" },
    { name: "Maquettes", path: "/maquettes" },
    { name: "Cours", path: "/cours" },
    { name: "Interventions", path: "/interventions" },
    { name: "Planning", path: "/planning" },
    { name: "Rapports", path: "/rapports" },
    { 
      name: "Admin", 
      path: "/admin", 
      icon: <FaUserShield className="h-3.5 w-3.5 mr-1" />,
      highlight: true 
    }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white text-blue-900 shadow-md" 
        : "bg-gradient-to-r from-blue-950 via-blue-800 to-blue-700 text-white"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-blue-300 bg-white p-1 shadow-md transform transition-transform hover:scale-105">
              <Image src="/Logo_IUT.png" alt="Logo" fill className="object-contain" />
            </div>
            <Link href="/" className={`text-xl font-bold tracking-tight ${scrolled ? "text-blue-900" : "text-white"} hover:opacity-90 transition-opacity`}>
              Gestionnaire IUT
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex space-x-1.5">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 transform ${
                  pathname === route.path
                    ? scrolled 
                      ? "bg-gradient-to-r from-blue-800 to-blue-700 text-white shadow-md" 
                      : "bg-white/20 text-white backdrop-blur-sm"
                    : scrolled
                      ? "text-blue-700 hover:bg-blue-50" 
                      : "text-blue-50 hover:bg-white/10"
                } ${route.highlight ? 'bg-amber-500/20 hover:bg-amber-500/30' : ''}`}
              >
                <span className="flex items-center">
                  {route.icon && route.icon}
                  {route.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none transition-colors ${
                scrolled ? "text-blue-900 hover:text-blue-700" : "text-blue-100 hover:text-white"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isOpen && (
          <div className="md:hidden pb-4 transition-all duration-300 animate-fadeIn">
            <div className="flex flex-col space-y-1 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm shadow-lg">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    pathname === route.path
                      ? scrolled 
                        ? "bg-blue-800 text-white" 
                        : "bg-white/20 text-white backdrop-blur-sm"
                      : scrolled
                        ? "text-blue-700 hover:bg-blue-50" 
                        : "text-blue-50 hover:bg-white/10"
                  } ${route.highlight ? 'bg-amber-500/20 hover:bg-amber-500/30' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center">
                    {route.icon && route.icon}
                    {route.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 