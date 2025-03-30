import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { UserContext } from "./context/UserContext";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function App() {
    const { loggedIn, setLoggedIn, userRole, setUserRole, setUserName } = useContext(UserContext);

    useEffect(() => {
        const jwt = Cookies.get("jwt");
        if (jwt) {
            const checkAuthenticationStatus = async () => {
                try {
                    const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
                    const { username, role } = response.data;

                    setLoggedIn(true);
                    setUserRole(role);
                    setUserName(username);
                } catch (error) {
                    console.error("Authentication check failed:", error);
                    setLoggedIn(false);
                    Cookies.remove("jwt");
                }
            };
            checkAuthenticationStatus();
        } else {
            setLoggedIn(false);
        }
    }, [setLoggedIn, setUserRole, setUserName]);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={loggedIn ? <Navigate to={`/${userRole}`} replace /> : <Home />} />
                <Route path="/login" element={!loggedIn ? <LoginPage /> : <Navigate to={`/${userRole}`} replace />} />

                {/* Protected Routes */}
                <Route
                    path="/admin/*"
                    element={
                        loggedIn && userRole === "admin" ? (
                            <AdminRoutes />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/employee/*"
                    element={
                        loggedIn && userRole === "employee" ? (
                            <EmployeeRoutes />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/user/*"
                    element={
                        loggedIn && userRole === "user" ? (
                            <UserRoutes />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to={loggedIn ? `/${userRole}` : "/login"} replace />} />
            </Routes>
            <Footer />
        </Router>
    );
}

// Admin Routes
const AdminRoutes = () => (
    <Routes>
        <Route path="/" element={<Users />} />
    </Routes>
);

// Employee Routes
const EmployeeRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
);

// User Routes
const UserRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
);
