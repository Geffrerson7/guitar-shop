import pg from "pg";

/*
 * Acceso directo a PostgreSQL desde las E2E (Fase 11): comprobar lo que el
 * checkout guardó y dejar la base de datos como estaba.
 *
 * Cada prueba usa un email propio. Al terminar, `limpiarPedidos` devuelve al
 * stock las unidades de sus pedidos y los borra (las líneas caen en cascada),
 * así que el seed no cambia aunque la suite se ejecute muchas veces.
 */

try {
  process.loadEnvFile();
} catch {
  // En CI las variables llegan del entorno del workflow.
}

let pool: pg.Pool | undefined;

function db(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Las E2E del checkout necesitan DATABASE_URL (.env).");
  }
  pool ??= new pg.Pool({ connectionString, max: 2 });
  return pool;
}

export interface PedidoGuardado {
  codigo: string;
  totalCentimos: number;
  estado: string;
  lineas: {
    productoId: number;
    precioUnitarioCentimos: number;
    cantidad: number;
  }[];
}

export async function pedidosDe(email: string): Promise<PedidoGuardado[]> {
  const { rows } = await db().query<{
    id: number;
    codigo: string;
    totalCentimos: number;
    estado: string;
  }>(
    `SELECT "id", "codigo", "totalCentimos", "estado" FROM "Pedido"
     WHERE "email" = $1 ORDER BY "id"`,
    [email],
  );

  return Promise.all(
    rows.map(async ({ id, ...pedido }) => {
      const lineas = await db().query<PedidoGuardado["lineas"][number]>(
        `SELECT "productoId", "precioUnitarioCentimos", "cantidad"
         FROM "PedidoItem" WHERE "pedidoId" = $1 ORDER BY "id"`,
        [id],
      );
      return { ...pedido, lineas: lineas.rows };
    }),
  );
}

export async function stockDe(productoId: number): Promise<number> {
  const { rows } = await db().query<{ stock: number }>(
    `SELECT "stock" FROM "Producto" WHERE "id" = $1`,
    [productoId],
  );
  return rows[0]!.stock;
}

/** Devuelve el stock de los pedidos de `email` y los borra. */
export async function limpiarPedidos(email: string): Promise<void> {
  const cliente = await db().connect();
  try {
    await cliente.query("BEGIN");
    await cliente.query(
      `UPDATE "Producto" p SET "stock" = p."stock" + l."unidades"
       FROM (
         SELECT i."productoId", SUM(i."cantidad")::int AS "unidades"
         FROM "PedidoItem" i JOIN "Pedido" o ON o."id" = i."pedidoId"
         WHERE o."email" = $1
         GROUP BY i."productoId"
       ) l
       WHERE p."id" = l."productoId"`,
      [email],
    );
    await cliente.query(`DELETE FROM "Pedido" WHERE "email" = $1`, [email]);
    await cliente.query("COMMIT");
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}

export async function cerrarDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
