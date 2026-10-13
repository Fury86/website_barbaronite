import Link from "next/link";

export function PageHeader({ title, intro, action }: { title: string; intro?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {intro && <p className="text-ink-soft text-sm mt-1 max-w-2xl">{intro}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-primary btn-sm">{action.label}</Link>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-8 text-center text-ink-soft text-sm">{children}</div>;
}
