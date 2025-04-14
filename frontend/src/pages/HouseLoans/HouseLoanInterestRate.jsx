import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

// Helper function to provide dynamic text explanation for the rating bar.
const getRatingExplanation = (value, type) => {
    let rating = "";
    if (type === "Customer Relationship") {
        // For customer relationship, higher is better.
        if (value < 40) {
            rating = "Poor";
        } else if (value < 60) {
            rating = "Moderate";
        } else if (value < 70) {
            rating = "Average";
        } else if (value < 85) {
            rating = "Good";
        } else {
            rating = "Excellent";
        }
        return `${type} is rated as "${rating}". A ${rating.toLowerCase()} score indicates that additional engagement may be needed to improve customer loyalty.`;
    } else {
        // For risk, lower is better.
        if (value < 40) {
            rating = "Excellent";
        } else if (value < 60) {
            rating = "Good";
        } else if (value < 70) {
            rating = "Average";
        } else if (value < 85) {
            rating = "Moderate";
        } else {
            rating = "Poor";
        }
        return `${type} is rated as "${rating}". A ${rating.toLowerCase()} score reflects the risk level, with lower values indicating lower risk.`;
    }
};

// RatingBar component renders a horizontal segmented bar with a pointer and a legend.
const RatingBar = ({ label, value }) => {
    // The segments below match the colors used in the speedometers.
    const segments = [
        { label: "Poor", min: 0, max: 40, color: "#e3342f" },       // red
        { label: "Moderate", min: 40, max: 60, color: "#f6993f" },    // orange
        { label: "Average", min: 60, max: 70, color: "#ffed4a" },     // yellow
        { label: "Good", min: 70, max: 85, color: "#38c172" },        // light green
        { label: "Excellent", min: 85, max: 100, color: "#1c7ed6" }   // blue
    ];

    const pointerPos = value; // since scale is 0-100

    return (
        <div className="my-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">{label}</h4>
            <div
                className="relative h-6 w-full rounded overflow-hidden"
                style={{
                    background: "linear-gradient(to right, " +
                        segments.map(seg => seg.color).join(", ") + ")"
                }}
            >
                {/* Pointer marker */}
                <div
                    className="absolute top-0 h-full w-1 bg-black"
                    style={{ left: `${pointerPos}%` }}
                ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                {getRatingExplanation(value, label)}
            </div>
            {/* Legend */}
            <div className="flex justify-between mt-2">
                {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center space-x-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: seg.color }}
                        ></div>
                        <span className="text-xs">{seg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HouseLoanInterestRate = ({ receivedData }) => {
    if (!receivedData) return null;

    // Convert CRS and RAS (assumed to be decimals between 0 and 1) to percentages.
    const crsPercentage = receivedData.CRS * 100;
    const rasPercentage = receivedData.RAS * 100;

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-stretch gap-4">
                {/* Left Panel: Detailed Metrics – Occupies 3/5 of width */}
                <div className="md:w-3/5 p-4">
                    <div className="h-full p-6 bg-white shadow-lg rounded-lg border">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                            📊 AI Analysis Report
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 text-center">
                            Detailed breakdown of risk assessment and loan evaluation.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* CRS Card */}
                            <div className="p-4 bg-blue-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Customer Relationship Score (CRS)
                                </p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {receivedData.CRS}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Higher values indicate stronger customer loyalty.
                                </p>
                            </div>
                            {/* RAS Card */}
                            <div className="p-4 bg-green-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Risk Assessment Score (RAS)
                                </p>
                                <p className="text-4xl font-bold text-green-600">
                                    {receivedData.RAS.toFixed(3)}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Lower values denote lower credit risk.
                                </p>
                            </div>
                            {/* BPS Available Card */}
                            <div className="p-4 bg-yellow-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    BPS Available
                                </p>
                                <p className="text-4xl font-bold text-yellow-600">
                                    {receivedData.BPS} BPS
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Maximum basis points available for adjustment.
                                </p>
                            </div>
                            {/* BPS Deduction Card */}
                            <div className="p-4 bg-red-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    BPS Deduction Applied
                                </p>
                                <p className="text-4xl font-bold text-red-600">
                                    {receivedData.BPS_Deduction}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Effective rate reduction percentage.
                                </p>
                            </div>
                            {/* Base Rate Card */}
                            <div className="p-4 bg-purple-100 rounded-lg shadow sm:col-span-2 text-center">
                                <p className="text-lg font-medium text-gray-600">Base Rate</p>
                                <p className="text-4xl font-bold text-purple-600">
                                    {receivedData.base_rate ? receivedData.base_rate : "N/A"}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Standard interest rate before adjustments.
                                </p>
                            </div>
                            {/* Final Interest Rate Card */}
                            <div className="p-6 bg-indigo-100 rounded-lg shadow sm:col-span-2 text-center border-l-4 border-indigo-600">
                                <h4 className="text-xl font-bold text-indigo-700">
                                    Final Interest Rate
                                </h4>
                                <p className="text-5xl font-extrabold text-indigo-800 mt-2">
                                    {receivedData.FinalRate}%
                                </p>
                                <p className="text-md text-gray-600 mt-3">
                                    Effective rate after all discounts & adjustments.
                                </p>
                            </div>
                        </div>
                        {/* Interest Calculation Breakdown Card */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 mb-2 text-center">
                                Interest Rate Calculation Details
                            </h4>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                                <li>
                                    <strong>Base Rate:</strong>{" "}
                                    {receivedData.base_rate ? receivedData.base_rate + "%" : "N/A"}
                                </li>
                                <li>
                                    <strong>BPS Deduction:</strong> {receivedData.BPS_Deduction}%
                                    applied (from {receivedData.BPS} BPS available).
                                </li>
                                <li>
                                    <strong>Final Rate:</strong> {receivedData.FinalRate}%
                                </li>
                            </ul>
                            <p className="mt-2 text-sm text-gray-600">
                                Based on risk assessment and customer relationship analysis,
                                the discount helps lower the actual interest rate, ensuring
                                competitive pricing while managing risk.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visual Indicators – Occupies 2/5 of width */}
                <div className="md:w-2/5 p-4 flex flex-col justify-between">
                    {/* Updated Speedometers with improved colors and centered needle */}
                    <div className="mb-4">
                        {/* Customer Relationship Index */}
                        <div className="flex justify-center items-center bg-white shadow-md rounded-lg p-4 mb-2">
                            <div className="text-center w-full">
                                <h4 className="text-lg font-semibold text-gray-700 mb-1">
                                    Customer Relationship Index
                                </h4>
                                <div className="flex justify-center">
                                    <ReactSpeedometer
                                        maxValue={100}
                                        value={crsPercentage}
                                        needleColor="#000"
                                        startColor="#e3342f"
                                        endColor="#38c172"
                                        segments={5}
                                        needleHeightRatio={0.8}
                                        ringWidth={25}
                                        height={160}
                                        currentValueText="Customer Relationship: ${value}%" // ✅ correct syntax
                                    />
                                </div>
                                <div className="mt-2 flex flex-col items-center">
                                    <span className="text-sm text-gray-600">For ideal customer loyalty</span>
                                    <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                                        Your value :{ (receivedData.CRS * 100).toFixed(2)  }

                                    </span>
                                    <span className="mt-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                                        Optimal Range: 30 - 100
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Risk Rating Index */}
                        <div className="flex justify-center items-center bg-white shadow-md rounded-lg p-4">
                            <div className="text-center w-full">
                                <h4 className="text-lg font-semibold text-gray-700 mb-1">
                                    Risk Rating Index
                                </h4>
                                <div className="flex justify-center">
                                    <ReactSpeedometer
                                        maxValue={100}
                                        value={rasPercentage}
                                        needleColor="#000"
                                        startColor="#38c172"
                                        endColor="#e3342f"
                                        segments={5}
                                        needleHeightRatio={0.8}
                                        ringWidth={25}
                                        height={160}
                                        currentValueText="Risk Score: ${value}%" // ✅ correct syntax
                                    />
                                </div>
                                <div className="mt-2 flex flex-col items-center">
                                    <span className="text-sm text-gray-600">For low credit exposure</span>
                                    <span className="mt-1 inline-block bg-blue-100 text-white-800 text-xs font-medium px-3 py-1 rounded-full">
                                        Your value :{ (receivedData.RAS * 100).toFixed(2) }
                                    </span>
                                    <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                                        Optimal Range: 0 - 65
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Horizontal Rating Bars */}
                    <div className="flex-1">
                        <RatingBar label="Customer Relationship" value={crsPercentage} />
                        <RatingBar label="Risk Assessment" value={rasPercentage} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HouseLoanInterestRate;
