"use client";

import * as React from "react";
import { Download, FileDown, Link as LinkIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toMarkdown,
  downloadBlob,
  downloadPdfFromElement,
} from "@/lib/exporters";
import { buildShareUrl } from "@/lib/share";
import type { PackingList, TripInput } from "@/lib/schemas";

export function ResultToolbar({
  input,
  result,
  targetRef,
  onReset,
}: {
  input: TripInput;
  result: PackingList;
  targetRef: React.RefObject<HTMLDivElement | null>;
  onReset?: () => void;
}) {
  const [busyPdf, setBusyPdf] = React.useState(false);

  const handleMarkdown = () => {
    const md = toMarkdown(input, result);
    const safe = input.destination.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadBlob(md, `packing-${safe}.md`, "text/markdown;charset=utf-8");
    toast.success("Markdown downloaded");
  };

  const handlePdf = async () => {
    if (!targetRef.current) return;
    try {
      setBusyPdf(true);
      const safe = input.destination.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      await downloadPdfFromElement(targetRef.current, `packing-${safe}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    } finally {
      setBusyPdf(false);
    }
  };

  const handleShare = async () => {
    const url = buildShareUrl(input);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.message("Share link", { description: url });
    }
  };

  return (
    <div className="sticky top-16 z-20 -mx-1 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 shadow-sm backdrop-blur">
      <Button variant="ghost" size="sm" onClick={handleMarkdown}>
        <Download className="mr-2 h-4 w-4" />
        Markdown
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePdf}
        disabled={busyPdf}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {busyPdf ? "Building PDF…" : "PDF"}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleShare}>
        <LinkIcon className="mr-2 h-4 w-4" />
        Share
      </Button>
      <div className="ml-auto" />
      {onReset ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-dashed"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New trip
        </Button>
      ) : null}
    </div>
  );
}
