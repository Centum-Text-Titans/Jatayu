import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import FixedDepositInterestRate from "./FixedDepositInterestRate";
import EMIAnalysis from "./EMIAnalysis";

const FLASK_API_URL = import.meta.env.VITE_FLASK_URL;
const decryptCustomerId = (token) => atob(token);

const IssueFixedDeposit = () => {
    const { token } = useParams();
    const customerId = decryptCustomerId(token);

    const [customerData, setCustomerData] = useState(null);
    const [loanTypes, setLoanTypes] = useState({});
    const [depositAmount, setDepositAmount] = useState("");

    // Duration states from 3 dropdowns.
    const [selectedYears, setSelectedYears] = useState("0");
    const [selectedMonths, setSelectedMonths] = useState("0");
    const [selectedDays, setSelectedDays] = useState("0");

    // Selected FD slab based on the computed duration.
    const [selectedSlab, setSelectedSlab] = useState(null);

    const [receivedData, setReceivedData] = useState(null);
    const [showEmiAnalysis, setShowEmiAnalysis] = useState(false);



   

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

    useEffect(() => {
        axios
            .get(`${FLASK_API_URL}/customer-details/${customerId}`)
            .then((response) => setCustomerData(response.data))
            .catch((error) =>
                console.error("Error fetching customer details:", error)
            );

        axios
            .get(`${FLASK_API_URL}/get_fixed_deposit_json/`)
            .then((response) => setLoanTypes(response.data))
            .catch((error) =>
                console.error("Error fetching fixed deposit slabs:", error)
            );
    }, [customerId]);

    const depositCategory =
        Number(depositAmount) > 0 && Number(depositAmount) <= 30000000
            ? "below 3 cr"
            : Number(depositAmount) > 30000000
                ? "above 3 cr"
                : "";

    // Calculates the total duration in years from selected year, month, and day.
    const getTotalDurationYears = () => {
        const years = parseInt(selectedYears, 10);
        const months = parseInt(selectedMonths, 10);
        const days = parseInt(selectedDays, 10);
        return years + months / 12 + days / 365;
    };

    // For each slab, calculate its average duration.
    const getAverageDurationFromSlab = (tenure) => {
        // The tenure string could be like "1 year - 1 year 364 days" or "7 days - 45 days"
        const parts = tenure.split("-");
        const parseDuration = (s) => {
            let years = 0, days = 0;
            const yearMatch = s.match(/(\d+)\s*year/);
            const dayMatch = s.match(/(\d+)\s*day/);
            if (yearMatch) years = parseFloat(yearMatch[1]);
            if (dayMatch) days = parseFloat(dayMatch[1]);
            return years + days / 365;
        };
        return parts.length === 2
            ? (parseDuration(parts[0]) + parseDuration(parts[1])) / 2
            : parseDuration(parts[0]);
    };

    // Auto-detect the slab based on the computed duration.
    const detectSlab = () => {
        const durationYears = getTotalDurationYears();
        if (!depositCategory || !loanTypes[depositCategory] || durationYears <= 0) {
            setSelectedSlab(null);
            return;
        }

        const slabs = loanTypes[depositCategory];
        let match = null;
        let closestDiff = Infinity;

        slabs.forEach((slab) => {
            const avgDuration = getAverageDurationFromSlab(slab.Tenure);
            const diff = Math.abs(avgDuration - durationYears);
            if (diff < closestDiff) {
                closestDiff = diff;
                match = slab;
            }
        });
        setSelectedSlab(match);
    };

    // Update the slab every time the deposit amount or duration changes.
    useEffect(() => {
        detectSlab();
    }, [depositAmount, selectedYears, selectedMonths, selectedDays, loanTypes]);

    // Auto determine customer type from age.
    const customerType = customerData?.Age > 60 ? "Senior Citizen" : "Regular";

    // Get the interest rate (base rate) from the slab based on customer type.
    const rate = selectedSlab
        ? parseFloat(
            (customerType === "Senior Citizen"
                ? selectedSlab["Senior citizens"]
                : selectedSlab["Regular customers"]
            ).replace("%", "")
        )
        : null;

    // Updated handle function to call the backend route.
    const handleCalculateFDInterest = async () => {
        const durationYears = getTotalDurationYears();
        if (!selectedSlab || !rate || !depositAmount || durationYears <= 0) {
            console.error("Missing or invalid inputs for FD calculation.");
            return;
        }
        const totalDurationYears = parseFloat(selectedYears) + parseFloat(selectedMonths) / 12 + parseFloat(selectedDays) / 365;


        // Prepare payload for the POST request.
        const payload = {
            customer_id: customerId,
            LoanAmount: depositAmount,
            LoanDuration: totalDurationYears, // Pass duration as float (in years)
            BaseRate: rate
        };

        try {
            const response = await axios.post(
                `${FLASK_API_URL}/fixed_deposit_predict/`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.data) {
                setReceivedData(response.data);
            }
        } catch (error) {
            console.error("Error calculating FD interest using backend:", error);
        }
    };

    // Formatting function for numbers in Indian style.
    const formatNumberIndian = (num) => new Intl.NumberFormat("en-IN").format(num);

    // Today's date and estimated maturity date.
    const today = new Date();
    const todayDateStr = today.toLocaleDateString();
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + getTotalDurationYears() * 365);
    const maturityDateStr = getTotalDurationYears() > 0 ? maturityDate.toLocaleDateString() : "N/A";

    // Create arrays for dropdown options.
    const yearsOptions = Array.from({ length: 11 }, (_, i) => i); // 0 to 10
    const monthsOptions = Array.from({ length: 12 }, (_, i) => i); // 0 to 11
    const daysOptions = Array.from({ length: 31 }, (_, i) => i);   // 0 to 30

    return (
        <div className="p-6 w-full min-h-screen bg-gray-100">
            <h2 className="text-3xl font-bold text-center mb-10">Issue Fixed Deposit</h2>

            {customerData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Details */}
                    <div className="bg-white p-6 rounded-xl shadow border space-y-2">
                        <h3 className="text-xl font-bold border-b pb-2">{customerData.CustomerName}</h3>
                        <p>Customer ID: {customerData.CustomerID}</p>
                        <p>Age: {customerData.Age}</p>
                        <p>Credit Score: {customerData.CreditScore}</p>
                        <p>Marital Status: {customerData.MaritalStatus}</p>
                        <p>Education: {customerData.EducationLevel}</p>
                        <p>Annual Income: ₹{formatNumberIndian(customerData.AnnualIncome)}</p>
                        <p>Home Ownership: {customerData.HomeOwnershipStatus}</p>
                    </div>

                    {/* Fixed Deposit Input Form */}
                    <div className="bg-white p-6 rounded-xl shadow border space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2"
                                placeholder="Enter Deposit Amount"
                                value={depositAmount}
                                onChange={(e) => {
                                    setDepositAmount(e.target.value);
                                    setSelectedSlab(null);
                                }}
                            />
                            <div>
                            {depositAmount && !isNaN(depositAmount) && (
                                <div className="mt-2">
                                    <p className="text-lg text-blue-600 font-semibold">₹{formatNumberIndian(Number(depositAmount))}</p>
                                    <p className="text-md text-gray-700">
                                        In Words: {convertNumberToWords(Number(depositAmount))} rupees only
                                    </p>
                                </div>
                            )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Category</label>
                            <input
                                type="text"
                                value={
                                    depositCategory === "below 3 cr"
                                        ? "Less than ₹3 Cr"
                                        : depositCategory === "above 3 cr"
                                            ? "Greater than ₹3 Cr"
                                            : "N/A"
                                }
                                disabled
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>


                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
                                <select
                                    value={selectedYears}
                                    onChange={(e) => setSelectedYears(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {yearsOptions.map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                                <select
                                    value={selectedMonths}
                                    onChange={(e) => setSelectedMonths(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {monthsOptions.map((mo) => (
                                        <option key={mo} value={mo}>{mo}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                                <select
                                    value={selectedDays}
                                    onChange={(e) => setSelectedDays(e.target.value)}
                                    className="w-full border rounded p-2"
                                >
                                    {daysOptions.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detected Tenure Slab</label>
                            <input
                                type="text"
                                value={selectedSlab?.Tenure || "Not matched"}
                                disabled
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                            <input
                                type="text"
                                value={customerType}
                                disabled
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
                            <input
                                type="text"
                                value={rate ? `${rate}%` : "N/A"}
                                disabled
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Today's Date: {todayDateStr}</span>
                            <span>Maturity Date: {maturityDateStr}</span>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleCalculateFDInterest}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                            >
                                Calculate FD Interest
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center mt-6 text-gray-600">Loading customer details...</p>
            )}

            {receivedData && (
                <>
                    <div className="mt-10">
                        <FixedDepositInterestRate receivedData={receivedData} />
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => setShowEmiAnalysis(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                        >
                            Calculate EMI
                        </button>
                    </div>

                    {showEmiAnalysis && (
                        <div className="mt-6">
                            <EMIAnalysis response_data={receivedData} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default IssueFixedDeposit;
