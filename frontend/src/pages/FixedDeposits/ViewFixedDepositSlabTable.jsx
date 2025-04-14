import React, { useState, useEffect } from "react";
import axios from "axios";

// A reusable table component to render each fixed deposit slab data set.
const FixedDepositTable = ({ title, data }) => {
    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border px-4 py-2 text-left">Tenure</th>
                        <th className="border px-4 py-2 text-left">Regular Customers (%)</th>
                        <th className="border px-4 py-2 text-left">Senior Citizens (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{item.Tenure}</td>
                            <td className="border px-4 py-2">{item["Regular customers"]}</td>
                            <td className="border px-4 py-2">{item["Senior citizens"]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ViewFixedDepositSlabTable = () => {
    const [fixedDepositData, setFixedDepositData] = useState({});
    const [lastModified, setLastModified] = useState(null);

    // Declare the Flask API base URL (should end with `/api`)
    const FLASK_API_URL = import.meta.env.VITE_FLASK_URL;

    // Fetch the fixed deposit data from the API.
    const fetchFixedDepositData = () => {
        axios
            .get(`${FLASK_API_URL}/get_fixed_deposit_json/`)
            .then((response) => {
                setFixedDepositData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching fixed deposit data:", error);
            });
    };

    // Fetch the last modified date from the API.
    const fetchLastModified = () => {
        axios
            .get(`${FLASK_API_URL}/fixed_deposit_last_modified/`)
            .then((response) => {
                if (response.data.last_modified) {
                    setLastModified(response.data.last_modified);
                }
            })
            .catch((error) => {
                console.error("Error fetching last modified:", error);
            });
    };

    // Handler to manually refresh the data (triggers a save & re-fetch)
    const handleRefreshRates = () => {
        axios
            .post(`${FLASK_API_URL}/save_fixed_deposit_json/`)
            .then((response) => {
                console.log(response.data.message);
                // After refreshing, fetch the updated data and last modified date
                fetchFixedDepositData();
                fetchLastModified();
            })
            .catch((error) =>
                console.error("Error refreshing fixed deposit rates:", error)
            );
    };

    // Compute a "time ago" string based on the last modified timestamp.
    const getTimeAgo = (lastModifiedStr) => {
        if (!lastModifiedStr) return "";
        const lastModifiedDate = new Date(lastModifiedStr);
        const now = new Date();
        const diff = Math.floor((now - lastModifiedDate) / 1000);
        if (diff < 60) return `${diff} sec ago`;
        else if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        else return `${Math.floor(diff / 3600)} hrs ago`;
    };

    // Trigger data fetch on component mount.
    useEffect(() => {
        fetchFixedDepositData();
        fetchLastModified();
    }, []);

    // Render the two tables if the keys are present.
    return (
        <div className="p-6 mx-auto bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-3xl font-bold text-center mb-2 md:mb-0">
                    Fixed Deposit Slab Table
                </h2>
            </div>
            <div className="overflow-x-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3">
                    <button
                        onClick={handleRefreshRates}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-2 md:mb-0"
                    >
                        Fetch Live Data 🔄
                    </button>
                    {lastModified && (
                        <p className="text-sm text-gray-600">
                            Rates updated {getTimeAgo(lastModified)}
                        </p>
                    )}
                </div>
                {fixedDepositData["below 3 cr"] && fixedDepositData["above 3 cr"] ? (
                    <>
                        <FixedDepositTable
                            title="Fixed Deposit Rates (Below 3 Cr)"
                            data={fixedDepositData["below 3 cr"]}
                        />
                        <FixedDepositTable
                            title="Fixed Deposit Rates (Above 3 Cr)"
                            data={fixedDepositData["above 3 cr"]}
                        />
                    </>
                ) : (
                    <p className="text-center">No fixed deposit rates available.</p>
                )}
            </div>
        </div>
    );
};

export default ViewFixedDepositSlabTable;
