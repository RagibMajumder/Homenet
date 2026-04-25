import { fetchProperties } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/lib/types";

export default async function Home() {
  let properties: Property[] = [];
  let error: string | null = null;
  try {
    properties = await fetchProperties();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Invest in tokenized properties
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Data from your local API. Mint on Base Sepolia via ERC-1155.
            </p>
          </div>
          <div className="hidden text-sm text-white/60 md:block">
            Backend: <span className="text-white/80">:8000</span>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            Failed to load properties from the backend.
            <div className="mt-2 text-xs text-red-100/80">{error}</div>
            <div className="mt-3 text-xs text-red-100/80">
              Make sure FastAPI is running on{" "}
              <span className="font-semibold">http://localhost:8000</span> and
              CORS is enabled.
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-sm text-white/80">
            No properties found.
            <div className="mt-2 text-xs text-white/60">
              Run <span className="font-mono">python seed.py</span> on the backend
              to generate demo data.
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p, idx) => (
              <PropertyCard key={p.id} property={p} tokenId={BigInt(idx)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
