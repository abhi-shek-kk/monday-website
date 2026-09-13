import { NextResponse } from "next/server";
import { searchPublicContent } from "@/lib/services/search.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const results = await searchPublicContent(query);
    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
