package com.example.coffee.service;

import com.example.coffee.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PriorityService {

    private final Clock clock; // Injected

    // Weights
    private static final double WEIGHT_WAIT_TIME = 0.40;
    private static final double WEIGHT_COMPLEXITY = 0.25;
    private static final double WEIGHT_LOYALTY = 0.10;
    private static final double WEIGHT_URGENCY = 0.25;

    private static final int MAX_WAIT_BEFORE_TIMEOUT = 10; // minutes
    private static final int URGENCY_THRESHOLD = 8; // minutes


    public double calculatePriority(Order order) {
        long waitTimeMinutes = order.getWaitTimeMinutes(clock);
        
        // 1. Wait Time Score (Normalized: 10 mins = 100)
        double waitScore = Math.min((double) waitTimeMinutes / MAX_WAIT_BEFORE_TIMEOUT * 100, 100);

        // 2. Complexity Score (Shorter prep time = Higher priority for throughput)
        // Max prep time is ~6 min. Normalize: (6 - prepTime) / 6 * 100
        // If prepTime is 1, score should be high.
        // Let's assume max possible prep time is 10 for safety
        double complexityScore = Math.max(0, (10.0 - order.getPrepTimeMinutes()) / 10.0 * 100);

        // 3. Loyalty Score
        double loyaltyScore = order.isLoyaltyMember() ? 100 : 0;

        // 4. Urgency Score
        // If wait time > 8 mins, this kicks in hard to avoid timeout
        double urgencyScore = 0;
        if (waitTimeMinutes >= URGENCY_THRESHOLD) {
             // Linear ramp up from 8 to 10 mins
             urgencyScore = 100;
        } else if (waitTimeMinutes > 5) {
            urgencyScore = (waitTimeMinutes - 5) * 20; // 5->0, 6->20, 7->40, 8->60
        }

        double totalScore = (waitScore * WEIGHT_WAIT_TIME) +
                            (complexityScore * WEIGHT_COMPLEXITY) +
                            (loyaltyScore * WEIGHT_LOYALTY) +
                            (urgencyScore * WEIGHT_URGENCY);

        // Emergency Handling: If wait time > 8 min, boost significantly
        if (waitTimeMinutes > 8) {
            totalScore += 50;
        }
        
        return totalScore;
    }
}
