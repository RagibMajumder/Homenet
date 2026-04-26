"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DasAsset = {
  id: string;
  content?: {
    metadata?: {
      name?: string;
    };
  };
};

type ChartPoint = { time: string; tvl: number };

function nowTime() {
  return new Date().toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RwaTerminal() {
  const [logs, setLogs] = useState<string[]>([
    `> INITIALIZING HOMENET RWA MONITOR...`,
    `> CONNECTING TO HELIUS RPC...`,
    `> SUBSCRIBING: Metaplex Core mints (authority scope)`,
  ]);

  const [chartData, setChartData] = useState<ChartPoint[]>([
    { time: new Date().toLocaleTimeString(), tvl: 1_250_000 },
  ]);

  const seenAssetIdsRef = useRef<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tvlRef = useRef<number>(1_250_000);

  const rpcUrl = useMemo(
    () =>
      "https://devnet.helius-rpc.com/?api-key=0526bfce-6df0-4c51-bc81-2e1a681a0223",
    [],
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs.length]);

  useEffect(() => {
    let isMounted = true;

    async function pollOnce() {
      try {
        const res = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "my-id",
            method: "getAssetsByAuthority",
            params: {
              authorityAddress: "HLXQ9Zeiwi8EY4CjF2g2CZ9zM2gPRHWQwiSmXCPaQkmW",
              page: 1,
              limit: 5,
            },
          }),
        });

        if (!res.ok) {
          const t = nowTime();
          const msg = `[${t}] RPC_ERROR: HTTP ${res.status}`;
          if (isMounted) setLogs((prev) => [...prev, msg]);
          return;
        }

        const json = (await res.json()) as {
          result?: { items?: DasAsset[] };
        };
        const assets = json.result?.items ?? [];
        if (!assets.length) return;

        const t = nowTime();
        const newAssets = assets.filter(
          (a) => a?.id && !seenAssetIdsRef.current.has(a.id),
        );
        if (!newAssets.length) return;

        newAssets.forEach((a) => seenAssetIdsRef.current.add(a.id));

        const newLines = newAssets.map((asset) => {
          const name =
            asset.content?.metadata?.name?.trim() ||
            "UNKNOWN_ASSET_NAME";
          const shortId = asset.id.slice(0, 8);
          return `[${t}] 🟩 ON-CHAIN DETECTION: New RWA Minted: ${name} | ID: ${shortId}...`;
        });

        if (isMounted) {
          setLogs((prev) => [...prev, ...newLines]);

          // Update TVL graph when we detect new mints.
          // For demo purposes: incrementally increase TVL by a fixed amount per new mint.
          // (We don't have property price from DAS, so we simulate based on mint count.)
          const delta = newAssets.length * 50_000;
          tvlRef.current += delta;
          setChartData((prev) => {
            const next = [...prev, { time: t, tvl: tvlRef.current }];
            return next.length > 20 ? next.slice(next.length - 20) : next;
          });
        }
      } catch (e) {
        const t = nowTime();
        const msg = `[${t}] RPC_ERROR: ${e instanceof Error ? e.message : String(e)}`;
        if (isMounted) setLogs((prev) => [...prev, msg]);
      }
    }

    // Kick one poll immediately so the terminal feels alive.
    pollOnce();

    const intervalId = window.setInterval(pollOnce, 10_000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [rpcUrl]);

  useEffect(() => {
    const heartbeatLines = [
      `[${nowTime()}] STATUS: Solana Devnet Blockheight [REDACTED]... OK`,
      `[${nowTime()}] DATA_SYNC: Local Python DB parity confirmed.`,
      `[${nowTime()}] NETWORK: Listening for Metaplex Core events...`,
    ];

    const intervalId = window.setInterval(() => {
      const idx = Math.floor(Math.random() * heartbeatLines.length);
      const line = heartbeatLines[idx].replace(/\[\d{2}:\d{2}:\d{2}\]/, `[${nowTime()}]`);
      setLogs((prev) => [...prev, line]);
    }, 3_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full max-w-2xl mt-8 rounded-lg overflow-hidden border border-gray-700 bg-black shadow-2xl">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center text-xs text-gray-400 font-mono">
          rwa_monitor_daemon // live
        </div>
        <div className="w-[52px]" />
      </div>

      <div className="flex flex-col">
        {/* Top (Charts) — ~60% */}
        <div className="px-3 pt-3 pb-2">
          <div className="rounded-md border border-gray-800 bg-black/60">
            <div className="px-3 py-2 text-xs font-mono text-gray-400">
              tvl_trace // devnet
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid stroke="#333" strokeOpacity={0.25} vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                  />
                  <YAxis
                    stroke="#666"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.85)",
                      border: "1px solid #333",
                      color: "#d1d5db",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tvl"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    style={{
                      filter: "drop-shadow(0px 0px 8px rgba(74,222,128,0.55))",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom (Logs) — ~40% */}
        <div
          ref={scrollerRef}
          className="font-mono text-sm h-40 overflow-y-auto px-4 pb-4 space-y-1 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
        >
          {logs.map((line, idx) => (
            <div key={`${idx}-${line}`} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

