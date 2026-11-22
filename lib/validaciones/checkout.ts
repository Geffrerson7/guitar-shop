import "server-only";
import { z } from "zod";
import { MAX_LINEAS, MAX_POR_LINEA } from "@/features/carrito/reducer";
import type { CampoCheckout, ErroresCheckout } from "@/features/checkout/tipos";

/*
 * Validación del checkout en el servidor (Fase 11). La del navegador
 * (`required`, `type="email"`, `autocomplete`) es solo ayuda: todo lo que
 * llega a la Server Action se vuelve a comprobar aquí.
 *
 * Minimización de datos (lección de SEC-01): nombre, email, teléfono opcional
 * y dirección de envío. Nada más. Los campos que no están en el esquema se
 * descartan, incluido cualquier importe que intente colar el cliente.
 */

/** Texto recortado, con espacios internos normalizados. */
const texto = (nombre: string, min: number, max: number) =>
  z
    .string({ error: `Escribe ${nombre}.` })
    .transform((valor) => valor.trim().replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(1, `Escribe ${nombre}.`)
        .min(min, `Revisa ${nombre}: es demasiado corto.`)
        .max(max, `Revisa ${nombre}: admite hasta ${max} caracteres.`),
    );

/** Prefijos de código postal fuera de la península (envío no disponible). */
const PREFIJOS_FUERA_PENINSULA = new Set(["07", "35", "38", "51", "52"]);

const datosContacto = z.object({
  nombre: texto("tu nombre y apellidos", 2, 100),
  email: z
    .string({ error: "Escribe tu email." })
    .trim()
    .toLowerCase()
    .min(1, "Escribe tu email.")
    .max(254, "Revisa el email: es demasiado largo.")
    .pipe(z.email("Revisa el email: debe tener la forma nombre@dominio.es.")),
  telefono: z
    .string()
    .optional()
    .transform((valor) => valor?.replace(/[\s.-]/g, "") || undefined)
    .pipe(
      z
        .string()
        .regex(
          /^\+?\d{9,15}$/,
          "Revisa el teléfono: de 9 a 15 cifras, con prefijo opcional.",
        )
        .optional(),
    ),
  direccion: texto("la dirección", 5, 200),
  codigoPostal: z
    .string({ error: "Escribe el código postal." })
    .trim()
    .min(1, "Escribe el código postal.")
    .regex(
      /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/,
      "Revisa el código postal: son cinco cifras, como 28013.",
    )
    .refine(
      (cp) => !PREFIJOS_FUERA_PENINSULA.has(cp.slice(0, 2)),
      "Por ahora solo enviamos a la península.",
    ),
  localidad: texto("la localidad", 2, 100),
  provincia: texto("la provincia", 2, 100),
  consentimiento: z.literal("on", {
    error: "Necesitamos tu consentimiento para tramitar el pedido.",
  }),
});

/** Líneas tal como las manda el formulario: solo id y cantidad. */
const lineas = z
  .array(
    z.object({
      productoId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
      cantidad: z.number().int().min(1).max(MAX_POR_LINEA),
    }),
  )
  .min(1)
  .max(MAX_LINEAS)
  .refine(
    (todas) => new Set(todas.map((l) => l.productoId)).size === todas.length,
  );

export interface LineaSolicitada {
  productoId: number;
  cantidad: number;
}

export interface DatosCheckout {
  contacto: {
    nombre: string;
    email: string;
    telefono?: string;
    direccion: string;
    codigoPostal: string;
    localidad: string;
    provincia: string;
  };
  lineas: LineaSolicitada[];
  claveIdempotencia: string;
}

export type ResultadoValidacion =
  | { ok: true; datos: DatosCheckout }
  | { ok: false; errores: ErroresCheckout }
  /** El carrito o la clave no son válidos: no es culpa de ningún campo. */
  | { ok: false; mensaje: string };

/** `FormData` → objeto plano; un campo repetido se queda con el primero. */
function aObjeto(
  entrada: FormData | Record<string, unknown>,
): Record<string, unknown> {
  if (!(entrada instanceof FormData)) return entrada;
  const objeto: Record<string, unknown> = {};
  for (const [clave, valor] of entrada) {
    if (!(clave in objeto) && typeof valor === "string") objeto[clave] = valor;
  }
  return objeto;
}

function leerLineas(valor: unknown): LineaSolicitada[] | null {
  if (typeof valor !== "string" || valor.length > 10_000) return null;
  try {
    const resultado = lineas.safeParse(JSON.parse(valor));
    return resultado.success
      ? [...resultado.data].sort((a, b) => a.productoId - b.productoId)
      : null;
  } catch {
    return null;
  }
}

export function validarCheckout(
  entrada: FormData | Record<string, unknown>,
): ResultadoValidacion {
  const valores = aObjeto(entrada);

  const clave = z.uuid().safeParse(valores.claveIdempotencia);
  const lineasValidas = leerLineas(valores.lineas);
  if (!clave.success || lineasValidas === null) {
    return {
      ok: false,
      mensaje:
        "No hemos podido leer tu carrito. Vuelve al carrito y revísalo antes de confirmar.",
    };
  }

  const contacto = datosContacto.safeParse(valores);
  if (!contacto.success) {
    const errores: ErroresCheckout = {};
    for (const issue of contacto.error.issues) {
      const campo = issue.path[0] as CampoCheckout;
      errores[campo] ??= issue.message;
    }
    return { ok: false, errores };
  }

  // El consentimiento ya está comprobado; lo que se guarda es su fecha.
  const {
    nombre,
    email,
    telefono,
    direccion,
    codigoPostal,
    localidad,
    provincia,
  } = contacto.data;
  return {
    ok: true,
    datos: {
      contacto: {
        nombre,
        email,
        telefono,
        direccion,
        codigoPostal,
        localidad,
        provincia,
      },
      lineas: lineasValidas,
      claveIdempotencia: clave.data,
    },
  };
}
