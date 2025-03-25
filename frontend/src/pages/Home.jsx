import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="p-6 flex flex-col items-center space-y-8">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                Welcome to the Home Page
            </h1>
            <p className="text-center text-gray-600 text-lg">
                Discover amazing features and connect with others. Start your journey with us today!
            </p>
            <div className="space-x-4">
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/signup")}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
                >
                    Signup
                </button>
            </div>
            
        </div>
    );
}
