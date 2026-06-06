package com.wong.satsi.core_service.service;

import com.wong.satsi.core_service.model.Sucursal;
import com.wong.satsi.core_service.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SucursalService {

    private final SucursalRepository sucursalRepository;

    // Método para que el SysAdmin guarde una nueva tienda
    public Sucursal guardarSucursal(Sucursal sucursal) {
        return sucursalRepository.save(sucursal);
    }

    // Método para que el Personal de Tienda lea las tiendas y llene su menú desplegable
    public List<Sucursal> obtenerTodas() {
        return sucursalRepository.findAll();
    }
}