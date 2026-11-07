
package com.vertex.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductoRequest(

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    String nombre,

    @Size(max = 2000)
    String descripcion,

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01",
        message = "El precio debe ser mayor que cero")
    BigDecimal precio,

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    Integer stock,

    @NotNull(message = "Seleccione una categoría")
    Long categoriaId,

    @Size(max = 2000)
    String imagenUrl
) {}
