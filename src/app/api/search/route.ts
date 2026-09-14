import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { searchPublicContent } from "@/lib/services/search.service";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const results = await searchPublicContent(query, session?.role);
    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
