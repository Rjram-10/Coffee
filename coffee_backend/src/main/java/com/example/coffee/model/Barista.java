package com.example.coffee.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "baristas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Barista {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    // Workload tracking
    private LocalDateTime busyUntil; // When they will be free
    private int totalOrdersCompleted;
    
    // To identify if they are overloaded or underloaded relative to others
    // We can calculate this dynamically, but storing total prep time assigned helps
    private int totalMinutesAssigned; 

    public boolean isBusy() {
        return busyUntil != null && busyUntil.isAfter(LocalDateTime.now());
    }
}
