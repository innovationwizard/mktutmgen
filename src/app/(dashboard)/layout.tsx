"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Wand2,
  ClipboardCheck,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/generator", label: "Generador UTM", icon: Wand2 },
  { href: "/qa", label: "QA & Revisión", icon: ClipboardCheck },
  { href: "/history", label: "Historial", icon: History },
  { href: "/admin", label: "Administración", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al cambiar la contraseña");
        return;
      }
      toast.success("Contraseña actualizada exitosamente");
      setPwModalOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setPwLoading(false);
    }
  }

  const sidebar = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <Image
          src="/grupo_orion_logo.png"
          alt="Grupo Orión"
          width={32}
          height={32}
          className="rounded"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white">
            UTM Generator
          </span>
          <span className="text-[10px] uppercase tracking-widest text-orion-400">
            Grupo Orión
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/10 text-white"
                  : "text-orion-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-orion-400")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-orion-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {session?.user && (
          <div className="px-3 py-2 text-xs text-orion-400">
            {session.user.name}
          </div>
        )}
        <button
          onClick={() => setPwModalOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-orion-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <KeyRound className="h-[18px] w-[18px]" />
          Cambiar contraseña
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-orion-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="brand-gradient fixed inset-y-0 left-0 z-30 hidden w-60 flex-col lg:flex">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "brand-gradient fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-4 rounded-lg p-1 text-orion-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      {/* Content area */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-orion-100 bg-white/80 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-orion-600 hover:bg-orion-50">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-orion-900">UTM Generator</span>
        </header>

        <main className="flex-1 bg-grid px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {/* Change password modal */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setPwModalOpen(false)}>
          <div className="glass-card mx-4 w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-orion-900">Cambiar contraseña</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-orion-500">Contraseña actual</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm outline-none focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-orion-500">Nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm outline-none focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-orion-500">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm outline-none focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPwModalOpen(false)}
                  className="flex-1 rounded-lg border border-orion-200 bg-white px-4 py-2 text-sm font-medium text-orion-600 hover:bg-orion-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="brand-gradient flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orion-900/20 disabled:opacity-50"
                >
                  {pwLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
