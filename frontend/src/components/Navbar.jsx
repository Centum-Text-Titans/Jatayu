import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Importing Link and useLocation

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation(); // Get current route

    // Function to determine if the link is active
    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-white">
                    <a href="/" className="flex items-center space-x-2">
                        <span>🤖 Dynamic Interest Rate AI</span>
                    </a>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6">
                    <Link
                        to="/login"
                        className={`text-white hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-lg transition-all ${isActive("/login")}`}
                    >
                        Login
                    </Link>
                 
                    <Link
                        to="/about"
                        className={`text-white hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-lg transition-all ${isActive("/about")}`}
                    >
                        About
                    </Link>
                </div>

                {/* Mobile Menu Hamburger */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-lg rounded-lg p-4 absolute top-16 left-0 right-0 z-40 transition-transform transform duration-300">
                    <div className="flex flex-col items-center space-y-4">
                        <Link
                            to="/login"
                            className={`text-lg text-black px-4 py-2 rounded-lg transition-all ${isActive("/login")}`}
                        >
                            Login
                        </Link>
                       
                        <Link
                            to="/about"
                            className={`text-lg text-black px-4 py-2 rounded-lg transition-all ${isActive("/about")}`}
                        >
                            About
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
