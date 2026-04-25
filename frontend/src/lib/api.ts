import { Property } from "@/lib/types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch(`${apiBaseUrl}/properties`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch properties: HTTP ${res.status}`);
  }
  return (await res.json()) as Property[];
}

