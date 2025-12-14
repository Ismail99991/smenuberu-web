export type BookingStatus = "none" | "booked" | "cancelled" | "completed";

export type BookingRecord = {
  status: BookingStatus;
  updatedAt: number;
};

const key = (slotId: string) => `slot_booking_${slotId}`;

export function getBooking(slotId: string): BookingRecord {
  if (typeof window === "undefined") return { status: "none", updatedAt: 0 };

  const raw = window.localStorage.getItem(key(slotId));
  if (!raw) return { status: "none", updatedAt: 0 };

  try {
    const parsed = JSON.parse(raw) as BookingRecord;
    if (!parsed?.status) return { status: "none", updatedAt: 0 };
    return parsed;
  } catch {
    // старый формат (если был "booked" строкой)
    if (raw === "booked") return { status: "booked", updatedAt: Date.now() };
    return { status: "none", updatedAt: 0 };
  }
}

export function setBooking(slotId: string, status: BookingStatus) {
  if (typeof window === "undefined") return;
  const rec: BookingRecord = { status, updatedAt: Date.now() };
  window.localStorage.setItem(key(slotId), JSON.stringify(rec));
}
