import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import HouseLoanInterestRate from "./HouseLoanInterestRate";
import HouseLoanInterestRateDisplay from "./HouseLoanInterestRateDisplay";

const FLASK_API_URL = import.meta.env.VITE_FLASK_URL; // Should end with `/api`
const decryptCustomerId = (token) => atob(token);

const IssueHouseLoan = () => {
    const { token } = useParams();

    const customerId = decryptCustomerId(token);

    const [bpsLoadingStep, setBpsLoadingStep] = useState(null);
    const [bpsError, setBpsError] = useState(false);



    const [customerData, setCustomerData] = useState(null);
    const [loanTypes, setLoanTypes] = useState({});
    const [selectedLoan, setSelectedLoan] = useState("");
    const [loanAmount, setLoanAmount] = useState("");
    const [loanDurationYears, setLoanDurationYears] = useState(1);
    const [receivedData, setReceivedData] = useState(null);
    const [receivedBpsData, setReceivedBpsData] = useState(null);

    useEffect(() => {
        axios
            .get(`${FLASK_API_URL}/customer-details/${customerId}`)
            .then((response) => setCustomerData(response.data))
            .catch((error) =>
                console.error("Error fetching customer details:", error)
            );

        axios
            .get(`${FLASK_API_URL}/get_house_loan_json/`)
            .then((response) => setLoanTypes(response.data))
            .catch((error) =>
                console.error("Error fetching loan types:", error)
            );
    }, [customerId]);

    const handleLoanTypeChange = (e) => setSelectedLoan(e.target.value);

    const handleDynamicInterestCalculation = () => {
        if (!customerData || !selectedLoan || !loanAmount || !loanDurationYears) {
            console.error("Missing required fields for interest calculation.");
            return;
        }
        const baseRate = loanTypes[selectedLoan] || 0;
        const requestData = {
            customer_id: customerData.CustomerID,
            LoanAmount: loanAmount,
            LoanDuration: loanDurationYears,
            BaseRate: baseRate,
        };

        // Clear previous data
        localStorage.removeItem("emiData");
        localStorage.removeItem("emiBpsData");

        setBpsLoadingStep("Processing customer data...");
        setBpsError(false);


        axios
            .post(`${FLASK_API_URL}/house_loan_predict/`, requestData)
            .then((response) => {
                setReceivedData(response.data);
                // Store new data
                localStorage.setItem("emiData", JSON.stringify(response.data));
            })
            .catch((error) =>
                console.error("Error fetching predicted interest rate:", error)
            );
        setBpsLoadingStep("Processing customer data...");
        setBpsError(false);

        axios
            .post(`${FLASK_API_URL}/house_loan_predictor/`, requestData)
            .then((response) => {
                setBpsLoadingStep("Fetching market trends...");
                setTimeout(() => {
                    setBpsLoadingStep("Calculating final BPS...");
                    setTimeout(() => {
                        setReceivedBpsData(response.data);
                        localStorage.setItem("emiBpsData", JSON.stringify(response.data));
                        setBpsLoadingStep(null); // clear loading state
                    }, 1000);
                }, 1000);
            })
            .catch((error) => {
                console.error("Error fetching predicted BPS rate:", error);
                setBpsLoadingStep(null);
                setBpsError(true);
            });

    };

    const formatNumberIndian = (num) => {
        if (!num || isNaN(num)) return "";
        return new Intl.NumberFormat("en-IN").format(num);
    };

    const convertNumberToWords = (num) => {
        const ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
            "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        if (num === 0) return "Zero";
        let words = "";

        if (Math.floor(num / 10000000) > 0) {
            words += convertNumberToWords(Math.floor(num / 10000000)) + " Crore ";
            num %= 10000000;
        }
        if (Math.floor(num / 100000) > 0) {
            words += convertNumberToWords(Math.floor(num / 100000)) + " Lakh ";
            num %= 100000;
        }
        if (Math.floor(num / 1000) > 0) {
            words += convertNumberToWords(Math.floor(num / 1000)) + " Thousand ";
            num %= 1000;
        }
        if (Math.floor(num / 100) > 0) {
            words += convertNumberToWords(Math.floor(num / 100)) + " Hundred ";
            num %= 100;
        }
        if (num > 0) {
            if (words !== "") words += "and ";
            if (num < 20) {
                words += ones[num];
            } else {
                words += tens[Math.floor(num / 10)];
                if (num % 10 > 0) words += " " + ones[num % 10];
            }
        }
        return words.trim();
    };


    const handleEmiClick = () => {
        const newUrl = `/employee/issue-loan/emi-analysis/${token}`;
        window.open(newUrl, "_blank");
    };
    const handleBpsTableClick = () => {
        const newUrl = `/employee/issue-loan/bps-breakdown/${token}`;
        window.open(newUrl, "_blank");
    };

    const totalMonths = loanDurationYears * 12;
    const today = new Date();
    const todayDateStr = today.toLocaleDateString();
    const closingDate = new Date();
    closingDate.setMonth(closingDate.getMonth() + totalMonths);
    const closingDateStr = closingDate.toLocaleDateString();

    return (
        <div className="p-6 w-full min-h-screen bg-gray-100">
            <h2 className="text-3xl font-bold text-center mb-10">Issue House Loan</h2>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                                <select
                                    value={selectedLoan}
                                    onChange={handleLoanTypeChange}
                                    className="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select Loan Type</option>
                                    {Object.keys(loanTypes).map((loanName) => (
                                        <option key={loanName} value={loanName}>
                                            {loanName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Rate (%)</label>
                                <input
                                    type="text"
                                    value={selectedLoan && loanTypes[selectedLoan] ? loanTypes[selectedLoan] : "N/A"}
                                    disabled
                                    className="w-full border rounded p-2 bg-gray-100 text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                            <input
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                placeholder="Enter Loan Amount"
                                className="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                            />
                            {loanAmount && !isNaN(loanAmount) && (
                                <div className="mt-2">
                                    <p className="text-lg text-blue-600 font-semibold">₹{formatNumberIndian(Number(loanAmount))}</p>
                                    <p className="text-md text-gray-700">
                                        In Words: {convertNumberToWords(Number(loanAmount))} rupees only
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years)</label>
                            <select
                                value={loanDurationYears}
                                onChange={(e) => setLoanDurationYears(Number(e.target.value))}
                                className="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                            >
                                {Array.from({ length: 29 }, (_, i) => i + 1).map((year) => (
                                    <option key={year} value={year}>
                                        {year} {year === 1 ? "Year" : "Years"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <p className="text-blue-600 font-medium">Today's Date: {todayDateStr}</p>
                            <p className="text-green-600 font-medium">Loan Ending Date: {closingDateStr}</p>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleDynamicInterestCalculation}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                            >
                                Calculate Interest
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-600 mt-6">Loading customer data...</div>
            )}

            {receivedData && (
                <div className="mt-10">
                    <HouseLoanInterestRate receivedData={receivedData} />
                </div>
            )}
            {bpsLoadingStep && (
                <div className="mt-10 text-center text-blue-600 font-medium">
                    {bpsLoadingStep}
                </div>
            )}

            {bpsError && (
                <div className="mt-10 text-center text-red-600 font-semibold">
                    Failed to calculate BPS. Please try again later.
                </div>
            )}

            {receivedBpsData && (
                <>
                    <div className="mt-10">
                        <HouseLoanInterestRateDisplay receivedBpsData={receivedBpsData} />
                    </div>
                    <div className="text-center mt-6">
                        <button
                            onClick={handleEmiClick}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                        >
                            Calculate EMI
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <button
                            onClick={handleBpsTableClick}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded"
                        >
                            View Bps BreakDown
                        </button>
                    </div>

                </>
            )}
        </div>
    );
};

export default IssueHouseLoan;
