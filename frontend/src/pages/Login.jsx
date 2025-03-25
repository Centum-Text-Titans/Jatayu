import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For loading state
    const navigate = useNavigate();

    // Get the environment variable for the backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/login`, {
                identifier,
                password,
            }, { withCredentials: true });
    
            if (response.data.status === "success") {
                try {
                    const profileResponse = await axios.get(`${backendUrl}/profile`, { withCredentials: true });
                    const { username, role } = profileResponse.data;
    
                    // Store user details in localStorage
                    localStorage.setItem("loggedUser", username);
                    localStorage.setItem("userRole", role);
    
                    // Redirect user based on role
                    if (role === "examiner") {
                        navigate("/examiner-dashboard");
                    } else if (role === "student") {
                        navigate("/student-dashboard");
                    } else {
                        navigate("/leaderboard"); // Default route
                    }
                } catch (error) {
                    console.error("Error fetching user profile", error);
                    toast.error("Error fetching profile, please try again.");
                }
            }
        } catch (error) {
            setIsLoading(false); // Stop loading on error
            console.error(error);
            if (error.response) {
                const errorMessage = error.response.data.error;
                if (errorMessage === "UserNotFound") {
                    toast.error("User not found");
                } else if (errorMessage === "IncorrectPassword") {
                    toast.error("Incorrect password");
                } else {
                    toast.error("Login failed");
                }
            } else {
                toast.error("Network error, please try again.");
            }
        }
    };
    

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <ToastContainer
                position="bottom-right"
                autoClose={1400}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-600">Username</label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            placeholder="Enter your username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center mb-6">
                        <input
                            type="checkbox"
                            id="showConfirmPassword"
                            onChange={togglePasswordVisibility}
                            className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <label htmlFor="showConfirmPassword" className="ml-2 text-sm text-gray-600">Show password</label>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 hover:text-blue-700">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
