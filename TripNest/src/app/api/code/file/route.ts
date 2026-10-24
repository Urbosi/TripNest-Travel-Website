import { json, notFound } from "@/lib/api";
import { readSourceFile } from "@/lib/codetree";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("path");

  if (!requested) return notFound("Path");

  const file = await readSourceFile(requested);
  if (!file) return notFound("File");

  return json({ file });
}
