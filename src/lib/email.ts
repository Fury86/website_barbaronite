import "server-only";
import { Resend } from "resend";
import { getSetting } from "./data";

/** Праща известие до имейла от настройките. Ако Resend не е конфигуриран – само логва. */
export async function notify(subject: string, lines: string[]): Promise<void> {
  const to = (await getSetting("notify_email")) || "info@barbaronite.eu";
  const key = process.env.RESEND_API_KEY;
  const html =
    `<div style="font-family:sans-serif;font-size:15px;line-height:1.5">` +
    lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("") +
    `<p style="color:#888;font-size:13px">Изпратено от сайта barbaronite.eu. Отговорете директно на подателя, не на този имейл.</p></div>`;
  if (!key) {
    console.log(`[email пропуснат – няма RESEND_API_KEY] до ${to}: ${subject}\n${lines.join("\n")}`);
    return;
  }
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.RESEND_FROM || "БарбарониТЕ <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error("email failed", e);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
