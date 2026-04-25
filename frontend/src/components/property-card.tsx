"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, Percent, Tag } from "lucide-react";
import { prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { toast } from "sonner";

import type { Property } from "@/lib/types";
import { erc1155Contract } from "@/lib/thirdweb";

export function PropertyCard({
  property,
  tokenId,
}: {
  property: Property;
  tokenId: bigint;
}) {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [isPending, setIsPending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const investDisabled = !account || isPending;

  const shortAddress = useMemo(() => {
    const a = account?.address;
    if (!a) return null;
    return `${a.slice(0, 6)}…${a.slice(-4)}`;
  }, [account?.address]);

  async function onInvest() {
    if (!account) return;
    setError(null);
    setLastTxHash(null);
    setIsPending(true);
    try {
      // mintTo(address to, uint256 tokenId, uint256 amount, bytes data)
      const transaction = prepareContractCall({
        contract: erc1155Contract,
        method:
          "function mintTo(address to, uint256 tokenId, uint256 amount, bytes data)",
        params: [account.address, tokenId, 1n, "0x"],
      });

      const result = await sendTx(transaction);
      setLastTxHash(result.transactionHash);
      toast.success("Investment minted", {
        description: `Tx: ${result.transactionHash.slice(0, 10)}…`,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `https://sepolia.basescan.org/tx/${result.transactionHash}`,
              "_blank",
              "noopener,noreferrer",
            ),
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error("Mint failed", { description: msg });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-snug">
              {property.address}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                tokenId {tokenId.toString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Percent className="h-3.5 w-3.5" />
                {property.apy_percentage}% APY
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/60">Price</div>
          <div className="text-base font-semibold">
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Available:{" "}
          <span className="text-white/80">
            {property.available_tokens}/{property.total_tokens}
          </span>
        </div>

        <button
          onClick={onInvest}
          disabled={investDisabled}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Minting…" : "Invest"}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 text-xs text-white/60">
        {account ? (
          <span>
            Mint to: <span className="text-white/80">{shortAddress}</span>
          </span>
        ) : (
          <span>Connect your wallet to invest.</span>
        )}
      </div>

      {lastTxHash ? (
        <div className="mt-2 text-xs">
          <span className="text-white/60">Tx:</span>{" "}
          <a
            className="text-white/80 underline underline-offset-4"
            href={`https://sepolia.basescan.org/tx/${lastTxHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on BaseScan
          </a>
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}

