import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ViewCustomersFd() {
    const [customerDetails, setCustomerDetails] = useState([]);
    const [userId, setUserId] = useState();
    const [isReversed, setIsReversed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const FLASK_URL = import.meta.env.VITE_FLASK_URL;

    const encryptCustomerId = (customerId) => btoa(customerId);

    // Fetch customer details
    useEffect(() => {
        axios
            .get(`${FLASK_URL}/customer-details/`)
            .then((response) => {
                const details = response.data.details || [];
                console.log("Fetched customer details:", details);
                setCustomerDetails(details);
            })
            .catch((error) => {
                console.error("Error fetching customer details:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [FLASK_URL]);

    // Check for user authentication
    useEffect(() => {
        const checkAuthenticationStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
                console.log("User authenticated, ID:", response.data.id);
                setUserId(response.data.userid);
            } catch (error) {
                console.error("Authentication check failed:", error);
            }
        };
        checkAuthenticationStatus();
    }, [API_URL]);

    // Sort customer details when userId becomes available
    useEffect(() => {
        if (!userId || customerDetails.length === 0) return;

        const sorted = [...customerDetails].sort((a, b) => {
            if (a.AddedBy === userId && b.AddedBy !== userId) return -1;
            if (a.AddedBy !== userId && b.AddedBy === userId) return 1;
            return 0;
        });

        setCustomerDetails(isReversed ? sorted.reverse() : sorted);
    }, [userId]);

    const handleFixedDeposit = (customer) => {
        const token = encryptCustomerId(customer.CustomerID);
        const issueLoanUrl = `employee/issue-fd/${token}`;
        window.open(issueLoanUrl, '_blank');
    };

    const toggleReverseOrder = () => {
        const sorted = [...customerDetails].sort((a, b) => {
            if (a.AddedBy === userId && b.AddedBy !== userId) return -1;
            if (a.AddedBy !== userId && b.AddedBy === userId) return 1;
            return 0;
        });

        const updatedList = isReversed ? sorted : sorted.reverse();

        setCustomerDetails(updatedList);
        setIsReversed(!isReversed);
        setCurrentPage(1);
    };

    // Pagination
    const totalPages = Math.ceil(customerDetails.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = customerDetails.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">All Customers Data</h2>
                    <p className="text-sm text-gray-600">
                        View list of customers registered with our bank.
                    </p>
                </div>
                <button
                    onClick={toggleReverseOrder}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    {isReversed ? 'Original Order' : 'Reverse Order'}
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-600 mt-8">Loading...</div>
            ) : customerDetails.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                            <thead>
                                <tr className="bg-indigo-100 text-gray-800 text-left">
                                    <th className="p-3 border-b">Customer ID</th>
                                    <th className="p-3 border-b">Name</th>
                                    <th className="p-3 border-b">Age</th>
                                    <th className="p-3 border-b">Gender</th>
                                    <th className="p-3 border-b">Credit Score</th>
                                    <th className="p-3 border-b">AddedBy</th>
                                    <th className="p-3 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((customer) => (
                                    <tr
                                        key={customer.CustomerID}
                                        className={`transition ${customer.AddedBy === userId ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                                    >
                                        <td className="p-3 border-b">{customer.CustomerID}</td>
                                        <td className="p-3 border-b">{customer.CustomerName}</td>
                                        <td className="p-3 border-b">{customer.Age}</td>
                                        <td className="p-3 border-b">{customer.Gender}</td>
                                        <td className="p-3 border-b">{customer.CreditScore}</td>
                                        <td className="p-3 border-b">{customer.AddedBy}</td>
                                        <td className="p-3 border-b">
                                            <button
                                                onClick={() => handleFixedDeposit(customer)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                            >
                                                Issue FD
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-600 mt-8">No customer data available.</div>
            )}
        </div>
    );
}
