
package com.vertex.backend.repository;

import com.vertex.backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {
}
