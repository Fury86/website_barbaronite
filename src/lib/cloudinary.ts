import "server-only";
import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/** Подписва директно качване от браузъра към Cloudinary. */
export function signUpload(): { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string } {
  const c = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || "barbaronite";
  const signature = c.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET!);
  return { signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY!, cloudName: process.env.CLOUDINARY_CLOUD_NAME!, folder };
}

/** Оптимизиран URL на Cloudinary изображение (auto формат/качество, по желание ширина). */
export function cld(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com") || url.includes("/upload/f_auto")) return url;
  const t = width ? `f_auto,q_auto,w_${width},c_limit` : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${t}/`);
}
