/**
 * Import campaigns from the "Marcación QA Final" sheet of utm_generator.xlsx
 * into the production database. Creates Campaign + pending QAReview records.
 *
 * Run: npx tsx prisma/import-campaigns.ts
 */

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

// Excel serial number → JS Date
function excelDate(serial: number): Date | null {
  if (!serial || typeof serial !== "number" || serial < 1) return null;
  // Excel epoch: 1900-01-01, but has a leap-year bug (+1 day for serials > 59)
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 86400000);
}

async function main() {
  console.log("📖 Reading Excel file...");
  const wb = XLSX.readFile("utm_generator.xlsx");
  const ws = wb.Sheets["Marcación QA Final"];
  const raw: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
  });

  // Row 1 = actual headers, Row 2 = role assignments, data starts at row 3 (index 3)
  const dataRows = raw.slice(3);
  console.log(`   Total rows in sheet: ${dataRows.length}`);

  // ── Build master data lookup maps ──
  const [industries, brands, platforms, countries, companies, formats, buyTypes] =
    await Promise.all([
      prisma.industry.findMany(),
      prisma.brand.findMany(),
      prisma.platform.findMany(),
      prisma.country.findMany(),
      prisma.company.findMany(),
      prisma.adFormat.findMany(),
      prisma.buyType.findMany(),
    ]);

  const industryByAbbr = Object.fromEntries(industries.map((i) => [i.abbreviation, i.id]));
  const brandByAbbr = Object.fromEntries(brands.map((b) => [b.abbreviation, b.id]));
  const platformByAbbr = Object.fromEntries(platforms.map((p) => [p.abbreviation, p.id]));
  const countryByAbbr = Object.fromEntries(countries.map((c) => [c.abbreviation, c.id]));
  const companyByAbbr = Object.fromEntries(companies.map((c) => [c.abbreviation, c.id]));
  const formatByAbbr = Object.fromEntries(formats.map((f) => [f.abbreviation, f.id]));
  const buyTypeByAbbr = Object.fromEntries(buyTypes.map((b) => [b.abbreviation, b.id]));

  // Get default user for createdById
  const defaultUser = await prisma.user.findFirst({ where: { name: "condor" } });
  if (!defaultUser) throw new Error("Default user 'condor' not found. Run seed first.");

  // Ensure "prospecting" segmentation type exists
  await prisma.segmentationType.upsert({
    where: { name: "prospecting" },
    update: {},
    create: { name: "prospecting", sortOrder: 99 },
  });

  // ── Filter to real data rows ──
  const campaigns: typeof dataRows = [];
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const campaignName = str(row[12]);
    const industry = str(row[8]);
    const brand = str(row[11]);
    const platform = str(row[13]);

    // Skip empty/placeholder rows
    if (!campaignName || !industry || !brand || !platform) {
      continue;
    }

    campaigns.push(row);
  }

  console.log(`   Real campaign rows: ${campaigns.length}`);

  // ── Validate all rows before inserting anything ──
  const errors: string[] = [];
  const validated: {
    row: (string | number | undefined)[];
    industryId: string;
    countryId: string;
    companyId: string;
    brandId: string;
    platformId: string;
    formatId: string;
    buyTypeId: string;
  }[] = [];

  for (let i = 0; i < campaigns.length; i++) {
    const row = campaigns[i];
    const rowNum = i + 4; // 1-indexed, +3 for header rows

    const industryAbbr = str(row[8]);
    const countryAbbr = str(row[9]);
    const companyAbbr = str(row[10]);
    const brandAbbr = str(row[11]);
    const platformAbbr = str(row[13]);
    const formatAbbr = str(row[14]);
    const buyTypeAbbr = str(row[15]);

    const industryId = industryByAbbr[industryAbbr];
    const countryId = countryByAbbr[countryAbbr];
    // Default to "bs" when company is empty (116 rows have no company in Excel)
    const companyId = companyAbbr ? companyByAbbr[companyAbbr] : companyByAbbr["bs"];
    const brandId = brandByAbbr[brandAbbr];
    const platformId = platformByAbbr[platformAbbr];
    const formatId = formatByAbbr[formatAbbr];
    const buyTypeId = buyTypeByAbbr[buyTypeAbbr];

    if (!industryId) errors.push(`Row ${rowNum}: unknown industry "${industryAbbr}"`);
    if (!countryId) errors.push(`Row ${rowNum}: unknown country "${countryAbbr}"`);
    if (!companyId) errors.push(`Row ${rowNum}: unknown company "${companyAbbr}"`);
    if (!brandId) errors.push(`Row ${rowNum}: unknown brand "${brandAbbr}"`);
    if (!platformId) errors.push(`Row ${rowNum}: unknown platform "${platformAbbr}"`);
    if (!formatId) errors.push(`Row ${rowNum}: unknown format "${formatAbbr}"`);
    if (!buyTypeId) errors.push(`Row ${rowNum}: unknown buyType "${buyTypeAbbr}"`);

    if (industryId && countryId && companyId && brandId && platformId && formatId && buyTypeId) {
      validated.push({ row, industryId, countryId, companyId, brandId, platformId, formatId, buyTypeId });
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Validation errors:");
    errors.forEach((e) => console.error(`   ${e}`));
    console.error(`\n   ${errors.length} errors found. Aborting import.`);
    process.exit(1);
  }

  console.log(`   All ${validated.length} rows validated successfully.`);

  // ── Insert campaigns ──
  let created = 0;
  let duplicates = 0;

  for (const { row, industryId, countryId, companyId, brandId, platformId, formatId, buyTypeId } of validated) {
    const campaignName = str(row[12]);
    const dateLabel = str(row[16]);
    const namingCampaign = str(row[17]);
    const segmentation = str(row[18]);
    const namingAdGroup = str(row[19]);
    const pieceType = str(row[20]);
    const pieceDifferentiator = str(row[21]);
    const namingPiece = str(row[22]);
    const utmSource = str(row[23]);
    const utmMedium = str(row[24]);
    const utmString = str(row[25]);
    const destinationUrl = str(row[26]);
    const fullUrl = str(row[27]);

    // Parse dates (Excel serial numbers)
    const implementationDate = excelDate(row[0] as number);
    const startDate = excelDate(row[2] as number);
    // Col 3 has data corruption (budget values leaked in), only use if valid date serial
    const endDateRaw = row[3] as number;
    const endDate = endDateRaw && endDateRaw > 40000 ? excelDate(endDateRaw) : null;

    // Check for duplicate (same naming campaign string)
    const existing = await prisma.campaign.findFirst({
      where: { namingCampaign, namingPiece },
    });

    if (existing) {
      duplicates++;
      continue;
    }

    const campaign = await prisma.campaign.create({
      data: {
        industryId,
        countryId,
        companyId,
        brandId,
        platformId,
        formatId,
        buyTypeId,
        campaignName,
        dateLabel,
        segmentation,
        pieceType,
        pieceDifferentiator,
        utmSourceOverride: utmSource || null,
        utmMediumOverride: utmMedium || null,
        destinationUrl,
        implementationDate,
        startDate,
        endDate,
        namingCampaign,
        namingAdGroup,
        namingPiece,
        utmString,
        fullUrl,
        createdById: defaultUser.id,
      },
    });

    // Create pending QA review
    await prisma.qAReview.create({
      data: { campaignId: campaign.id },
    });

    created++;
  }

  console.log(`\n✅ Import complete.`);
  console.log(`   Created: ${created}`);
  console.log(`   Duplicates skipped: ${duplicates}`);

  // ── Verify: cross-check totals ──
  const dbCount = await prisma.campaign.count();
  const qaCount = await prisma.qAReview.count();
  console.log(`\n📊 Database totals:`);
  console.log(`   Campaigns: ${dbCount}`);
  console.log(`   QA Reviews: ${qaCount}`);
}

function str(val: string | number | undefined): string {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
