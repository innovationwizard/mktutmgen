"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  MASTER_DATA_LABELS,
  type MasterDataCategory,
} from "@/types";

interface MasterItem {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  sortOrder: number;
  source?: string;
  medium?: string;
}

const CATEGORIES: MasterDataCategory[] = [
  "industries",
  "brands",
  "platforms",
  "countries",
  "companies",
  "adFormats",
  "buyTypes",
  "campaignTypes",
  "segmentationTypes",
  "adPieceTypes",
];

export default function AdminPage() {
  const [category, setCategory] = useState<MasterDataCategory>("industries");
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MasterItem>>({});
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/master-data?category=${category}`)
      .then((r) => r.json())
      .then((data) => setItems(data[category] || data || []))
      .catch(() => toast.error("Error cargando datos"))
      .finally(() => setLoading(false));
  }, [category]);

  function startEdit(item: MasterItem) {
    setEditingId(item.id);
    setEditForm(item);
    setIsNew(false);
  }

  function startNew() {
    setEditingId("new");
    setEditForm({ name: "", abbreviation: "", isActive: true, sortOrder: items.length });
    setIsNew(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setIsNew(false);
  }

  async function saveItem() {
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(`/api/master-data`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, ...editForm }),
      });
      if (!res.ok) throw new Error();

      toast.success(isNew ? "Creado exitosamente" : "Actualizado exitosamente");
      cancelEdit();

      // Refresh
      const data = await fetch(`/api/master-data?category=${category}`).then(
        (r) => r.json()
      );
      setItems(data[category] || data || []);
    } catch {
      toast.error("Error al guardar");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const res = await fetch(`/api/master-data?category=${category}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Eliminado exitosamente");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error("Error al eliminar. Puede estar en uso por campañas.");
    }
  }

  const isPlatform = category === "platforms";
  const isSimple =
    category === "campaignTypes" ||
    category === "segmentationTypes" ||
    category === "adPieceTypes";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-orion-900">
          Administración
        </h1>
        <p className="mt-1 text-sm text-orion-400">
          Gestiona los datos maestros para los dropdowns del generador
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Category list */}
        <div className="glass-card overflow-hidden">
          <div className="border-b border-orion-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-orion-600" />
              <span className="text-sm font-semibold text-orion-800">
                Categorías
              </span>
            </div>
          </div>
          <nav className="p-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  cancelEdit();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  category === cat
                    ? "bg-orion-900 font-medium text-white"
                    : "text-orion-600 hover:bg-orion-50"
                }`}
              >
                {MASTER_DATA_LABELS[cat]}
                {category === cat && (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Items table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-orion-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-orion-800">
              {MASTER_DATA_LABELS[category]}
            </h2>
            <button
              onClick={startNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orion-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-orion-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-orion-400">
              Cargando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orion-100 bg-orion-50/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-orion-500">
                      Nombre
                    </th>
                    {!isSimple && (
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-orion-500">
                        Abreviación
                      </th>
                    )}
                    {isPlatform && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-orion-500">
                          Source
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-orion-500">
                          Medium
                        </th>
                      </>
                    )}
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-orion-500">
                      Estado
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-orion-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orion-50">
                  {/* New item row */}
                  {isNew && (
                    <tr className="bg-blue-50/50">
                      <td className="px-4 py-2">
                        <input
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, name: e.target.value }))
                          }
                          className="w-full rounded border border-orion-200 px-2 py-1 text-sm outline-none focus:border-orion-400"
                          placeholder="Nombre"
                          autoFocus
                        />
                      </td>
                      {!isSimple && (
                        <td className="px-4 py-2">
                          <input
                            value={editForm.abbreviation || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                abbreviation: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-orion-200 px-2 py-1 text-sm outline-none focus:border-orion-400"
                            placeholder="Abreviación"
                          />
                        </td>
                      )}
                      {isPlatform && (
                        <>
                          <td className="px-4 py-2">
                            <input
                              value={editForm.source || ""}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  source: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-orion-200 px-2 py-1 text-sm outline-none focus:border-orion-400"
                              placeholder="source"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={editForm.medium || ""}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  medium: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-orion-200 px-2 py-1 text-sm outline-none focus:border-orion-400"
                              placeholder="medium"
                            />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-2">
                        <span className="qa-ok">Activo</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={saveItem}
                            className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Existing items */}
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-orion-50/30"
                    >
                      <td className="px-4 py-2.5">
                        {editingId === item.id ? (
                          <input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-orion-200 px-2 py-1 text-sm outline-none focus:border-orion-400"
                          />
                        ) : (
                          <span className="font-medium text-orion-900">
                            {item.name}
                          </span>
                        )}
                      </td>
                      {!isSimple && (
                        <td className="px-4 py-2.5">
                          {editingId === item.id ? (
                            <input
                              value={editForm.abbreviation || ""}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  abbreviation: e.target.value,
                                }))
                              }
                              className="w-full rounded border border-orion-200 px-2 py-1 text-sm font-mono outline-none focus:border-orion-400"
                            />
                          ) : (
                            <code className="rounded bg-orion-50 px-1.5 py-0.5 text-xs text-orion-600">
                              {item.abbreviation}
                            </code>
                          )}
                        </td>
                      )}
                      {isPlatform && (
                        <>
                          <td className="px-4 py-2.5">
                            {editingId === item.id ? (
                              <input
                                value={editForm.source || ""}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    source: e.target.value,
                                  }))
                                }
                                className="w-full rounded border border-orion-200 px-2 py-1 text-sm font-mono outline-none focus:border-orion-400"
                              />
                            ) : (
                              <code className="text-xs text-orion-500">
                                {item.source}
                              </code>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {editingId === item.id ? (
                              <input
                                value={editForm.medium || ""}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    medium: e.target.value,
                                  }))
                                }
                                className="w-full rounded border border-orion-200 px-2 py-1 text-sm font-mono outline-none focus:border-orion-400"
                              />
                            ) : (
                              <code className="text-xs text-orion-500">
                                {item.medium}
                              </code>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            item.isActive !== false ? "qa-ok" : "qa-fail"
                          }
                        >
                          {item.isActive !== false ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveItem}
                              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="rounded p-1.5 text-orion-400 hover:bg-orion-50 hover:text-orion-600"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="rounded p-1.5 text-orion-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
