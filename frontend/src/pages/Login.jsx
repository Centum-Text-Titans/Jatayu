import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/login`, { identifier, password }, { withCredentials: true });

            if (response.data.status === "success") {
                const profileResponse = await axios.get(`${backendUrl}/profile`, { withCredentials: true });
                const {  role } = profileResponse.data;
                navigate(`/${role}`);
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            toast.error("Invalid credentials or network error.");
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gradient-to-r from-blue-100 via-green-100 to-teal-100 pt-20">
            <ToastContainer position="bottom-right" autoClose={1400} />
            
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-105">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Log In</h1>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-blue-500 focus:outline-none"
                            >
                                {passwordVisible ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow-md hover:from-blue-600 hover:to-teal-600 focus:ring-4 focus:ring-blue-300 focus:outline-none transform transition-transform hover:scale-105"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}   