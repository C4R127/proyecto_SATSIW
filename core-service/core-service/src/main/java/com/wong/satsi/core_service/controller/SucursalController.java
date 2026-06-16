package com.wong.satsi.core_service.controller;

import com.wong.satsi.core_service.model.Sucursal;
import com.wong.satsi.core_service.service.SucursalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor

public class SucursalController {

    private final SucursalService sucursalService;

    // Endpoint GET: Para llenar el combo en el formulario de creación de tickets
    @GetMapping
    public ResponseEntity<List<Sucursal>> listarSucursales() {
        return ResponseEntity.ok(sucursalService.obtenerTodas());
    }

    // Endpoint POST: Para que el SysAdmin agregue nuevas tiendas desde su panel
    @PostMapping
    public ResponseEntity<Sucursal> crearSucursal(@RequestBody Sucursal sucursal) {
        return ResponseEntity.ok(sucursalService.guardarSucursal(sucursal));
    }
}