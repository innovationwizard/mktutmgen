import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNaming } from "@/lib/naming";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        industry: true,
        country: true,
        company: true,
        brand: true,
        platform: true,
        format: true,
        buyType: true,
        campaignType: true,
        qaReview: true,
        createdBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Campaigns GET error:", error);
    return NextResponse.json({ error: "Error fetching campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();

    const [industry, country, company, brand, platform, format, buyType] =
      await Promise.all([
        prisma.industry.findUnique({ where: { id: body.industryId } }),
        prisma.country.findUnique({ where: { id: body.countryId } }),
        prisma.company.findUnique({ where: { id: body.companyId } }),
        prisma.brand.findUnique({ where: { id: body.brandId } }),
        prisma.platform.findUnique({ where: { id: body.platformId } }),
        prisma.adFormat.findUnique({ where: { id: body.formatId } }),
        prisma.buyType.findUnique({ where: { id: body.buyTypeId } }),
      ]);

    if (!industry || !country || !company || !brand || !platform || !format || !buyType) {
      return NextResponse.json({ error: "Invalid reference data" }, { status: 400 });
    }

    const naming = generateNaming({
      industryAbbr: industry.abbreviation,
      countryAbbr: country.abbreviation,
      companyAbbr: company.abbreviation,
      brandAbbr: brand.abbreviation,
      campaignName: body.campaignName,
      platformAbbr: platform.abbreviation,
      formatAbbr: format.abbreviation,
      buyTypeAbbr: buyType.abbreviation,
      dateLabel: body.dateLabel,
      segmentation: body.segmentation || "",
      pieceType: body.pieceType || "",
      pieceDifferentiator: body.pieceDifferentiator || "",
      utmSource: body.utmSourceOverride || platform.source,
      utmMedium: body.utmMediumOverride || platform.medium,
      destinationUrl: body.destinationUrl || "",
    });

    const campaign = await prisma.campaign.create({
      data: {
        industryId: body.industryId,
        countryId: body.countryId,
        companyId: body.companyId,
        brandId: body.brandId,
        platformId: body.platformId,
        formatId: body.formatId,
        buyTypeId: body.buyTypeId,
        campaignTypeId: body.campaignTypeId || null,
        campaignName: body.campaignName,
        dateLabel: body.dateLabel,
        segmentation: body.segmentation || "",
        pieceType: body.pieceType || "",
        pieceDifferentiator: body.pieceDifferentiator || "",
        utmSourceOverride: body.utmSourceOverride || null,
        utmMediumOverride: body.utmMediumOverride || null,
        destinationUrl: body.destinationUrl || "",
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        namingCampaign: naming.namingCampaign,
        namingAdGroup: naming.namingAdGroup,
        namingPiece: naming.namingPiece,
        utmString: naming.utmString,
        fullUrl: naming.fullUrl,
        createdById: session.user.id,
      },
      include: {
        industry: true,
        brand: true,
        platform: true,
      },
    });

    await prisma.qAReview.create({
      data: { campaignId: campaign.id },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Campaigns POST error:", error);
    return NextResponse.json({ error: "Error creating campaign" }, { status: 500 });
  }
}
