import React, { useState } from "react";
import CalculateFD from "../FixedDeposits/CalculateFD";
import SearchCustomerFd from "../FixedDeposits/SearchCustomerFd";
import ViewFixedDepositSlabTable from "../FixedDeposits/ViewFixedDepositSlabTable";
import CalculateRate from "../HouseLoans/CalculateRate";
import ViewCustomers from "../HouseLoans/ViewCustomers";
import ChatBot from "../Tools/Chatbot";
import ViewHouseLoanSlabTable from "../HouseLoans/ViewHouseLoanSlabTable";
import SearchCustomer from "../HouseLoans/SearchCustomer";
import ViewCustomersFd from "../FixedDeposits/ViewCustomersFd";


export default function EmployeeDashboard() {
    // State for the main toggle: "fd" = Fixed Deposits, "hl" = House Loans.
    const [activeLoanType, setActiveLoanType] = useState("hl");
    // State for the secondary navigation within each mode.
    const [activeSubMenu, setActiveSubMenu] = useState("search_or_add_hl");

    // Render main content based on the current sub-menu selection.
    const renderContent = () => {
        if (activeLoanType === "fd") {
            if (activeSubMenu === "calculate_fd") return <CalculateFD />;
            if (activeSubMenu === "search_or_add_fd") return <SearchCustomerFd />;
            if (activeSubMenu === "view_customers_fd") return <ViewCustomersFd />;
            if (activeSubMenu === "slab_table_fd") return <ViewFixedDepositSlabTable />;
        } else if (activeLoanType === "hl") {
            if (activeSubMenu === "calculate_rate") return <CalculateRate />;
            if (activeSubMenu === "search_or_add_hl") return <SearchCustomer />;
            if (activeSubMenu === "view_customers_hl") return <ViewCustomers />;
            if (activeSubMenu === "slab_table_hl") return <ViewHouseLoanSlabTable />;
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
                                setActiveLoanType("hl");
                                setActiveSubMenu("search_or_add_hl");
                            }}
                            className={`px-4 py-2 rounded-full transition-colors ${activeLoanType === "hl"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            House Loans
                        </button>
                        <button
                            onClick={() => {
                                setActiveLoanType("fd");
                                setActiveSubMenu("search_or_add_fd");
                            }}
                            className={`px-4 py-2 rounded-full transition-colors ${activeLoanType === "fd"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            Fixed Deposits
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
                                    onClick={() => setActiveSubMenu("search_or_add_fd")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "search_or_add_fd"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Search or Add Customer
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("calculate_fd")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "calculate_fd"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Calculate FD Amount
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("slab_table_fd")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "slab_table_fd"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    View FD Slab Table
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("view_customers_fd")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "view_customers_fd"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    View Customers
                                </button>
                            </div>
                        )}
                        {activeLoanType === "hl" && (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveSubMenu("search_or_add_hl")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "search_or_add_hl"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Search or Add Customer
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("calculate_rate")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "calculate_rate"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    Calculate Interest Rate
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("slab_table_hl")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "slab_table_hl"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    View Slab Table
                                </button>
                                <button
                                    onClick={() => setActiveSubMenu("view_customers_hl")}
                                    className={`px-3 py-2 rounded transition-colors ${activeSubMenu === "view_customers_hl"
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    View Customers
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








