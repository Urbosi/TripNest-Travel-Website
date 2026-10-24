"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, Input, Skeleton, Spinner } from "@/components/ui";
import { KEY_FILES } from "@/lib/keyFiles";

type CodeFile = { path: string; size: number; lines: number; language: string };
type FileBody = { path: string; content: string; lines: number; language: string; size: number };

const LANG_COLOR: Record<string, string> = {
  typescript: "#3178c6",
  tsx: "#38bdf8",
  javascript: "#f7df1e",
  json: "#a3a3a3",
  css: "#c2410c",
  markdown: "#94a3b8",
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** Build a nested tree from flat paths. */
type TreeNode = {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  file?: CodeFile;
};

function buildTree(files: CodeFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: new Map() };
  for (const f of files) {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const isLeaf = i === parts.length - 1;
      const nodePath = parts.slice(0, i + 1).join("/");
      if (!node.children.has(part)) {
        node.children.set(part, { name: part, path: nodePath, children: new Map() });
      }
      node = node.children.get(part)!;
      if (isLeaf) node.file = f;
    });
  }
  return root;
}

export default function CodeExplorer() {
  const [files, setFiles] = useState<CodeFile[] | null>(null);
  const [totals, setTotals] = useState<{ files: number; lines: number; bytes: number } | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [body, setBody] = useState<FileBody | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["src", "src/app", "src/lib", "src/db"]));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/code");
      const data = (await res.json()) as {
        files: CodeFile[];
        totals: { files: number; lines: number; bytes: number };
      };
      if (!alive) return;
      setFiles(data.files);
      setTotals(data.totals);
      // Auto-open the schema as the most interesting starting point.
      if (data.files.some((f) => f.path === "src/db/schema.ts")) open("src/db/schema.ts");
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function open(path: string) {
    setActivePath(path);
    setLoadingFile(true);
    const res = await fetch(`/api/code/file?path=${encodeURIComponent(path)}`);
    const data = (await res.json()) as { file: FileBody };
    setBody(res.ok ? data.file : null);
    setLoadingFile(false);
  }

  const filtered = useMemo(() => {
    if (!files) return [];
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, query]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  // Keep the selected folder visible while filtering.
  useEffect(() => {
    if (query.trim()) {
      setExpanded(new Set(filtered.map((f) => f.path.split("/").slice(0, -1).join("/")).filter(Boolean)));
    }
  }, [query, filtered]);

  const lineCount = body ? body.content.split("\n").length : 0;

  async function copy() {
    if (!body) return;
    await navigator.clipboard.writeText(body.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------ Download bar ----------------------------- */}
      <Card className="overflow-hidden border-lagoon-300/50 bg-gradient-to-br from-lagoon-50 via-white to-sand-100">
        <div className="flex flex-wrap items-center justify-between gap-5 p-6 sm:p-7">
          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-ink">
              📁 Download the whole project folder
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink/60">
              Unzip it, then in VS Code choose <strong className="text-ink/80">File → Open Folder</strong> and
              select the <code className="rounded bg-sand-100 px-1.5 py-0.5 text-[11px] font-bold">TripNest</code>{" "}
              directory. Run <code className="rounded bg-sand-100 px-1.5 py-0.5 text-[11px] font-bold">npm install</code>{" "}
              and you&apos;re running it locally.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href="/tripnest-source.zip"
              download
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-lagoon-600 px-6 text-sm font-bold text-white shadow-lg shadow-lagoon-600/25 transition hover:bg-lagoon-700"
            >
              ⬇ Download .zip
            </a>
            <a
              href="/api/code"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-xl border border-ink/15 bg-white px-5 text-sm font-bold text-ink transition hover:border-lagoon-500 hover:text-lagoon-700"
            >
              File index (JSON)
            </a>
          </div>
        </div>
        {totals && (
          <div className="grid grid-cols-3 border-t border-ink/8 bg-white/60">
            {[
              { k: "Files", v: totals.files.toLocaleString() },
              { k: "Lines of code", v: totals.lines.toLocaleString() },
              { k: "Uncompressed", v: fmtSize(totals.bytes) },
            ].map((s) => (
              <div key={s.k} className="px-6 py-4 text-center">
                <p className="text-xl font-black text-ink">{s.v}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">{s.k}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ---------------------------- Key files quick jump --------------------------- */}
      <Card className="p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/45">Start with these</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {KEY_FILES.filter((k) => files?.some((f) => f.path === k.path)).map((k) => (
            <button
              key={k.path}
              onClick={() => open(k.path)}
              title={k.why}
              className={`group rounded-xl border px-3 py-2 text-left transition ${
                activePath === k.path
                  ? "border-lagoon-500 bg-lagoon-50"
                  : "border-ink/12 bg-white hover:border-lagoon-300 hover:bg-lagoon-50/50"
              }`}
            >
              <span className="block font-mono text-[11px] font-bold text-ink">
                {k.path.split("/").pop()}
              </span>
              <span className="block max-w-[16rem] truncate text-[10px] text-ink/45">{k.why}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* --------------------------------- Tree -------------------------------- */}
        <Card className="flex max-h-[42rem] flex-col overflow-hidden">
          <div className="border-b border-ink/8 p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter files…"
              className="h-9 py-0 text-xs"
            />
            {files && (
              <p className="mt-2 px-1 text-[11px] font-semibold text-ink/40">
                {filtered.length} of {files.length} files
              </p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!files ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon="🔍"
                  title="No files match"
                  description={`Nothing matches "${query}".`}
                />
              </div>
            ) : (
              <TreeBranch node={tree} depth={0} expanded={expanded} setExpanded={setExpanded} onOpen={open} activePath={activePath} />
            )}
          </div>
        </Card>

        {/* -------------------------------- Viewer ------------------------------- */}
        <Card className="flex max-h-[42rem] flex-col overflow-hidden">
          {!activePath ? (
            <div className="grid flex-1 place-items-center p-8">
              <EmptyState
                icon="📄"
                title="Pick a file to read it"
                description="Browse the tree on the left, or jump straight to one of the key files above."
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 bg-sand-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-bold text-ink">{activePath}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-ink/45">
                    {body && (
                      <>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: LANG_COLOR[body.language] ?? "#94a3b8" }}
                        />
                        <span className="font-semibold capitalize">{body.language}</span>
                        <span>·</span>
                        <span>{lineCount.toLocaleString()} lines</span>
                        <span>·</span>
                        <span>{fmtSize(body.size)}</span>
                      </>
                    )}
                    {loadingFile && <Spinner className="h-3 w-3" />}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={copy} disabled={!body}>
                    {copied ? "✓ Copied" : "Copy"}
                  </Button>
                  <a
                    href={`/api/code/file?path=${encodeURIComponent(activePath)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center rounded-xl border border-ink/15 bg-white px-3 text-xs font-semibold text-ink/70 transition hover:border-lagoon-500 hover:text-lagoon-700"
                  >
                    Raw
                  </a>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-[#0c1720]">
                {loadingFile || !body ? (
                  <div className="space-y-2 p-5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="skeleton h-3 rounded" style={{ width: `${50 + ((i * 13) % 45)}%` }} />
                    ))}
                  </div>
                ) : (
                  <table className="w-full border-collapse font-mono text-[11.5px] leading-5">
                    <tbody>
                      {body.content.split("\n").map((line, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="w-12 select-none border-r border-white/5 px-3 text-right align-top text-white/25">
                            {i + 1}
                          </td>
                          <td className="whitespace-pre px-4 align-top text-[#d7e5ec]">
                            {line || " "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function TreeBranch({
  node,
  depth,
  expanded,
  setExpanded,
  onOpen,
  activePath,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  onOpen: (p: string) => void;
  activePath: string | null;
}) {
  const dirs = [...node.children.values()].filter((c) => c.children.size > 0);
  const leaves = [...node.children.values()].filter((c) => c.children.size === 0 && c.file);

  dirs.sort((a, b) => a.name.localeCompare(b.name));
  leaves.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {dirs.map((child) => {
        const isOpen = expanded.has(child.path);
        return (
          <div key={child.path}>
            <button
              onClick={() =>
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(child.path)) next.delete(child.path);
                  else next.add(child.path);
                  return next;
                })
              }
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left transition hover:bg-ink/5"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <span className="w-3 shrink-0 text-[9px] text-ink/40">{isOpen ? "▾" : "▸"}</span>
              <span className="text-amber-500">📁</span>
              <span className="truncate text-xs font-bold text-ink">{child.name}</span>
            </button>
            {isOpen && (
              <TreeBranch
                node={child}
                depth={depth + 1}
                expanded={expanded}
                setExpanded={setExpanded}
                onOpen={onOpen}
                activePath={activePath}
              />
            )}
          </div>
        );
      })}

      {leaves.map((child) => {
        const f = child.file!;
        const active = activePath === f.path;
        return (
          <button
            key={f.path}
            onClick={() => onOpen(f.path)}
            className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left transition ${
              active ? "bg-lagoon-100 font-bold" : "hover:bg-ink/5"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <span className="w-3 shrink-0" />
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: LANG_COLOR[f.language] ?? "#94a3b8" }}
            />
            <span className={`truncate font-mono text-[11px] ${active ? "text-lagoon-800" : "text-ink/70"}`}>
              {child.name}
            </span>
            <span className="ml-auto shrink-0 pl-2 text-[10px] tabular-nums text-ink/30">
              {f.lines}
            </span>
          </button>
        );
      })}
    </>
  );
}
