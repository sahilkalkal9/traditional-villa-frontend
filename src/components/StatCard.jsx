export default function StatCard({ title, value, sub }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
        {title}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-[#071726] sm:text-3xl">
        {value}
      </h3>
      {sub && <p className="mt-2 text-xs text-[#6b7280]">{sub}</p>}
    </div>
  );
}