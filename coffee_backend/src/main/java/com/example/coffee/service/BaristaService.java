package com.example.coffee.service;

import com.example.coffee.model.Barista;
import com.example.coffee.model.Order;
import com.example.coffee.model.OrderStatus;
import com.example.coffee.repo.BaristaRepository;
import com.example.coffee.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BaristaService {

    private final BaristaRepository baristaRepository;
    private final OrderRepository orderRepository;
    private final PriorityService priorityService;
    private final Clock clock;

    @Scheduled(fixedRate = 5000) // Check every 5 seconds for assignment
    @Transactional
    public void assignOrders() {
        List<Barista> baristas = baristaRepository.findAll();
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING);

        if (pendingOrders.isEmpty()) return;

        // Recalculate priorities
        for (Order order : pendingOrders) {
            order.setPriorityScore(priorityService.calculatePriority(order));
        }
        // Save updated scores? Only if we persist them, but for now we can just use in memory list
        // Sort by priority descending
        pendingOrders.sort(Comparator.comparingDouble(Order::getPriorityScore).reversed());

        for (Barista barista : baristas) {
            if (!barista.isBusy()) {
                // Find best order for this barista
                // Simple greedy: take highest priority
                // Advanced: check workload logic (overloaded baristas prefer short orders)
                
                if (pendingOrders.isEmpty()) break;
                
                Order orderToAssign = pendingOrders.get(0); 
                // We could iterate to find a "better" fit if barista is overloaded, but keeping it simple for now
                // as per "Available baristas get highest-priority compatible order"
                
                assignOrderToBarista(barista, orderToAssign);
                pendingOrders.remove(orderToAssign);
            }
        }
        
        // Persist priority updates for pending orders that weren't assigned
        orderRepository.saveAll(pendingOrders);
    }

    @Scheduled(fixedRate = 2000) // Check every 2 seconds for completions
    @Transactional
    public void completeOrders() {
        List<Barista> baristas = baristaRepository.findAll();
        LocalDateTime now = LocalDateTime.now(clock);

        for (Barista barista : baristas) {
            if (barista.getBusyUntil() != null && barista.getBusyUntil().isBefore(now)) {
                // Barista finished!
                // Find their processing order? 
                // We didn't link Barista -> Order directly in DB (OneToMany), but we can find the order by status and time?
                // Actually, standard practice would be to store "currentOrderId" on Barista, or "baristaId" on Order.
                // Let's check Order model. It has startTime/endTime but no baristaId.
                // However, we can query orders that are PROCESSING and have startTime + prepTime < now.
            }
        }
        
        // Better approach: Find all PROCESSING orders that should be done by now
        List<Order> processingOrders = orderRepository.findByStatus(OrderStatus.PROCESSING);
        for (Order order : processingOrders) {
             LocalDateTime expected = order.getStartTime().plusMinutes(order.getPrepTimeMinutes());
             if (expected.isBefore(now)) {
                 order.setStatus(OrderStatus.COMPLETED);
                 order.setEndTime(now);
                 orderRepository.save(order);
             }
        }
    }

    private void assignOrderToBarista(Barista barista, Order order) {
        order.setStatus(OrderStatus.PROCESSING);
        order.setStartTime(LocalDateTime.now(clock));
        // Calculate finish time
        LocalDateTime finishTime = LocalDateTime.now(clock).plusMinutes(order.getPrepTimeMinutes());
        barista.setBusyUntil(finishTime);
        barista.setTotalOrdersCompleted(barista.getTotalOrdersCompleted() + 1);
        barista.setTotalMinutesAssigned(barista.getTotalMinutesAssigned() + order.getPrepTimeMinutes());

        orderRepository.save(order);
        baristaRepository.save(barista);
    }

    public List<Barista> getAllBaristas() {
        return baristaRepository.findAll();
    }
    
    // Initializer to create baristas if none exist
    @jakarta.annotation.PostConstruct
    public void initBaristas() {
        if (baristaRepository.count() == 0) {
            baristaRepository.save(new Barista(null, "Barista 1", null, 0, 0));
            baristaRepository.save(new Barista(null, "Barista 2", null, 0, 0));
            baristaRepository.save(new Barista(null, "Barista 3", null, 0, 0));
        }
    }
}
