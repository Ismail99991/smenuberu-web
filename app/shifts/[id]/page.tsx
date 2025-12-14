import ShiftDetailsClient from "./shift-details-client";

export default function Page({ params }: { params: { id: string } }) {
  return <ShiftDetailsClient id={params.id} />;
}
