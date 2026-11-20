import { describe, expect, it } from "vitest";
import { staggerStyle } from "./stagger";

describe("staggerStyle", () => {
  it("expone el índice como la custom property --stagger", () => {
    expect(staggerStyle(3)).toEqual({ "--stagger": 3 });
  });
});
