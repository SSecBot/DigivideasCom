"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines for structured block parsing
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" = "ul";

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (listType === "ul") {
        elements.push(
          <ul key={`ul-${elements.length}`} className="space-y-2 my-3 pl-2">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="space-y-2 my-3 pl-2 list-decimal list-inside">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  // Inline formatting helper: handles **bold**, *italic*, and `code`
  const renderInline = (text: string): React.ReactNode => {
    // Split by markdown inline tokens
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={idx} className="italic text-brand-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-white/10 text-brand-400 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 2: ## Title
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4 pt-4 border-t border-white/10 first:mt-0 first:pt-0 first:border-0"
        >
          {renderInline(trimmed.replace("## ", ""))}
        </h2>
      );
      return;
    }

    // Heading 3: ### Title
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-3"
        >
          {renderInline(trimmed.replace("### ", ""))}
        </h3>
      );
      return;
    }

    // Heading 4: #### Title
    if (trimmed.startsWith("#### ")) {
      flushList();
      elements.push(
        <h4
          key={`h4-${index}`}
          className="text-base sm:text-lg font-bold text-brand-400 mt-5 mb-2 font-mono uppercase tracking-wide"
        >
          {renderInline(trimmed.replace("#### ", ""))}
        </h4>
      );
      return;
    }

    // Blockquote: > Quote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="p-5 my-5 rounded-2xl bg-brand-500/10 border-l-4 border-brand-500 text-zinc-200 italic shadow-lg leading-relaxed"
        >
          {renderInline(trimmed.replace("> ", ""))}
        </blockquote>
      );
      return;
    }

    // Unordered List item: - Item or * Item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
      }
      const itemText = trimmed.slice(2);
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2.5 text-zinc-300 text-sm sm:text-base leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
          <span>{renderInline(itemText)}</span>
        </li>
      );
      return;
    }

    // Ordered List item: 1. Item
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
      }
      const itemText = trimmed.replace(/^\d+\.\s/, "");
      listItems.push(
        <li key={`oli-${index}`} className="text-zinc-300 text-sm sm:text-base leading-relaxed pl-1">
          <span>{renderInline(itemText)}</span>
        </li>
      );
      return;
    }

    // Regular Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${index}`}
        className="text-zinc-300 text-sm sm:text-base leading-relaxed my-3"
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
