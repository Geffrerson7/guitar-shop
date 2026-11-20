import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Reveal from "./Reveal";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe("Reveal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra el contenido de inmediato si no hay IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal data-testid="bloque">Texto</Reveal>);

    expect(screen.getByTestId("bloque")).toHaveAttribute(
      "data-reveal",
      "visible",
    );
  });

  it("queda oculto hasta entrar en el viewport y después se muestra", () => {
    let callback: Callback = () => {};
    const unobserve = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe() {}
        unobserve = unobserve;
        disconnect() {}
      },
    );

    render(<Reveal data-testid="bloque">Texto</Reveal>);
    const bloque = screen.getByTestId("bloque");
    expect(bloque).toHaveAttribute("data-reveal", "");

    act(() => callback([{ isIntersecting: true, target: bloque }]));

    expect(bloque).toHaveAttribute("data-reveal", "visible");
    expect(unobserve).toHaveBeenCalledWith(bloque);
  });
});
