import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Cookies from "js-cookie";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { loggedIn, userName, setLoggedIn, setUserRole, setUserName } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path ? "text-gray-300" : "text-white";

    const handleLogout = () => {
        Cookies.remove("jwt");
        setLoggedIn(false);
        setUserRole("");
        setUserName("");
        navigate("/");
    };

    return (
        <nav className="bg-blue-500 p-4 flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">Dynamic AI Interest Rate</Link>

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
