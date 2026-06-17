import { randomBytes } from "crypto";

export function generateShareCode(length = 10): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export function getPublicUrl(shareCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/p/${shareCode}`;
}

export function getQuickPreviewUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl}/q/${slug}`;
}
