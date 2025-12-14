export type ApplicationStatus = "none" | "applied" | "accepted" | "rejected";

const key = (shiftId: string) => `app_status_${shiftId}`;

export function getStatus(shiftId: string): ApplicationStatus {
  if (typeof window === "undefined") return "none";
  return (window.localStorage.getItem(key(shiftId)) as ApplicationStatus) || "none";
}

export function setStatus(shiftId: string, status: ApplicationStatus) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(shiftId), status);
}
