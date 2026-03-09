"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  MinusCircle,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import type { QACheckValue, QAStatusValue } from "@/types";

interface CampaignWithQA {
  id: string;
  namingCampaign: string;
  brand: { name: string };
  platform: { name: string };
  createdAt: string;
  qaReview: {
    id: string;
    status: QAStatusValue;
    [key: string]: unknown;
  } | null;
}

const QA_CHECK_ICONS: Record<QACheckValue, React.ReactNode> = {
  OK: <CheckCircle className="h-4 w-4 text-emerald-600" />,
  FAIL: <XCircle className="h-4 w-4 text-red-600" />,
  PENDING: <Clock className="h-4 w-4 text-amber-500" />,
  NA: <MinusCircle className="h-4 w-4 text-gray-400" />,
};

const STATUS_LABELS: Record<QAStatusValue, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En Revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

// QA checklist sections matching the Excel columns AC-BH
const QA_SECTIONS = [
  {
    title: "Plataforma",
    icon: "📱",
    responsibility: "Quien Implementa",
    checks: [
      { key: "platformCorrect", label: "¿La plataforma es correcta?" },
    ],
  },
  {
    title: "Campaña",
    icon: "📊",
    responsibility: "Quien Implementa / Specialist",
    checks: [
      { key: "campaignNameCorrect", label: "¿Está bien el nombre de la campaña?" },
      { key: "campaignObjectiveCorrect", label: "¿Es correcto el objetivo de campaña?" },
      { key: "campaignBudgetMatch", label: "¿El presupuesto coincide con la bitácora?" },
    ],
    textFields: [
      { key: "budgetLevel", label: "Nivel de presupuesto" },
      { key: "budgetAllocation", label: "¿Asignación diaria o total?" },
      { key: "campaignObservations", label: "Observaciones", multiline: true },
    ],
  },
  {
    title: "Conjunto de Anuncios",
    icon: "👥",
    responsibility: "Quien Implementa / Specialist",
    checks: [
      { key: "adGroupNameCorrect", label: "¿Está bien el nombre del grupo?" },
      { key: "geoAgeGenderMatch", label: "¿Coincide segmentación de lugares, sexo y edad?" },
      { key: "includedAudiencesMatch", label: "¿Coinciden los públicos incluidos?" },
      { key: "excludedAudiencesMatch", label: "¿Coinciden los públicos excluidos?" },
    ],
    textFields: [
      { key: "placementScope", label: "Ubicaciones (IG, FB o ambas)" },
      { key: "eventName", label: "Evento" },
      { key: "adGroupObservations", label: "Observaciones", multiline: true },
    ],
    boolFields: [
      { key: "isEvergreen", label: "¿Es atemporal (AO)?" },
    ],
  },
  {
    title: "Anuncios",
    icon: "🎨",
    responsibility: "Quien Implementa / Specialist",
    checks: [
      { key: "adNameCorrect", label: "¿Está bien el nombre del anuncio?" },
      { key: "profilesCorrect", label: "¿Los perfiles de FB e IG son correctos?" },
      { key: "mainCopyApproved", label: "¿El copy principal está aprobado?" },
      { key: "titleCopyApproved", label: "¿El copy de título está aprobado?" },
      { key: "descriptionCopyApproved", label: "¿La descripción está aprobada?" },
      { key: "urlMatchesNaming", label: "¿La URL coincide con la marcación?" },
      { key: "urlWithUtmWorks", label: "¿Funciona la URL con UTM?" },
    ],
    textFields: [
      { key: "ctaValue", label: "CTA del anuncio" },
      { key: "previewLink", label: "Preview Link" },
      { key: "trackingEvents", label: "Eventos de seguimiento" },
      { key: "adObservations", label: "Observaciones", multiline: true },
    ],
  },
];

