
package com.vertex.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;

    @Column(name = "imagen_url")
    private String imagenUrl;

    private Boolean activo;

    public Long getId() {
        return id;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public Integer getStock() {
        return stock;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public Boolean getActivo() {
        return activo;
    }
    
public void setNombre(String nombre) {
    this.nombre = nombre;
}

public void setDescripcion(String descripcion) {
    this.descripcion = descripcion;
}

public void setPrecio(BigDecimal precio) {
    this.precio = precio;
}

public void setStock(Integer stock) {
    this.stock = stock;
}

public void setImagenUrl(String imagenUrl) {
    this.imagenUrl = imagenUrl;
}

public void setCategoria(Categoria categoria) {
    this.categoria = categoria;
}

public void setActivo(Boolean activo) {
    this.activo = activo;
}


}

