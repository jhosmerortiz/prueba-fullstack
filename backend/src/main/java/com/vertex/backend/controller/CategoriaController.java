
package com.vertex.backend.controller;

import com.vertex.backend.dto.CategoriaResponse;
import com.vertex.backend.repository.CategoriaRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")

public class CategoriaController {

    private final CategoriaRepository repository;

    public CategoriaController(CategoriaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return repository.findAll(Sort.by("nombre"))
                .stream()
                .map(c -> new CategoriaResponse(
                        c.getId(),
                        c.getNombre()
                ))
                .toList();
    }
}