export default function QAPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithQA[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [qaForm, setQaForm] = useState<Record<string, unknown>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/campaigns?include=qa")
      .then((r) => r.json())
      .then(setCampaigns)
      .catch(() => toast.error("Error cargando campañas"))
      .finally(() => setLoading(false));
  }, []);

  function selectCampaign(campaign: CampaignWithQA) {
    setSelected(campaign.id);
    if (campaign.qaReview) {
      setQaForm(campaign.qaReview as Record<string, unknown>);
    } else {
      setQaForm({ status: "PENDING" });
    }
  }

  function updateQAField(key: string, value: unknown) {
    setQaForm((prev) => ({ ...prev, [key]: value }));
  }

  function cycleCheck(key: string) {
    const current = (qaForm[key] as QACheckValue) || "PENDING";
    const order: QACheckValue[] = ["PENDING", "OK", "FAIL", "NA"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateQAField(key, next);
  }

  async function saveQA() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: selected, ...qaForm }),
      });
      if (!res.ok) throw new Error();
      toast.success("QA guardado exitosamente");

      // Refresh campaigns list
      const updated = await fetch("/api/campaigns?include=qa").then((r) =>
        r.json()
      );
      setCampaigns(updated);
    } catch {
      toast.error("Error al guardar QA");
    } finally {
      setSaving(false);
    }
  }

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.namingCampaign
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (c.qaReview?.status ?? "PENDING") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-orion-900">
          QA & Revisión
        </h1>
        <p className="mt-1 text-sm text-orion-400">
          Checklist completo de calidad para campañas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Campaign list */}
        <div className="glass-card flex flex-col overflow-hidden lg:max-h-[calc(100vh-12rem)]">
          <div className="space-y-3 border-b border-orion-100 p-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orion-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar campaña..."
                className="w-full rounded-lg border border-orion-100 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orion-400"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orion-300" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-orion-100 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-orion-400"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_REVIEW">En Revisión</option>
                <option value="APPROVED">Aprobado</option>
                <option value="REJECTED">Rechazado</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orion-300" />
            </div>
          </div>

          <div className="flex-1 divide-y divide-orion-50 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-orion-400">
                Cargando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-orion-400">
                No se encontraron campañas
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCampaign(c)}
                  className={`w-full px-4 py-3 text-left transition-all hover:bg-orion-50 ${
                    selected === c.id ? "bg-orion-50 border-l-2 border-l-orion-900" : ""
                  }`}
                >
                  <p className="truncate text-sm font-medium text-orion-900">
                    {c.namingCampaign || "Sin nombre"}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-orion-400">
                      {c.brand.name} · {c.platform.name}
                    </span>
                    <span
                      className={`ml-auto text-[10px] font-medium uppercase ${
                        c.qaReview?.status === "APPROVED"
                          ? "text-emerald-600"
                          : c.qaReview?.status === "REJECTED"
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {STATUS_LABELS[
                        (c.qaReview?.status as QAStatusValue) ?? "PENDING"
                      ]}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* QA Form */}
        {selected ? (
          <div className="space-y-4">
            {/* Status bar */}
            <div className="glass-card flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-orion-600" />
                <span className="text-sm font-semibold text-orion-900">
                  Estado General:
                </span>
                <select
                  value={(qaForm.status as string) || "PENDING"}
                  onChange={(e) => updateQAField("status", e.target.value)}
                  className="rounded-lg border border-orion-100 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-orion-400"
                >
                  {(
                    Object.entries(STATUS_LABELS) as [QAStatusValue, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveQA}
                disabled={saving}
                className="brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orion-900/20 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar QA"}
              </button>
            </div>

            {/* Sections */}
            {QA_SECTIONS.map((section) => (
              <div key={section.title} className="glass-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-orion-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <h3 className="text-sm font-semibold text-orion-800">
                      {section.title}
                    </h3>
                  </div>
                  <span className="text-[10px] text-orion-400">
                    {section.responsibility}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  {/* Check fields */}
                  {section.checks.map((check) => (
                    <div
                      key={check.key}
                      className="flex items-center justify-between rounded-lg border border-orion-50 px-4 py-2.5"
                    >
                      <span className="text-sm text-orion-700">
                        {check.label}
                      </span>
                      <button
                        onClick={() => cycleCheck(check.key)}
                        className="flex items-center gap-1.5 rounded-lg border border-orion-100 px-2.5 py-1 text-xs font-medium transition-all hover:bg-orion-50"
                      >
                        {
                          QA_CHECK_ICONS[
                            (qaForm[check.key] as QACheckValue) || "PENDING"
                          ]
                        }
                        <span>
                          {(qaForm[check.key] as string) || "PENDING"}
                        </span>
                      </button>
                    </div>
                  ))}

                  {/* Boolean fields */}
                  {section.boolFields?.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between rounded-lg border border-orion-50 px-4 py-2.5"
                    >
                      <span className="text-sm text-orion-700">
                        {field.label}
                      </span>
                      <button
                        onClick={() =>
                          updateQAField(field.key, !qaForm[field.key])
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          qaForm[field.key]
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {qaForm[field.key] ? "Sí" : "No"}
                      </button>
                    </div>
                  ))}

                  {/* Text fields */}
                  {section.textFields?.map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-xs font-medium text-orion-500">
                        {field.label}
                      </label>
                      {field.multiline ? (
                        <textarea
                          value={(qaForm[field.key] as string) || ""}
                          onChange={(e) =>
                            updateQAField(field.key, e.target.value)
                          }
                          rows={2}
                          className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm outline-none focus:border-orion-400"
                          placeholder="OK o escribir observaciones..."
                        />
                      ) : (
                        <input
                          type="text"
                          value={(qaForm[field.key] as string) || ""}
                          onChange={(e) =>
                            updateQAField(field.key, e.target.value)
                          }
                          className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm outline-none focus:border-orion-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
            <ClipboardCheck className="mb-3 h-12 w-12 text-orion-200" />
            <p className="text-sm font-medium text-orion-400">
              Selecciona una campaña para revisar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
