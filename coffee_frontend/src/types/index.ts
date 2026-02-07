export interface Order {
    id: number;
    customerName: string;
    drinkType: string;
    prepTimeMinutes: number;
    price: number;
    arrivalTime: string;
    startTime: string | null;
    endTime: string | null;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    priorityScore: number;
    timesSkipped: number;
    isLoyaltyMember: boolean;
    waitTimeMinutes?: number; // Calculated on frontend if needed or from backend helper
}

export interface Barista {
    id: number;
    name: string;
    busyUntil: string | null;
    totalOrdersCompleted: number;
    totalMinutesAssigned: number;
    status?: 'IDLE' | 'BUSY'; // Derived from busyUntil
}

export interface Worker {
    id: number;
    username: string;
    role: string;
}

export interface AuthResponse {
    id: number;
    username: string;
    role: string;
    token: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    isLoyaltyMember: boolean;
}
