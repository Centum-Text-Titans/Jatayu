import React, { useState } from "react";
import IssueFD from "../FixedDeposits/IssueFD";
import FDHistory from "../FixedDeposits/FDHistory";
import IssueHouseLoan from "../HouseLoans/IssueHouseLoan";
import AdjustRate from "../HouseLoans/AdjustRate";
import HLHistory from "../HouseLoans/HLHistory";
import ChatBot from "../Tools/Chatbot";


export default function EmployeeDashboard() {
    // State for the main toggle: "fd" = Fixed Deposits, "hl" = House Loans.
    const [activeLoanType, setActiveLoanType] = useState("fd");
    // State for the secondary navigation within each mode.
    const [activeSubMenu, setActiveSubMenu] = useState("issue_fd");

    // Render main content based on the current sub-menu selection.
    const renderContent = () => {
        if (activeLoanType === "fd") {
            if (activeSubMenu === "issue_fd") return <IssueFD />;
            if (activeSubMenu === "fd_history") return <FDHistory />;
        } else if (activeLoanType === "hl") {
            if (activeSubMenu === "issue_hl") return <IssueHouseLoan />;
            if (activeSubMenu === "adjust_rate") return <AdjustRate />;
            if (activeSubMenu === "hl_history") return <HLHistory />;
        }
        return <div>Select an option from the menu.</div>;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top header with branch details */}
            <header className="flex justify-between items-center p-4 bg-white shadow">
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                <div className="flex items-center space-x-4">
                    {/* Toggle between Fixed Deposits and House Loans */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                setActiveLoanType("fd");
                                setActiveSubMenu("issue_fd");
                            }}
                            className={`px-4 py-2 rounded-full transition-colors ${activeLoanType === "fd"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Fixed Deposits
                        </button>
                        <button
                            onClick={() => {
                                setActiveLoanType("hl");
                                setActiveSubMenu("issue_hl");
                            }}
                            className={`px-4 py-2 rounded-full transition-colors ${activeLoanType === "hl"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            House Loans
                        </button>
                    </div>
                    {/* Logo */}
                    <img
                        src="/bankLogo.jpg"
                        alt="Logo"
                        className="h-25 w-25 object-cover rounded-full"
                    />
                    {/* Branch details */}
                    <div className="text-right">
                        <div className="text-sm font-bold">Branch Code: B123</div>
                        <div className="text-xs text-gray-500">contact@branch.com</div>
                        <div className="text-xs text-gray-500">+91 9876543210</div>
                        <div className="text-xs text-gray-500">
                            Hyderabad, Telangana
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content area */}
            <div className="flex flex-1 p-6">
                <div className="flex flex-col flex-1">



                    {/* Secondary Navigation based on selected toggle */}
                    <div className="mt-4">
                        {activeLoanType === "fd" && (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveSubMenu("issue_fd")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "issue_fd"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Issue FD
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("fd_history")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "fd_history"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    History
                                </button>
                            </div>
                        )}
                        {activeLoanType === "hl" && (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveSubMenu("issue_hl")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "issue_hl"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Issue House Loan
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("adjust_rate")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "adjust_rate"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Adjust Rate
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("hl_history")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "hl_history"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    History
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main panel content */}
                    <div className="mt-6 p-4 bg-white shadow rounded flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Chat Bot fixed to bottom right */}
            <div className="fixed bottom-4 right-4">
                <ChatBot />
            </div>
        </div>
    );
}








