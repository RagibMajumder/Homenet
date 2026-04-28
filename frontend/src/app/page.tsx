import { fetchProperties } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { RwaTerminal } from "@/components/rwa-terminal";
import type { Property } from "@/lib/types";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function Home() {
  let properties: Property[] = [];
  let error: string | null = null;
  try {
    properties = await fetchProperties();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <DashboardView
      Navbar={<Navbar />}
      properties={properties}
      error={error}
      PropertyCard={PropertyCard}
      RwaTerminal={<RwaTerminal />}
    />
  );
}
