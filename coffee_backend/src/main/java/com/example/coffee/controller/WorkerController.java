package com.example.coffee.controller;

import com.example.coffee.dto.AuthRequest;
import com.example.coffee.dto.AuthResponse;
import com.example.coffee.model.Worker;
import com.example.coffee.repo.WorkerRepository;
import com.example.coffee.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerRepository workerRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest creds) {
        Worker worker = workerRepository.findByUsername(creds.username()).orElse(null);
        if (worker == null || worker.getPassword() == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String storedPassword = worker.getPassword();
        boolean matches = passwordEncoder.matches(creds.password(), storedPassword) || storedPassword.equals(creds.password());
        if (!matches) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // Upgrade legacy plaintext passwords to bcrypt on successful login
        if (!storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$") && !storedPassword.startsWith("$2y$")) {
            worker.setPassword(passwordEncoder.encode(creds.password()));
            workerRepository.save(worker);
        }

        String token = jwtService.generateToken(worker.getUsername(), worker.getRole());
        return ResponseEntity.ok(new AuthResponse(worker.getId(), worker.getUsername(), worker.getRole(), token));
    }
}
