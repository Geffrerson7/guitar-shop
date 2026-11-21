/*
 * Seed idempotente (Fase 8): las 12 piezas y las 4 categorías del catálogo
 * original. Se puede ejecutar tantas veces como se quiera (`pnpm db:seed`):
 * hace upsert por `slug`, así que actualiza en lugar de duplicar.
 *
 * Los ids se fijan explícitamente para conservar las URLs públicas
 * (`/producto/3` sigue siendo la OM-Series Artisan); al terminar se ajusta
 * la secuencia para que los productos creados desde el panel (Fase 13) no
 * choquen con ellos.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const categorias = [
  { id: 1, nombre: "Eléctricas", slug: "electricas" },
  { id: 2, nombre: "Acústicas", slug: "acusticas" },
  { id: 3, nombre: "Bajos", slug: "bajos" },
  { id: 4, nombre: "Accesorios", slug: "accesorios" },
] as const;

type SlugCategoria = (typeof categorias)[number]["slug"];

type ProductoSeed = {
  id: number;
  slug: string;
  nombre: string;
  marca: string;
  /** Euros enteros; se convierten a céntimos al insertar. */
  euros: number;
  categoria: SlugCategoria;
  badge: string | null;
  stock: number;
  descripcion: string;
  specs: string[];
};

