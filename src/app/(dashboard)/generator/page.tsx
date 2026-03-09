"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wand2,
  Copy,
  Check,
  Plus,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateNaming, validateNaming } from "@/lib/naming";
import type { NamingInput, NamingOutput } from "@/lib/naming";
import { copyToClipboard } from "@/lib/utils";

// ── Types ──

interface MasterItem {
  id: string;
  name: string;
  abbreviation: string;
  source?: string;
  medium?: string;
}

interface MasterData {
  industries: MasterItem[];
  brands: MasterItem[];
  platforms: MasterItem[];
  countries: MasterItem[];
  companies: MasterItem[];
  adFormats: MasterItem[];
  buyTypes: MasterItem[];
  campaignTypes: MasterItem[];
  segmentationTypes: MasterItem[];
  adPieceTypes: MasterItem[];
}

// ── Component ──

export default function GeneratorPage() {
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    industryId: "",
    countryId: "",
    companyId: "",
    brandId: "",
    campaignName: "",
    platformId: "",
    formatId: "",
    buyTypeId: "",
    dateLabel: "",
    segmentation: "",
    pieceType: "",
    pieceDifferentiator: "",
    utmSourceOverride: "",
    utmMediumOverride: "",
    destinationUrl: "",
    // Metadata
    startDate: "",
    endDate: "",
  });

  // Load master data
  useEffect(() => {
    fetch("/api/master-data")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setMasterData)
      .catch(() => toast.error("Error cargando datos maestros"))
      .finally(() => setLoading(false));
  }, []);

  // Helper to find item by ID
  const find = useCallback(
    (list: MasterItem[] | undefined, id: string) =>
      list?.find((i) => i.id === id),
    []
  );

  // Compute naming in real-time
  const naming: NamingOutput | null = useMemo(() => {
    if (!masterData) return null;

    const industry = find(masterData.industries, form.industryId);
    const country = find(masterData.countries, form.countryId);
    const company = find(masterData.companies, form.companyId);
    const brand = find(masterData.brands, form.brandId);
    const platform = find(masterData.platforms, form.platformId);
    const format = find(masterData.adFormats, form.formatId);
    const buyType = find(masterData.buyTypes, form.buyTypeId);

    const input: NamingInput = {
      industryAbbr: industry?.abbreviation ?? "",
      countryAbbr: country?.abbreviation ?? "",
      companyAbbr: company?.abbreviation ?? "",
      brandAbbr: brand?.abbreviation ?? "",
      campaignName: form.campaignName,
      platformAbbr: platform?.abbreviation ?? "",
      formatAbbr: format?.abbreviation ?? "",
      buyTypeAbbr: buyType?.abbreviation ?? "",
      dateLabel: form.dateLabel,
      segmentation: form.segmentation,
      pieceType: form.pieceType,
      pieceDifferentiator: form.pieceDifferentiator,
      utmSource:
        form.utmSourceOverride || platform?.source || "",
      utmMedium:
        form.utmMediumOverride || platform?.medium || "",
      destinationUrl: form.destinationUrl,
    };

    return generateNaming(input);
  }, [form, masterData, find]);

  const issues = useMemo(
    () => (naming ? validateNaming(naming) : []),
    [naming]
  );

  // Handlers
  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({
      industryId: "",
      countryId: "",
      companyId: "",
      brandId: "",
      campaignName: "",
      platformId: "",
      formatId: "",
      buyTypeId: "",
      dateLabel: "",
      segmentation: "",
      pieceType: "",
      pieceDifferentiator: "",
      utmSourceOverride: "",
      utmMediumOverride: "",
      destinationUrl: "",
      startDate: "",
      endDate: "",
    });
  }

  async function handleCopy(text: string, field: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(field);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  async function handleSave() {
    if (!naming) return;

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...naming }),
      });

      if (!res.ok) throw new Error();

      toast.success("Campaña guardada exitosamente");
    } catch {
      toast.error("Error al guardar la campaña");
    }
  }

  // Auto-fill source/medium when platform changes
  useEffect(() => {
    if (!masterData || !form.platformId) return;
    const platform = find(masterData.platforms, form.platformId);
    if (platform) {
      setForm((prev) => ({
        ...prev,
        utmSourceOverride: prev.utmSourceOverride || "",
        utmMediumOverride: prev.utmMediumOverride || "",
      }));
    }
  }, [form.platformId, masterData, find]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-48 animate-shimmer rounded-lg bg-orion-100" />
        <div className="glass-card h-96 animate-shimmer" />
      </div>
    );
  }

  const platform = find(masterData?.platforms, form.platformId);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orion-900">
            Generador UTM
          </h1>
          <p className="mt-1 text-sm text-orion-400">
            Selecciona los parámetros para generar la marcación
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-orion-200 bg-white px-3 py-2 text-sm font-medium text-orion-600 transition-all hover:bg-orion-50"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>
          <button
            onClick={handleSave}
            disabled={issues.length > 0}
            className="brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orion-900/20 transition-all hover:shadow-xl disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Form sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Campaign Parameters ── */}
        <div className="space-y-6">
          {/* Identification */}
          <FormSection title="Identificación" icon="🏢">
            <SelectField
              label="Industria"
              value={form.industryId}
              onChange={(v) => updateField("industryId", v)}
              options={masterData?.industries ?? []}
            />
            <SelectField
              label="País"
              value={form.countryId}
              onChange={(v) => updateField("countryId", v)}
              options={masterData?.countries ?? []}
            />
            <SelectField
              label="Empresa"
              value={form.companyId}
              onChange={(v) => updateField("companyId", v)}
              options={masterData?.companies ?? []}
            />
            <SelectField
              label="Marca"
              value={form.brandId}
              onChange={(v) => updateField("brandId", v)}
              options={masterData?.brands ?? []}
            />
          </FormSection>

          {/* Campaign Config */}
          <FormSection title="Configuración de Campaña" icon="⚙️">
            <TextField
              label="Nombre de Campaña"
              value={form.campaignName}
              onChange={(v) => updateField("campaignName", v)}
              placeholder="Ej: navidad, BackToSchool, pmax"
            />
            <SelectField
              label="Plataforma"
              value={form.platformId}
              onChange={(v) => updateField("platformId", v)}
              options={masterData?.platforms ?? []}
            />
            <SelectField
              label="Formato / Objetivo"
              value={form.formatId}
              onChange={(v) => updateField("formatId", v)}
              options={masterData?.adFormats ?? []}
            />
            <SelectField
              label="Tipo de Compra"
              value={form.buyTypeId}
              onChange={(v) => updateField("buyTypeId", v)}
              options={masterData?.buyTypes ?? []}
            />
            <TextField
              label="Etiqueta de Fecha"
              value={form.dateLabel}
              onChange={(v) => updateField("dateLabel", v)}
              placeholder="Ej: nov2023, ao, 1al31dic"
            />
          </FormSection>

          {/* Segmentation & Piece */}
          <FormSection title="Segmentación y Pieza" icon="🎯">
            <SelectField
              label="Segmentación"
              value={form.segmentation}
              onChange={(v) => updateField("segmentation", v)}
              options={
                masterData?.segmentationTypes.map((s) => ({
                  ...s,
                  abbreviation: s.name,
                })) ?? []
              }
              valueKey="name"
            />
            <SelectField
              label="Tipo de Pieza"
              value={form.pieceType}
              onChange={(v) => updateField("pieceType", v)}
              options={
                masterData?.adPieceTypes.map((s) => ({
                  ...s,
                  abbreviation: s.name,
                })) ?? []
              }
              valueKey="name"
            />
            <TextField
              label="Diferenciador de Pieza"
              value={form.pieceDifferentiator}
              onChange={(v) => updateField("pieceDifferentiator", v)}
              placeholder="Ej: 1, Xela, Zapatos, _home"
            />
          </FormSection>

          {/* UTM Overrides */}
          <FormSection title="UTM Source & Medium" icon="🔗">
            <TextField
              label="Source"
              value={form.utmSourceOverride}
              onChange={(v) => updateField("utmSourceOverride", v)}
              placeholder={platform?.source || "Se auto-completa con la plataforma"}
            />
            <TextField
              label="Medium"
              value={form.utmMediumOverride}
              onChange={(v) => updateField("utmMediumOverride", v)}
              placeholder={platform?.medium || "Se auto-completa con la plataforma"}
            />
            <TextField
              label="URL de Destino"
              value={form.destinationUrl}
              onChange={(v) => updateField("destinationUrl", v)}
              placeholder="https://www.ejemplo.com/"
            />
          </FormSection>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-orion-100 bg-orion-900 px-6 py-4">
              <Wand2 className="h-5 w-5 text-white" />
              <h2 className="font-semibold text-white">
                Preview en Tiempo Real
              </h2>
            </div>

            <div className="space-y-5 p-6">
              {/* Validation warnings */}
              {issues.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-800">
                    Advertencias:
                  </p>
                  {issues.map((issue, i) => (
                    <p key={i} className="mt-1 text-xs text-amber-700">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}

              {/* Campaign Naming */}
              <OutputBlock
                label="Nombre de Campaña"
                sublabel="(R) naming_campaign"
                value={naming?.namingCampaign || "—"}
                onCopy={() =>
                  handleCopy(naming?.namingCampaign || "", "campaign")
                }
                copied={copiedField === "campaign"}
              />

              {/* Ad Group Naming */}
              <OutputBlock
                label="Nombre de Grupo de Anuncios"
                sublabel="(T) naming_adgroup"
                value={naming?.namingAdGroup || "—"}
                onCopy={() =>
                  handleCopy(naming?.namingAdGroup || "", "adgroup")
                }
                copied={copiedField === "adgroup"}
              />

              {/* Piece Naming */}
              <OutputBlock
                label="Nombre de Anuncio / Pieza"
                sublabel="(W) naming_piece"
                value={naming?.namingPiece || "—"}
                onCopy={() =>
                  handleCopy(naming?.namingPiece || "", "piece")
                }
                copied={copiedField === "piece"}
              />

              {/* UTM String */}
              <OutputBlock
                label="UTM String"
                sublabel="(Z) parámetros UTM"
                value={naming?.utmString || "—"}
                onCopy={() =>
                  handleCopy(naming?.utmString || "", "utm")
                }
                copied={copiedField === "utm"}
                mono
              />

              {/* Full URL */}
              <OutputBlock
                label="URL Completa"
                sublabel="(AB) URL + UTM"
                value={naming?.fullUrl || "—"}
                onCopy={() =>
                  handleCopy(naming?.fullUrl || "", "url")
                }
                copied={copiedField === "url"}
                mono
                link={
                  naming?.fullUrl?.startsWith("http")
                    ? naming.fullUrl
                    : undefined
                }
              />

              {/* Copy all */}
              <button
                onClick={() => {
                  const all = [
                    `Campaña: ${naming?.namingCampaign}`,
                    `Grupo: ${naming?.namingAdGroup}`,
                    `Pieza: ${naming?.namingPiece}`,
                    `UTM: ${naming?.utmString}`,
                    `URL: ${naming?.fullUrl}`,
                  ].join("\n");
                  handleCopy(all, "all");
                }}
                className="w-full rounded-lg border border-orion-200 bg-orion-50 px-4 py-2.5 text-sm font-medium text-orion-700 transition-all hover:bg-orion-100"
              >
                {copiedField === "all" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" /> Copiado
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Copiar Todo
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-orion-100 px-5 py-3">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-orion-800">{title}</h3>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  valueKey = "id",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: MasterItem[];
  valueKey?: "id" | "name";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-orion-500">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-orion-100 bg-white px-3 py-2 pr-8 text-sm text-orion-900 outline-none transition-all focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
            <option
              key={opt.id}
              value={valueKey === "name" ? opt.name : opt.id}
            >
              {opt.name}{" "}
              {opt.abbreviation !== opt.name
                ? `(${opt.abbreviation})`
                : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orion-300" />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-orion-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-orion-100 bg-white px-3 py-2 text-sm text-orion-900 outline-none transition-all placeholder:text-orion-300 focus:border-orion-400 focus:ring-2 focus:ring-orion-100"
      />
    </div>
  );
}

function OutputBlock({
  label,
  sublabel,
  value,
  onCopy,
  copied,
  mono,
  link,
}: {
  label: string;
  sublabel: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
  link?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-orion-700">{label}</span>
          <span className="ml-1.5 text-[10px] text-orion-300">{sublabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 text-orion-300 transition-colors hover:text-orion-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={onCopy}
            className="rounded p-1 text-orion-300 transition-colors hover:text-orion-600"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      <div
        className={`utm-display ${mono ? "text-xs" : "text-sm"} ${
          value === "—" ? "text-orion-300" : "text-orion-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
