import { useEffect, useState } from 'react';

const CalculateRate = () => {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTenure, setLoanTenure] = useState(5);
    const [bps, setBps] = useState(0);
    const [emiWithoutBps, setEmiWithoutBps] = useState(0);
    const [emiWithBps, setEmiWithBps] = useState(0);
    const [interestWithoutBps, setInterestWithoutBps] = useState(0);
    const [interestWithBps, setInterestWithBps] = useState(0);
    const [totalWithoutBps, setTotalWithoutBps] = useState(0);
    const [totalWithBps, setTotalWithBps] = useState(0);

    useEffect(() => {
        const monthlyRate = interestRate / 12 / 100;
        const adjustedRate = (interestRate + bps / 100) / 12 / 100;
        const totalPayments = loanTenure * 12;

        const calcEMI = (rate) => {
            return loanAmount * rate * Math.pow(1 + rate, totalPayments) / (Math.pow(1 + rate, totalPayments) - 1);
        };

        const emi1 = calcEMI(monthlyRate);
        const emi2 = calcEMI(adjustedRate);

        setEmiWithoutBps(Math.round(emi1));
        setEmiWithBps(Math.round(emi2));
        setInterestWithoutBps(Math.round(emi1 * totalPayments - loanAmount));
        setInterestWithBps(Math.round(emi2 * totalPayments - loanAmount));
        setTotalWithoutBps(Math.round(emi1 * totalPayments));
        setTotalWithBps(Math.round(emi2 * totalPayments));
    }, [loanAmount, interestRate, loanTenure, bps]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-700">Loan EMI Calculator with BPS Adjustment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Slider label="Loan Amount" min={100000} max={10000000} step={10000} value={loanAmount} onChange={setLoanAmount} suffix="₹" />
                    <Slider label="Rate of Interest (p.a)" min={1} max={20} step={0.1} value={interestRate} onChange={setInterestRate} suffix="%" />
                    <Slider label="Loan Tenure" min={1} max={30} step={1} value={loanTenure} onChange={setLoanTenure} suffix="Yr" />
                    <Slider label="BPS Adjustment" min={0} max={100} step={1} value={bps} onChange={setBps} suffix="bps" />
                </div>
                <div className="space-y-4">
                    <Comparison label="Monthly EMI" before={emiWithoutBps} after={emiWithBps} />
                    <Comparison label="Total Interest" before={interestWithoutBps} after={interestWithBps} />
                    <Comparison label="Total Amount" before={totalWithoutBps} after={totalWithBps} border />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PieChart title="Without BPS" interestPercentage={(interestWithoutBps / totalWithoutBps) * 100} />
                <PieChart title="With BPS" interestPercentage={(interestWithBps / totalWithBps) * 100} />
            </div>
        </div>
    );
};

const Slider = ({ label, min, max, step, value, onChange, suffix }) => (
    <div className="space-y-2">
        <div className="flex justify-between">
            <label className="text-gray-700 font-medium">{label}</label>
            <div className="text-green-500 font-medium">{value.toLocaleString()} {suffix}</div>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
    </div>
);

const Comparison = ({ label, before, after, border }) => (
    <div className={`flex justify-between ${border ? 'border-t pt-2' : ''}`}>
        <div>{label}</div>
        <div className="font-medium flex gap-4">
            <span className="text-gray-500">₹{before.toLocaleString()}</span>
            <span className="text-blue-600 font-bold">₹{after.toLocaleString()}</span>
        </div>
    </div>
);

const PieChart = ({ title, interestPercentage }) => (
    <div className="flex flex-col items-center">
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <div className="relative h-56 w-56">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#EEF2FF" />
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#4F6BFF" strokeDasharray={`${interestPercentage * 2.51} 251`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
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

export default CalculateRate;