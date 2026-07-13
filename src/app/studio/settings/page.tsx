"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeSellerPassword } from "@/services/studio";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const schema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function StudioSettingsPage() {
  const { toast } = useToast();
  const seller = useAuthStore((s) => s.seller);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword") ?? "";
  const checks = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(newPassword) },
    { label: "Contains a letter", ok: /[A-Za-z]/.test(newPassword) },
  ];

  useEffect(() => {
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }, [reset]);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Account for {seller?.email ?? "seller"}. Change your studio password here.
        </p>
      </div>

      <form
        className="space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
        onSubmit={handleSubmit(async (values) => {
          setSubmitting(true);
          try {
            await changeSellerPassword(values.currentPassword, values.newPassword);
            toast("Password updated", "success");
            reset();
          } catch (error) {
            toast(error instanceof Error ? error.message : "Could not change password", "error");
          } finally {
            setSubmitting(false);
          }
        })}
        noValidate
      >
        <div>
          <label htmlFor="currentPassword" className="mb-1.5 block text-sm">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
            {...register("currentPassword")}
          />
          {errors.currentPassword ? (
            <p className="mt-1 text-sm text-red-700">{errors.currentPassword.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
            {...register("newPassword")}
          />
          <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            {checks.map((check) => (
              <li key={check.label} className={check.ok ? "text-[var(--accent)]" : undefined}>
                {check.ok ? "✓" : "○"} {check.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-700">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <Button type="submit" loading={submitting} disabled={!isValid}>
          Update password
        </Button>
      </form>
    </div>
  );
}
