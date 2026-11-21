import { z } from "zod";

/*
 * Variables de entorno validadas (Fase 8). Se importa desde next.config.ts,
 * así que `next dev` y `next build` fallan al arrancar, con un mensaje claro,
 * si falta una variable obligatoria o tiene un formato inválido.
 *
 * Next.js carga `.env*` antes de evaluar next.config.ts; el CLI de Prisma no,
 * por eso prisma.config.ts carga `.env` por su cuenta.
 */

const postgresUrl = z.url({
  protocol: /^postgres(ql)?$/,
  error: (issue) =>
    issue.input === undefined
      ? "es obligatoria y no está definida"
      : "debe ser una URL postgresql://usuario:contraseña@host:puerto/base",
});

const schema = z.object({
  /**
   * Conexión de la aplicación en ejecución. En Neon, la cadena **agrupada**
   * (host con `-pooler`): las funciones serverless abren muchas conexiones
   * cortas.
   */
  DATABASE_URL: postgresUrl,
  /**
   * Conexión **directa** para `prisma migrate` (en Neon, el host sin
   * `-pooler`). Opcional: en local se usa DATABASE_URL.
   */
  DIRECT_URL: postgresUrl.optional(),
  /** URL pública del sitio. Opcional (ver lib/site.ts). */
  SITE_URL: z.url({ protocol: /^https?$/ }).optional(),
});

export type Env = z.infer<typeof schema>;

/** Valida un objeto de entorno; lanza un error legible si no es válido. */
export function parseEnv(
  source: Record<string, string | undefined> = process.env,
): Env {
  // Una variable definida pero vacía (`SITE_URL=`) cuenta como ausente.
  const values = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== ""),
  );
  const result = schema.safeParse(values);

  if (!result.success) {
    const detalle = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Variables de entorno inválidas:\n${detalle}\n` +
        "Copia .env.example a .env y revisa los valores.",
    );
  }

  return result.data;
}

export const env = parseEnv();
