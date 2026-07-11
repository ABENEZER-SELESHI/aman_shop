import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "@/components/site/BrandMark";

describe("BrandMark", () => {
  it("renders Aman Shop brand", () => {
    render(<BrandMark asLink={false} />);
    expect(screen.getByText("Aman Shop")).toBeInTheDocument();
  });
});
