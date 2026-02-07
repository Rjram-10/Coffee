package com.example.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name="orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String drinkType; // Espresso, Cappuccino, etc.
    
    private int prepTimeMinutes; // 2, 4, 1, 6
    private double price;
    
    private LocalDateTime arrivalTime; // When order was placed
    private LocalDateTime startTime;   // When barista started
    private LocalDateTime endTime;     // When order was completed (delivered)

    @Enumerated(EnumType.STRING)
    private OrderStatus status; // PENDING, PROCESSING, COMPLETED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    // Delegate to Customer entity, helpful for frontend JSON serialization if needed, 
    // or just return false if no customer linked.
    // Using JsonProperty to maintain compatibility with frontend expected field.
    @com.fasterxml.jackson.annotation.JsonProperty("isLoyaltyMember")
    public boolean isLoyaltyMember() {
        return customer != null && customer.isLoyaltyMember();
    }
    
    // Priority Algorithm Params
    private double priorityScore;
    private int timesSkipped; // To track fairness

    // Helper to calculate wait time in minutes
    public long getWaitTimeMinutes(java.time.Clock clock) {
         if (arrivalTime == null) return 0;
         return java.time.Duration.between(arrivalTime, LocalDateTime.now(clock)).toMinutes();
    }
}
