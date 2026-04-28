"use client";

import { motion } from "framer-motion";
import type { Property } from "@/lib/types";

export function DashboardView(props: {
  Navbar: React.ReactNode;
  properties: Property[];
  error: string | null;
  PropertyCard: (p: { property: Property; tokenId: bigint }) => React.ReactNode;
  RwaTerminal: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#070707] text-white">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {props.Navbar}
      </motion.div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-end justify-between gap-6"
        >
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
        </motion.div>

        {props.error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100"
          >
            Failed to load properties from the backend.
            <div className="mt-2 text-xs text-red-100/80">{props.error}</div>
            <div className="mt-3 text-xs text-red-100/80">
              Make sure FastAPI is running on{" "}
              <span className="font-semibold">
                {process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ??
                  "http://localhost:8000"}
              </span>{" "}
              and CORS is enabled.
            </div>
          </motion.div>
        ) : props.properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-sm text-white/80"
          >
            No properties found.
            <div className="mt-2 text-xs text-white/60">
              Run <span className="font-mono">python seed.py</span> on the backend
              to generate demo data.
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="mt-8 grid items-stretch grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.06, delayChildren: 0.05 },
              },
            }}
          >
            {props.properties.map((p, idx) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 10, scale: 0.98 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {props.PropertyCard({ property: p, tokenId: BigInt(idx) })}
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          {props.RwaTerminal}
        </motion.div>
      </main>
    </div>
  );
}

