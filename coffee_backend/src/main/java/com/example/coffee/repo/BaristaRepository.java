package com.example.coffee.repo;

import com.example.coffee.model.Barista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaristaRepository extends JpaRepository<Barista, Long> {
}