const productos: ProductoSeed[] = [
  {
    id: 1,
    slug: "heritage-custom-t-style",
    nombre: "Heritage Custom T-Style",
    marca: "Luthier House",
    euros: 2450,
    categoria: "electricas",
    badge: "Nuevo",
    stock: 3,
    descripcion:
      "Una obra maestra de la artesanía moderna con sonido cálido y sustain infinito.",
    specs: [
      "Cuerpo de Aliso seleccionado",
      "Mástil de Arce",
      "Pastillas Custom Shop Hand-Wound",
    ],
  },
  {
    id: 2,
    slug: "1964-gibson-es-335",
    nombre: "1964 Gibson ES-335",
    marca: "Gibson Vintage",
    euros: 8900,
    categoria: "electricas",
    badge: "Vintage",
    stock: 1,
    descripcion:
      "Semi-hollowbody icónica con sonido aterciopelado y laca nitrocelulósica original.",
    specs: [
      "Cuerpo semi-hueco de arce laminado",
      "Mástil de caoba",
      "Pastillas PAF humbucker originales",
    ],
  },
  {
    id: 3,
    slug: "om-series-artisan",
    nombre: "OM-Series Artisan",
    marca: "Voltio & Madera",
    euros: 3100,
    categoria: "acusticas",
    badge: null,
    stock: 2,
    descripcion:
      "Acústica artesanal con tapa de pícea maciza. Proyección y calidez inigualables.",
    specs: [
      "Tapa de Pícea maciza",
      "Fondo y aros de Palosanto",
      "Diapasón de Ébano",
    ],
  },
  {
    id: 4,
    slug: "black-beauty-custom",
    nombre: "Black Beauty Custom",
    marca: "Gibson",
    euros: 5200,
    categoria: "electricas",
    badge: null,
    stock: 2,
    descripcion:
      "Les Paul Custom con hardware dorado. Graves profundos y agudos cristalinos.",
    specs: [
      "Cuerpo de Caoba con tapa de Arce",
      "Mástil de Caoba",
      "Pastillas 490R y 498T",
    ],
  },
  {
    id: 5,
    slug: "classical-concert-1a",
    nombre: "Classical Concert 1A",
    marca: "Ramirez Master",
    euros: 4750,
    categoria: "acusticas",
    badge: "Edición Limitada",
    stock: 1,
    descripcion: "Guitarra clásica de concierto con incrustaciones de nácar.",
    specs: [
      "Tapa de Pícea alemana",
      "Fondo de Palosanto de India",
      "Incrustaciones de nácar",
    ],
  },
  {
    id: 6,
    slug: "modern-eagle-v",
    nombre: "Modern Eagle V",
    marca: "PRS Guitars",
    euros: 4200,
    categoria: "electricas",
    badge: null,
    stock: 2,
    descripcion:
      "Arce quilted azul vibrante con pájaros incrustados en el diapasón.",
    specs: ["Tapa de Arce Quilted", "Mástil de Caoba", "Pastillas 58/15 LT"],
  },
  {
    id: 7,
    slug: "masterbuilt-57-s-type",
    nombre: "Masterbuilt '57 S-Type",
    marca: "Fender Custom Shop",
    euros: 6100,
    categoria: "electricas",
    badge: null,
    stock: 1,
    descripcion:
      "Reissue envejecido a mano. El sonido que definió el rock and roll.",
    specs: ["Cuerpo de Aliso", "Mástil de Arce", "Pastillas Custom Shop"],
  },
  {
    id: 8,
    slug: "pro-series-5-string-bass",
    nombre: "Pro Series 5-String Bass",
    marca: "Warwick",
    euros: 2800,
    categoria: "bajos",
    badge: null,
    stock: 3,
    descripcion:
      "Bajo de 5 cuerdas con cuerpo de fresno. Definición y potencia.",
    specs: [
      "Cuerpo de Fresno",
      "Diapasón de Wenge",
      "Pastillas MEC Active/Passive",
    ],
  },
  {
    id: 9,
    slug: "royal-reverb-combo",
    nombre: "Royal Reverb Combo",
    marca: "Luthier Amps",
    euros: 1890,
    categoria: "accesorios",
    badge: null,
    stock: 4,
    descripcion:
      "Amp valvular con reverberación. El sonido que soñás desde que agarraste una guitarra.",
    specs: [
      "Potencia de 40W",
      "Altavoz Celestion Vintage 30",
      "Reverb a válvula Accutronics",
    ],
  },
  {
    id: 10,
    slug: "deluxe-drive-bundle",
    nombre: "Deluxe Drive Bundle",
    marca: "Custom Shop",
    euros: 450,
    categoria: "accesorios",
    badge: null,
    stock: 8,
    descripcion: "Bundle de pedales boutique: overdrive, distorsión y boost.",
    specs: [
      "Overdrive analógico",
      "Distorsión de alta ganancia",
      "Boost conmutable",
    ],
  },
  {
    id: 11,
    slug: "grand-auditorium-c12",
    nombre: "Grand Auditorium C12",
    marca: "Taylor Guitars",
    euros: 3800,
    categoria: "acusticas",
    badge: null,
    stock: 2,
    descripcion:
      "Taylor Grand Auditorium. Versatilidad absoluta para cualquier estilo.",
    specs: [
      "Tapa de Pícea maciza",
      "Fondo de Palosanto",
      "Pastillas Expression System 2",
    ],
  },
  {
    id: 12,
    slug: "jazz-masterpiece-hollow",
    nombre: "Jazz Masterpiece Hollow",
    marca: "D'Angelico",
    euros: 3400,
    categoria: "electricas",
    badge: null,
    stock: 1,
    descripcion:
      "Hollowbody de jazz con tapa de arce tallada. El estándar de oro.",
    specs: [
      "Cuerpo hueco de Arce tallado",
      "Mástil de Arce",
      "Pastillas Floating Mini-Humbucker",
    ],
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida (copia .env.example a .env).",
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await prisma.$transaction(async (tx) => {
      const idPorSlug = new Map<SlugCategoria, number>();

      for (const { id, nombre, slug } of categorias) {
        const categoria = await tx.categoria.upsert({
          where: { slug },
          update: { nombre },
          create: { id, nombre, slug },
        });
        idPorSlug.set(slug, categoria.id);
      }

      for (const { id, euros, categoria, ...producto } of productos) {
        const datos = {
          ...producto,
          precioCentimos: euros * 100,
          imagen: `/guitarras/${producto.slug}.webp`,
          activo: true,
          categoriaId: idPorSlug.get(categoria)!,
        };

        await tx.producto.upsert({
          where: { slug: producto.slug },
          update: datos,
          create: { id, ...datos },
        });
      }

      // Los ids explícitos no avanzan las secuencias de autoincrement.
      await tx.$executeRaw`SELECT setval(pg_get_serial_sequence('"Categoria"', 'id'), (SELECT MAX(id) FROM "Categoria"))`;
      await tx.$executeRaw`SELECT setval(pg_get_serial_sequence('"Producto"', 'id'), (SELECT MAX(id) FROM "Producto"))`;
    });

    const total = await prisma.producto.count();
    console.log(
      `Seed completado: ${categorias.length} categorías, ${total} productos.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
