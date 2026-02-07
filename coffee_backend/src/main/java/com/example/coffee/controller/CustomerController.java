package com.example.coffee.controller;

import com.example.coffee.model.Customer;
import com.example.coffee.repo.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {
    
    private final CustomerRepository customerRepository;

    @GetMapping("/search")
    public ResponseEntity<Customer> getCustomerByEmail(@RequestParam String email) {
        return customerRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerRepository.save(customer);
    }
}
