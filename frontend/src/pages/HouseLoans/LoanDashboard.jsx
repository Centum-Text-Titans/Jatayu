// LoanDashboard.jsx
import React, { useState } from "react";
import IssueHouseLoan from "./IssueHouseLoan";
import HouseLoanInterestRate from "./HouseLoanInterestRate";
import CalculateRate from "./CalculateRate";

const LoanDashboard = () => {
    // Shared state so that changes in one component update the others.
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [loanDurationYears, setLoanDurationYears] = useState(5);
    const [interestRate, setInterestRate] = useState(6.5);
    const [bpsDiscount, setBpsDiscount] = useState(25);
    const [aiData, setAiData] = useState(null);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-center mb-6">House Loan Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <IssueHouseLoan
                    loanAmount={loanAmount}
                    setLoanAmount={setLoanAmount}
                    loanDurationYears={loanDurationYears}
                    setLoanDurationYears={setLoanDurationYears}
                    interestRate={interestRate}
                    setInterestRate={setInterestRate}
                    setAiData={setAiData}
                />
                <CalculateRate
                    loanAmount={loanAmount}
                    setLoanAmount={setLoanAmount}
                    loanDurationYears={loanDurationYears}
                    setLoanDurationYears={setLoanDurationYears}
                    interestRate={interestRate}
                    setInterestRate={setInterestRate}
                    bpsDiscount={bpsDiscount}
                    setBpsDiscount={setBpsDiscount}
                />
            </div>
            {aiData && (
                <div className="mt-8">
                    <HouseLoanInterestRate receivedData={aiData} />
                </div>
            )}
        </div>
    );
};

export default LoanDashboard;
