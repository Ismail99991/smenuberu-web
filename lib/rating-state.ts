export type RatingRecord = {
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  updatedAt: number;
};

const key = (slotId: string) => `slot_rating_${slotId}`;

export function getRating(slotId: string): RatingRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key(slotId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RatingRecord;
  } catch {
    return null;
  }
}

export function setRating(slotId: string, stars: 1 | 2 | 3 | 4 | 5, comment?: string) {
  if (typeof window === "undefined") return;
  const rec: RatingRecord = { stars, comment, updatedAt: Date.now() };
  window.localStorage.setItem(key(slotId), JSON.stringify(rec));
}
