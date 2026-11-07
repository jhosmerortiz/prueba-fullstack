
package com.vertex.backend.repository;

import com.vertex.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository
        extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrueOrderByIdAsc();
}
