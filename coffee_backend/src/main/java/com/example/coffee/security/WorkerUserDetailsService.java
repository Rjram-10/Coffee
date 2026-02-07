package com.example.coffee.security;

import com.example.coffee.model.Worker;
import com.example.coffee.repo.WorkerRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerUserDetailsService implements UserDetailsService {

    private final WorkerRepository workerRepository;

    public WorkerUserDetailsService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Worker worker = workerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Worker not found"));

        String role = worker.getRole() == null ? "STAFF" : worker.getRole().toUpperCase();
        return new User(
                worker.getUsername(),
                worker.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}
