import { useState, useEffect } from 'react';
import { useCoffeeSystem } from './hooks/useCoffeeSystem';
import { BaristaStatus } from './components/BaristaStatus';
import { Queue } from './components/Queue';
import { Menu } from './components/Menu';
import { LoginScreen } from './components/LoginScreen';
import { CustomerLookup } from './components/CustomerLookup';
import { StatsPage } from './components/StatsPage';
import { Coffee, LogOut, BarChart3 } from 'lucide-react';
import type { Worker, Customer } from './types';

function App() {
  // Auth State
  const [worker, setWorker] = useState<Worker | null>(null);

  const { orders, baristas, loading, placeOrder } = useCoffeeSystem(!!worker);

  // View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'stats'>('dashboard');

  // Order Flow State
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);

  const handleLogin = (loggedInWorker: Worker) => {
    setWorker(loggedInWorker);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('auth_worker');
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored) as Worker;
        if (parsed?.username) {
          setWorker(parsed);
        }
      } catch {
        localStorage.removeItem('auth_worker');
      }
    }
  }, []);

  const handleMenuClick = (drink: string) => {
    setSelectedDrink(drink);
    setIsLookupOpen(true);
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (selectedDrink) {
      placeOrder(selectedDrink, customer.name, customer);
      setIsLookupOpen(false);
      setSelectedDrink(null);
    }
  };

  if (!worker) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentView === 'stats') {
    return <StatsPage onBack={() => setCurrentView('dashboard')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-coffee-400 animate-pulse">
        <Coffee className="w-12 h-12 mb-4" />
        <span className="sr-only">Loading Bean & Brew...</span>
      </div>
    );
  }

  // Calculate stats
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const avgWaitTime = completedOrders.length > 0
    ? (completedOrders.reduce((acc, o) => acc + (o.waitTimeMinutes || 0), 0) / completedOrders.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-coffee-900 selection:text-coffee-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coffee-200 to-coffee-600 mb-1">
            BEAN<span className="text-coffee-500">&</span>BREW
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-zinc-500 text-sm tracking-widest uppercase">Smart Queue Operations</p>
            <span className="px-2 py-0.5 bg-coffee-900/40 border border-coffee-800 rounded text-xs text-coffee-300">
              Logged in as: <span className="font-bold">{worker.username}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => setCurrentView('stats')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-400 hover:text-coffee-300 bg-zinc-900/50 hover:bg-zinc-900 rounded-lg border border-zinc-800 transition-all"
          >
            <BarChart3 size={18} />
            Stats & Sim
          </button>

          <div className="h-8 w-px bg-zinc-800 mx-2" />

          <div className="text-right">
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Avg Wait</p>
            <p className="text-xl font-bold font-mono text-coffee-200">{avgWaitTime}m</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-xs uppercase tracking-wider">Served</p>
            <p className="text-xl font-bold font-mono text-emerald-400">{completedOrders.length}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_worker');
              setWorker(null);
            }}
            className="ml-4 p-2 text-zinc-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Baristas & Menu (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <section>
            <h2 className="sr-only">Baristas</h2>
            <BaristaStatus baristas={baristas} />
          </section>

          <section>
            <Menu onOrder={(drink) => handleMenuClick(drink)} />
          </section>

          {/* Simulation Controls - Admin Only? Optional */}
          <section className="bg-zinc-900/30 p-4 rounded-xl border border-dashed border-zinc-800 mt-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"];
                  const drinks = ["Cold Brew", "Espresso", "Latte", "Specialty"];
                  const randomName = names[Math.floor(Math.random() * names.length)];
                  const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];
                  placeOrder(randomDrink, randomName, null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors"
              >
                Add Random Order
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Queue (4 cols) */}
        <div className="lg:col-span-4 h-[600px] lg:h-auto sticky top-4">
          <Queue orders={orders} />
        </div>
      </main>

      <CustomerLookup
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onCustomerSelect={handleCustomerSelect}
      />
    </div>
  );
}

export default App;
