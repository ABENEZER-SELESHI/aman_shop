import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Track order",
  description: "Check the status of your Aman Shop order with your order reference.",
};

export default function TrackOrderLayout({ children }: { children: ReactNode }) {
  return children;
}
