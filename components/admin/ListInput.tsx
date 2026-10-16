"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Text input for comma-separated lists (tags, features...). Keeps the raw text while
 * typing — so "," and spaces can be typed — and reports the parsed list on every change.
 * Earlier inputs re-joined the list on each keystroke, which swallowed commas and
 * trailing spaces (multi-word tags were impossible to type).
 */

export function parseList(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

interface ListInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string[] | undefined;
  onChange: (items: string[]) => void;
}

export function ListInput({ value, onChange, onBlur, onFocus, ...props }: ListInputProps) {
  const joined = (value ?? []).join(", ");
  const [text, setText] = useState(joined);
  const focused = useRef(false);

  // Follow outside changes (e.g. opening another record) unless the user is typing
  useEffect(() => {
    if (!focused.current) setText(joined);
  }, [joined]);

  return (
    <input
      {...props}
      type="text"
      value={text}
      onFocus={(e) => {
        focused.current = true;
        onFocus?.(e);
      }}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseList(e.target.value));
      }}
      onBlur={(e) => {
        focused.current = false;
        setText(parseList(e.target.value).join(", "));
        onBlur?.(e);
      }}
    />
  );
}
