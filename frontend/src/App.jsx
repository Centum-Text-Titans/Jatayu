import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import { UserContext } from "./context/UserContext";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Define your base API URL as a constant
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
    const { loggedIn, setLoggedIn, userRole, setUserRole, setUserName } = useContext(UserContext);

    useEffect(() => {
        const jwtToken = document.cookie.split('; ').find(row => row.startsWith('jwt='));
        if (jwtToken) {
            const checkAuthenticationStatus = async () => {
                try {
                    const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
                    const { username, role } = response.data;

                    setLoggedIn(true);
                    setUserRole(role);
                    setUserName(username);
                } catch (error) {
                    console.error("Error during authentication check:", error);
                    setLoggedIn(false); // Handle token expiration or invalidity
                }
            };
            checkAuthenticationStatus();
        }
    }, [setLoggedIn, setUserRole, setUserName]);

    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route
                    path="/"
                    element={
                        loggedIn ? (
                            <Navigate to={`/${userRole}`} replace />
                        ) : (
                            <Home />
                        )
                    }
                />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/user" element={<Users/>} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Routes for each role */}
                <Route path="/employee/*" element={loggedIn && userRole === "employee" ? <EmployeeRoutes /> : <Navigate to="/login" replace />} />
                <Route path="/user/*" element={loggedIn && userRole === "user" ? <UserRoutes /> : <Navigate to="/login" replace />} />
                <Route path="/admin/*" element={loggedIn && userRole === "admin" ? <AdminRoutes /> : <Navigate to="/login" replace />} />
            </Routes>
            <Footer/>
        </Router>
    );
}

// Placeholder components for role-specific routes
const EmployeeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            {/* Add your employee-specific sub-routes here */}
        </Routes>
    );
};

const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            {/* Add your user-specific sub-routes here */}
        </Routes>
    );
};

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Leaderboard />} />
            {/* Add your admin-specific sub-routes here */}
        </Routes>
    );
};
