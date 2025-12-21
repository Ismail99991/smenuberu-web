export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "https://smenuberu-api.onrender.com";

export type UiSlot = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  company: string;
  city: string;
  address: string;
  time: string; // "08:00–15:00"
  pay: number;
  hot: boolean;
  tags: string[];
  type: string;
};

export async function getSlotsUi(): Promise<UiSlot[]> {
  const res = await fetch(`${API_BASE}/slots/ui`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /slots/ui failed: ${res.status} ${text}`);
  }
  return res.json();
}
