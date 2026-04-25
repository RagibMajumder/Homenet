import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const client = createThirdwebClient({
  clientId:
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ??
    "PLEASE_SET_NEXT_PUBLIC_THIRDWEB_CLIENT_ID",
});

// Base Sepolia chain id: 84532
export const baseSepolia = defineChain(84532);

export const erc1155ContractAddress =
  "0x9d2fFEf11164AD87a0B05218E26311797d932183" as const;

export const erc1155Contract = getContract({
  client,
  chain: baseSepolia,
  address: erc1155ContractAddress,
});

