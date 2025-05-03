import React from "react";

// Health Mapping
const healthMapping = {
    CreditScore: [
        [750, Infinity, 100],
        [700, 750, 75],
        [650, 700, 50],
        [-Infinity, 650, 20],
    ],
    Age: [
        [30, 55, 100],
        [25, 30, 70],
        [55, 65, 70],
        [-Infinity, 25, 30],
        [65, Infinity, 30],
    ],
    Tenure: [
        [7, Infinity, 100],
        [4, 7, 75],
        [1, 4, 40],
        [-Infinity, 1, 20],
    ],
    Balance: [
        [100000, Infinity, 100],
        [50000, 100000, 80],
        [10000, 50000, 60],
        [-Infinity, 10000, 30],
    ],
    NumOfProducts: [
        [4, 4, 100],
        [3, 3, 90],
        [2, 2, 75],
        [1, 1, 50],
    ],
    HasCrCard: [
        ["Yes", "Yes", 80],
        ["No", "No", 50],
    ],
    IsActiveMember: [
        ["Yes", "Yes", 100],
        ["No", "No", 40],
    ],
    EstimatedSalary: [
        [150000, Infinity, 100],
        [100000, 150000, 80],
        [50000, 100000, 60],
        [-Infinity, 50000, 30],
    ],
};

// Sample feature values
const featureValues = {
    CreditScore: 720,
    Age: 28,
    Tenure: 5,
    Balance: 45000,
    NumOfProducts: 2,
    HasCrCard: "Yes",
    IsActiveMember: "No",
    EstimatedSalary: 120000,
};

// Helper: get rating for a feature
function getRating(feature, value) {
    const ranges = healthMapping[feature];
    if (!ranges) return 0;

    for (const [min, max, score] of ranges) {
        if (typeof min === "number" && typeof max === "number") {
            if (value >= min && value < max) return score;
            if (min === max && value === min) return score; // exact match
        } else {
            if (min === value && max === value) return score; // categorical
        }
    }
    return 0;
}

// Helper: build segments dynamically
function buildSegments(feature) {
    const mapping = healthMapping[feature];
    if (!mapping) return [];

    const colors = ["#e3342f", "#f6993f", "#ffed4a", "#38c172", "#1f9d55", "#4dc0b5", "#3490dc"];
    return mapping.map(([min, max, score], idx) => ({
        label: `${score} Score`,
        min: score - 10,
        max: score,
        color: colors[idx % colors.length],
    }));
}

// Helper: get pointer position
function getPointerPosition(rating) {
    return rating; // rating is already 0-100
}

// Helper: explanation text
function getFeatureExplanation(feature, rating) {
    if (rating >= 85) return `${feature}: Excellent`;
    if (rating >= 70) return `${feature}: Good`;
    if (rating >= 60) return `${feature}: Average`;
    if (rating >= 40) return `${feature}: Moderate`;
    return `${feature}: Poor`;
}

// Generic RangeBar Component
const RangeBar = ({ feature, value }) => {
    const rating = getRating(feature, value);
    const segments = buildSegments(feature);
    const gradientStyle = `linear-gradient(to right, ${segments.map((seg) => seg.color).join(", ")})`;
    const pointerPos = getPointerPosition(rating);

    return (
        <div className="my-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">{feature}</h4>

            {/* Range Bar */}
            <div
                className="relative h-6 w-full rounded overflow-hidden mb-2"
                style={{ background: gradientStyle }}
            >
                {/* Pointer */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-black transform -translate-x-1/2"
                    style={{ left: `${pointerPos}%` }}
                    title={`${feature}: ${rating.toFixed(2)} %`}
                ></div>

                {/* Value Display */}
                <div
                    className="absolute top-full text-xs font-semibold text-gray-800 transform -translate-x-1/2"
                    style={{ left: `${pointerPos}%`, marginTop: "4px" }}
                >
                    {rating.toFixed(2)}%
                </div>
            </div>

            {/* Explanation */}
            <div className="text-sm text-gray-600 mb-2">
                {getFeatureExplanation(feature, rating)}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
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

// Main Component
const AllParameterRatings = () => {
    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">📈 Parameter Health Ratings</h2>

            {Object.keys(featureValues).map((feature) => (
                <RangeBar key={feature} feature={feature} value={featureValues[feature]} />
            ))}
        </div>
    );
};

export default AllParameterRatings;
