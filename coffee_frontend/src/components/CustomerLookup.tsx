import React, { useState } from 'react';
import api from '../api';
import type { Customer } from '../types';
import { User, Mail, Search, UserPlus, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerLookupProps {
    isOpen: boolean;
    onClose: () => void;
    onCustomerSelect: (customer: Customer) => void;
}

export const CustomerLookup: React.FC<CustomerLookupProps> = ({ isOpen, onClose, onCustomerSelect }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // New customer form
    const [newName, setNewName] = useState('');
    const [createIsLoyalty, setCreateIsLoyalty] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFoundCustomer(null);
        setIsCreating(false);

        try {
            const res = await api.get(`/customers/search?email=${email}`);
            setFoundCustomer(res.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setIsCreating(true);
                setCreateIsLoyalty(false); // Reset for new form
                setNewName('');
            } else {
                setError('Search failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/customers', {
                name: newName,
                email: email,
                isLoyaltyMember: createIsLoyalty
            });
            setFoundCustomer(res.data);
            setIsCreating(false);
        } catch (err) {
            setError('Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const confirmSelection = () => {
        if (foundCustomer) {
            onCustomerSelect(foundCustomer);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-coffee-100 flex items-center gap-2">
                        <User className="text-coffee-500" />
                        Customer Check-in
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {!foundCustomer && !isCreating && (
                        <form onSubmit={handleSearch}>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Customer Email</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                        placeholder="customer@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 bg-coffee-600 hover:bg-coffee-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    {loading ? '...' : <Search size={20} />}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                        </form>
                    )}

                    {isCreating && (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="bg-zinc-800/50 p-4 rounded-lg border border-dashed border-zinc-700 mb-4 text-center">
                                <p className="text-sm text-zinc-400">New Customer Found!</p>
                                <p className="font-mono text-coffee-300 text-sm mt-1">{email}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                        placeholder="John Doe"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Loyalty Status</label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-coffee-600 transition-colors">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={createIsLoyalty}
                                            onChange={(e) => setCreateIsLoyalty(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-300">
                                        Enable VIP Membership
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <UserPlus size={18} />
                                Create Profile
                            </button>
                        </form>
                    )}

                    {foundCustomer && (
                        <div className="space-y-6">
                            <div className="bg-coffee-900/20 border border-coffee-800/50 p-5 rounded-xl text-center">
                                <div className="w-16 h-16 bg-coffee-800/50 rounded-full flex items-center justify-center mx-auto mb-3 text-coffee-200">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-coffee-100">{foundCustomer.name}</h3>
                                <p className="text-coffee-400 text-sm mb-3">{foundCustomer.email}</p>

                                {foundCustomer.isLoyaltyMember ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wide">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                                        VIP Member
                                    </span>
                                ) : (
                                    <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-500 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Standard Member
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={confirmSelection}
                                className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-3 rounded-xl transition-colors"
                            >
                                Continue to Order
                            </button>

                            <button
                                onClick={() => { setFoundCustomer(null); setEmail(''); }}
                                className="w-full text-zinc-500 hover:text-zinc-300 text-xs py-2"
                            >
                                Not this person? Search again
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
