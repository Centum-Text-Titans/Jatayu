import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewHouseLoanSlabTable = () => {
    const [loanTypes, setLoanTypes] = useState({});
    const [lastModified, setLastModified] = useState(null);

    // ✅ Declare the Flask API base URL
    const FLASK_API_URL = import.meta.env.VITE_FLASK_URL; // Should end with `/api`

    const handleRefreshRates = () => {
        axios
            .get(`${FLASK_API_URL}/save_house_loan_json/`)
            .then((response) => {
                console.log(response.data.message);
                fetchLastModified();
                fetchLoanTypes();
            })
            .catch((error) =>
                console.error("Error refreshing loan rates:", error)
            );
    };

    

    const fetchLoanTypes = () => {
        axios
            .get(`${FLASK_API_URL}/get_house_loan_json/`)
            .then((response) => {
                setLoanTypes(response.data);
            })
            .catch((error) => {
                console.error("Error fetching loan types:", error);
            });
    };

    const fetchLastModified = () => {
        axios
            .get(`${FLASK_API_URL}/house_loan_last_modified/`)
            .then((response) => {
                if (response.data.last_modified) {
                    setLastModified(response.data.last_modified);
                }
            })
            .catch((error) => {
                console.error("Error fetching last modified:", error);
            });
    };

    useEffect(() => {
        fetchLoanTypes();
        fetchLastModified();
    }, []);

    const getTimeAgo = (lastModifiedStr) => {
        if (!lastModifiedStr) return "";
        const lastModifiedDate = new Date(lastModifiedStr);
        const now = new Date();
        const diff = Math.floor((now - lastModifiedDate) / 1000);
        if (diff < 60) return `${diff} sec ago`;
        else if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        else return `${Math.floor(diff / 3600)} hrs ago`;
    };

    return (
        <div className="p-6 mx-auto bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-3xl font-bold text-center mb-2 md:mb-0">
                    House Loan Slab Rates
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
                <table className="min-w-full border-collapse border border-gray-300 ">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border px-4 py-2 text-left">Loan Type</th>
                            <th className="border px-4 py-2 text-left">To Rate (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(loanTypes).length > 0 ? (
                            Object.entries(loanTypes).map(([loanName, rateObj]) => (
                                <tr key={loanName} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{loanName}</td>
                                    <td className="border px-4 py-2">
                                        {rateObj.to_rate ? rateObj.to_rate : rateObj}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="border px-4 py-2" colSpan="2">
                                    No interest rates available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewHouseLoanSlabTable;
