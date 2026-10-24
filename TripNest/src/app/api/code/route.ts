import { json } from "@/lib/api";
import { listSourceFiles } from "@/lib/codetree";

export const dynamic = "force-dynamic";

export async function GET() {
  const files = await listSourceFiles();
  const totals = files.reduce(
    (acc, f) => ({
      files: acc.files + 1,
      lines: acc.lines + f.lines,
      bytes: acc.bytes + f.size,
    }),
    { files: 0, lines: 0, bytes: 0 },
  );

  return json({ files, totals });
}
