import type { Metadata } from "next";
import { getBlocks, getSettings } from "@/lib/data";
import { ContactForm } from "@/components/site/forms";
import { cld } from "@/lib/cloudinary";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Контакти", description: "Адрес, телефон и форма за връзка с БарбарониТЕ – ж.к. Хаджи Димитър, София." };

export default async function ContactsPage() {
  const [t, s] = await Promise.all([getBlocks("Контакти"), getSettings()]);
  return (
    <div className="max-w-[1200px] mx-auto my-14 px-5">
      <section className="flex flex-wrap gap-10 items-start">
        <div className="flex-1 min-w-[300px]">
          {t["contacts.image"] && <img src={cld(t["contacts.image"], 900)} alt="" className="max-w-full h-auto mb-5" fetchPriority="high" />}
          <h3 className="text-bb-blue">{s.site_name}</h3>
          <p className="mt-2" style={{ whiteSpace: "pre-line" }}>{s.address}</p>
          <p className="mt-3">
            <strong>Тел:</strong> <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-[#e74c3c]">{s.phone}</a><br />
            <strong>Email:</strong> <a href={`mailto:${s.email}`} className="text-[#e74c3c]">{s.email}</a>
          </p>
          {s.maps_url && <p className="mt-3"><a href={s.maps_url} target="_blank" rel="noopener" className="bb-more">Виж на картата</a></p>}
        </div>
        <div className="flex-[2] min-w-[300px]">
          <h2 className="mb-2">{t["contacts.title"] || "Елате и ни посетете"}</h2>
          <p className="mb-7">{t["contacts.intro"]}</p>
          <div className="max-w-[700px]"><ContactForm /></div>
        </div>
      </section>
    </div>
  );
}
