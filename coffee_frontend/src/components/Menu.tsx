import React from 'react';
import { Coffee, CupSoda, Milk } from 'lucide-react';

interface MenuProps {
    onOrder: (drink: string) => void;
}

const DRINKS = [
    { name: "Cold Brew", price: 120, time: 1, icon: CupSoda, color: "text-blue-300" },
    { name: "Espresso", price: 150, time: 2, icon: Coffee, color: "text-orange-300" },
    { name: "Americano", price: 140, time: 2, icon: Coffee, color: "text-amber-200" },
    { name: "Cappuccino", price: 180, time: 4, icon: Milk, color: "text-orange-100" },
    { name: "Latte", price: 200, time: 4, icon: Milk, color: "text-white" },
    { name: "Specialty", price: 250, time: 6, icon: Coffee, color: "text-purple-300" },
];

export const Menu: React.FC<MenuProps> = ({ onOrder }) => {
    return (
        <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-coffee-200">
                    <Coffee className="w-5 h-5" />
                    Menu
                </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {DRINKS.map((drink) => (
                    <button
                        key={drink.name}
                        onClick={() => onOrder(drink.name)}
                        className="group flex flex-col p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-coffee-600 transition-all text-left"
                    >
                        <div className="flex justify-between items-start w-full mb-2">
                            <drink.icon className={`w-6 h-6 ${drink.color}`} />
                            <span className="text-xs font-mono text-zinc-400">{drink.time}m</span>
                        </div>
                        <span className="font-bold text-sm text-zinc-100 group-hover:text-coffee-300 transition-colors">{drink.name}</span>
                        <span className="text-xs text-zinc-500">₹{drink.price}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
