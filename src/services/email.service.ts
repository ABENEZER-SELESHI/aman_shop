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

type PasswordResetEmailInput = {
  to: string;
  name: string;
  resetToken: string;
  expiresMinutes: number;
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
        logger.info("Email delivery skipped; order email logged without PII body", {
          subject,
          reference: order.reference,
        });
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

  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<void> {
    const subject = "Aman Shop — password reset";
    const text = [
      `Hi ${input.name},`,
      "",
      `Use this one-time reset token within ${input.expiresMinutes} minutes:`,
      input.resetToken,
      "",
      "If you did not request this, ignore this email.",
    ].join("\n");

    if (!this.resend) {
      if (config.isDevelopment || config.isTest) {
        logger.info("Password reset email skipped (dev)", { to: input.to });
        return;
      }
      throw new Error("RESEND_API_KEY is required for email delivery in production");
    }

    await this.resend.emails.send({
      from: config.email.from,
      to: input.to,
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
