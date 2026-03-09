"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales incorrectas.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="brand-gradient relative hidden flex-1 items-center justify-center lg:flex">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Image
            src="/grupo_orion_logo.png"
            alt="Grupo Orión"
            width={200}
            height={200}
            className="drop-shadow-2xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              UTM Generator
            </h1>
            <p className="mt-2 text-orion-200">
              Marcación y convenciones de nombrado para campañas digitales
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/grupo_orion_logo.png"
              alt="Grupo Orión"
              width={80}
              height={80}
              priority
            />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-orion-900">
              Iniciar sesión
            </h2>
            <p className="mt-1 text-sm text-orion-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-orion-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-orion-100 bg-white px-4 py-2.5 text-sm text-orion-900 outline-none transition-all placeholder:text-orion-300 focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-orion-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-orion-100 bg-white px-4 py-2.5 text-sm text-orion-900 outline-none transition-all placeholder:text-orion-300 focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="brand-gradient w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orion-900/20 transition-all hover:shadow-xl hover:shadow-orion-900/30 disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-orion-300">
            Grupo Orión © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
