
import { supabase } from "./supabase";

const MAX_ORIGINAL = 10 * 1024 * 1024;
const MAX_FINAL = 2 * 1024 * 1024;

export async function optimizarImagen(archivo) {
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!tiposPermitidos.includes(archivo.type)) {
    throw new Error("Solo se permiten imágenes JPG, PNG y WebP.");
  }

  if (archivo.size > MAX_ORIGINAL) {
    throw new Error("La imagen no debe superar los 10 MB.");
  }

  const imagen = await createImageBitmap(archivo);

  try {
    const escala = Math.min(
      1,
      1280 / Math.max(imagen.width, imagen.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(imagen.width * escala));
    canvas.height = Math.max(1, Math.round(imagen.height * escala));

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      throw new Error("No se pudo procesar la imagen.");
    }

    contexto.drawImage(
      imagen,
      0,
      0,
      canvas.width,
      canvas.height
    );

    let optimizada;

    for (const calidad of [0.8, 0.65, 0.5]) {
      optimizada = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", calidad);
      });

      if (!optimizada || optimizada.type !== "image/webp") {
        throw new Error("No se pudo convertir la imagen a WebP.");
      }

      if (optimizada.size <= MAX_FINAL) break;
    }

    if (optimizada.size > MAX_FINAL) {
      throw new Error("La imagen optimizada supera los 2 MB.");
    }

    return {
      blob: optimizada,
      original: archivo.size,
      final: optimizada.size,
      ancho: canvas.width,
      alto: canvas.height,
    };
  } finally {
    imagen.close();
  }
}

export async function subirImagen(preparada) {
  const ruta = `catalogo/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("productos")
    .upload(ruta, preparada.blob, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("productos")
    .getPublicUrl(ruta);

  return {
    url: data.publicUrl,
    ruta,
  };
}

export async function eliminarImagenTemporal(ruta) {
  const { error } = await supabase.storage
    .from("productos")
    .remove([ruta]);

  if (error) {
    console.warn("No se pudo limpiar la imagen:", error);
  }
}
