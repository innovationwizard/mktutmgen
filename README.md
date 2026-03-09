# UTM Generator — Grupo Orión

Generador de marcación UTM y convenciones de nombrado para campañas digitales. Reemplaza completamente el flujo Excel de marcación y QA.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials)
- **Styling:** Tailwind CSS
- **Deploy:** Vercel + Neon/Supabase (PostgreSQL)

## Funcionalidades

| Módulo | Descripción |
|---|---|
| **Generador UTM** | Selecciona parámetros → genera naming de campaña, grupo de anuncios, pieza y UTM en tiempo real. Replica exactamente las fórmulas del Excel. |
| **QA & Revisión** | Checklist completo (plataforma, campaña, conjunto de anuncios, anuncios) con estados OK/FAIL/PENDING/NA. Replica las columnas AC-BH del Excel. |
| **Historial** | Búsqueda, filtros y exportación CSV de todas las marcaciones generadas. |
| **Administración** | CRUD completo de datos maestros: industrias, marcas, plataformas, países, empresas, formatos, tipos de compra, segmentaciones, tipos de pieza. |
| **Auth & Roles** | Admin, Expert, Specialist con permisos diferenciados. |

## Setup

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd utm-generator
npm install
```

### 2. Base de datos

Crea una base PostgreSQL (Neon, Supabase, o local):

```bash
cp .env.example .env
# Editar DATABASE_URL en .env
```

### 3. Prisma

```bash
npx prisma db push    # Crear tablas
npm run db:seed        # Cargar datos maestros del Excel
```

### 4. Generar secret de NextAuth

```bash
openssl rand -base64 32
# Copiar el resultado a NEXTAUTH_SECRET en .env
```

### 5. Correr

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

**Credenciales default:** `admin@grupoorion.com` / `admin123`

### 6. Deploy (Vercel)

```bash
vercel --prod
```

Variables de entorno requeridas en Vercel:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Arquitectura

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected route group
│   │   ├── dashboard/         # Overview + stats
│   │   ├── generator/         # UTM generator (core)
│   │   ├── qa/                # QA checklist workflow
│   │   ├── history/           # Campaign history + export
│   │   └── admin/             # Master data CRUD
│   └── api/
│       ├── auth/[...nextauth] # Auth endpoints
│       ├── campaigns/         # Campaign CRUD
│       ├── master-data/       # Master data CRUD
│       └── qa/                # QA review CRUD
├── lib/
│   ├── naming.ts              # Naming convention engine (Excel formula logic)
│   ├── prisma.ts              # DB client singleton
│   ├── auth.ts                # NextAuth config
│   └── utils.ts               # Helpers
├── types/
│   └── index.ts               # Zod schemas + TypeScript types
└── middleware.ts               # Auth middleware
```

## Fórmulas de Naming (del Excel)

```
Campaña:  {industry}_{country}_{company}_{brand}_{name}_{platform}_{format}_{buyType}_{dateLabel}
Grupo:    {brand}_{name}_{dateLabel}_{segmentation}
Pieza:    {brand}_{dateLabel}_{segmentation}_{pieceType}{name}{differentiator}
UTM:      ?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_term={adGroup}&utm_content={piece}
```

## Dependencias clave

```
bcryptjs         → password hashing (add: npm i bcryptjs @types/bcryptjs)
```

> **Nota:** `bcryptjs` no está en package.json. Agrégalo antes de correr:
> ```bash
> npm i bcryptjs @types/bcryptjs
> ```

## Próximos pasos

- [ ] Bulk import desde Excel existente
- [ ] Roles granulares (quién implementa vs quién revisa)
- [ ] Notificaciones de QA por email
- [ ] Dashboard de analytics (campañas por mes, tasa de aprobación)
- [ ] Duplicar campaña existente
- [ ] Validación de URLs en tiempo real
