import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Helper function to format numbers with commas (for non-currency amounts)
const formatNumber = (value) => {
    if (typeof value !== 'number') return value;
    return value.toLocaleString('en-US');
}


const FLASK_API_URL = import.meta.env.VITE_FLASK_URL; // Should end with `/api`
const decryptCustomerId = (token) => atob(token);

const BpsFdTable = () => {
    const [receivedBpsData, setReceivedBpsData] = useState(null);
    const [customerData, setCustomerData] = useState(null);


    const { token } = useParams();
    const customerId = decryptCustomerId(token);

    const formatNumberIndian = (num) => {
        if (!num || isNaN(num)) return "";
        return new Intl.NumberFormat("en-IN").format(num);
    };

    // Fetch data from localStorage when component mounts
    useEffect(() => {
        const storedBpsData = localStorage.getItem("fdBpsData");

        if (storedBpsData) {
            setReceivedBpsData(JSON.parse(storedBpsData));
        }


        axios
            .get(`${FLASK_API_URL}/customer-details/${customerId}`)
            .then((response) => setCustomerData(response.data))
            .catch((error) => console.error("Error fetching customer details:", error));
    }, []); // Empty dependency array ensures this runs once after mount

    // Show loading or empty state if data is not yet available
    if (!receivedBpsData) {
        return (
            <div className="container mx-auto p-6 text-center text-gray-500">
                Loading AI analysis data...
            </div>
        );
    }

    // Destructure the data for easier access
    const {
        bps, // Total BPS adjustment from parameters
        results // Array of parameter details
    } = receivedBpsData;

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 rounded-lg shadow-inner">


            {customerData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                        <div className="mb-4 border-b pb-2">
                            <h3 className="text-2xl font-semibold text-gray-800">
                                {customerData.CustomerName}
                            </h3>
                            <p className="text-sm text-gray-500">Customer ID: {customerData.CustomerID}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700"><span className="font-semibold">Age:</span> {customerData.Age}</p>
                            <p className="text-gray-700"><span className="font-semibold">Credit Score:</span> {customerData.CreditScore}</p>
                            <p className="text-gray-700"><span className="font-semibold">Marital Status:</span> {customerData.MaritalStatus}</p>
                            <p className="text-gray-700"><span className="font-semibold">Education:</span> {customerData.EducationLevel}</p>
                            <p className="text-gray-700"><span className="font-semibold">Annual Income:</span> ₹{formatNumberIndian(customerData.AnnualIncome)}</p>
                            <p className="text-gray-700"><span className="font-semibold">Home Ownership:</span> {customerData.HomeOwnershipStatus}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 space-y-6">
                        {/* Section 3: Detailed Parameter Breakdown */}
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                            Detailed Adjustment Factors
                        </h3>
                        <div className="overflow-x-auto"> {/* Makes table horizontally scrollable on small screens */}
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3 px-4 rounded-l-lg">
                                            Parameter
                                        </th>
                                        <th scope="col" className="py-3 px-4">
                                            Value
                                        </th>
                                        <th scope="col" className="py-3 px-4 text-right rounded-r-lg">
                                            BPS Adjustment
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results && results.length > 0 ? (
                                        results.map((item, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                <th scope="row" className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {item.parameter}
                                                </th>
                                                <td className="py-3 px-4">
                                                    {/* Handle numeric values that might need formatting */}
                                                    {typeof item.value === 'number' && ['Balance', 'EstimatedSalary', 'AnnualIncome', 'LoanAmount', 'MonthlyDebtPayments', 'SavingsAccountBalance', 'CheckingAccountBalance', 'TotalAssets', 'TotalLiabilities', 'MonthlyIncome', 'NetWorth'].includes(item.parameter)
                                                        ? formatNumber(item.value)
                                                        : item.value}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {/* Show BPS with higher precision */}
                                                    {item.bps?.toFixed(4)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-gray-500">
                                                No detailed parameters available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="font-semibold text-gray-900 bg-gray-100">
                                        <th scope="row" colSpan="2" className="py-3 px-4 text-base text-right">Total Customer BPS Adjustment</th>
                                        <td className="py-3 px-4 text-base text-right">{bps?.toFixed(4)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-600 mt-6">Loading customer data...</div>
            )}




        </div>
    );
};

export default BpsFdTable;
