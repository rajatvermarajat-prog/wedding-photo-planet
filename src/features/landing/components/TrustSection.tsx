export function TrustSection() {
  const statements = [
    'Built for modern wedding photography teams',
    'From first inquiry to final gallery',
    'One connected workflow',
  ];
  return (
    <section aria-label="Product trust statements" className="border-y border-[#DFD9D2] bg-[#F0EDE9]">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
        {statements.map((statement) => (
          <p key={statement} className="rounded-2xl bg-white/62 px-4 py-4 text-center text-sm font-extrabold text-[#5A2F3E]">
            {statement}
          </p>
        ))}
      </div>
    </section>
  );
}
