import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
// import Users from "./pages/Admin/Users";
import EmployeeDashboard from "./pages/Employee/EmployeeDashBoard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import IssueHouseLoan from "./pages/HouseLoans/IssueHouseLoan";
import axios from "axios";
import Login from "./pages/Login";
import IssueFixedDeposit from "./pages/FixedDeposits/IssueFixedDeposit";

export default function App() {
    const [authLoading, setAuthLoading] = useState(true);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile`, {
                    withCredentials: true,
                });
                if (response.data.username != null) {
                    setAuthLoading(true);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                setAuthLoading(false);
            }
            setAuthLoading(false);
        };

        checkAuthenticationStatus();
    }, [setAuthLoading, API_URL]);

    if (authLoading) {
        return (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>
        );
    }
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />


                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/employee/*" element={<EmployeeRoutes />} />
                <Route path="/user/*" element={<UserRoutes />} />
                {/* Fallback Route */}
                <Route path="*" element={<Home />} />
            </Routes>
        </Router>
    );
}

// Admin Routes
const AdminRoutes = () => (
    <Routes>
        <Route path="/" element={<AdminDashboard />} />
    </Routes>
);

// Employee Routes
const EmployeeRoutes = () => (
    <Routes>
        <Route path="/" element={<EmployeeDashboard />} />
        <Route path="/issue-loan/:token" element={<IssueHouseLoan />} />
        <Route path="/issue-fd/:token" element={<IssueFixedDeposit />} />
    </Routes>
);

// User Routes
const UserRoutes = () => (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
);
