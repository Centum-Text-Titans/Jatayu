import React, { useState, useEffect } from "react";
import axios from "axios";

export default function IssueHouseLoan() {
    // Customer and loan state variables
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState("");
    const [loanAmount, setLoanAmount] = useState("");
    const [receivedData, setReceivedData] = useState("");

    // Loan duration split into years and months
    const [loanDurationYears, setLoanDurationYears] = useState(0);


    // Data from endpoints
    const [customerDetails, setCustomerDetails] = useState([]);
    const [loanTypes, setLoanTypes] = useState({});

    // Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [customers, setCustomers] = useState([]);
    const [searchBy, setSearchBy] = useState("Name"); // Options: "Name" or "CID"

    useEffect(() => {
        // Fetch customer details
        axios.get("http://localhost:8000/api/customer-details/")
            .then((response) => {
                setCustomerDetails(response.data.details);
            })
            .catch((error) => {
                console.error("Error fetching customer details:", error);
            });

        // Fetch loan types
        axios.get("http://localhost:8000/api/loan-json/")
            .then((response) => {
                // Expecting a structure like: { "Home Loan": "5.5", "Car Loan": "7.2", ... }
                setLoanTypes(response.data);
            })
            .catch((error) => {
                console.error("Error fetching loan types:", error);
            });
    }, []);

    // Handle customer search filtering
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.length > 1) {
            const filteredCustomers = customerDetails.filter((customer) => {
                if (searchBy === "Name") {
                    return customer.Name.toLowerCase().includes(query.toLowerCase());
                } else if (searchBy === "CID") {
                    return customer.CID.toLowerCase().includes(query.toLowerCase());
                }
                return false;
            });
            setCustomers(filteredCustomers);
        } else {
            setCustomers([]);
        }
    };

    // When a suggestion is clicked, set the selected customer and clear search
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setSearchTerm("");
        setCustomers([]);
    };

    // Handle loan type change
    const handleLoanTypeChange = (e) => {
        setSelectedLoan(e.target.value);
    };


    const handleDynamicInterestCalculation = () => {
        if (!selectedCustomer || !selectedLoan || !loanAmount || !loanDurationYears) {
            console.error("Missing required fields for interest calculation.");
            return;
        }
        console.log(loanTypes[selectedLoan]);

        const totalDuration = loanDurationYears;

        const requestData = {
            CreditScore: selectedCustomer.CreditScore,
            Tenure: selectedCustomer.Tenure,
            NumOfProducts: selectedCustomer.NumOfProducts,
            IsActiveMember: selectedCustomer.IsActiveMember,
            PaymentHistory: selectedCustomer.PaymentHistory,
            LoyaltyScore: selectedCustomer.LoyaltyScore,
            PreviousLoanDefaults: selectedCustomer.PreviousLoanDefaults,
            DebtToIncomeRatio: selectedCustomer.DebtToIncomeRatio,
            NumberOfCreditInquiries: selectedCustomer.NumberOfCreditInquiries,
            LengthOfCreditHistory: selectedCustomer.LengthOfCreditHistory,
            AnnualIncome: selectedCustomer.AnnualIncome,
            MonthlyDebtPayments: selectedCustomer.MonthlyDebtPayments,
            Balance: selectedCustomer.Balance,
            NetWorth: selectedCustomer.NetWorth,
            TotalDebtToIncomeRatio: selectedCustomer.TotalDebtToIncomeRatio,
            LoanAmount: loanAmount,
            LoanDuration: totalDuration,
            BaseRate: loanTypes[selectedLoan],
            HomeOwnershipStatus: selectedCustomer.HomeOwnershipStatus,
            BankruptcyHistory: selectedCustomer.BankruptcyHistory,
            NumberOfOpenCreditLines: selectedCustomer.NumberOfOpenCreditLines,
            EducationLevel: selectedCustomer.EducationLevel,
            MaritalStatus: selectedCustomer.MaritalStatus
        };

        axios.post("http://localhost:8000/api/house-loan-predict/", requestData)
            .then((response) => {
                console.log(response.data);
                if (response.data && response.data) {
                    // setInterestAmount(response.data);
                    setReceivedData(response.data); // Store full response data for display
                } else {
                    console.error("Unexpected API response format:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching predicted interest rate:", error);
            });
    };



    // Compute today's date and closing date dynamically based on the total loan duration.
    const totalMonths = loanDurationYears * 12;
    const today = new Date();
    const todayDateStr = today.toLocaleDateString();
    const closingDate = new Date();
    closingDate.setMonth(closingDate.getMonth() + totalMonths);
    const closingDateStr = closingDate.toLocaleDateString();

    return (
        <div className="p-6 max-w-screen-lg mx-auto bg-white shadow rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">Issue House Loan</h2>

            <div className="space-y-6">
                {/* Customer Search */}
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="sm:w-1/4">
                        <label className="block text-sm font-medium mb-1">Search By</label>
                        <select
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                            className="w-full border p-2 rounded"
                        >
                            <option value="Name">Name</option>
                            <option value="CID">User ID</option>
                        </select>
                    </div>
                    <div className="sm:w-3/4">
                        <label className="block text-sm font-medium mb-1">Customer Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={`Search Customer by ${searchBy}`}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                {/* Customer Suggestions */}
                {customers.length > 0 && (
                    <ul className="border border-gray-200 rounded max-h-60 overflow-y-auto">
                        {customers.map((customer) => (
                            <li
                                key={customer.CID}
                                onClick={() => handleSelectCustomer(customer)}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {customer.Name} ({customer.CID})
                            </li>
                        ))}
                    </ul>
                )}

                {/* Selected Customer Details */}
                {selectedCustomer && (
                    <div className="border rounded p-4 bg-gray-50 overflow-x-auto">
                        <h3 className="text-xl font-semibold mb-3">Selected Customer</h3>
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-2 py-1">User ID</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Age</th>
                                    <th className="border px-2 py-1">Gender</th>
                                    <th className="border px-2 py-1">Credit Score</th>
                                    <th className="border px-2 py-1">Tenure</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border px-2 py-1">{selectedCustomer.CID}</td>
                                    <td className="border px-2 py-1">{selectedCustomer.Name}</td>
                                    <td className="border px-2 py-1">{selectedCustomer.Age}</td>
                                    <td className="border px-2 py-1">{selectedCustomer.Gender}</td>
                                    <td className="border px-2 py-1">{selectedCustomer.CreditScore}</td>
                                    <td className="border px-2 py-1">{selectedCustomer.Tenure}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Loan Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Loan Type</label>
                        <select
                            value={selectedLoan}
                            onChange={handleLoanTypeChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select Loan Type</option>
                            {Object.entries(loanTypes).map(([loanName]) => (
                                <option key={loanName} value={loanName}>
                                    {loanName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Rate (%)</label>
                        <input
                            type="text"
                            value={selectedLoan ? loanTypes[selectedLoan] : ""}
                            disabled
                            className="w-full border p-2 rounded bg-gray-100 text-gray-700"
                        />
                    </div>
                </div>

                {/* Loan Amount */}
                <div>
                    <label className="block text-sm font-medium mb-1">Loan Amount</label>
                    <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="Enter Loan Amount"
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* Loan Duration (Years and Months) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (Years)</label>
                        <select
                            value={loanDurationYears}
                            onChange={(e) => setLoanDurationYears(Number(e.target.value))}
                            className="w-full border p-2 rounded"
                        >
                            {Array.from({ length: 11 }, (_, i) => i).map((year) => (
                                <option key={year} value={year}>
                                    {year} {year === 1 ? "Year" : "Years"}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Loan Dates Display */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
                    <div className="text-xl font-bold text-blue-600">
                        Today's Date: <span className="ml-2">{todayDateStr}</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                        Closing Date: <span className="ml-2">{closingDateStr}</span>
                    </div>
                </div>

                {/* Calculate Interest Button */}
                <div className="text-center mt-6">
                    <button
                        onClick={handleDynamicInterestCalculation}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
                    >
                        Calculate Interest
                    </button>
                </div>



                {receivedData && (
                    <div className="mt-6 p-6 bg-white shadow-lg rounded-lg border w-full max-w-2xl mx-auto text-center">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">📊 AI Analysis Report</h3>
                        <p className="text-lg text-gray-600 mb-6">Here's a detailed breakdown of the AI's risk assessment and loan evaluation:</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-100 rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-600">Customer Relationship Score</p>
                                <p className="text-4xl font-bold text-blue-600">{receivedData['Customer Relation Ship Score']}</p>
                                <p className="text-sm text-gray-500 mt-2">🔹 A higher score indicates stronger financial trust.</p>
                            </div>
                            <div className="p-4 bg-green-100 rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-600">Risk Assessment Score</p>
                                <p className="text-4xl font-bold text-green-600">{receivedData['Risk Assessment Score']}</p>
                                <p className="text-sm text-gray-500 mt-2">⚠️ Lower values mean lower risk for the lender.</p>
                            </div>
                            <div className="p-4 bg-yellow-100 rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-600">BPS Discount</p>
                                <p className="text-4xl font-bold text-yellow-600">{receivedData['bps discount']} BPS</p>
                                <p className="text-sm text-gray-500 mt-2">💰 Indicates potential rate reduction.</p>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg shadow">
                                <p className="text-lg font-medium text-gray-600">BPS Available for Discount</p>
                                <p className="text-4xl font-bold text-red-600">{receivedData['bps available for discount']} BPS</p>
                                <p className="text-sm text-gray-500 mt-2">📉 Maximum reduction applicable.</p>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-lg shadow col-span-2">
                                <p className="text-lg font-medium text-gray-600">Base Rate</p>
                                <p className="text-4xl font-bold text-purple-600">{receivedData['base rate']}%</p>
                                <p className="text-sm text-gray-500 mt-2">📌 The standard interest rate before adjustments.</p>
                            </div>
                            <div className="p-6 bg-indigo-100 rounded-lg shadow col-span-2 border-l-4 border-indigo-600">
                                <h4 className="text-xl font-bold text-indigo-700">Final Interest Rate</h4>
                                <p className="text-5xl font-extrabold text-indigo-800 mt-2">{receivedData['final rate']}%</p>
                                <p className="text-md text-gray-600 mt-3">✅ This is the effective interest rate after applying all discounts and risk adjustments.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
