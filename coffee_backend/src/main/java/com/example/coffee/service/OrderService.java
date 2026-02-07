package com.example.coffee.service;

import com.example.coffee.model.Order;
import com.example.coffee.model.OrderStatus;
import com.example.coffee.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PriorityService priorityService;
    private final Clock clock;

    public Order createOrder(Order order) {
        order.setArrivalTime(LocalDateTime.now(clock));
        order.setStatus(OrderStatus.PENDING);
        order.setPriorityScore(priorityService.calculatePriority(order));
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.PENDING);
    }
    
    public Order save(Order order) {
        return orderRepository.save(order);
    }
}
