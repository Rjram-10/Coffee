import { useState, useEffect } from 'react';
import api from '../api';
import type { Order, Barista, Customer } from '../types';

export const useCoffeeSystem = (enabled: boolean) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [baristas, setBaristas] = useState<Barista[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [ordersRes, baristasRes] = await Promise.all([
                api.get('/orders'),
                api.get('/baristas')
            ]);
            setOrders(ordersRes.data);
            setBaristas(baristasRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [enabled]);

    const placeOrder = async (drinkType: string, customerName: string, customer: Customer | null = null) => {
        // Find details based on drink type (simplified for frontend demo)

        let prepTime = 2;
        let price = 150;

        switch (drinkType) {
            case 'Cold Brew': prepTime = 1; price = 120; break;
            case 'Espresso': prepTime = 2; price = 150; break;
            case 'Americano': prepTime = 2; price = 140; break;
            case 'Cappuccino': prepTime = 4; price = 180; break;
            case 'Latte': prepTime = 4; price = 200; break;
            case 'Specialty': prepTime = 6; price = 250; break;
        }

        const newOrder: any = {
            customerName: customer ? customer.name : (customerName || `Customer-${Math.floor(Math.random() * 1000)}`),
            drinkType,
            prepTimeMinutes: prepTime,
            price,
            arrivalTime: new Date().toISOString(), // Backend might override this
            status: 'PENDING',
            priorityScore: 0,
            timesSkipped: 0,
            customer: customer ? { id: customer.id } : null
        };

        await api.post('/orders', newOrder);
        fetchData(); // Refresh immediately
    };

    return { orders, baristas, loading, placeOrder };
};
