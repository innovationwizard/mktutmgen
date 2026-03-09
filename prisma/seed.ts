import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ──
  const users = [
    { email: "condor@grupoorion.com", name: "condor", password: "testpass2026", role: Role.ADMIN },
    { email: "sebas@grupoorion.com", name: "sebas", password: "testpass12026", role: Role.ADMIN },
    { email: "delfa@grupoorion.com", name: "delfa", password: "testpass22026", role: Role.ADMIN },
  ];

  for (const u of users) {
    const passwordHash = await hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
      },
    });
  }

  // ── Industries ──
  const industries = [
    { name: "Retail", abbreviation: "rtil" },
    { name: "Moda", abbreviation: "mda" },
    { name: "Hogar", abbreviation: "hgr" },
    { name: "Automotríz", abbreviation: "atmz" },
    { name: "Farmaceutica", abbreviation: "far" },
    { name: "Fintech", abbreviation: "fin" },
    { name: "Inbound", abbreviation: "ibod" },
    { name: "Salud y Belleza", abbreviation: "saybe" },
    { name: "Medios de Comunicación", abbreviation: "med" },
    { name: "Licores", abbreviation: "lic" },
    { name: "Agro Industria", abbreviation: "agr" },
    { name: "Educación Superior", abbreviation: "edu" },
    { name: "Construcción", abbreviation: "cons" },
  ];

  for (const [i, ind] of industries.entries()) {
    await prisma.industry.upsert({
      where: { abbreviation: ind.abbreviation },
      update: {},
      create: { ...ind, sortOrder: i },
    });
  }

  // ── Brands ──
  const brands = [
    { name: "Pradera", abbreviation: "prad" },
    { name: "Metro", abbreviation: "mto" },
    { name: "Tienda Amiga", abbreviation: "ta" },
    { name: "Envello", abbreviation: "ello" },
    { name: "Volkswagen", abbreviation: "vw" },
    { name: "VW Camiones y Buses", abbreviation: "vwc&b" },
    { name: "Seat", abbreviation: "sat" },
    { name: "Dinners", abbreviation: "dcm" },
    { name: "Amelissa", abbreviation: "ams" },
    { name: "Agua Bendita", abbreviation: "ab" },
    { name: "Time Square", abbreviation: "ts" },
    { name: "Glausser", abbreviation: "glau" },
    { name: "Tonnig", abbreviation: "tng" },
    { name: "Chicco", abbreviation: "chi" },
    { name: "Mpower", abbreviation: "mp" },
    { name: "Bella Piel", abbreviation: "bp" },
    { name: "Wadana", abbreviation: "wad" },
    { name: "Bosi", abbreviation: "bos" },
    { name: "Iwanna", abbreviation: "iwc" },
    { name: "The North Face", abbreviation: "tnf" },
    { name: "Vans", abbreviation: "vns" },
    { name: "Kppa", abbreviation: "kpa" },
    { name: "Steve Madden", abbreviation: "sm" },
    { name: "Superga", abbreviation: "sp" },
    { name: "JanSport", abbreviation: "jns" },
    { name: "La Silla", abbreviation: "lsv" },
    { name: "La Opinión", abbreviation: "lo" },
    { name: "El Colombiano", abbreviation: "elc" },
    { name: "Pilatos", abbreviation: "pil" },
    { name: "Flexi", abbreviation: "fx" },
    { name: "Audi Farma", abbreviation: "audi" },
    { name: "Global Open University", abbreviation: "gou" },
    { name: "Paco", abbreviation: "paco" },
    { name: "Kipling", abbreviation: "kpl" },
    { name: "Diesel", abbreviation: "die" },
    { name: "Girboud", abbreviation: "gb" },
    { name: "Replay", abbreviation: "rpl" },
    { name: "Novomode", abbreviation: "nov" },
    { name: "Celio", abbreviation: "cel" },
    { name: "Puerta Abierta", abbreviation: "PuertaAbierta" },
    { name: "Super Dry", abbreviation: "sd" },
    { name: "Blacksip", abbreviation: "bsip" },
    { name: "Calzacosta", abbreviation: "cc" },
    { name: "Listo Corona", abbreviation: "lc" },
    { name: "Bodegas", abbreviation: "ba" },
    { name: "Coliseum", abbreviation: "cum" },
    { name: "Drogas La Economia", abbreviation: "dle" },
  ];

  for (const [i, brand] of brands.entries()) {
    await prisma.brand.upsert({
      where: { name_abbreviation: { name: brand.name, abbreviation: brand.abbreviation } },
      update: {},
      create: { ...brand, sortOrder: i },
    });
  }

  // ── Platforms (with default source/medium) ──
  const platforms = [
    { name: "Facebook", abbreviation: "fb", source: "facebook", medium: "ads" },
    { name: "Instagram", abbreviation: "ig", source: "meta", medium: "socialads" },
    { name: "Google Ads", abbreviation: "ga", source: "google", medium: "cpc" },
    { name: "People Media", abbreviation: "pm", source: "peoplemedia", medium: "ads" },
    { name: "Mercado Libre", abbreviation: "ml", source: "mercadoads", medium: "ads" },
    { name: "Time One", abbreviation: "to", source: "timeone", medium: "ads" },
    { name: "Sun Media", abbreviation: "sm", source: "sunmedia", medium: "ads" },
    { name: "Twitter", abbreviation: "twt", source: "twitter", medium: "ads" },
    { name: "LinkedIn", abbreviation: "ink", source: "linkedin", medium: "ads" },
    { name: "Applife", abbreviation: "al", source: "applift", medium: "ads" },
    { name: "DV360", abbreviation: "dv360", source: "dv360", medium: "cpm" },
    { name: "Criteo", abbreviation: "cri", source: "criteo", medium: "ads" },
    { name: "TikTok", abbreviation: "ttk", source: "tiktok", medium: "ads" },
    { name: "Pinterest", abbreviation: "pit", source: "pinterest", medium: "ads" },
    { name: "TapTap", abbreviation: "ttp", source: "taptap", medium: "ads" },
    { name: "Bing", abbreviation: "bg", source: "bing", medium: "cpc" },
    { name: "Mercado Ads", abbreviation: "mad", source: "mercadoads", medium: "ads" },
    { name: "Discovery", abbreviation: "dcv", source: "discovery", medium: "ads" },
    { name: "Vidoomy", abbreviation: "vid", source: "vidoomy", medium: "ads" },
  ];

  for (const [i, plat] of platforms.entries()) {
    await prisma.platform.upsert({
      where: { abbreviation: plat.abbreviation },
      update: {},
      create: { ...plat, sortOrder: i },
    });
  }

  // ── Countries ──
  const countries = [
    { name: "Colombia", abbreviation: "col" },
    { name: "México", abbreviation: "mex" },
    { name: "Bolivia", abbreviation: "bo" },
    { name: "Canadá", abbreviation: "ca" },
    { name: "Perú", abbreviation: "per" },
    { name: "Guatemala", abbreviation: "guat" },
    { name: "Ecuador", abbreviation: "ecu" },
    { name: "Chile", abbreviation: "chi" },
  ];

  for (const [i, c] of countries.entries()) {
    await prisma.country.upsert({
      where: { abbreviation: c.abbreviation },
      update: {},
      create: { ...c, sortOrder: i },
    });
  }

  // ── Companies ──
  const companies = [
    { name: "Blue Star", abbreviation: "bs" },
  ];

  for (const [i, co] of companies.entries()) {
    await prisma.company.upsert({
      where: { abbreviation: co.abbreviation },
      update: {},
      create: { ...co, sortOrder: i },
    });
  }

  // ── Ad Formats ──
  const formats = [
    { name: "SEM", abbreviation: "sem" },
    { name: "GDN (Google Display)", abbreviation: "gdn" },
    { name: "GSP (Gmail Sponsored)", abbreviation: "gsp" },
    { name: "Discovery", abbreviation: "dcv" },
    { name: "YouTube", abbreviation: "ytb" },
    { name: "Smart", abbreviation: "smt" },
    { name: "Smart Display", abbreviation: "sd" },
    { name: "Shopping", abbreviation: "shp" },
    { name: "Smart Shopping", abbreviation: "ss" },
    { name: "Tráfico", abbreviation: "traf" },
    { name: "Conversiones", abbreviation: "conv" },
    { name: "DPA (Dynamic Product Ads)", abbreviation: "dpa" },
    { name: "Video", abbreviation: "vid" },
    { name: "Alcance", abbreviation: "alc" },
    { name: "Brand Awareness", abbreviation: "ba" },
    { name: "Leads", abbreviation: "lds" },
    { name: "Descargas", abbreviation: "desc" },
    { name: "Externo", abbreviation: "ext" },
    { name: "Performance Max", abbreviation: "pmx" },
    { name: "Interacción", abbreviation: "int" },
    { name: "Mensajes", abbreviation: "men" },
    { name: "Programática", abbreviation: "prog" },
  ];

  for (const [i, f] of formats.entries()) {
    await prisma.adFormat.upsert({
      where: { abbreviation: f.abbreviation },
      update: {},
      create: { ...f, sortOrder: i },
    });
  }

  // ── Buy Types ──
  const buyTypes = [
    { name: "CPA (Costo por Adquisición)", abbreviation: "cpa" },
    { name: "CPL (Costo por Lead)", abbreviation: "cpl" },
    { name: "CPV (Costo por Vista)", abbreviation: "cpv" },
    { name: "CPC (Costo por Clic)", abbreviation: "cpc" },
    { name: "CPE (Costo por Engagement)", abbreviation: "cpe" },
    { name: "CPI (Costo por Instalación)", abbreviation: "cpi" },
    { name: "CPM (Costo por Mil)", abbreviation: "cpm" },
  ];

  for (const [i, bt] of buyTypes.entries()) {
    await prisma.buyType.upsert({
      where: { abbreviation: bt.abbreviation },
      update: {},
      create: { ...bt, sortOrder: i },
    });
  }

  // ── Campaign Types ──
  const campaignTypes = [
    { name: "Brand" },
    { name: "Category" },
    { name: "Consideration" },
    { name: "Performance" },
  ];

  for (const [i, ct] of campaignTypes.entries()) {
    await prisma.campaignType.upsert({
      where: { name: ct.name },
      update: {},
      create: { ...ct, sortOrder: i },
    });
  }

  // ── Segmentation Types ──
  const segmentations = [
    "intereses", "lookalike", "abierta", "remarketing",
    "audiencias", "temas", "keywords",
  ];

  for (const [i, name] of segmentations.entries()) {
    await prisma.segmentationType.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
  }

  // ── Ad Piece Types ──
  const pieceTypes = [
    "single", "carrusel", "collection", "video", "gif", "canvas",
    "300x250", "728x90", "300x600", "320x120", "banner", "texto",
    "mail", "carrudin", "carruviddin", "viddin", "html5",
  ];

  for (const [i, name] of pieceTypes.entries()) {
    await prisma.adPieceType.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: i },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
