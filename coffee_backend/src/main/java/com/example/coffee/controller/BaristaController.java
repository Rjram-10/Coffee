package com.example.coffee.controller;

import com.example.coffee.model.Barista;
import com.example.coffee.service.BaristaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/baristas")
@RequiredArgsConstructor
public class BaristaController {
    private final BaristaService baristaService;

    @GetMapping
    public ResponseEntity<List<Barista>> getAllBaristas() {
        return ResponseEntity.ok(baristaService.getAllBaristas());
    }
}
