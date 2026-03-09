/**
 * ═══════════════════════════════════════════════════════════════
 * NAMING CONVENTION ENGINE
 * ═══════════════════════════════════════════════════════════════
 *
 * Replicates the exact formula logic from the Excel:
 *
 *   Campaign:  {industry}_{country}_{company}_{brand}_{name}_{platform}_{format}_{buyType}_{dateLabel}
 *   Ad Group:  {brand}_{name}_{dateLabel}_{segmentation}
 *   Ad/Piece:  {brand}_{dateLabel}_{segmentation}_{pieceType}{name}{differentiator}
 *   UTM:       ?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_term={adGroup}&utm_content={piece}
 *   Full URL:  {destinationUrl}{utmString}
 */

export interface NamingInput {
  industryAbbr: string;
  countryAbbr: string;
  companyAbbr: string;
  brandAbbr: string;
  campaignName: string;
  platformAbbr: string;
  formatAbbr: string;
  buyTypeAbbr: string;
  dateLabel: string;
  segmentation: string;
  pieceType: string;
  pieceDifferentiator: string;
  utmSource: string;
  utmMedium: string;
  destinationUrl: string;
}

export interface NamingOutput {
  namingCampaign: string;
  namingAdGroup: string;
  namingPiece: string;
  utmString: string;
  fullUrl: string;
}

/**
 * Generate all naming strings from input parameters.
 * Mirrors Excel formulas R4, T4, W4, Z4, AB4.
 */
export function generateNaming(input: NamingInput): NamingOutput {
  const {
    industryAbbr,
    countryAbbr,
    companyAbbr,
    brandAbbr,
    campaignName,
    platformAbbr,
    formatAbbr,
    buyTypeAbbr,
    dateLabel,
    segmentation,
    pieceType,
    pieceDifferentiator,
    utmSource,
    utmMedium,
    destinationUrl,
  } = input;

  // R4: =I4&"_"&J4&"_"&K4&"_"&L4&"_"&M4&"_"&N4&"_"&O4&"_"&P4&"_"&Q4
  const namingCampaign = [
    industryAbbr,
    countryAbbr,
    companyAbbr,
    brandAbbr,
    campaignName,
    platformAbbr,
    formatAbbr,
    buyTypeAbbr,
    dateLabel,
  ].join("_");

  // T4: =L4&"_"&M4&"_"&Q4&"_"&S4
  const namingAdGroup = [brandAbbr, campaignName, dateLabel, segmentation].join(
    "_"
  );

  // W4: =L4&"_"&Q4&"_"&S4&"_"&U4&M4&""&V4
  const namingPiece = `${brandAbbr}_${dateLabel}_${segmentation}_${pieceType}${campaignName}${pieceDifferentiator}`;

  // Z4: ="?"&"utm_source="&X4&"&utm_medium="&Y4&"&utm_campaign="&R4&"&utm_term="&T4&"&utm_content="&W4
  const utmString = [
    `?utm_source=${encodeURIComponent(utmSource)}`,
    `&utm_medium=${encodeURIComponent(utmMedium)}`,
    `&utm_campaign=${encodeURIComponent(namingCampaign)}`,
    `&utm_term=${encodeURIComponent(namingAdGroup)}`,
    `&utm_content=${encodeURIComponent(namingPiece)}`,
  ].join("");

  // AB4: =CONCATENATE(AA4,Z4)
  const separator = destinationUrl.includes("?") ? "&" : "";
  const fullUrl = destinationUrl
    ? `${destinationUrl}${separator}${utmString.replace(/^\?/, destinationUrl.includes("?") ? "&" : "?")}`
    : utmString;

  return {
    namingCampaign,
    namingAdGroup,
    namingPiece,
    utmString,
    fullUrl,
  };
}

/**
 * Validate a naming string against the expected pattern.
 * Returns an array of issues (empty = valid).
 */
export function validateNaming(naming: NamingOutput): string[] {
  const issues: string[] = [];

  if (!naming.namingCampaign || naming.namingCampaign.includes("__")) {
    issues.push("El nombre de campaña tiene segmentos vacíos.");
  }

  if (!naming.namingAdGroup || naming.namingAdGroup.includes("__")) {
    issues.push("El nombre del grupo de anuncios tiene segmentos vacíos.");
  }

  if (naming.fullUrl && !isValidUrl(naming.fullUrl)) {
    issues.push("La URL final no es válida.");
  }

  if (naming.utmString && !naming.utmString.includes("utm_source=")) {
    issues.push("Falta utm_source en la marcación.");
  }

  return issues;
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse a naming string back into its components.
 * Useful for importing existing campaigns.
 */
export function parseNamingCampaign(naming: string): Partial<NamingInput> {
  const parts = naming.split("_");
  if (parts.length < 9) return {};

  return {
    industryAbbr: parts[0],
    countryAbbr: parts[1],
    companyAbbr: parts[2],
    brandAbbr: parts[3],
    campaignName: parts[4],
    platformAbbr: parts[5],
    formatAbbr: parts[6],
    buyTypeAbbr: parts[7],
    dateLabel: parts.slice(8).join("_"),
  };
}
