package com.example.coffee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class CoffeeApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoffeeApplication.class, args);
	}

	@Bean
	public org.springframework.boot.CommandLineRunner demo(
			com.example.coffee.repo.WorkerRepository workerRepo,
			com.example.coffee.repo.CustomerRepository customerRepo,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
	) {
		return (args) -> {
			if (workerRepo.count() == 0) {
				workerRepo.save(new com.example.coffee.model.Worker(null, "admin", passwordEncoder.encode("admin"), "MANAGER"));
				workerRepo.save(new com.example.coffee.model.Worker(null, "barista", passwordEncoder.encode("barista"), "BARISTA"));
			}
            if (customerRepo.count() == 0) {
                customerRepo.save(new com.example.coffee.model.Customer(null, "John Doe", "john@example.com", true));
                customerRepo.save(new com.example.coffee.model.Customer(null, "Jane Smith", "jane@example.com", false));
            }
		};
	}
}
