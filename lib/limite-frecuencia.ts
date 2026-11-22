/*
 * Limitación de frecuencia de la acción de checkout (Fase 11): ventana
 * deslizante por clave (la IP del cliente), en memoria.
 *
 * Límite declarado: la memoria es de cada instancia del servidor. En un único
 * proceso (`next start`) el límite es exacto; en funciones serverless cada
 * instancia lleva su propia cuenta, así que frena el abuso desde un cliente
 * pero no es un límite global. Uno compartido (Redis o la propia base de
 * datos) queda para la Fase 14. No guarda nada en disco ni en la base de
 * datos: las IPs no se persisten.
 */

export interface OpcionesLimite {
  /** Intentos permitidos dentro de la ventana. */
  maximo: number;
  ventanaMs: number;
  /** Claves distintas como máximo en memoria antes de purgar. */
  maxClaves?: number;
  ahora?: () => number;
}

export interface Limitador {
  /** Registra un intento; `false` si supera el límite (no se registra). */
  intentar(clave: string): boolean;
}

export function crearLimitador({
  maximo,
  ventanaMs,
  maxClaves = 10_000,
  ahora = Date.now,
}: OpcionesLimite): Limitador {
  const intentos = new Map<string, number[]>();

  function purgar(desde: number) {
    for (const [clave, marcas] of intentos) {
      const vigentes = marcas.filter((t) => t > desde);
      if (vigentes.length === 0) intentos.delete(clave);
      else intentos.set(clave, vigentes);
    }
  }

  return {
    intentar(clave) {
      const t = ahora();
      const desde = t - ventanaMs;
      if (intentos.size >= maxClaves) purgar(desde);

      const vigentes = (intentos.get(clave) ?? []).filter((m) => m > desde);
      if (vigentes.length >= maximo) {
        intentos.set(clave, vigentes);
        return false;
      }
      vigentes.push(t);
      intentos.set(clave, vigentes);
      return true;
    },
  };
}
