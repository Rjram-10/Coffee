import React, { useState } from 'react';
import api from '../api';
import { BarChart3, Play, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationReport {
    testCaseId: number;
    totalOrders: number;
    averageWaitTimeMinutes: number;
    baristaWorkload: Record<string, number>;
    drinkBreakdown: Record<string, number>;
    complaintsCount: number;
}

interface StatsPageProps {
    onBack: () => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBack }) => {
    const [reports, setReports] = useState<SimulationReport[]>([]);
    const [loading, setLoading] = useState(false);

    const runSimulation = async () => {
        setLoading(true);
        try {
            const res = await api.post('/simulation/run');
            setReports(res.data);
        } catch (err) {
            console.error("Simulation failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregate stats
    const avgWaitAll = reports.length > 0
        ? (reports.reduce((acc, r) => acc + r.averageWaitTimeMinutes, 0) / reports.length).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-zinc-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coffee-200 to-coffee-600 mb-1">
                                OPS<span className="text-coffee-500">.</span>ANALYTICS
                            </h1>
                            <p className="text-zinc-500 text-sm tracking-widest uppercase">Simulation & Reporting</p>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="lg:col-span-3 bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-coffee-200">
                                        <BarChart3 className="w-5 h-5" />
                                        Simulation Results
                                    </h2>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Running 10 test cases (200-300 orders each) to evaluate efficiency.
                                    </p>
                                </div>
                                <button
                                    onClick={runSimulation}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-coffee-600 hover:bg-coffee-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                    Run Simulation
                                </button>
                            </div>

                            {reports.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                                <th className="p-4">Test Case</th>
                                                <th className="p-4">Orders</th>
                                                <th className="p-4">Drink Breakdown</th>
                                                <th className="p-4">Complaints</th>
                                                <th className="p-4">Avg Wait (min)</th>
                                                <th className="p-4">Barista 1 Load</th>
                                                <th className="p-4">Barista 2 Load</th>
                                                <th className="p-4">Barista 3 Load</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r, i) => (
                                                <motion.tr
                                                    key={r.testCaseId}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                                                >
                                                    <td className="p-4 font-mono text-zinc-400">#{r.testCaseId}</td>
                                                    <td className="p-4 font-bold text-zinc-200">{r.totalOrders}</td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                                            {Object.entries(r.drinkBreakdown).map(([drink, count]) => (
                                                                <span key={drink} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
                                                                    <span className="text-coffee-300 font-bold">{drink}:</span> {count}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.complaintsCount > 50 ? 'bg-red-900/30 text-red-400' :
                                                            r.complaintsCount > 20 ? 'bg-orange-900/30 text-orange-400' : 'bg-zinc-800 text-zinc-400'
                                                            }`}>
                                                            {r.complaintsCount}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.averageWaitTimeMinutes < 5 ? 'bg-emerald-900/30 text-emerald-400' :
                                                            r.averageWaitTimeMinutes < 10 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                                                            }`}>
                                                            {r.averageWaitTimeMinutes.toFixed(2)}m
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-zinc-400">{r.baristaWorkload['Barista 1']}</td>
                                                    <td className="p-4 text-zinc-400">{r.baristaWorkload['Barista 2']}</td>
                                                    <td className="p-4 text-zinc-400">{r.baristaWorkload['Barista 3']}</td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                                    <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No simulation data available.</p>
                                    <p className="text-sm">Click "Run Simulation" to generate report.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Overall Performance</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-zinc-400 mb-1">Aggregate Avg Wait</p>
                                        <p className="text-3xl font-black text-coffee-200 font-mono">{avgWaitAll}m</p>
                                    </div>
                                    <div className="h-px bg-zinc-800" />
                                    <div>
                                        <p className="text-sm text-zinc-400 mb-1">Total Orders Simulated</p>
                                        <p className="text-2xl font-bold text-zinc-200 font-mono">
                                            {reports.reduce((acc, r) => acc + r.totalOrders, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
