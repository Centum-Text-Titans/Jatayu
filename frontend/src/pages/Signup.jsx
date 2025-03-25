import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
    const navigate = useNavigate();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role should be "student"

    // Local storage keys for storing form values
    const LOCAL_STORAGE_KEYS = {
        USERNAME: 'username',
        PASSWORD: 'password',
        ROLE: 'role',
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem(LOCAL_STORAGE_KEYS.USERNAME);
        const storedPassword = localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD);
        const storedRole = localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE);

        if (storedUsername) setUsername(storedUsername);
        if (storedPassword) setPassword(storedPassword);
        if (storedRole === "student" || storedRole === "examiner") {
            setRole(storedRole); // Ensure only valid roles are set
        }
    }, []);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const signUp = async () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL; // Using environment variable

        try {
            console.log("Signing up with:", { username, role, password });
            const response = await axios.post(`${backendUrl}/signup`, {
                uname: username,  // Use correct key
                role: role,       // Include the role in the request body
                password: password
            });
            

            if (response.data ) {
                toast.success('Signup successful! Redirecting...', {
                    position: 'bottom-right',
                    autoClose: 1400,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'light',
                });

                // Clear local storage after successful signup
                localStorage.removeItem(LOCAL_STORAGE_KEYS.USERNAME);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.PASSWORD);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);

                setTimeout(() => {
                    navigate('/login'); // Ensure route exists
                }, 1800);
            } else {
                toast.error('Signup failed. Please try again.', {
                    position: 'bottom-right',
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('An error occurred. Please try again later.', {
                position: 'bottom-right',
                autoClose: 2000,
            });
        }
    };

    const handleSubmit = () => {
        // Save form values (including role) to local storage
        localStorage.setItem(LOCAL_STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(LOCAL_STORAGE_KEYS.PASSWORD, password);
        localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, role); // Save role

        if (password === confirmPassword) {
            signUp();
        } else {
            toast.error('Password and confirm password do not match.', {
                position: 'bottom-right',
                autoClose: 2000,
            });
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
            <div className="w-full max-w-md bg-white p-7 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center mb-6">Sign up </h1>

                <form>
                    {/* Username Field */}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

             

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirm Password</label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="confirmPassword"
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* Role Dropdown */}
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-600">Select Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="student">Student</option>
                            <option value="examiner">Examiner</option>
                        </select>
                    </div>

                    {/* Show Password Toggle */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            className="mr-2"
                            onChange={togglePasswordVisibility}
                        />
                        <label className="text-sm text-gray-600">Show password</label>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="button"
                        className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                        onClick={handleSubmit}
                    >
                        Sign up
                    </button>

                    <small className="text-center block mt-4 text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
                    </small>
                </form>
            </div>
        </div>
    );
}
