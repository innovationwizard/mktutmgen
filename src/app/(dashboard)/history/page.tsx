"use client";

import { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { copyToClipboard, formatDate } from "@/lib/utils";

interface CampaignRow {
  id: string;
  namingCampaign: string;
  namingAdGroup: string;
  namingPiece: string;
  utmString: string;
  fullUrl: string;
  destinationUrl: string;
  createdAt: string;
  brand: { name: string; abbreviation: string };
  platform: { name: string; abbreviation: string };
  industry: { name: string };
  country: { name: string };
  qaReview: { status: string } | null;
}

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/campaigns?include=qa")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setCampaigns)
      .catch(() => toast.error("Error cargando historial"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      c.namingCampaign.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.name.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCopy(text: string, id: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success("Copiado");
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  async function exportCSV() {
    const header = [
      "Campaña",
      "Grupo de Anuncios",
      "Pieza",
      "UTM",
      "URL Completa",
      "Marca",
      "Plataforma",
      "Estado QA",
      "Fecha",
    ].join(",");

    const rows = filtered.map((c) =>
      [
        `"${c.namingCampaign}"`,
        `"${c.namingAdGroup}"`,
        `"${c.namingPiece}"`,
        `"${c.utmString}"`,
        `"${c.fullUrl}"`,
        c.brand.name,
        c.platform.name,
        c.qaReview?.status ?? "PENDING",
        formatDate(c.createdAt),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marcaciones_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orion-900">
            Historial
          </h1>
          <p className="mt-1 text-sm text-orion-400">
            Todas las marcaciones generadas
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-lg border border-orion-200 bg-white px-3 py-2 text-sm font-medium text-orion-600 transition-all hover:bg-orion-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orion-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por campaña, marca o plataforma..."
          className="w-full rounded-lg border border-orion-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orion-100 bg-orion-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-orion-500">
                  Campaña
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orion-500">
                  Marca
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orion-500">
                  Plataforma
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orion-500">
                  QA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-orion-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-orion-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orion-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-orion-400">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-orion-400">
                    <HistoryIcon className="mx-auto mb-2 h-8 w-8 text-orion-200" />
                    No se encontraron marcaciones
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-orion-50/30">
                    <td className="max-w-xs truncate px-4 py-3">
                      <p className="truncate font-medium text-orion-900">
                        {c.namingCampaign || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-orion-400">
                        {c.namingAdGroup}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-orion-700">
                      {c.brand.name}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-orion-50 px-1.5 py-0.5 text-xs text-orion-600">
                        {c.platform.abbreviation}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.qaReview?.status === "APPROVED"
                            ? "qa-ok"
                            : c.qaReview?.status === "REJECTED"
                              ? "qa-fail"
                              : "qa-pending"
                        }
                      >
                        {c.qaReview?.status === "APPROVED"
                          ? "OK"
                          : c.qaReview?.status === "REJECTED"
                            ? "Rechazado"
                            : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-orion-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopy(c.fullUrl || c.utmString, c.id)}
                          className="rounded p-1.5 text-orion-400 transition-colors hover:bg-orion-50 hover:text-orion-600"
                          title="Copiar URL+UTM"
                        >
                          {copiedId === c.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        {c.fullUrl?.startsWith("http") && (
                          <a
                            href={c.fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-orion-400 transition-colors hover:bg-orion-50 hover:text-orion-600"
                            title="Abrir URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
