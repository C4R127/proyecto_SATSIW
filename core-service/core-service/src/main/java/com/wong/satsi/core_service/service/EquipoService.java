package com.wong.satsi.core_service.service;

import com.wong.satsi.core_service.model.Equipo;
import com.wong.satsi.core_service.repository.EquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;

    public List<Equipo> obtenerTodosLosEquipos() {
        return equipoRepository.findAll();
    }
/*
    public Equipo guardarEquipo(Equipo equipo) {
        return equipoRepository.save(equipo);
    }*/
}