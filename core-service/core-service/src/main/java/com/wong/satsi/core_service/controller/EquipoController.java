package com.wong.satsi.core_service.controller;

import com.wong.satsi.core_service.model.Equipo;
import com.wong.satsi.core_service.service.EquipoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite peticiones desde React
public class EquipoController {

    private final EquipoService equipoService;

    @GetMapping
    public ResponseEntity<List<Equipo>> listarEquipos() {
        return ResponseEntity.ok(equipoService.obtenerTodosLosEquipos());
    }

    // NUEVO: Endpoint para guardar un equipo
    @PostMapping
    public ResponseEntity<Equipo> crearEquipo(@RequestBody Equipo equipo) {
        return ResponseEntity.ok(equipoService.guardarEquipo(equipo));
    }
}