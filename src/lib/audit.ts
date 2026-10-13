import "server-only";
import { db, auditLog } from "@/db";
import type { SessionUser } from "./auth";

export async function logAction(
  user: SessionUser | null,
  action: "create" | "update" | "delete" | "login" | "logout" | "status",
  entity: string,
  entityId: string | number = "",
  details = "",
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: user?.id ?? null,
      userName: user?.name ?? "",
      action,
      entity,
      entityId: String(entityId),
      details: details.slice(0, 500),
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
