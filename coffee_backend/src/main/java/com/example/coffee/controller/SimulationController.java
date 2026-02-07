package com.example.coffee.controller;

import com.example.coffee.service.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/run")
    public ResponseEntity<List<SimulationService.SimulationReport>> runSimulation() {
        return ResponseEntity.ok(simulationService.runSimulation());
    }
}
