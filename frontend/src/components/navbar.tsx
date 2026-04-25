"use client";

import { ConnectButton } from "thirdweb/react";
import { Home, Wallet } from "lucide-react";

import { baseSepolia, client } from "@/lib/thirdweb";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Home className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Homenet</div>
            <div className="text-xs text-white/60">Tokenization dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-xs text-white/60 sm:block">
            Network: <span className="text-white/80">Base Sepolia</span>
          </div>
          <ConnectButton
            client={client}
            chain={baseSepolia}
            connectButton={{
              label: "Connect Wallet",
            }}
            detailsButton={{
              render: () => (
                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </span>
              ),
            }}
          />
        </div>
      </div>
    </header>
  );
}

