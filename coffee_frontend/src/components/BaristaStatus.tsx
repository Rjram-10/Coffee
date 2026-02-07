import React from 'react';
import type { Barista } from '../types';
import { User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface BaristaStatusProps {
    baristas: Barista[];
}

export const BaristaStatus: React.FC<BaristaStatusProps> = ({ baristas }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {baristas.map((barista) => {
                const isBusy = barista.busyUntil && new Date(barista.busyUntil) > new Date();
                return (
                    <motion.div
                        key={barista.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "p-6 rounded-xl border flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300",
                            isBusy
                                ? "bg-amber-900/20 border-amber-800/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                : "bg-emerald-900/20 border-emerald-800/50"
                        )}
                    >
                        <div className="absolute top-2 right-3">
                            <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                isBusy ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                            )}>
                                {isBusy ? "Brewing" : "Ready"}
                            </span>
                        </div>

                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                            isBusy ? "bg-amber-800/40 text-amber-200" : "bg-emerald-800/40 text-emerald-200"
                        )}>
                            <User size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-coffee-100 mb-1">{barista.name}</h3>

                        <div className="w-full mt-4 space-y-2">
                            <div className="flex justify-between text-xs text-coffee-300">
                                <span>Efficiency</span>
                                <span>{Math.round(barista.totalOrdersCompleted * 1.5)}%</span>
                            </div>
                            {/* Fake efficiency meter for visuals */}
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-coffee-500 h-full rounded-full"
                                    style={{ width: `${Math.min(100, barista.totalOrdersCompleted * 5 + 20)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4 w-full justify-center">
                            <div className="text-center">
                                <p className="text-xs text-coffee-400 uppercase tracking-widest">Done</p>
                                <p className="text-lg font-mono font-bold text-coffee-100">{barista.totalOrdersCompleted}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-coffee-400 uppercase tracking-widest">Load</p>
                                <p className="text-lg font-mono font-bold text-coffee-100">{barista.totalMinutesAssigned}m</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
