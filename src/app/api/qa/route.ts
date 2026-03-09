import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST: Create or update a QA review
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;
    const body = await request.json();
    const { campaignId, ...qaData } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    // Remove non-schema fields
    delete qaData.id;
    delete qaData.campaign;
    delete qaData.implementedBy;
    delete qaData.reviewedBy;
    delete qaData.createdAt;
    delete qaData.updatedAt;

    // Convert date strings if present
    if (qaData.adGroupStartDate) {
      qaData.adGroupStartDate = new Date(qaData.adGroupStartDate);
    }
    if (qaData.adGroupEndDate) {
      qaData.adGroupEndDate = new Date(qaData.adGroupEndDate);
    }
    if (qaData.implementedAt) {
      qaData.implementedAt = new Date(qaData.implementedAt);
    }
    if (qaData.reviewedAt) {
      qaData.reviewedAt = new Date(qaData.reviewedAt);
    }

    // Upsert: create if doesn't exist, update if it does
    const review = await prisma.qAReview.upsert({
      where: { campaignId },
      create: {
        campaignId,
        ...qaData,
      },
      update: qaData,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("QA POST error:", error);
    return NextResponse.json(
      { error: "Error saving QA review" },
      { status: 500 }
    );
  }
}

// GET: Fetch QA review for a specific campaign
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }
    const review = await prisma.qAReview.findUnique({
      where: { campaignId },
      include: {
        campaign: {
          include: {
            brand: true,
            platform: true,
          },
        },
        implementedBy: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("QA GET error:", error);
    return NextResponse.json(
      { error: "Error fetching QA review" },
      { status: 500 }
    );
  }
}
