import { NextResponse } from "next/server";
import { store } from "@/vector-store";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const removed = store.remove(id);
  if (removed) {
    return NextResponse.json({ message: "Deleted" });
  } else {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}
