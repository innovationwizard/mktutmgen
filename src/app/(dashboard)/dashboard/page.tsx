import { prisma } from "@/lib/prisma";
import { Wand2, ClipboardCheck, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let totalCampaigns = 0;
  let pendingQA = 0;
  let approvedQA = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentCampaigns: any[] = [];

  try {
    [totalCampaigns, pendingQA, approvedQA, recentCampaigns] =
      await Promise.all([
        prisma.campaign.count(),
        prisma.qAReview.count({ where: { status: "PENDING" } }),
        prisma.qAReview.count({ where: { status: "APPROVED" } }),
        prisma.campaign.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            industry: true,
            brand: true,
            platform: true,
            qaReview: true,
          },
        }),
      ]);
  } catch (e) {
    console.error("Dashboard data error:", e);
  }

  const stats = [
    {
      label: "Campañas Totales",
      value: totalCampaigns,
      icon: Wand2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "QA Pendiente",
      value: pendingQA,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "QA Aprobado",
      value: approvedQA,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "En Revisión",
      value: totalCampaigns - pendingQA - approvedQA,
      icon: ClipboardCheck,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-orion-900">
          Panel General
        </h1>
        <p className="mt-1 text-sm text-orion-400">
          Resumen de marcaciones y estado de QA
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="glass-card flex items-center gap-4 p-5"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orion-900">{value}</p>
              <p className="text-xs text-orion-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/generator"
          className="glass-card group flex items-center gap-4 p-6 transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-orion-900 p-3 text-white transition-transform group-hover:scale-105">
            <Wand2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-orion-900">
              Nueva Marcación
            </h3>
            <p className="text-sm text-orion-400">
              Generar naming y UTMs para una campaña
            </p>
          </div>
        </Link>

        <Link
          href="/qa"
          className="glass-card group flex items-center gap-4 p-6 transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-orion-900 p-3 text-white transition-transform group-hover:scale-105">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-orion-900">
              Revisar QA
            </h3>
            <p className="text-sm text-orion-400">
              {pendingQA} campañas pendientes de revisión
            </p>
          </div>
        </Link>
      </div>

      {/* Recent campaigns */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-orion-100 px-6 py-4">
          <h2 className="font-semibold text-orion-900">
            Campañas Recientes
          </h2>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-orion-400">
            No hay campañas creadas aún.
          </div>
        ) : (
          <div className="divide-y divide-orion-50">
            {recentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-orion-900">
                    {campaign.namingCampaign || "Sin nombre"}
                  </p>
                  <p className="mt-0.5 text-xs text-orion-400">
                    {campaign.brand.name} · {campaign.platform.name}
                  </p>
                </div>
                <span
                  className={
                    campaign.qaReview?.status === "APPROVED"
                      ? "qa-ok"
                      : campaign.qaReview?.status === "REJECTED"
                        ? "qa-fail"
                        : "qa-pending"
                  }
                >
                  {campaign.qaReview?.status === "APPROVED"
                    ? "Aprobado"
                    : campaign.qaReview?.status === "REJECTED"
                      ? "Rechazado"
                      : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
