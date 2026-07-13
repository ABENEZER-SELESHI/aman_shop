"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/site/BrandMark";
import { loginSeller } from "@/services/studio";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function StudioLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (accessToken) router.replace("/studio");
  }, [accessToken, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4">
      <form
        className="w-full max-w-md space-y-5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-6"
        onSubmit={handleSubmit(async (values) => {
          setSubmitting(true);
          try {
            const session = await loginSeller(values.email, values.password);
            setSession(session);
            toast("Welcome back", "success");
            router.replace("/studio");
          } catch (error) {
            toast(error instanceof Error ? error.message : "Sign-in failed", "error");
          } finally {
            setSubmitting(false);
          }
        })}
        noValidate
      >
        <div>
          <BrandMark asLink={false} size="lg" />
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">Studio</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Seller sign-in for Aman Shop.</p>
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
            {...register("email")}
          />
          {errors.email ? <p className="mt-1 text-sm text-red-700">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm"
            {...register("password")}
          />
          {errors.password ? <p className="mt-1 text-sm text-red-700">{errors.password.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
