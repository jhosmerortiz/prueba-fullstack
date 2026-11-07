
package com.vertex.backend.service;

import com.vertex.backend.dto.*;
import com.vertex.backend.entity.*;
import com.vertex.backend.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar() {
        return productoRepository
                .findByActivoTrueOrderByIdAsc()
                .stream()
                .map(this::convertir)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        Producto p = buscarProducto(id);
        if (!Boolean.TRUE.equals(p.getActivo())) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Producto no disponible"
            );
        }
        return convertir(p);
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest datos) {
        Producto p = new Producto();
        actualizarCampos(p, datos);
        p.setActivo(true);

        return convertir(productoRepository.saveAndFlush(p));
    }

    @Transactional
    public ProductoResponse actualizar(
            Long id, ProductoRequest datos) {
        Producto p = buscarProducto(id);
        actualizarCampos(p, datos);

        return convertir(productoRepository.saveAndFlush(p));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto p = buscarProducto(id);
        p.setActivo(false);
        productoRepository.save(p);
    }

    private Producto buscarProducto(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Producto no encontrado"
                ));
    }

    private void actualizarCampos(
            Producto p, ProductoRequest datos) {

        Categoria categoria = categoriaRepository
                .findById(datos.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La categoría no existe"
                ));

        p.setNombre(datos.nombre());
        p.setDescripcion(datos.descripcion());
        p.setPrecio(datos.precio());
        p.setStock(datos.stock());
        p.setImagenUrl(datos.imagenUrl());
        p.setCategoria(categoria);
    }

    private ProductoResponse convertir(Producto p) {
        return new ProductoResponse(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getPrecio(),
                p.getStock(),
                p.getImagenUrl(),
                p.getCategoria().getNombre()
        );
    }
}
