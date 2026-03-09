import { z } from "zod";

// ── Master Data Schemas ──

export const masterDataItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  abbreviation: z.string().min(1, "La abreviación es obligatoria"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export type MasterDataItem = z.infer<typeof masterDataItemSchema>;

export const platformSchema = masterDataItemSchema.extend({
  source: z.string().min(1, "El source es obligatorio"),
  medium: z.string().default(""),
});

export type PlatformItem = z.infer<typeof platformSchema>;

// ── Campaign Creation Schema ──

export const campaignFormSchema = z.object({
  implementationDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  industryId: z.string().min(1, "Selecciona una industria"),
  countryId: z.string().min(1, "Selecciona un país"),
  companyId: z.string().min(1, "Selecciona una empresa"),
  brandId: z.string().min(1, "Selecciona una marca"),
  platformId: z.string().min(1, "Selecciona una plataforma"),
  formatId: z.string().min(1, "Selecciona un formato"),
  buyTypeId: z.string().min(1, "Selecciona un tipo de compra"),
  campaignTypeId: z.string().optional(),
  campaignName: z.string().min(1, "El nombre de campaña es obligatorio"),
  dateLabel: z.string().min(1, "La etiqueta de fecha es obligatoria"),
  segmentation: z.string().default(""),
  pieceType: z.string().default(""),
  pieceDifferentiator: z.string().default(""),
  utmSourceOverride: z.string().optional(),
  utmMediumOverride: z.string().optional(),
  destinationUrl: z.string().default(""),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

// ── QA Review Schema ──

export const qaCheckValues = ["PENDING", "OK", "FAIL", "NA"] as const;
export type QACheckValue = (typeof qaCheckValues)[number];

export const qaStatusValues = [
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;
export type QAStatusValue = (typeof qaStatusValues)[number];

export const qaReviewFormSchema = z.object({
  status: z.enum(qaStatusValues),
  platformCorrect: z.enum(qaCheckValues),
  campaignNameCorrect: z.enum(qaCheckValues),
  campaignObjectiveCorrect: z.enum(qaCheckValues),
  campaignBudgetMatch: z.enum(qaCheckValues),
  budgetLevel: z.string(),
  budgetAllocation: z.string(),
  campaignObservations: z.string(),
  adGroupNameCorrect: z.enum(qaCheckValues),
  isEvergreen: z.boolean(),
  eventName: z.string(),
  geoAgeGenderMatch: z.enum(qaCheckValues),
  includedAudiencesMatch: z.enum(qaCheckValues),
  excludedAudiencesMatch: z.enum(qaCheckValues),
  placementScope: z.string(),
  adGroupObservations: z.string(),
  adNameCorrect: z.enum(qaCheckValues),
  profilesCorrect: z.enum(qaCheckValues),
  mainCopyApproved: z.enum(qaCheckValues),
  titleCopyApproved: z.enum(qaCheckValues),
  descriptionCopyApproved: z.enum(qaCheckValues),
  ctaValue: z.string(),
  urlMatchesNaming: z.enum(qaCheckValues),
  urlWithUtmWorks: z.enum(qaCheckValues),
  previewLink: z.string(),
  trackingEvents: z.string(),
  adObservations: z.string(),
});

export type QAReviewFormData = z.infer<typeof qaReviewFormSchema>;

// ── Dropdown options type ──

export interface SelectOption {
  value: string;
  label: string;
  abbreviation?: string;
  meta?: Record<string, string>;
}

// ── Master data category enum for admin panel ──

export type MasterDataCategory =
  | "industries"
  | "brands"
  | "platforms"
  | "countries"
  | "companies"
  | "adFormats"
  | "buyTypes"
  | "campaignTypes"
  | "segmentationTypes"
  | "adPieceTypes";

export const MASTER_DATA_LABELS: Record<MasterDataCategory, string> = {
  industries: "Industrias",
  brands: "Marcas",
  platforms: "Plataformas",
  countries: "Países",
  companies: "Empresas",
  adFormats: "Formatos",
  buyTypes: "Tipos de Compra",
  campaignTypes: "Tipos de Campaña",
  segmentationTypes: "Segmentaciones",
  adPieceTypes: "Tipos de Pieza",
};
