import { useState,useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [loggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
                setUserName(response.data.username)
                if(response.data.username!=null){

                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                setIsLoggedIn(false);

            }
        };

        checkAuthenticationStatus();
    }, []);

    const isActive = (path) => location.pathname === path ? "text-gray-300" : "text-white";

    const handleLogout = () => {
        // Get all cookies
        document.cookie.split(";").forEach((cookie) => {
            const cookieName = cookie.split("=")[0].trim();
            // Remove each cookie by setting its expiration date in the past
            Cookies.remove(cookieName);
        });
    
        // Redirect to homepage
        navigate("/");
        window.location.reload();
    };
    
    return (
        <nav className="bg-blue-500 p-4 flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">Dynamic AI Interest Rate 🤖</Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
                {loggedIn ? (
                    <>
                        <span className="text-white">Welcome, {userName}</span>
                        <button onClick={handleLogout} className="text-white bg-red-500 px-3 py-1 rounded">Logout</button>
                    </>
                ) : (
                    <Link to="/login" className={`text-white ${isActive("/login")}`}>Login</Link>
                )}
            </div>

            {/* Mobile Navigation (Hamburger Menu) */}
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsOpen(!isOpen)} className="text-white text-3xl">
                    {isOpen ? "×" : "☰"}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-blue-500 flex flex-col items-center space-y-4 py-4">
                    <Link to="/about" className={`text-white ${isActive("/about")}`}>About</Link>
                    {loggedIn ? (
                        <>
                            <span className="text-white">Welcome, {userName}</span>
                            <button onClick={handleLogout} className="text-white bg-red-500 px-3 py-1 rounded">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className={`text-white ${isActive("/login")}`}>Login</Link>
                    )}
                </div>
            )}
        </nav>
    );
}
