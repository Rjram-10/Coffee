package com.example.coffee.service;

import com.example.coffee.model.Customer;
import com.example.coffee.model.Order;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

public class PriorityServiceTest {

    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());
    private final PriorityService priorityService = new PriorityService(clock);

    @Test
    public void testPriorityCalculation_Normal() {
        Order order = new Order();
        order.setArrivalTime(LocalDateTime.now(clock).minusMinutes(2)); // Waiting 2 mins
        order.setPrepTimeMinutes(2); // Espresso
        
        Customer customer = new Customer();
        customer.setLoyaltyMember(false);
        order.setCustomer(customer);
        
        double score = priorityService.calculatePriority(order);
        System.out.println("Normal Score: " + score);
        assertTrue(score > 0);
    }

    @Test
    public void testPriorityCalculation_Urgent() {
        Order order = new Order();
        order.setArrivalTime(LocalDateTime.now(clock).minusMinutes(9)); // Waiting 9 mins!
        order.setPrepTimeMinutes(2); 
        
        Customer customer = new Customer();
        customer.setLoyaltyMember(false);
        order.setCustomer(customer);
        
        double score = priorityService.calculatePriority(order);
        System.out.println("Urgent Score: " + score);
        // Should be very high due to emergency boost (+50) and high wait score
        assertTrue(score > 100); 
    }
    
    @Test
    public void testPriorityCalculation_Loyalty() {
         Order normal = new Order();
         normal.setArrivalTime(LocalDateTime.now(clock).minusMinutes(2));
         normal.setPrepTimeMinutes(2);
         Customer c1 = new Customer();
         c1.setLoyaltyMember(false);
         normal.setCustomer(c1);
         
         Order loyal = new Order();
         loyal.setArrivalTime(LocalDateTime.now(clock).minusMinutes(2));
         loyal.setPrepTimeMinutes(2);
         Customer c2 = new Customer();
         c2.setLoyaltyMember(true);
         loyal.setCustomer(c2);
         
         assertTrue(priorityService.calculatePriority(loyal) > priorityService.calculatePriority(normal));
    }
}
