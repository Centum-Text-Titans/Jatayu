import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    // Open-source images from Unsplash based on relevant search queries
    const carouselImages = [
        "https://source.unsplash.com/800x600/?house,loan",
        "https://source.unsplash.com/800x600/?home,interior",
        "https://source.unsplash.com/800x600/?bank,loan",
        "https://source.unsplash.com/800x600/?fixed,deposit",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-change the carousel slide every 3 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [carouselImages.length]);

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-center text-blue-700">
                    House Loan & Fixed Deposits
                </h1>
                <p className="text-center text-gray-600 mt-2">
                    Secure your future with the best financial solutions.
                </p>
            </header>

            {/* Carousel */}
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg mb-10">
                {carouselImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    {carouselImages.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-3 h-3 rounded-full mx-1 cursor-pointer transition-colors ${idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                                }`}
                            onClick={() => setCurrentIndex(idx)}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* House Loan Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
                    <h2 className="text-2xl font-bold mb-2 text-blue-700">House Loan</h2>
                    <p className="text-gray-700 text-base">
                        Explore competitive rates and flexible tenure options for your
                        dream home. Our tailored house loan solutions help you achieve
                        home ownership with ease.
                    </p>
                </div>
                {/* Fixed Deposits Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105">
                    <h2 className="text-2xl font-bold mb-2 text-blue-700">
                        Fixed Deposits
                    </h2>
                    <p className="text-gray-700 text-base">
                        Secure your future with our fixed deposit schemes offering high
                        interest rates and assured returns. Benefit from safe and lucrative
                        investments.
                    </p>
                </div>
            </div>

            {/* Call-to-Action Button */}
            <div className="mt-10 text-center">
                <button
                    onClick={() => navigate("/contact")}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Learn More
                </button>
            </div>
        </div>
    );
}
