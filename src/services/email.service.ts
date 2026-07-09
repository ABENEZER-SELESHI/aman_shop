import { Resend } from "resend";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import type { OrderLine } from "../types/order.js";

type OrderEmailInput = {
  reference: string;
  customerName: string;
  customerPhone: string;
  preferredPickup: string;
  customerNote: string;
  subtotalEtb: number;
  lines: OrderLine[];
};

export class EmailService {
  private readonly resend: Resend | null;

  constructor() {
    this.resend = config.email.resendApiKey ? new Resend(config.email.resendApiKey) : null;
  }

  async sendNewOrderEmail(order: OrderEmailInput): Promise<void> {
    const subject = `New order ${order.reference} — ${order.customerName}`;
    const text = this.renderOrderText(order);

    if (!this.resend) {
      if (config.isDevelopment || config.isTest) {
        logger.info("Email delivery skipped; logging order email", { subject, text });
        return;
      }
      throw new Error("RESEND_API_KEY is required for email delivery in production");
    }

    await this.resend.emails.send({
      from: config.email.from,
      to: config.email.orderNotifyEmail,
      subject,
      text,
    });
  }

  private renderOrderText(order: OrderEmailInput): string {
    const lines = order.lines
      .map((line) => `- ${line.quantity} x ${line.name} (${line.productId}) @ ${line.unitPriceEtb} ETB`)
      .join("\n");

    return [
      `Reference: ${order.reference}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.customerPhone}`,
      `Preferred pickup: ${order.preferredPickup}`,
      `Pay in person: yes`,
      `Subtotal: ${order.subtotalEtb} ETB`,
      `Note: ${order.customerNote || "None"}`,
      "",
      "Lines:",
      lines,
    ].join("\n");
  }
}

export const emailService = new EmailService();
