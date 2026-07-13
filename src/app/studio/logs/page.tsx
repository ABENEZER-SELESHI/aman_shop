"use client";

import { useEffect, useState } from "react";
import { fetchActivityLogs, type ActivityLog } from "@/services/studio";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export default function StudioLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchActivityLogs();
        if (!cancelled) setLogs(data);
      } catch (error) {
        toast(error instanceof Error ? error.message : "Failed to load logs", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Activity log</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Product changes, order updates, and shop events.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : logs.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          No activity recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-[var(--surface)]">
          {logs.map((log) => (
            <li key={log.id} className="px-4 py-4 text-sm">
              <p className="text-[var(--ink)]">{log.message}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {log.action}
                {log.entity ? ` · ${log.entity}` : ""}
                {log.entityId ? `:${log.entityId}` : ""} · {log.actorType}
                {log.actorId ? ` ${log.actorId.slice(0, 8)}…` : ""} ·{" "}
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
