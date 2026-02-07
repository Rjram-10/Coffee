package com.example.coffee.service;

import com.example.coffee.model.Barista;
import com.example.coffee.model.Customer;
import com.example.coffee.model.Order;
import com.example.coffee.model.OrderStatus;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final PriorityService priorityService;

    @Data
    public static class SimulationReport {
        private int testCaseId;
        private int totalOrders;
        private double averageWaitTimeMinutes;
        private Map<String, Integer> baristaWorkload; // Barista Name -> Orders Completed
        private Map<String, Integer> drinkBreakdown; // Drink Type -> Count
        private int complaintsCount;
    }

    public List<SimulationReport> runSimulation() {
        List<SimulationReport> reports = new ArrayList<>();
        
        for (int i = 1; i <= 10; i++) {
            reports.add(runTestCase(i));
        }
        
        return reports;
    }

    private SimulationReport runTestCase(int caseId) {
        // Setup 3 Baristas (In-memory)
        List<Barista> baristas = new ArrayList<>();
        for (int b = 1; b <= 3; b++) {
            baristas.add(new Barista((long)b, "Barista " + b, null, 0, 0));
        }

        // Generate Random Orders (200-300)
        Random rand = new Random();
        int numOrders = 200 + rand.nextInt(101); // 200 to 300
        List<Order> orders = new ArrayList<>();
        
        // Start at 7:00 AM today
        LocalDateTime simStartTime = LocalDateTime.now().withHour(7).withMinute(0).withSecond(0).withNano(0);
        
        Map<String, Integer> drinkCounts = new HashMap<>();

        for (int j = 0; j < numOrders; j++) {
            Order o = new Order();
            o.setId((long)j);
            String drink = getRandomDrink(rand);
            o.setDrinkType(drink);
            o.setPrepTimeMinutes(getPrepTime(o.getDrinkType()));
            o.setArrivalTime(simStartTime.plusSeconds(rand.nextInt(10800))); // Arrive within 3 hours (7am - 10am)
            
            // Track drink counts
            drinkCounts.put(drink, drinkCounts.getOrDefault(drink, 0) + 1);

            // Mock Customer for Loyalty
            boolean isVip = rand.nextDouble() > 0.8; // 20% mock VIP
            if (isVip) {
                Customer c = new Customer();
                c.setLoyaltyMember(true);
                o.setCustomer(c);
            }
            
            o.setStatus(OrderStatus.PENDING);
            orders.add(o);
        }

        // Sort by arrival time to simulate real flow
        orders.sort(Comparator.comparing(Order::getArrivalTime));

        // SIMULATION STATE
        Map<Long, LocalDateTime> baristaFreeTime = new HashMap<>(); 
        Map<Long, Integer> baristaMinutesWorked = new HashMap<>(); // Track workload (minutes)
        Map<String, Integer> workloadCount = new HashMap<>(); // Track count for report

        for (Barista b : baristas) {
            baristaFreeTime.put(b.getId(), simStartTime);
            baristaMinutesWorked.put(b.getId(), 0);
            workloadCount.put(b.getName(), 0);
        }

        long totalWaitMinutes = 0;
        int complaints = 0;
        int processedSuccessfully = 0;
        int orderIdx = 0;

        // Use a List for the queue so we can search/filter for Workload Balancing
        List<Order> activeQueue = new ArrayList<>();
        
        LocalDateTime currentTime = orders.get(0).getArrivalTime();
        
        // LOOP
        while (orderIdx < numOrders || !activeQueue.isEmpty()) {
            
            // 1. Add arrived orders
            while (orderIdx < numOrders && !orders.get(orderIdx).getArrivalTime().isAfter(currentTime)) {
                activeQueue.add(orders.get(orderIdx));
                orderIdx++;
            }

            // 2. RE-CALCULATE PRIORITIES (Every 30 seconds)
            // Function: Wait(40%) + Complexity(25%) + Loyalty(10%) + Urgency(25%)
            for (Order o : activeQueue) {
                long waitMins = java.time.Duration.between(o.getArrivalTime(), currentTime).toMinutes();
                
                // Wait Score: 0-100 (cap at 10 mins)
                double waitScore = Math.min(waitMins, 10) * 10.0;
                
                // Complexity Score: Short (1 min) -> High Score. Long (6 min) -> Low Score.
                double complexityScore = ((6.0 - o.getPrepTimeMinutes()) / 5.0) * 100.0;
                complexityScore = Math.max(0, complexityScore);
                
                // Loyalty
                double loyaltyScore = o.isLoyaltyMember() ? 100.0 : 0.0;
                
                // Urgency (Approaching 8 min timeout)
                double urgencyScore = 0.0;
                if (waitMins >= 8) urgencyScore = 100.0;
                else if (waitMins >= 6) urgencyScore = (waitMins - 6) * 50.0; 
                
                // Weighted Sum
                double total = (waitScore * 0.40) + 
                               (complexityScore * 0.25) + 
                               (loyaltyScore * 0.10) + 
                               (urgencyScore * 0.25);
                               
                // Emergency Boost (>8 min)
                if (waitMins > 8) total += 50.0;
                
                o.setPriorityScore(total);
            }
            
            // Sort Queue by Score Descending
            activeQueue.sort((o1, o2) -> Double.compare(o2.getPriorityScore(), o1.getPriorityScore()));

            // 3. CHECK TIMEOUT / ABANDONMENT
            Iterator<Order> it = activeQueue.iterator();
            while (it.hasNext()) {
                Order o = it.next();
                long w = java.time.Duration.between(o.getArrivalTime(), currentTime).toMinutes();
                
                // > 10 min hard timeout (Order Abandoned / Lost)
                if (w > 10) {
                    it.remove();
                    complaints++; // Count as bad outcome
                }
            }

            // 4. ASSIGN TO BARISTAS (Workload Balancing)
            boolean anyoneBusy = false;
            
            // Calculate Avg Workload
            double totalWork = 0;
            for(long vid : baristaMinutesWorked.keySet()) totalWork += baristaMinutesWorked.get(vid);
            double avgWork = totalWork / 3.0;
            
            for (Barista b : baristas) {
                if (baristaFreeTime.get(b.getId()).isBefore(currentTime) || baristaFreeTime.get(b.getId()).isEqual(currentTime)) {
                     if (!activeQueue.isEmpty()) {
                         // Workload Balancing Strategy
                         double myWork = baristaMinutesWorked.get(b.getId());
                         double ratio = avgWork > 0 ? myWork / avgWork : 1.0;
                         
                         Order bestOrder = null;
                         
                         if (ratio > 1.2) {
                             // Overloaded: Prefer Quick Orders (< 3 mins)
                             for(Order cand : activeQueue) {
                                 if (cand.getPrepTimeMinutes() < 3) {
                                     bestOrder = cand;
                                     break;
                                 }
                             }
                         } else if (ratio < 0.8) {
                             // Underutilized: Prefer Complex Orders (>= 4 mins)
                             for(Order cand : activeQueue) {
                                 if (cand.getPrepTimeMinutes() >= 4) {
                                     bestOrder = cand;
                                     break;
                                 }
                             }
                         }
                         
                         // Fallback: Just take top priority
                         if (bestOrder == null) bestOrder = activeQueue.get(0);
                         
                         // Assign
                         activeQueue.remove(bestOrder);
                         
                         LocalDateTime start = currentTime;
                         LocalDateTime end = start.plusMinutes(bestOrder.getPrepTimeMinutes());
                         
                         baristaFreeTime.put(b.getId(), end);
                         workloadCount.put(b.getName(), workloadCount.get(b.getName()) + 1);
                         baristaMinutesWorked.put(b.getId(), baristaMinutesWorked.get(b.getId()) + bestOrder.getPrepTimeMinutes());
                         
                         long totalTime = java.time.Duration.between(bestOrder.getArrivalTime(), end).toMinutes();
                         totalWaitMinutes += totalTime;
                         processedSuccessfully++;
                         
                         // If we took > 8 mins to serve, it's still a "Complaint" in our stats
                         long waitOnly = java.time.Duration.between(bestOrder.getArrivalTime(), start).toMinutes();
                         if (waitOnly > 8) complaints++; 
                         
                         anyoneBusy = true; 
                     }
                } else {
                    anyoneBusy = true;
                }
            }
            
            currentTime = currentTime.plusSeconds(30);
            
            // Break condition
             if (activeQueue.isEmpty() && orderIdx >= numOrders && !anyoneBusy) {
                 boolean allDone = true;
                 for (Barista b : baristas) {
                     if (baristaFreeTime.get(b.getId()).isAfter(currentTime)) {
                         allDone = false;
                         break;
                     }
                 }
                 if (allDone) break;
            }
        }

        SimulationReport report = new SimulationReport();
        report.setTestCaseId(caseId);
        report.setTotalOrders(numOrders);
        report.setAverageWaitTimeMinutes(processedSuccessfully > 0 ? (double)totalWaitMinutes / processedSuccessfully : 0);
        report.setBaristaWorkload(workloadCount);
        report.setDrinkBreakdown(drinkCounts);
        report.setComplaintsCount(complaints);
        
        return report;
    }

    private String getRandomDrink(Random r) {
        String[] drinks = {"Espresso", "Latte", "Cappuccino", "Cold Brew", "Specialty"};
        return drinks[r.nextInt(drinks.length)];
    }

    private int getPrepTime(String drink) {
        switch (drink) {
            case "Cold Brew": return 1;
            case "Espresso": return 2;
            case "Americano": return 2;
            case "Cappuccino": return 4;
            case "Latte": return 4;
            case "Specialty": return 6;
            default: return 2;
        }
    }
}
