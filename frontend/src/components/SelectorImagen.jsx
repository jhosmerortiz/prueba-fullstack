
import { useEffect, useState } from "react";
import { ImagePlus, X, LoaderCircle } from "lucide-react";
import { optimizarImagen } from "../lib/imagenes";

function formatearTamano(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function SelectorImagen({
  imagenUrl,
  onImagenPreparada,
  onQuitar,
  deshabilitado = false,
}) {
  const [procesando, setProcesando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [resultado, setResultado] = useState(null);
  const [tamanoOriginal, setTamanoOriginal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  async function seleccionar(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setProcesando(true);
    setError("");

    try {
      const preparada = await optimizarImagen(archivo);

      setVistaPrevia(URL.createObjectURL(preparada.blob));
      setResultado(preparada);
      setTamanoOriginal(archivo.size);
      onImagenPreparada(preparada);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
      e.target.value = "";
    }
  }

  function quitar() {
    setVistaPrevia("");
    setResultado(null);
    setTamanoOriginal(0);
    setError("");
    onImagenPreparada(null);
    onQuitar();
  }

  const imagen = vistaPrevia || imagenUrl;

  const tamanoOptimizado = resultado?.blob?.size ?? 0;

  const reduccion =
    tamanoOriginal > 0
      ? ((tamanoOriginal - tamanoOptimizado) / tamanoOriginal) * 100
      : 0;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-stone-800">
        Imagen del producto
      </label>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-6 text-center hover:border-lime-400 hover:bg-lime-50">
        {procesando ? (
          <LoaderCircle className="animate-spin" size={28} />
        ) : (
          <ImagePlus size={28} className="text-stone-500" />
        )}

        <span className="text-sm font-semibold">
          {procesando
            ? "Optimizando imagen..."
            : "Seleccionar imagen desde mi PC"}
        </span>

        <span className="text-xs text-stone-500">
          JPG, PNG o WebP · Máximo 10 MB
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={seleccionar}
          disabled={deshabilitado || procesando}
          className="sr-only"
        />
      </label>

      {resultado && (
        <div className="rounded-xl bg-lime-50 p-3 text-sm text-lime-800">
          <p className="font-semibold">
            Imagen optimizada correctamente
          </p>
        </div>
      )}

      {imagen && (
        <div className="flex items-start gap-3">
          <img
            src={imagen}
            alt="Vista previa del producto"
            className="h-28 w-28 rounded-xl bg-stone-100 object-cover"
          />

          <button
            type="button"
            onClick={quitar}
            disabled={deshabilitado}
            className="flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600"
          >
            <X size={14} />
            Quitar
          </button>
        </div>
      )}

      {/* COMPARACIÓN DE TAMAÑOS */}
      {resultado && tamanoOriginal > 0 && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">
              Tamaño original
            </span>
            <span className="font-medium text-stone-800">
              {formatearTamano(tamanoOriginal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500">
              Tamaño optimizado
            </span>
            <span className="font-medium text-stone-800">
              {formatearTamano(tamanoOptimizado)}
            </span>
          </div>

          <div className="border-t border-stone-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">
                {reduccion >= 0
                  ? "Reducción de tamaño"
                  : "Incremento de tamaño"}
              </span>
              <span className="font-bold text-lime-700">
                {Math.abs(reduccion).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
