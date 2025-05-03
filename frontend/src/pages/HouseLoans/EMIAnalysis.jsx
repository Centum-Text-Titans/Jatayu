import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const FLASK_API_URL = import.meta.env.VITE_FLASK_URL; // Should end with `/api`
const decryptCustomerId = (token) => atob(token);
const EMIAnalysis = () => {
    const [emiData, setEmiData] = useState(null);
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanDuration, setLoanDuration] = useState(0);
    const [BPS, setBPS] = useState(0);
    const [BPS_Deduction, setBPS_Deduction] = useState(0);
    const [customerData, setCustomerData] = useState(null);
    
    const { token } = useParams();
    const customerId = decryptCustomerId(token);
    // Fetch EMI data from localStorage on component mount
    useEffect(() => {
        const storedData = localStorage.getItem("emiData");
        const storedData1 = localStorage.getItem("emiBpsData");
        if (storedData) {
            const data = JSON.parse(storedData);
            setEmiData(data);
            setLoanAmount(data.loan_amount); // Set the initial loan amount
            setLoanDuration(data.loan_duration); // Set the initial loan duration
        } else {
            console.warn("No EMI data found in localStorage.");
        }
        if (storedData1) {
            const data = JSON.parse(storedData1);
            var bp = data.bps+data.market_bps
            setBPS(bp); // Set the initial loan amount
            setBPS_Deduction(bp/100); // Set the initial loan duration
        } else {
            console.warn("No EMI data found in localStorage.");
        }


        axios
            .get(`${FLASK_API_URL}/customer-details/${customerId}`)
            .then((response) => setCustomerData(response.data))
            .catch((error) => console.error("Error fetching customer details:", error));
    }, []);

    // Handle cases where emiData is still not available (loading state)
    if (!emiData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">No EMI Data Available</h2>
                    <p className="text-gray-500">
                        Please return to the previous page and try calculating EMI again.
                    </p>
                </div>
            </div>
        );
    }
    const formatNumberIndian = (num) => {
        if (!num || isNaN(num)) return "";
        return new Intl.NumberFormat("en-IN").format(num);
    };
    // Destructure after confirming emiData is available
    const {
        CRS,
        RAS,
        base_rate,
        // BPS,
        // BPS_Deduction,
        FinalRate,
    } = emiData;

    const computedFinalRate = base_rate - (BPS / 100);

    // Total number of monthly payments based on current duration
    const totalPayments = loanDuration * 12;

    // Generic function for calculating EMI
    const calculateEMI = (principal, annualRate, tenureYears) => {
        const months = tenureYears * 12;
        const monthlyRate = annualRate / 12 / 100;
        const emi =
            principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);
        return emi;
    };

    // Recalculate EMI values whenever loanAmount or loanDuration updates
    const emiWithoutBPS = calculateEMI(loanAmount, base_rate, loanDuration);
    const emiWithBPS = calculateEMI(loanAmount, computedFinalRate, loanDuration);

    const totalWithoutBPS = emiWithoutBPS * totalPayments;
    const totalWithBPS = emiWithBPS * totalPayments;

    const interestWithoutBPS = totalWithoutBPS - loanAmount;
    const interestWithBPS = totalWithBPS - loanAmount;

    // Calculate percentage breakdowns for the pie charts
    const interestPercentageWithoutBPS = (interestWithoutBPS / totalWithoutBPS) * 100;
    const interestPercentageWithBPS = (interestWithBPS / totalWithBPS) * 100;

    // Handlers for the sliders
    const handleLoanAmountChange = (e) => {
        setLoanAmount(Number(e.target.value));
    };

    const handleLoanDurationChange = (e) => {
        setLoanDuration(Number(e.target.value));
    };



    return (
        <div className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-800">
                EMI Analysis & BPS Discount Impact
            </h2>

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
                        {/* Adjustable Sliders Section */}
                        <div className="bg-white p-4 rounded-lg shadow border space-y-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-1">
                                    Adjust Loan Amount (₹)
                                </label>
                                <input
                                    type="range"
                                    min="100000"
                                    max="10000000"
                                    step="10000"
                                    value={loanAmount}
                                    onChange={handleLoanAmountChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                                />
                                <p className="text-blue-600 font-medium mt-1">
                                    ₹{loanAmount.toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-1">
                                    Adjust Loan Duration (Years)
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={loanDuration}
                                    onChange={handleLoanDurationChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                                />
                                <p className="text-blue-600 font-medium mt-1">
                                    {loanDuration} {loanDuration === 1 ? "Year" : "Years"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-600 mt-6">Loading customer data...</div>
            )}



            {/* Rate and Loan Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-700">Loan & Rate Details</h3>
                    <Detail label="Loan Amount:" value={`₹${loanAmount.toLocaleString()}`} />
                    <Detail label="Loan Duration:" value={`${loanDuration} ${loanDuration > 1 ? 'years' : 'year'}`} />
                    <Detail label="Base Rate:" value={`${base_rate}%`} />
                    <Detail label="BPS Discount:" value={`${BPS} bps  – (${BPS_Deduction}%)`} />
                    <Detail label="Computed Final Rate:" value={`${computedFinalRate.toFixed(2)}%`} />
                    <Detail label="Provided Final Rate:" value={`${FinalRate}%`} />
                    <Detail label="Credit Scores:" value={`CRS: ${CRS}, RAS: ${RAS}`} />
                </div>

                {/* EMI Comparison Section */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-700">EMI Breakdown</h3>
                    <Comparison
                        label="Monthly EMI"
                        before={Math.round(emiWithoutBPS)}
                        after={Math.round(emiWithBPS)}
                    />
                    <Comparison
                        label="Total Interest"
                        before={Math.round(interestWithoutBPS)}
                        after={Math.round(interestWithBPS)}
                    />
                    <Comparison
                        label="Total Payment"
                        before={Math.round(totalWithoutBPS)}
                        after={Math.round(totalWithBPS)}
                        border
                    />
                </div>
            </div>

            {/* Visual Pie Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PieChart
                    title="Without BPS Discount"
                    interestPercentage={interestPercentageWithoutBPS}
                />
                <PieChart
                    title="With BPS Discount"
                    interestPercentage={interestPercentageWithBPS}
                />
            </div>

            {/* Analysis Narrative */}
            <section className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-2xl font-bold text-gray-700">Analysis</h3>
                <p>
                    Without the BPS discount, your monthly EMI is approximately{" "}
                    <span className="font-medium">₹{Math.round(emiWithoutBPS).toLocaleString()}</span>, with a
                    total interest component of around{" "}
                    <span className="font-medium">₹{Math.round(interestWithoutBPS).toLocaleString()}</span> over
                    the entire loan period.
                </p>
                <p>
                    When the bank provides a BPS discount of {BPS} bps (a reduction of {BPS_Deduction}%),
                    your computed final rate decreases to{" "}
                    <span className="font-medium">{computedFinalRate.toFixed(2)}%</span>. This lower rate
                    reduces your monthly EMI to approximately{" "}
                    <span className="font-medium">₹{Math.round(emiWithBPS).toLocaleString()}</span> and lowers the total
                    interest burden to about{" "}
                    <span className="font-medium">₹{Math.round(interestWithBPS).toLocaleString()}</span>.
                </p>
                <p>
                    In summary, the BPS discount effectively reduces your overall cost of borrowing,
                    offering a significant benefit by lowering both the periodic EMI and the cumulative interest payable.
                </p>
            </section>
        </div>
    );
};

const Detail = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="text-gray-800">{value}</span>
    </div>
);

const Comparison = ({ label, before, after, border }) => (
    <div className={`flex justify-between ${border ? 'border-t pt-2' : ''}`}>
        <span className="text-gray-700">{label}</span>
        <div className="font-medium flex gap-4">
            <span className="text-gray-500">Before: ₹{before.toLocaleString()}</span>
            <span className="text-blue-600 font-bold">After: ₹{after.toLocaleString()}</span>
        </div>
    </div>
);

const PieChart = ({ title, interestPercentage }) => (
    <div className="flex flex-col items-center">
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <div className="relative h-56 w-56">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="20"
                    stroke="#EEF2FF"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="20"
                    stroke="#4F6BFF"
                    strokeDasharray={`${interestPercentage * 2.51} 251`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Legend color="bg-gray-200" text="Principal" />
                <Legend color="bg-blue-500" text="Interest" />
            </div>
        </div>
    </div>
);

const Legend = ({ color, text }) => (
    <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm text-gray-600">{text}</span>
    </div>
);

export default EMIAnalysis;
