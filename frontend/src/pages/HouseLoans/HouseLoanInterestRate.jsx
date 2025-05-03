import React from "react";

// CRS Segments (higher = better)
const getCRSSegments = () => [
    { label: "Poor (0-40)", min: 0, max: 40, color: "#e3342f" },       // Red
    { label: "Moderate (40-60)", min: 40, max: 60, color: "#f6993f" }, // Orange
    { label: "Average (60-70)", min: 60, max: 70, color: "#ffed4a" },  // Yellow
    { label: "Good (70-85)", min: 70, max: 85, color: "#38c172" },     // Light Green
    { label: "Excellent (85-100)", min: 85, max: 100, color: "#1f9d55" }, // Dark Green
];

// RAS Segments (lower = better)
const getRASSegments = () => [
    { label: "Excellent (0-40)", min: 0, max: 40, color: "#1f9d55" },  // Dark Green
    { label: "Good (40-60)", min: 40, max: 60, color: "#38c172" },     // Light Green
    { label: "Average (60-70)", min: 60, max: 70, color: "#ffed4a" },  // Yellow
    { label: "Moderate (70-85)", min: 70, max: 85, color: "#f6993f" }, // Orange
    { label: "Poor (85-100)", min: 85, max: 100, color: "#e3342f" },   // Red
];

// Helper: Get explanation text
const getRatingExplanation = (value, type) => {
    let thresholds;
    if (type === "Customer Relationship") {
        thresholds = [
            { limit: 40, label: "Poor" },
            { limit: 60, label: "Moderate" },
            { limit: 70, label: "Average" },
            { limit: 85, label: "Good" },
            { limit: 100, label: "Excellent" },
        ];
    } else {
        thresholds = [
            { limit: 40, label: "Excellent" },
            { limit: 60, label: "Good" },
            { limit: 70, label: "Average" },
            { limit: 85, label: "Moderate" },
            { limit: 100, label: "Poor" },
        ];
    }

    let rating = thresholds.find(t => value < t.limit)?.label || "Excellent";

    if (type === "Customer Relationship") {
        return `${type} is rated "${rating}". Higher values indicate stronger customer loyalty.`;
    } else {
        return `${type} is rated "${rating}". Lower values represent lower credit risk.`;
    }
};

// RatingBar component
const RatingBar = ({ label, value }) => {
    const segments = label === "Customer Relationship" ? getCRSSegments() : getRASSegments();

    const colors = segments.map(seg => seg.color);
    const gradientStyle = `linear-gradient(to right, ${colors.join(", ")})`;

    const pointerPos = value;

    return (
        <div className="my-4 pb-5">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">{label}</h4>
            <div
                className="relative h-6 w-full rounded overflow-hidden mb-2"
                style={{ background: gradientStyle }}
            >
                {/* Pointer */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-black transform -translate-x-1/2"
                    style={{ left: `${pointerPos}%` }}
                    title={`${label}: ${value.toFixed(2)} %`}
                ></div>

                {/* Value Display */}
                <div
                    className="absolute top-full text-xs font-semibold text-gray-800 transform -translate-x-1/2"
                    style={{ left: `${pointerPos}%`, marginTop: "4px" }}
                >
                    {value.toFixed(2)}%
                </div>
            </div>

            {/* Explanation Text */}
            <div className="mt-2 text-sm text-gray-600">
                {getRatingExplanation(value, label)}
            </div>

            {/* Legend */}
            <div className="flex justify-between mt-2 flex-wrap gap-2">
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

// Main HouseLoanInterestRate component
const HouseLoanInterestRate = ({ receivedData }) => {
    const defaultData = {
        CRS: 0.7523,
        RAS: 0.3088,
    };

    const data = receivedData || defaultData;

    const crsPercentage = data.CRS * 100;
    const rasPercentage = data.RAS * 100;

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Left Panel */}
                <div className="md:w-3/5 p-4">
                    <div className="h-full p-6 bg-white shadow-lg rounded-lg border">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                            📊 AI Analysis Report
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 text-center">
                            Detailed breakdown of risk assessment and loan evaluation.
                        </p>

                        {/* Definitions */}
                        <div className="bg-gray-50 p-4 rounded mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Definitions:</h4>
                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-2">
                                <li>
                                    <strong>CRS (Customer Relationship Score)</strong>: Higher values (closer to 100%) indicate stronger customer loyalty and satisfaction.
                                </li>
                                <li>
                                    <strong>RAS (Risk Assessment Score)</strong>: Lower values (closer to 0%) suggest lower credit or lending risk.
                                </li>
                            </ul>
                        </div>

                        {/* CRS & RAS Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Customer Relationship Score (CRS)
                                </p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {crsPercentage.toFixed(2)}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Higher values indicate stronger customer loyalty.
                                </p>
                            </div>

                            <div className="p-4 bg-green-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Risk Assessment Score (RAS)
                                </p>
                                <p className="text-4xl font-bold text-green-600">
                                    {rasPercentage.toFixed(2)}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Lower values denote lower credit risk.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="md:w-2/5 p-4 flex flex-col justify-start">
                    <RatingBar label="Customer Relationship" value={crsPercentage} />
                    <RatingBar label="Risk Assessment" value={rasPercentage} />
                </div>
            </div>
        </div>
    );
};

export default HouseLoanInterestRate;
