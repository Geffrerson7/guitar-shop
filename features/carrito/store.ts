import {
  CLAVE_CARRITO,
  leerCarrito,
  serializarCarrito,
} from "./almacenamiento";
import {
  CARRITO_VACIO,
  reducirCarrito,
  type AccionCarrito,
  type Carrito,
} from "./reducer";

/*
 * Almacén externo del carrito para `useSyncExternalStore` (Fase 10).
 *
 * La fuente de verdad es `localStorage`, compartido por todas las pestañas;
 * este módulo solo lo lee, aplica el reducer y avisa a React:
 *   - `getSnapshot` devuelve el mismo array mientras el texto guardado no
 *     cambie (React exige una instantánea estable).
 *   - `getServerSnapshot` es el carrito vacío: el servidor y la hidratación
 *     renderizan lo mismo y React se sincroniza con el navegador justo
 *     después, sin avisos de *hydration mismatch*.
 *   - El evento `storage` (cambios hechos en **otra** pestaña) vuelve a
 *     notificar.
 *
 * Si `localStorage` no está disponible (modo privado estricto, cuota llena,
 * almacenamiento bloqueado), el carrito sigue funcionando en memoria durante
 * la visita.
 */

type Oyente = () => void;

const oyentes = new Set<Oyente>();

/** Copia en memoria; es la fuente si `localStorage` falla. */
let enMemoria: string | null = null;
let soloMemoria = false;

let ultimoTexto: string | null | undefined;
let ultimoCarrito: Carrito = CARRITO_VACIO;

function almacenamiento(): Storage | null {
  if (soloMemoria || typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    soloMemoria = true;
    return null;
  }
}

function leerTexto(): string | null {
  const storage = almacenamiento();
  if (!storage) return enMemoria;
  try {
    return storage.getItem(CLAVE_CARRITO);
  } catch {
    soloMemoria = true;
    return enMemoria;
  }
}

function escribirTexto(texto: string | null): void {
  enMemoria = texto;
  const storage = almacenamiento();
  if (!storage) return;
  try {
    if (texto === null) storage.removeItem(CLAVE_CARRITO);
    else storage.setItem(CLAVE_CARRITO, texto);
  } catch {
    // Cuota llena o escritura bloqueada: se sigue en memoria.
    soloMemoria = true;
  }
}

function notificar(): void {
  for (const oyente of oyentes) oyente();
}

function alCambiarOtraPestana(evento: StorageEvent): void {
  // `key === null`: otra pestaña llamó a `localStorage.clear()`.
  if (evento.key === CLAVE_CARRITO || evento.key === null) notificar();
}

export function suscribir(oyente: Oyente): () => void {
  oyentes.add(oyente);
  if (oyentes.size === 1) {
    window.addEventListener("storage", alCambiarOtraPestana);
  }
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) {
      window.removeEventListener("storage", alCambiarOtraPestana);
    }
  };
}

export function getSnapshot(): Carrito {
  const texto = leerTexto();
  if (texto !== ultimoTexto) {
    ultimoTexto = texto;
    ultimoCarrito = leerCarrito(texto);
  }
  return ultimoCarrito;
}

export function getServerSnapshot(): Carrito {
  return CARRITO_VACIO;
}

/** Aplica una acción, la guarda y notifica. Devuelve el carrito resultante. */
export function despachar(accion: AccionCarrito): Carrito {
  const actual = getSnapshot();
  const siguiente = reducirCarrito(actual, accion);
  if (siguiente === actual) return actual;

  const texto = serializarCarrito(siguiente);
  escribirTexto(texto);
  ultimoTexto = texto;
  ultimoCarrito = siguiente;
  notificar();
  return siguiente;
}

/** Solo para pruebas: devuelve el módulo a su estado inicial. */
export function reiniciarParaPruebas(): void {
  enMemoria = null;
  soloMemoria = false;
  ultimoTexto = undefined;
  ultimoCarrito = CARRITO_VACIO;
}
