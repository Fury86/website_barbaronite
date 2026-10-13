export const ACTION: Record<string, string> = { create: "създаде", update: "редактира", delete: "изтри", login: "влезе", logout: "излезе", status: "смени статус" };
export const ENTITY: Record<string, string> = {
  activity: "дейност", team: "член на екипа", season: "сезон", slot: "занимание", event: "събитие", post: "новина",
  texts: "текстове", settings: "настройки", user: "потребител", registration: "записване", inquiry: "запитване", session: "", setup: "начална настройка",
};
export const REG_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Ново", cls: "bg-coral/15 text-coral-deep" },
  confirmed: { label: "Потвърдено", cls: "bg-mint/20 text-[#1c7a63]" },
  declined: { label: "Отказано", cls: "bg-line text-ink-soft" },
};
export const FORMAT_LABEL: Record<string, string> = { individual: "Индивидуално", group: "Групово", both: "Индивидуално и групово" };
