import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/** Дава подпис за директно качване от панела към Cloudinary. Само за влезли потребители. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary не е настроен – добавете CLOUDINARY_API_KEY и CLOUDINARY_API_SECRET във Vercel." }, { status: 503 });
  }
  return NextResponse.json(signUpload());
}
