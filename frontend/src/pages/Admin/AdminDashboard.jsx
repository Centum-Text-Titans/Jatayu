import React, { useState } from "react";
import Users from "../Details/Users";
import ChatBot from "../Tools/Chatbot";
import SaveFaiss from "../Tools/SaveFaiss";
// Placeholder components for demo
const History = () => <div>History content goes here...</div>;

export default function AdminDashboard() {
    const [activeMenu, setActiveMenu] = useState("manage_users");

    const renderContent = () => {
        if (activeMenu === "manage_users") return <Users />;
        if (activeMenu === "history") return <History />;
        if (activeMenu === "add_faiss") return <SaveFaiss />;
        return <div>Select an option from the menu.</div>;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-white shadow">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <img
                        src="/bankLogo.jpg"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                    <div className="text-right">
                        <div className="text-sm font-bold">Branch Code: B123</div>
                        <div className="text-xs text-gray-500">contact@branch.com</div>
                        <div className="text-xs text-gray-500">+91 9876543210</div>
                        <div className="text-xs text-gray-500">Hyderabad, Telangana</div>
                    </div>
                </div>
            </header>

            {/* Main area */}
            <div className="flex flex-1 p-6">
                <div className="flex flex-col flex-1">
                    {/* Single-level Menu */}
                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={() => setActiveMenu("manage_users")}
                            className={`px-4 py-2 rounded-full transition-colors ${activeMenu === "manage_users"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => setActiveMenu("history")}
                            className={`px-4 py-2 rounded-full transition-colors ${activeMenu === "history"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setActiveMenu("add_faiss")}
                            className={`px-4 py-2 rounded-full transition-colors ${activeMenu === "add_faiss"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Add FAISS
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-2 p-4 bg-white shadow rounded flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Chatbot */}
            <div className="fixed bottom-4 right-4">
                <ChatBot />
            </div>
        </div>
    );
}
