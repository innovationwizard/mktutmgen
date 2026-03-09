import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import type { MasterDataCategory } from "@/types";

const MODEL_MAP: Record<MasterDataCategory, keyof typeof prisma> = {
  industries: "industry",
  brands: "brand",
  platforms: "platform",
  countries: "country",
  companies: "company",
  adFormats: "adFormat",
  buyTypes: "buyType",
  campaignTypes: "campaignType",
  segmentationTypes: "segmentationType",
  adPieceTypes: "adPieceType",
};

// GET: Fetch all master data (or a specific category)
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as MasterDataCategory | null;

  try {
    if (category && MODEL_MAP[category]) {
      const model = prisma[MODEL_MAP[category]] as any;
      const items = await model.findMany({
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ [category]: items });
    }

    // Fetch all categories in parallel
    const [
      industries,
      brands,
      platforms,
      countries,
      companies,
      adFormats,
      buyTypes,
      campaignTypes,
      segmentationTypes,
      adPieceTypes,
    ] = await Promise.all([
      prisma.industry.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.platform.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.country.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.company.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.adFormat.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.buyType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.campaignType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.segmentationType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.adPieceType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    return NextResponse.json({
      industries,
      brands,
      platforms,
      countries,
      companies,
      adFormats,
      buyTypes,
      campaignTypes,
      segmentationTypes,
      adPieceTypes,
    });
  } catch (error) {
    console.error("Master data GET error:", error);
    return NextResponse.json({ error: "Error fetching master data" }, { status: 500 });
  }
}

// POST: Create a new item (admin only)
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();
    const { category, ...data } = body;

    if (!category || !MODEL_MAP[category as MasterDataCategory]) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const model = prisma[MODEL_MAP[category as MasterDataCategory]] as any;
    const item = await model.create({ data });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Master data POST error:", error);
    return NextResponse.json({ error: "Error creating item" }, { status: 500 });
  }
}

// PUT: Update an existing item (admin only)
export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();
    const { category, id, ...data } = body;

    if (!category || !MODEL_MAP[category as MasterDataCategory] || !id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const model = prisma[MODEL_MAP[category as MasterDataCategory]] as any;
    const item = await model.update({ where: { id }, data });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Master data PUT error:", error);
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

// DELETE: Remove an item (admin only)
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as MasterDataCategory | null;
  const id = searchParams.get("id");

  if (!category || !MODEL_MAP[category] || !id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const model = prisma[MODEL_MAP[category]] as any;
    await model.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Master data DELETE error:", error);
    return NextResponse.json(
      { error: "Cannot delete item. It may be in use." },
      { status: 409 }
    );
  }
}
