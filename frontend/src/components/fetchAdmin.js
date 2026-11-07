
import { supabase } from "../lib/supabase";

export async function fetchAdmin(url, opciones = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error(
      "No hay una sesión activa. Inicia sesión nuevamente."
    );
  }

  const headers = new Headers(opciones.headers || {});

  headers.set(
    "Authorization",
    `Bearer ${session.access_token}`
  );

  return fetch(url, {
    ...opciones,
    headers,
  });
}
