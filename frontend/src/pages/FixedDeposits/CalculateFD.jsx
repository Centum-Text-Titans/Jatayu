import { useEffect, useState } from 'react';

const CalculateFD = () => {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(6.5);
    const [time, setTime] = useState(5);
    const [bps, setBps] = useState(0);

    const [maturityWithoutBps, setMaturityWithoutBps] = useState(0);
    const [maturityWithBps, setMaturityWithBps] = useState(0);
    const [interestWithoutBps, setInterestWithoutBps] = useState(0);
    const [interestWithBps, setInterestWithBps] = useState(0);

    useEffect(() => {
        const r = rate / 100;
        const rBps = (rate + bps / 100) / 100;

        const compound = (P, r, t) => P * Math.pow((1 + r), t);

        const maturity1 = compound(principal, r, time);
        const maturity2 = compound(principal, rBps, time);

        setMaturityWithoutBps(Math.round(maturity1));
        setMaturityWithBps(Math.round(maturity2));
        setInterestWithoutBps(Math.round(maturity1 - principal));
        setInterestWithBps(Math.round(maturity2 - principal));
    }, [principal, rate, time, bps]);

    return (
        <div className="max-w-5xl mx-auto mt-10 p-8 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">💰 FD Calculator with BPS Adjustment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6 bg-white rounded-xl p-6 shadow-md">
                    <Slider label="💸 Investment Amount" min={1000} max={1000000} step={1000} value={principal} onChange={setPrincipal} suffix="₹" />
                    <Slider label="📈 Interest Rate (p.a)" min={1} max={15} step={0.1} value={rate} onChange={setRate} suffix="%" />
                    <Slider label="📆 Tenure (Years)" min={1} max={10} step={1} value={time} onChange={setTime} suffix="Yr" />
                    <Slider label="📉 BPS Adjustment" min={0} max={100} step={1} value={bps} onChange={setBps} suffix="bps" />
                </div>

                <div className="space-y-6 bg-white rounded-xl p-6 shadow-md">
                    <Comparison label="Total Interest Earned" before={interestWithoutBps} after={interestWithBps} />
                    <Comparison label="Maturity Amount" before={maturityWithoutBps} after={maturityWithBps} border />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                <PieChart title="Without BPS" interestPercentage={(interestWithoutBps / maturityWithoutBps) * 100} />
                <PieChart title="With BPS" interestPercentage={(interestWithBps / maturityWithBps) * 100} />
            </div>
        </div>
    );
};

const Slider = ({ label, min, max, step, value, onChange, suffix }) => (
    <div className="space-y-2">
        <label className="block font-semibold text-gray-700">{label}</label>
        <div className="flex justify-between items-center text-gray-600">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg cursor-pointer appearance-none accent-indigo-500"
            />
            <span className="ml-4 text-indigo-600 font-bold">{value.toLocaleString()} {suffix}</span>
        </div>
    </div>
);

const Comparison = ({ label, before, after, border }) => (
    <div className={`${border ? 'border-t pt-4' : ''} text-gray-700`}>
        <div className="text-lg font-medium">{label}</div>
        <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">Without BPS: ₹{before.toLocaleString()}</span>
            <span className="text-blue-600 font-semibold">With BPS: ₹{after.toLocaleString()}</span>
        </div>
    </div>
);

const PieChart = ({ title, interestPercentage }) => {
    const dashArray = 251;
    const interestDash = (interestPercentage * dashArray) / 100;
    const principalDash = dashArray - interestDash;

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">{title}</h3>
            <div className="relative h-56 w-56">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="20"
                        strokeDasharray={`${interestDash} ${principalDash}`}
                        strokeDashoffset="0"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-gray-700">
                    <Legend color="bg-gray-300" text="Principal" />
                    <Legend color="bg-indigo-500" text="Interest" />
                </div>
            </div>
        </div>
    );
};

const Legend = ({ color, text }) => (
    <div className="flex items-center space-x-2 mt-1">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span>{text}</span>
    </div>
);

export default CalculateFD;
