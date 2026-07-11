import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PayInPersonBanner } from "@/components/cart/PayInPersonBanner";

describe("PayInPersonBanner", () => {
  it("states pay in person clearly", () => {
    render(<PayInPersonBanner />);
    expect(screen.getByText(/No online payment/i)).toBeInTheDocument();
  });
});
