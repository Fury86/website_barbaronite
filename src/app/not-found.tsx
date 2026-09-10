import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6 text-center bg-[#fffff0]" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
      <div className="max-w-[850px] bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-8 py-14">
        <div className="text-6xl font-bold text-[#0244ae]">404</div>
        <h1 className="text-2xl font-bold mt-4">Тази страница не съществува</h1>
        <p className="text-[#3f3f3f] mt-3 mx-auto">Може би е преместена или адресът е сгрешен.</p>
        <Link href="/" className="bb-button mt-8">Начало</Link>
      </div>
    </main>
  );
}
