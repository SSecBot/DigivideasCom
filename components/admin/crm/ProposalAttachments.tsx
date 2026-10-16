"use client";

import React, { useRef, useState } from "react";
import { Download, FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { ProposalAttachment } from "@/lib/crm/types";
import { proposalFileUrl, useCrm } from "@/components/admin/crm/CrmProvider";
import { formatDateTime } from "@/components/admin/crm/crm-ui";

const MAX_BYTES = 10 * 1024 * 1024;

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/** Client-side pre-check; the server re-validates every file by its content. */
export function validatePdfFiles(files: File[]): string | null {
  for (const file of files) {
    if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return `${file.name} PDF değil`;
    if (file.size > MAX_BYTES) return `${file.name} 10 MB sınırını aşıyor`;
  }
  return null;
}

interface ProposalAttachmentsProps {
  proposalId?: string; // undefined while creating a new proposal
  attachments: ProposalAttachment[];
  pendingFiles?: File[];
  onPendingChange?: (files: File[]) => void;
  readOnly?: boolean;
}

export function ProposalAttachments({ proposalId, attachments, pendingFiles = [], onPendingChange, readOnly = false }: ProposalAttachmentsProps) {
  const { uploadProposalFiles, removeProposalFile } = useCrm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    const problem = validatePdfFiles(files);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    if (!proposalId) {
      onPendingChange?.([...pendingFiles, ...files]);
      return;
    }
    setBusy(true);
    await uploadProposalFiles(proposalId, files);
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" /> PDF ekleri
        </h4>
        {!readOnly && (
          <>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={onSelect} aria-label="PDF dosyası seç" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} PDF ekle
            </button>
          </>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

      {attachments.length === 0 && pendingFiles.length === 0 ? (
        <p className="text-xs text-zinc-500">
          {readOnly ? "Ek yok." : "Hazırladığınız teklif, sunum veya sözleşme PDF'lerini ekleyebilirsiniz (her biri en fazla 10 MB)."}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs">
              <FileText className="w-4 h-4 text-red-300 flex-shrink-0" />
              <a
                href={proposalId ? proposalFileUrl(proposalId, attachment.id) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 truncate text-zinc-100 hover:text-brand-300"
              >
                {attachment.name}
              </a>
              <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap hidden sm:inline">
                {formatBytes(attachment.size)} · {formatDateTime(attachment.uploadedAt)}
              </span>
              {proposalId && (
                <a href={proposalFileUrl(proposalId, attachment.id, true)} className="p-1 text-zinc-400 hover:text-white" aria-label={`${attachment.name} indir`}>
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
              {!readOnly && proposalId && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`${attachment.name} tekliften kaldırılsın mı?`)) removeProposalFile(proposalId, attachment.id);
                  }}
                  className="p-1 text-zinc-500 hover:text-red-300"
                  aria-label={`${attachment.name} kaldır`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
          {pendingFiles.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-white/10 text-xs">
              <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate text-zinc-300">{file.name}</span>
              <span className="text-[11px] font-mono text-zinc-500">{formatBytes(file.size)} · kaydedince yüklenecek</span>
              <button
                type="button"
                onClick={() => onPendingChange?.(pendingFiles.filter((_, i) => i !== index))}
                className="p-1 text-zinc-500 hover:text-red-300"
                aria-label={`${file.name} listeden çıkar`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
