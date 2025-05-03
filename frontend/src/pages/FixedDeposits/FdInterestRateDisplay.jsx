import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    RadialBarChart,
    RadialBar,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#FF4442', '#AA00FF', '#00B8D9'];

const sortParameters = (data) => {
    if (!Array.isArray(data)) return { positiveParams: [], improvementParams: [], overallParams: [] };
    const sortedData = [...data].sort((a, b) => b.bps - a.bps);
    return {
        positiveParams: sortedData.slice(0, 4),
        improvementParams: sortedData.slice(4, 8),
        overallParams: data,
    };
};

const FdInterestRateDisplay = ({ receivedBpsData }) => {
    const [positiveParams, setPositiveParams] = useState([]);
    const [improvementParams, setImprovementParams] = useState([]);
    const [overallParams, setOverallParams] = useState([]);

    useEffect(() => {
        if (receivedBpsData?.results && Array.isArray(receivedBpsData.results)) {
            const { positiveParams, improvementParams, overallParams } = sortParameters(receivedBpsData.results);
            setPositiveParams(positiveParams);
            setImprovementParams(improvementParams);
            setOverallParams(overallParams);
        } else {
            console.error('receivedBpsData.results is not an array:', receivedBpsData);
        }
    }, [receivedBpsData]);

    return (
        <div className="flex flex-col gap-12 p-4">
            <h2 className="text-2xl font-bold text-center mb-8">Feature Analysis</h2>
            <div className="w-full bg-white rounded-2xl shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Interest Rate Breakdown</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                    {/* Rate Info Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Base Interest Rate:</span>
                            <span className="font-semibold text-gray-800">{receivedBpsData.base_rate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Market Trend (bps):</span>
                            <span className="font-semibold text-gray-800">{receivedBpsData.market_bps.toFixed(2)} BPS</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Customer Discount (bps):</span>
                            <span className="font-semibold text-green-600">{receivedBpsData.bps.toFixed(2)} BPS</span>
                        </div>
                        <div className="flex justify-between mt-4">
                            <span className="text-lg font-semibold text-gray-800">Final Interest Rate:</span>
                            <span className="text-lg font-bold text-blue-700">{receivedBpsData.final_rate.toFixed(3)}%</span>
                        </div>
                    </div>

                    {/* Radial BPS Chart */}
                    <div className="flex flex-col items-center">
                        <RadialBarChart
                            width={180}
                            height={180}
                            innerRadius="75%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={450} // Full circle: 360 degrees
                            data={[
                                { name: 'bpsFill', value: Math.min(100, Math.abs(receivedBpsData.market_bps + receivedBpsData.bps)) },
                                { name: 'remainder', value: 100 - Math.min(100, Math.abs(receivedBpsData.market_bps + receivedBpsData.bps)) }
                            ]}
                        >
                            <RadialBar
                                background
                                dataKey="value"
                                clockWise
                                cornerRadius={10}
                                fill="#3b82f6"
                                isAnimationActive={false}
                                label={false}
                            >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#e5e7eb" /> {/* Tailwind gray-200 as the background track */}
                            </RadialBar>

                            <text
                                x={90}
                                y={90}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-center text-xl font-semibold text-black"
                            >
                                {(receivedBpsData.market_bps + receivedBpsData.bps).toFixed(1)}
                            </text>
                        </RadialBarChart>

                        <p className="mt-3 text-sm text-gray-600 font-medium text-center">
                            Total BPS 
                        </p>
                    </div>

                </div>
            </div>




            {/* Row 1 - Best Features & To Be Improved */}
            <div className="grid grid-cols-2 gap-8">
                {/* Best Features */}
                <div className="w-full h-[400px] bg-white rounded-2xl shadow p-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Best Features (Histogram)</h3>
                    <ResponsiveContainer>
                        <BarChart data={positiveParams}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="parameter"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name, props) => [`${value} BPS`, `Parameter: ${props.payload.parameter} (${props.payload.value})`]}
                            />
                            <Bar dataKey="bps" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* To Be Improved */}
                <div className="w-full h-[400px] bg-white rounded-2xl shadow p-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Features to Improve (Histogram)</h3>
                    <ResponsiveContainer>
                        <BarChart data={improvementParams}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="parameter"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name, props) => [`${value} BPS`, `Parameter: ${props.payload.parameter} (${props.payload.value})`]}
                            />
                            <Bar dataKey="bps" fill="#FF8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2 - PieChart + Overall Contributions */}
            <div className="grid grid-cols-5 gap-8">
                {/* Pie Chart (2/5) */}
                <div className="col-span-2 w-full h-[400px] bg-white rounded-2xl shadow p-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Top Positive Parameters (Pie Chart)</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={positiveParams}
                                dataKey="bps"
                                nameKey="parameter"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                label={({ parameter, value }) => `${parameter}`}
                            >
                                {positiveParams.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [`${value} BPS`, `${props.payload.parameter} (${props.payload.value})`]}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Overall Contributions (3/5) */}
                <div className="col-span-3 w-full h-[400px] bg-white rounded-2xl shadow p-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Overall Contributions (Histogram)</h3>
                    <ResponsiveContainer>
                        <BarChart data={overallParams}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="parameter"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name, props) => [`${value} BPS`, `${props.payload.parameter} (${props.payload.value})`]}
                            />
                            <Bar dataKey="bps" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default FdInterestRateDisplay;
