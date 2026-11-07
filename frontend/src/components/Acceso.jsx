
import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Layers3,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

export default function Acceso({ onVolver, onIngresar }) {
  const [modo, setModo] = useState("login");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      if (modo === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password: clave,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.session) {
          onIngresar();
        } else {
          setMensaje(
            "Registro realizado. Revisa tu correo para " +
            "confirmar tu cuenta y luego inicia sesión."
          );
          setModo("login");
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: correo,
            password: clave,
          });

        if (error) throw error;

        onIngresar();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#151b17] p-5">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl sm:p-10">

        <button
          onClick={onVolver}
          className="mb-8 flex cursor-pointer items-center gap-2 text-sm text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft size={17} />
          Volver al catálogo
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#d8f784] p-3">
            <Layers3 size={22} />
          </div>
          <span className="text-2xl font-black tracking-tight">
            nexo.
          </span>
        </div>

        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-lime-700 uppercase">
          Tu espacio digital
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          {modo === "login"
            ? "Bienvenido de nuevo."
            : "Crea tu cuenta."}
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          {modo === "login"
            ? "Ingresa tus datos para continuar."
            : "Regístrate para formar parte de Nexo."}
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Correo electrónico
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-stone-200 px-4">
              <Mail size={18} className="text-stone-400" />
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                className="w-full py-3.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Contraseña
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-stone-200 px-4">
              <LockKeyhole size={18} className="text-stone-400" />
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={
                  modo === "registro"
                    ? "new-password"
                    : "current-password"
                }
                minLength={6}
                required
                className="w-full py-3.5 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {mensaje && (
            <p role="status" className="rounded-xl bg-lime-50 p-3 text-sm text-lime-800">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d8f784] py-4 text-sm font-bold text-[#151b17] transition hover:bg-lime-300 disabled:opacity-50"
          >
            {cargando
              ? "Procesando..."
              : modo === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
            <ArrowRight size={18} />
          </button>

        </form>

        <div className="mt-8 border-t border-stone-100 pt-6 text-center">
          <p className="text-sm text-stone-500">
            {modo === "login"
              ? "¿Todavía no tienes una cuenta?"
              : "¿Ya tienes una cuenta?"}
          </p>

          <button
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setError("");
              setMensaje("");
            }}
            className="mt-2 cursor-pointer text-sm font-bold text-stone-900 underline decoration-lime-500 underline-offset-4"
          >
            {modo === "login"
              ? "Registrarme ahora"
              : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
