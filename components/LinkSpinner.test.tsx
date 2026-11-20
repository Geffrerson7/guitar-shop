import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LinkSpinner from "./LinkSpinner";

const linkStatus = vi.hoisted(() => ({ pending: false }));

vi.mock("next/link", () => ({
  useLinkStatus: () => linkStatus,
}));

const spinner = (container: HTMLElement) =>
  container.querySelector("[data-pending]");

describe("LinkSpinner", () => {
  beforeEach(() => {
    linkStatus.pending = false;
  });

  it("muestra el texto y oculta el spinner si no hay navegación pendiente", () => {
    const { container } = render(<LinkSpinner>Catálogo</LinkSpinner>);

    expect(screen.getByText("Catálogo")).toBeInTheDocument();
    expect(spinner(container)).toHaveAttribute("data-pending", "false");
  });

  it("activa el spinner mientras la navegación está pendiente", () => {
    linkStatus.pending = true;
    const { container } = render(<LinkSpinner>Catálogo</LinkSpinner>);

    expect(spinner(container)).toHaveAttribute("data-pending", "true");
  });

  it("es decorativo y siempre está renderizado (sin saltos de layout)", () => {
    const { container } = render(<LinkSpinner>Catálogo</LinkSpinner>);

    expect(spinner(container)).toHaveAttribute("aria-hidden", "true");
    expect(spinner(container)).toHaveClass("absolute");
    expect(container.textContent).toBe("Catálogo");
  });
});
