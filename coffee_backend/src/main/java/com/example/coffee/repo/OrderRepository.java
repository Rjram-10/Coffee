package com.example.coffee.repo;

import com.example.coffee.model.Order;
import com.example.coffee.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByStatusOrderByPriorityScoreDesc(OrderStatus status);
}
