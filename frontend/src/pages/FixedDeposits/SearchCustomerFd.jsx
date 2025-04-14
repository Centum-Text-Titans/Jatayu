import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper: simple encryption (using btoa for demo purposes)
const encryptCustomerId = (customerId) => btoa(customerId);

const SearchCustomerFd = () => {
    const [customerDetails, setCustomerDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userId, setUserId] = useState(null);
    const [searchBy, setSearchBy] = useState("CustomerName"); // Default to "CustomerName"
    const [filteredCustomers, setFilteredCustomers] = useState([]);

    // States for adding customer data
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");

    // Load base Flask API URL and backend URL from environment
    const FLASK_API_URL = import.meta.env.VITE_FLASK_URL;
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // Check authentication on mount
    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile`, {
                    withCredentials: true,
                });
                setUserId(response.data.userid);
            } catch (error) {
                console.error("Authentication check failed:", error);
            }
        };

        checkAuthenticationStatus();
    }, [API_URL]);

    // Fetch customer details on mount
    useEffect(() => {
        axios
            .get(`${FLASK_API_URL}/customer-details/`)
            .then((response) => {
                console.log(response.data.details);
                setCustomerDetails(response.data.details);
            })
            .catch((error) =>
                console.error("Error fetching customer details:", error)
            );
    }, [FLASK_API_URL]);

    // Handle search input
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.trim().length > 1) {
            const filtered = customerDetails.filter((customer) => {
                if (searchBy === "CustomerName") {
                    return customer.CustomerName
                        .toLowerCase()
                        .includes(query.toLowerCase());
                } else if (searchBy === "CustomerID") {
                    return customer.CustomerID
                        .toLowerCase()
                        .includes(query.toLowerCase());
                }
                return false;
            });
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    };

    // Open new window with encrypted CustomerID for issuing loan
    const handleFixedDeposit = (customer) => {
        const token = encryptCustomerId(customer.CustomerID);
        const issueLoanUrl = `employee/issue-fd/${token}`;
        window.open(issueLoanUrl, "_blank");
    };

    // Handle file selection for adding customer data
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Handle the add customer data submit action
    const handleAddCustomerData = async () => {
        if (!selectedFile) {
            setUploadMessage("Please select a file.");
            return;
        }

        
        const formData = new FormData();
        // Sending userId as addedBy if available, or default to "admin"
        formData.append("addedBy", userId || "admin");
        formData.append("file", selectedFile);

        try {
            const response = await axios.post(
                `${FLASK_API_URL}/add-customer/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setUploadMessage(response.data.message);
            // Optionally, clear the file input and update customers list here
            setSelectedFile(null);
        } catch (error) {
            console.error("Error uploading file:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setUploadMessage(error.response.data.error);
            } else {
                setUploadMessage("An error occurred during upload.");
            }
        }
    };

    return (
        <div className="p-6 mx-auto max-w-6xl bg-gray-50">
            <h2 className="text-3xl font-bold text-center mb-6">
                Search or Add Customer FD   
            </h2>

            {/* Search Section */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6">
                <div className="sm:w-1/4">
                    <label className="block text-sm font-medium mb-1">
                        Search By
                    </label>
                    <select
                        value={searchBy}
                        onChange={(e) => setSearchBy(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="CustomerName">Name</option>
                        <option value="CustomerID">User ID</option>
                    </select>
                </div>
                <div className="sm:w-3/4">
                    <label className="block text-sm font-medium mb-1">
                        Customer Search
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder={`Search Customer by ${searchBy}`}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            {filteredCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.CustomerID}
                            className="p-4 bg-white border rounded shadow hover:shadow-md transition"
                        >
                            <h3 className="text-xl font-semibold">
                                {customer.CustomerName}
                            </h3>
                            <p className="text-sm text-gray-600">
                                User ID: {customer.CustomerID}
                            </p>
                            <p className="text-sm text-gray-600">
                                Age: {customer.Age}
                            </p>
                            <p className="text-sm text-gray-600">
                                Gender: {customer.Gender}
                            </p>
                            <p className="text-sm text-gray-600">
                                Credit Score: {customer.CreditScore}
                            </p>
                            <button
                                onClick={() => handleFixedDeposit(customer)}
                                className="mt-4 bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
                            >
                                Issue Fixed Deposit
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                searchTerm.trim().length > 1 && (
                    <div className="text-center text-gray-600 mb-8">
                        No results found.
                    </div>
                )
            )}

            {/* Add Customer Data Section */}
            <div className="border-t pt-6">
                <h3 className="text-2xl font-bold mb-4 text-center">
                    Add Customer Data
                </h3>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full sm:w-auto mb-4 sm:mb-0"
                        accept=".csv, .xlsx, .pdf"
                    />
                    <button
                        onClick={handleAddCustomerData}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
                    >
                        Add Data
                    </button>
                </div>
                {uploadMessage && (
                    <div className="mt-4 text-center text-sm text-gray-700">
                        {uploadMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchCustomerFd;
