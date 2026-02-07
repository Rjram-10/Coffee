import React from 'react';
import type { Order } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface QueueProps {
    orders: Order[];
}

export const Queue: React.FC<QueueProps> = ({ orders }) => {
    // Filter out completed/cancelled orders for the active queue view
    const activeOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING')
        .sort((a, b) => b.priorityScore - a.priorityScore);

    return (
        <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-coffee-200">
                    <TrendingUp className="w-5 h-5 text-coffee-400" />
                    Smart Queue
                </h2>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400 font-mono">
                    {activeOrders.length} pending
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <AnimatePresence>
                    {activeOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className={cn(
                                "p-4 rounded-xl border relative overflow-hidden group hover:shadow-lg transition-all",
                                order.status === 'PROCESSING'
                                    ? "bg-gradient-to-r from-amber-900/40 to-zinc-900 border-amber-700/50"
                                    : order.priorityScore > 80
                                        ? "bg-red-900/20 border-red-800/50"
                                        : "bg-zinc-800/40 border-zinc-700/50"
                            )}
                        >
                            {order.status === 'PROCESSING' && (
                                <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold uppercase rounded-bl-lg">
                                    Brewing
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                                        #{order.id} <span className="text-coffee-400 font-normal">{order.customerName}</span>
                                    </h4>
                                    <p className="text-sm text-zinc-400">{order.drinkType}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-zinc-200 opacity-20 group-hover:opacity-100 transition-opacity">
                                        {Math.round(order.priorityScore)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                                <div className="flex items-center gap-1" title="Wait Time">
                                    <Clock className="w-3 h-3" />
                                    <span>{order.waitTimeMinutes || 0}m</span>
                                </div>
                                {order.isLoyaltyMember && (
                                    <div className="flex items-center gap-1 text-yellow-500/80" title="Loyalty Member">
                                        <Sparkles className="w-3 h-3" />
                                        <span>VIP</span>
                                    </div>
                                )}
                                {order.timesSkipped > 0 && (
                                    <div className="flex items-center gap-1 text-orange-400/80" title={`Skipped ${order.timesSkipped} times`}>
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Skipped {order.timesSkipped}x</span>
                                    </div>
                                )}
                            </div>

                            {/* Priority Bar */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                                <motion.div
                                    className={cn("h-full",
                                        order.priorityScore > 80 ? "bg-red-500" :
                                            order.priorityScore > 50 ? "bg-amber-500" : "bg-blue-500"
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, order.priorityScore)}%` }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {activeOrders.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 italic">
                        No active orders. Time for a coffee break? ☕
                    </div>
                )}
            </div>
        </div>
    );
};
