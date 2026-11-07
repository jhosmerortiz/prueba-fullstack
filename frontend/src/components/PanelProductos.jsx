
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Save,
  Package,
} from "lucide-react";

import { fetchAdmin } from "./fetchAdmin";
import SelectorImagen from "./SelectorImagen";

import {
  subirImagen,
  eliminarImagenTemporal,
} from "../lib/imagenes";

const API = "http://localhost:8080/api";

const formularioVacio = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoriaId: "",
  imagenUrl: "",
};

const moneda = (valor) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(valor);

function obtenerMensajeError(respuesta, accion) {
  if (respuesta.status === 401) {
    return (
      "HTTP 401: Spring Boot rechazó la autenticación. " +
      "Verifica tu sesión y la configuración JWT."
    );
  }

  if (respuesta.status === 403) {
    return (
      "HTTP 403: No tienes permiso para " +
      accion +
      ". Verifica tu rol de administrador."
    );
  }

  if (respuesta.status === 404) {
    return "El producto no existe o ya fue eliminado.";
  }

  return `No se pudo ${accion} (HTTP ${respuesta.status}).`;
}

export default function PanelProductos({
  productos = [],
  onActualizar,
}) {
  const [categorias, setCategorias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formularioVacio);

  const [imagenPreparada, setImagenPreparada] =
    useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // CARGAR CATEGORÍAS
  useEffect(() => {
    const controller = new AbortController();

    async function cargarCategorias() {
      try {
        const respuesta = await fetch(
          `${API}/categorias`,
          { signal: controller.signal }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar las categorías."
          );
        }

        const datos = await respuesta.json();

        if (!controller.signal.aborted) {
          setCategorias(datos);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      }
    }

    cargarCategorias();

    return () => controller.abort();
  }, []);

  // NUEVO PRODUCTO
  function nuevoProducto() {
    setEditando(null);
    setForm({ ...formularioVacio });
    setImagenPreparada(null);
    setError("");
    setMensaje("");
    setAbierto(true);
  }

  // EDITAR PRODUCTO
  function editarProducto(producto) {
    const categoria = categorias.find(
      (c) => c.nombre === producto.categoria
    );

    setEditando(producto);

    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: String(producto.precio),
      stock: String(producto.stock),
      categoriaId: categoria
        ? String(categoria.id)
        : "",
      imagenUrl:
        producto.imagenUrl ||
        producto.imagen ||
        "",
    });

    setImagenPreparada(null);
    setError("");
    setMensaje("");
    setAbierto(true);
  }

  // CAMBIAR DATOS DEL FORMULARIO
  function cambiarCampo(e) {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // CERRAR FORMULARIO
  function cerrarFormulario() {
    if (guardando) return;

    setAbierto(false);
    setEditando(null);
    setForm({ ...formularioVacio });
    setImagenPreparada(null);
    setError("");
  }

  // CREAR O ACTUALIZAR PRODUCTO
  async function guardarProducto(e) {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    let imagenSubida = null;
    let guardadoEnBackend = false;

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoriaId: Number(form.categoriaId),
      imagenUrl: form.imagenUrl || null,
    };

    try {
      // VALIDACIONES
      if (!datos.nombre) {
        throw new Error(
          "Ingresa el nombre del producto."
        );
      }

      if (
        !Number.isFinite(datos.precio) ||
        datos.precio <= 0
      ) {
        throw new Error(
          "El precio debe ser mayor a cero."
        );
      }

      if (
        !Number.isInteger(datos.stock) ||
        datos.stock < 0
      ) {
        throw new Error(
          "El stock debe ser un número entero mayor o igual a cero."
        );
      }

      if (!datos.categoriaId) {
        throw new Error(
          "Selecciona una categoría."
        );
      }

      // SUBIR IMAGEN OPTIMIZADA
      if (imagenPreparada) {
        imagenSubida = await subirImagen(
          imagenPreparada
        );

        datos.imagenUrl = imagenSubida.url;
      }

      // GUARDAR PRODUCTO EN SPRING BOOT
      const url = editando
        ? `${API}/productos/${editando.id}`
        : `${API}/productos`;

      const respuesta = await fetchAdmin(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(
            respuesta,
            editando
              ? "editar el producto"
              : "guardar el producto"
          )
        );
      }

      guardadoEnBackend = true;

      // ACTUALIZAR EL CATÁLOGO
      await onActualizar();

      // MENSAJE DE ÉXITO
      if (imagenPreparada) {
        const original =
          (imagenPreparada.original / 1024).toFixed(1);

        const final =
          (imagenPreparada.final / 1024).toFixed(1);

        setMensaje(
          `Producto guardado correctamente. ` +
          `Imagen WebP: ${original} KB → ${final} KB.`
        );
      } else {
        setMensaje(
          "Producto guardado correctamente."
        );
      }

      // LIMPIAR FORMULARIO
      setAbierto(false);
      setEditando(null);
      setForm({ ...formularioVacio });
      setImagenPreparada(null);
      setError("");

    } catch (err) {
      console.error(
        "Error al guardar el producto:",
        err
      );

      // ELIMINAR IMAGEN SI FALLÓ EL BACKEND
      if (
        !guardadoEnBackend &&
        imagenSubida?.ruta
      ) {
        await eliminarImagenTemporal(
          imagenSubida.ruta
        );
      }

      if (guardadoEnBackend) {
        setError(
          "El producto se guardó, pero no se pudo " +
          "actualizar la lista. Recarga la página."
        );
      } else {
        setError(
          err.message || "Error desconocido."
        );
      }

    } finally {
      setGuardando(false);
    }
  }

  // ELIMINAR PRODUCTO
  async function eliminarProducto(producto) {
    if (eliminando !== null) return;

    const confirmado = window.confirm(
      `¿Estás seguro de eliminar "${producto.nombre}" del catálogo?`
    );

    if (!confirmado) return;

    setEliminando(producto.id);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetchAdmin(
        `${API}/productos/${producto.id}`,
        {
          method: "DELETE",
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          obtenerMensajeError(
            respuesta,
            "eliminar el producto"
          )
        );
      }

      await onActualizar();

      setMensaje(
        "Producto eliminado del catálogo."
      );

    } catch (err) {
      console.error(
        "Error al eliminar el producto:",
        err
      );

      setError(
        err.message ||
          "No se pudo eliminar el producto."
      );

    } finally {
      setEliminando(null);
    }
  }

  // BUSCAR PRODUCTOS
  const filtrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();

    return (
      p.nombre.toLowerCase().includes(texto) ||
      (p.categoria || "")
        .toLowerCase()
        .includes(texto)
    );
  });

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Gestión de productos
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Administra los productos de tu catálogo.
          </p>
        </div>

        <button
          type="button"
          onClick={nuevoProducto}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#d8f784] px-5 py-3 text-sm font-bold text-[#151b17] transition hover:bg-lime-300"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="p-6 pb-3">
        <div className="flex max-w-sm items-center gap-3 rounded-xl border border-stone-200 px-4 py-3">
          <Search
            size={18}
            className="text-stone-400"
          />

          <input
            type="search"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* ERRORES */}
      {error && !abierto && (
        <p
          role="alert"
          className="mx-6 mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* MENSAJE DE ÉXITO */}
      {mensaje && (
        <p
          role="status"
          className="mx-6 mb-3 rounded-xl bg-lime-50 p-3 text-sm font-medium text-lime-800"
        >
          {mensaje}
        </p>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">

          <thead className="bg-stone-50 text-xs text-stone-500">
            <tr>
              <th className="px-6 py-4">
                Producto
              </th>

              <th className="px-6 py-4">
                Categoría
              </th>

              <th className="px-6 py-4">
                Precio
              </th>

              <th className="px-6 py-4">
                Stock
              </th>

              <th className="px-6 py-4 text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {filtrados.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-stone-50"
              >

                {/* PRODUCTO */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.imagen || p.imagenUrl ? (
                      <img
                        src={
                          p.imagen ||
                          p.imagenUrl
                        }
                        alt={p.nombre}
                        loading="lazy"
                        className="h-12 w-12 rounded-xl bg-stone-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
                        <Package size={20} />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {p.nombre}
                      </p>

                      <p className="text-xs text-stone-400">
                        ID: {p.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CATEGORÍA */}
                <td className="px-6 py-4 text-sm">
                  {p.categoria}
                </td>

                {/* PRECIO */}
                <td className="px-6 py-4 text-sm font-semibold">
                  {moneda(p.precio)}
                </td>

                {/* STOCK */}
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      p.stock < 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.stock} unidades
                  </span>
                </td>

                {/* ACCIONES */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      aria-label={`Editar ${p.nombre}`}
                      title="Editar"
                      onClick={() =>
                        editarProducto(p)
                      }
                      className="cursor-pointer rounded-xl border border-stone-200 p-2.5 text-stone-600 hover:bg-stone-100"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Eliminar ${p.nombre}`}
                      title="Eliminar"
                      onClick={() =>
                        eliminarProducto(p)
                      }
                      disabled={eliminando !== null}
                      className="cursor-pointer rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className="p-10 text-center text-sm text-stone-500">
            No se encontraron productos.
          </p>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario"
            className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >

            {/* TÍTULO */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-lime-700 uppercase">
                  NEXO / INVENTARIO
                </p>

                <h2
                  id="titulo-formulario"
                  className="mt-2 text-2xl font-bold"
                >
                  {editando
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="cursor-pointer rounded-xl p-2 hover:bg-stone-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={guardarProducto}
              className="space-y-4"
            >

              {/* NOMBRE */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Nombre del producto
                </label>

                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={cambiarCampo}
                  required
                  maxLength={150}
                  placeholder="Ej. Mouse Gamer RGB"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
                />
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={cambiarCampo}
                  rows={3}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
                />
              </div>

              {/* PRECIO Y STOCK */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Precio (S/)
                  </label>

                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={cambiarCampo}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={cambiarCampo}
                    min="0"
                    step="1"
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* CATEGORÍA */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Categoría
                </label>

                <select
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={cambiarCampo}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-lime-500"
                >
                  <option value="">
                    Seleccionar categoría
                  </option>

                  {categorias.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGEN OPTIMIZADA */}
              <SelectorImagen
                key={editando?.id ?? "nuevo"}
                imagenUrl={form.imagenUrl}
                onImagenPreparada={setImagenPreparada}
                onQuitar={() =>
                  setForm((anterior) => ({
                    ...anterior,
                    imagenUrl: "",
                  }))
                }
                deshabilitado={guardando}
              />

              {/* ERRORES */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* BOTONES */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  className="cursor-pointer rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#d8f784] px-6 py-3 text-sm font-bold text-[#151b17] transition hover:bg-lime-300 disabled:opacity-50"
                >
                  <Save size={17} />

                  {guardando
                    ? "Guardando..."
                    : "Guardar producto"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
}
