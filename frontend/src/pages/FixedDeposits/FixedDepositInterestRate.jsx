import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

// Helper function to provide dynamic text explanation for the bonus adjustment.
const getBonusExplanation = (baseRate, bonusBps, finalRate) => {
    return `Your fixed deposit base rate is ${baseRate}%. Based on your customer relationship, an additional bonus of ${bonusBps} basis points has been added, resulting in a final interest rate of ${finalRate}%. This bonus reward is our way of appreciating your loyalty.`;
};

// RatingBar component renders a horizontal segmented bar with a pointer and a legend.
const RatingBar = ({ label, value }) => {
    // Segments representing interest rate performance for fixed deposits.
    const segments = [
        { label: "Low", min: 0, max: 4, color: "#e3342f" },       // red
        { label: "Below Average", min: 4, max: 5, color: "#f6993f" },// orange
        { label: "Average", min: 5, max: 6, color: "#ffed4a" },       // yellow
        { label: "Good", min: 6, max: 7, color: "#38c172" },          // light green
        { label: "Excellent", min: 7, max: 10, color: "#1c7ed6" }     // blue
    ];

    const pointerPos = value; // assuming value directly represents percentage

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
                {getBonusExplanation(
                    // In this context, these values should be passed as needed.
                    "Base Rate", "Bonus BPS", "Final Rate"
                )}
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

const FixedDepositInterestRate = ({ receivedData }) => {
    if (!receivedData) return null;

    // Assume receivedData values are in percentage (base_rate and FinalRate)
    const baseRate = receivedData.base_rate ? parseFloat(receivedData.base_rate) : 0;
    const bonusBps = receivedData.Bonus_bps ? parseFloat(receivedData.Bonus_bps) : 0;
    const finalRate = receivedData.FinalRate ? parseFloat(receivedData.FinalRate) : 0;

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-stretch gap-4">
                {/* Left Panel: Detailed Metrics */}
                <div className="md:w-3/5 p-4">
                    <div className="h-full p-6 bg-white shadow-lg rounded-lg border">
                        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                            📊 Fixed Deposit Analysis Report
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 text-center">
                            Here is the breakdown of your fixed deposit interest rate.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Customer Bonus Card */}
                            <div className="p-4 bg-blue-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Customer Relationship Score (CRS)
                                </p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {receivedData.CRS}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    This score helped determine your bonus points.
                                </p>
                            </div>
                            {/* Base Rate Card */}
                            <div className="p-4 bg-purple-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Base Interest Rate
                                </p>
                                <p className="text-4xl font-bold text-purple-600">
                                    {baseRate ? baseRate.toFixed(2) : "N/A"}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Standard rate applicable for your fixed deposit.
                                </p>
                            </div>
                            {/* Bonus BPS Card */}
                            <div className="p-4 bg-yellow-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Bonus Basis Points (BPS)
                                </p>
                                <p className="text-4xl font-bold text-yellow-600">
                                    {bonusBps}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Extra bonus awarded based on customer loyalty.
                                </p>
                            </div>
                            {/* Final Interest Rate Card */}
                            <div className="p-4 bg-indigo-100 rounded-lg shadow text-center">
                                <p className="text-lg font-medium text-gray-600">
                                    Final Interest Rate
                                </p>
                                <p className="text-4xl font-bold text-indigo-600">
                                    {finalRate ? finalRate.toFixed(2) : "N/A"}%
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Your effective interest rate after bonus adjustments.
                                </p>
                            </div>
                        </div>
                        {/* Interest Calculation Breakdown */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
                            <h4 className="text-lg font-bold text-gray-800 mb-2 text-center">
                                Interest Rate Calculation Details
                            </h4>
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                                <li>
                                    <strong>Base Rate:</strong>{" "}
                                    {baseRate ? baseRate.toFixed(2) + "%" : "N/A"}
                                </li>
                                <li>
                                    <strong>Bonus BPS:</strong> {bonusBps} basis points added based on your customer relationship.
                                </li>
                                <li>
                                    <strong>Final Rate:</strong> {finalRate ? finalRate.toFixed(2) + "%" : "N/A"}
                                </li>
                            </ul>
                            <p className="mt-2 text-sm text-gray-600">
                                Your bonus basis points are added as a reward for your loyalty. This extra bonus increases your fixed deposit interest rate, making your deposit more rewarding.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visual Indicator */}
                <div className="md:w-2/5 p-4 flex flex-col justify-center">
                    <div className="flex justify-center items-center bg-white shadow-md rounded-lg p-4">
                        <div className="text-center w-full">
                            <h4 className="text-lg font-semibold text-gray-700 mb-1">
                                Final Interest Rate Gauge
                            </h4>
                            <div className="flex justify-center">
                                <ReactSpeedometer
                                    maxValue={10} // assuming the highest expected rate is 10%
                                    value={finalRate}
                                    needleColor="#000"
                                    startColor="#e3342f"
                                    endColor="#1c7ed6"
                                    segments={5}
                                    needleHeightRatio={0.8}
                                    ringWidth={25}
                                    height={200}
                                    currentValueText="Interest Rate: ${value}%"
                                />
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    This gauge represents your final effective FD interest rate.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Optional: A rating bar to visually explain bonus adjustments */}
                    <RatingBar label="FD Interest Bonus" value={finalRate * 10} />
                </div>
            </div>
        </div>
    );
};

export default FixedDepositInterestRate;
