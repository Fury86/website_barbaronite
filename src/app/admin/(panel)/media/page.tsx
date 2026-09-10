import { cloudinaryConfigured, getCloudinary, cld } from "@/lib/cloudinary";
import { PageHeader } from "@/components/admin/page-header";
import { CopyUrl, MediaUploader } from "./client";

type Resource = { public_id: string; secure_url: string; created_at: string; width: number; height: number; bytes: number };

export default async function MediaAdmin() {
  let resources: Resource[] = [];
  let error = "";
  if (!cloudinaryConfigured()) {
    error = "Cloudinary не е свързан. Добавете CLOUDINARY_API_KEY и CLOUDINARY_API_SECRET в настройките на Vercel (Settings → Environment Variables) и направете нов deploy.";
  } else {
    try {
      const c = getCloudinary();
      const res = await c.api.resources({ type: "upload", max_results: 60, direction: "desc" });
      resources = res.resources as Resource[];
    } catch (e) {
      error = "Cloudinary върна грешка: " + (e instanceof Error ? e.message : String(e));
    }
  }
  return (
    <div className="grid gap-5">
      <PageHeader title="Снимки" intro="Последните 60 файла във вашия Cloudinary акаунт. Копирайте адреса, за да го поставите в описание или новина." />
      {error ? <div className="card p-5 text-sm text-coral-deep font-bold">{error}</div> : (
        <>
          <MediaUploader />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {resources.map((r) => (
              <figure key={r.public_id} className="card overflow-hidden">
                <div className="aspect-square bg-paper-deep flex items-center justify-center">
                  <img src={cld(r.secure_url, 400)} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <figcaption className="p-2 text-xs text-ink-soft grid gap-1">
                  <span className="truncate" title={r.public_id}>{r.public_id.split("/").pop()}</span>
                  <span>{r.width}×{r.height}</span>
                  <CopyUrl url={r.secure_url} />
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
