import { describe, expect, it } from "vitest";
import { crearLimitador } from "./limite-frecuencia";

function reloj(inicio = 0) {
  let t = inicio;
  return { ahora: () => t, avanzar: (ms: number) => (t += ms) };
}

describe("crearLimitador", () => {
  it("permite hasta el máximo dentro de la ventana y después bloquea", () => {
    const { ahora } = reloj();
    const limitador = crearLimitador({ maximo: 3, ventanaMs: 1000, ahora });

    expect([1, 2, 3, 4].map(() => limitador.intentar("ip"))).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("lleva una cuenta por clave", () => {
    const { ahora } = reloj();
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 1000, ahora });

    expect(limitador.intentar("a")).toBe(true);
    expect(limitador.intentar("b")).toBe(true);
    expect(limitador.intentar("a")).toBe(false);
  });

  it("la ventana es deslizante: libera los intentos según caducan", () => {
    const { ahora, avanzar } = reloj();
    const limitador = crearLimitador({ maximo: 2, ventanaMs: 1000, ahora });

    limitador.intentar("ip");
    avanzar(600);
    limitador.intentar("ip");
    expect(limitador.intentar("ip")).toBe(false);

    avanzar(401); // el primero ya tiene más de 1000 ms
    expect(limitador.intentar("ip")).toBe(true);
    expect(limitador.intentar("ip")).toBe(false);
  });

  it("los intentos bloqueados no alargan el bloqueo", () => {
    const { ahora, avanzar } = reloj();
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 1000, ahora });

    limitador.intentar("ip");
    for (let i = 0; i < 5; i++) {
      avanzar(100);
      limitador.intentar("ip");
    }
    avanzar(501); // 1001 ms desde el único intento registrado
    expect(limitador.intentar("ip")).toBe(true);
  });

  it("purga las claves caducadas al llegar al tope de memoria", () => {
    const { ahora, avanzar } = reloj();
    const limitador = crearLimitador({
      maximo: 1,
      ventanaMs: 1000,
      maxClaves: 2,
      ahora,
    });

    limitador.intentar("a");
    limitador.intentar("b");
    avanzar(2000);
    // Con el mapa lleno se purga; «a» vuelve a tener su cupo.
    expect(limitador.intentar("c")).toBe(true);
    expect(limitador.intentar("a")).toBe(true);
  });
});
