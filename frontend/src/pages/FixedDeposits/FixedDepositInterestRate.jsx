import React from "react";

// Helper function to provide dynamic text explanation for the bonus adjustment.
// Convert basis points to percentage (100 bps = 1%)
const getBonusExplanation = (baseRate, bonusBps, finalRate) => {
    // Convert basis points to percentage
    const bonusPercentage = (bonusBps / 100).toFixed(2);
    
    return `Your fixed deposit base rate is ${baseRate}%. Based on your customer relationship, an additional bonus of ${bonusPercentage}% has been added, resulting in a final interest rate of ${finalRate}%. This bonus reward is our way of appreciating your loyalty.`;
};

// RatingBar component renders a horizontal segmented bar with a pointer and a legend.
const RatingBar = ({ label, value, baseRate, bonusBps, finalRate }) => {
    const segments = [
        { label: "Low", min: 0, max: 4, color: "#e3342f" },
        { label: "Below Average", min: 4, max: 5, color: "#f6993f" },
        { label: "Average", min: 5, max: 6, color: "#ffed4a" },
        { label: "Good", min: 6, max: 7, color: "#38c172" },
        { label: "Excellent", min: 7, max: 10, color: "#1c7ed6" },
    ];

    // Calculate pointer position as a percentage of the total range (0-10)
    const pointerPos = (value / 10) * 100;

    return (
        <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-700 text-center">{label}</h4>
            <div
                className="relative h-2 w-full rounded overflow-hidden"
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
            <div className="mt-4 text-sm text-gray-600 text-center px-4">
                {getBonusExplanation(baseRate, bonusBps, finalRate)}
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
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

const FixedDepositInterestRate = ({ receivedData }) => {
    if (!receivedData) return null;

    const baseRate = receivedData.base_rate ? parseFloat(receivedData.base_rate) : 0;
    const bonusBps = receivedData.Bonus_bps ? parseFloat(receivedData.Bonus_bps) : 0;
    const finalRate = receivedData.FinalRate ? parseFloat(receivedData.FinalRate) : 0;
    
    // Calculate CRS score from received data or use default
    const crsScore = receivedData.CRS ? parseFloat(receivedData.CRS) : 0;

    return (
        <div className="flex justify-center items-start bg-gray-100 p-2 pt-8">
            <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-5">
                <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    📊 Fixed Deposit Analysis Report
                </h3>

                <div className="flex flex-col md:flex-row md:justify-center gap-8">
                    {/* Left Card */}
                    <div className="flex-1 max-w-md p-6 bg-blue-100 rounded-lg shadow text-center">
                        <p className="text-lg font-medium text-gray-600 mb-2">
                            Customer Relationship Score (CRS)
                        </p>
                        <p className="text-5xl font-bold text-blue-600">
                            {crsScore}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            This score helped determine your interest rate bonus.
                        </p>
                    </div>

                    {/* Right Card */}
                    <div className="flex-1 max-w-md p-6 bg-green-100 rounded-lg shadow">
                        <RatingBar
                            label="FD Interest Bonus"
                            value={crsScore}
                            baseRate={baseRate}
                            bonusBps={bonusBps}
                            finalRate={finalRate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FixedDepositInterestRate;