import { NextResponse, type NextRequest } from "next/server";
import { getProductosCarrito, parseIdsCarrito } from "@/lib/carrito";

/*
 * GET /api/carrito?ids=1,3,12 — datos actuales de los productos del carrito
 * (Fase 10). Es una lectura, así que va en un Route Handler y no en una
 * Server Action: las acciones están pensadas para mutaciones y el cliente las
 * despacha de una en una.
 *
 * Sin caché: el stock tiene que ser el de este momento.
 */
export async function GET(request: NextRequest) {
  const ids = parseIdsCarrito(request.nextUrl.searchParams.get("ids"));
  if (ids === null) {
    return NextResponse.json(
      { error: "El parámetro ids no es válido." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const productos = await getProductosCarrito(ids);
  return NextResponse.json(
    { productos },
    { headers: { "Cache-Control": "no-store" } },
  );
}
