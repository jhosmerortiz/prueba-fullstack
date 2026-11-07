import { useState, useEffect } from "react";
import PanelProductos from "./components/PanelProductos";
import Acceso from "./components/Acceso";
import { supabase } from "./lib/supabase";
import {
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  Package,
  Search,
  ShieldCheck,
  LogOut,
  Layers3,
  Sparkles,
  Boxes,
} from "lucide-react";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const moneda = (numero) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(numero);

function TarjetaProducto({ producto }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <div className="relative h-58 overflow-hidden bg-stone-100 sm:h-64">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-stone-800 shadow-sm">
          {producto.categoria}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              {producto.nombre}
            </h3>
            <p className="mt-1 text-xs text-stone-400">
              Código: PRD-{String(producto.id).padStart(3, "0")}
            </p>
          </div>
          <ArrowUpRight
            size={19}
            className="shrink-0 text-stone-400 transition-colors group-hover:text-stone-900"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-bold text-stone-900">
            {moneda(producto.precio)}
          </span>
          <span className="text-xs text-stone-500">
            {producto.stock} disponibles
          </span>
        </div>
      </div>
    </article>
  );
}

// VISTA PÚBLICA DEL CATÁLOGO
function Catalogo({
  cambiarVista,
  productos,
  usuario,
  esAdmin,
  onCerrarSesion,
}) {
  const [busqueda, setBusqueda] = useState("");
  const destacado =
  productos.find((p) => p.nombre === "Auriculares Studio X")
  ?? productos[0];
  const [categoria, setCategoria] = useState("Todos");

  const categorias = [
    "Todos",
    ...new Set(productos.map((p) => p.categoria)),
  ];

  const filtrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "Todos" || p.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-stone-900">
      {/* BARRA SUPERIOR */}
      <header className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8f784]">
              <Layers3 size={19} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-[-0.08em]">
              nexo<span className="text-lime-500">.</span>
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            <span className="hidden text-sm font-semibold text-stone-900 sm:inline">Catálogo</span>
            {usuario ? (
              <>
                <span className="hidden max-w-44 truncate text-xs text-stone-500 md:inline" title={usuario.email}>
                  {usuario.email}
                </span>
                {esAdmin && (
                  <button onClick={() => cambiarVista("admin")}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-xs font-semibold hover:bg-stone-100 sm:text-sm">
                    <ShieldCheck size={16} /> Panel admin
                  </button>
                )}
                <button onClick={onCerrarSesion}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-[#151b17] px-4 py-2.5 text-xs font-semibold text-white hover:bg-stone-700 sm:text-sm">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <button onClick={() => cambiarVista("acceso")}
                className="cursor-pointer rounded-full bg-[#151b17] px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-700 sm:text-sm">
                Iniciar sesión
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* PORTADA PRINCIPAL */}
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
          <div className="relative overflow-hidden rounded-[28px] bg-[#151b17] text-white sm:rounded-[36px]">
            <div className="pointer-events-none absolute -top-36 right-0 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative grid items-center gap-8 px-7 py-12 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-16">
              <div className="z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-[#d8f784]">
                  <Sparkles size={14} />
                  UNA NUEVA FORMA DE EXPLORAR
                </span>

                <h1 className="mt-8 max-w-xl text-5xl leading-[1.07] font-bold tracking-[-0.055em] sm:text-6xl">
                  Objetos que
                  <br />
                  <span className="text-[#d8f784]">
                    inspiran.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-stone-300 sm:text-base">
                  Tecnología, diseño y estilo reunidos
                  en una colección cuidadosamente seleccionada.
                  Explora nuestro catálogo.
                </p>

                <a
                  href="#productos"
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#d8f784] px-6 py-3.5 text-sm font-bold text-[#151b17] transition hover:bg-lime-200"
                >
                  Explorar colección
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-[#d8f784]/10 blur-3xl" />
                <img
                  src={destacado?.imagen || "https://placehold.co/800x600?text=Nexo"}
                  alt="Producto destacado"
                  className="relative h-64 w-full rounded-[25px] object-cover sm:h-80 lg:h-[380px]"
                />
                <div className="absolute right-4 bottom-4 rounded-2xl bg-white/95 px-5 py-3 text-stone-900 shadow-xl backdrop-blur">
                  <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                    Producto destacado
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {destacado ? `${destacado.nombre} / ${moneda(destacado.precio)}` : "Próximamente"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATÁLOGO Y FILTROS */}
        <section
          id="productos"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-lime-700 uppercase">
                Descubre la colección
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Nuestros productos<span className="text-lime-500">.</span>
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Explora nuestra selección de artículos.
              </p>
            </div>

            <span className="rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-stone-500">
              {filtrados.length} productos
            </span>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`cursor-pointer rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                    categoria === cat
                      ? "bg-[#151b17] text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex w-full items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 sm:w-72">
              <Search size={18} className="text-stone-400" />
              <input
                type="search"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </div>
          </div>

          {filtrados.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 py-20 text-center">
              <Search size={32} className="mx-auto text-stone-300" />
              <h3 className="mt-4 font-semibold">
                No encontramos productos
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                Intenta con otra búsqueda o categoría.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-stone-200 px-6 py-7 text-center text-xs text-stone-500">
        NEXO CATALOG — Sistema de gestión de productos
      </footer>
    </div>
  );
}

// PANEL DE ADMINISTRACIÓN
function Administracion({ cambiarVista, productos, alActualizar, onCerrarSesion }) {
  const totalStock = productos.reduce(
    (total, p) => total + p.stock,
    0
  );

  const stockBajo = productos.filter(
    (p) => p.stock < 10
  ).length;

  const indicadores = [
    {
      titulo: "Productos",
      valor: productos.length,
      icono: Package,
      detalle: "Registrados en catálogo",
    },
    {
      titulo: "Unidades",
      valor: totalStock,
      icono: Boxes,
      detalle: "Stock total disponible",
    },
    {
      titulo: "Categorías",
      valor: new Set(productos.map((p) => p.categoria)).size,
      icono: Layers3,
      detalle: "Clasificaciones activas",
    },
    {
      titulo: "Stock bajo",
      valor: stockBajo,
      icono: ShieldCheck,
      detalle: "Menos de 10 unidades",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f3] md:flex">
      {/* BARRA LATERAL */}
      <aside className="flex w-full flex-col justify-between bg-[#151b17] p-6 text-white md:min-h-screen md:w-64">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8f784] text-stone-900">
              <Layers3 size={21} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                nexo.
              </h2>
              <p className="text-[10px] tracking-widest text-stone-400 uppercase">
                Administración
              </p>
            </div>
          </div>

          <p className="mt-12 mb-4 text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">
            Espacio de trabajo
          </p>

          <div className="flex items-center gap-3 rounded-xl bg-[#d8f784] px-4 py-3 font-semibold text-stone-900">
            <LayoutDashboard size={19} />
            <span className="text-sm">Panel general</span>
          </div>

          <button
            onClick={() => cambiarVista("catalogo")}
            className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-stone-300 transition hover:bg-white/10"
          >
            <Package size={19} />
            Ver catálogo
          </button>
          <button onClick={onCerrarSesion}
            className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-stone-300 hover:bg-white/10">
            <LogOut size={19} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO ADMIN */}
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-9 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                Espacio de administración
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Panel general<span className="text-lime-600">.</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Resumen y control de tu inventario.
              </p>
            </div>

            <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-500">
              Gestión de inventario
            </span>
          </header>

          {/* INDICADORES */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {indicadores.map((item) => {
              const Icono = item.icono;

              return (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-stone-200/70 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-500">
                      {item.titulo}
                    </span>
                    <div className="rounded-xl bg-lime-100 p-2.5 text-stone-800">
                      <Icono size={19} />
                    </div>
                  </div>
                  <p className="mt-5 text-4xl font-bold text-stone-900">
                    {item.valor}
                  </p>
                  <p className="mt-2 text-xs text-stone-400">
                    {item.detalle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* GESTION DE PRODUCTOS */}
          <PanelProductos
             productos={productos}
             onActualizar={alActualizar}
/>
        
        </div>
      </main>
    </div>
  );
}

  
function App() {
  const [vista, setVista] = useState("catalogo");
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  const [comprobandoRol, setComprobandoRol] = useState(true);

  async function recargarProductos() {
    const respuesta = await fetch(`${API}/productos`);
    if (!respuesta.ok) throw new Error("No se pudo actualizar el catálogo");
    const datos = await respuesta.json();
    setProductos(datos.map((p) => ({ ...p, imagen: p.imagenUrl })));
  }

  useEffect(() => {
    const controller = new AbortController();
    async function cargarProductos() {
      try {
        const respuesta = await fetch(`${API}/productos`, {
          signal: controller.signal,
        });
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
        const datos = await respuesta.json();
        setProductos(datos.map((p) => ({ ...p, imagen: p.imagenUrl })));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("No se pudieron cargar los productos. Verifica Spring Boot.");
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    cargarProductos();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data, error: errorSesion }) => {
      if (!activo) return;
      if (errorSesion) console.error("Error al recuperar sesión:", errorSesion);
      setUsuario(data?.session?.user ?? null);
      setComprobandoSesion(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, sesion) => {
        if (activo) {
          setUsuario(sesion?.user ?? null);
          setComprobandoSesion(false);
        }
      }
    );
    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let activo = true;
    setEsAdmin(false);
    setComprobandoRol(true);

    if (!usuario) {
      setComprobandoRol(false);
      return () => { activo = false; };
    }

    async function verificarRol() {
      const { data, error: errorRol } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", usuario.id)
        .maybeSingle();

      if (!activo) return;
      if (errorRol) console.error("Error al consultar perfil:", errorRol);
      setEsAdmin(!errorRol && data?.rol === "admin");
      setComprobandoRol(false);
    }
    verificarRol();
    return () => { activo = false; };
  }, [usuario?.id]);

  function cambiarVista(destino) {
    if (destino === "admin" && !esAdmin) {
      setVista("acceso");
      return;
    }
    setVista(destino);
  }

  async function cerrarSesion() {
    const { error: errorSalida } = await supabase.auth.signOut();
    if (errorSalida) {
      alert("No se pudo cerrar sesión: " + errorSalida.message);
      return;
    }
    setEsAdmin(false);
    setVista("catalogo");
  }

  if (cargando || comprobandoSesion || comprobandoRol) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
        <p className="text-lg font-semibold text-stone-700">Cargando Nexo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (vista === "acceso") {
    return (
      <Acceso
        onVolver={() => setVista("catalogo")}
        onIngresar={() => setVista("catalogo")}
      />
    );
  }

  if (vista === "admin") {
    if (!usuario || !esAdmin) {
      return (
        <Acceso
          onVolver={() => setVista("catalogo")}
          onIngresar={() => setVista("catalogo")}
        />
      );
    }
    return (
      <Administracion
        cambiarVista={cambiarVista}
        productos={productos}
        alActualizar={recargarProductos}
        onCerrarSesion={cerrarSesion}
      />
    );
  }

  return (
    <Catalogo
      cambiarVista={cambiarVista}
      productos={productos}
      usuario={usuario}
      esAdmin={esAdmin}
      onCerrarSesion={cerrarSesion}
    />
  );
}

export default App;
