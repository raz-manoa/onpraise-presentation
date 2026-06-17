"use client";

import { Bold } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  htmlHasBoldMarkup,
  lyricsHtmlToEditorHtml,
  plainTextToStorageHtml,
  sanitizeLyrics,
} from "@/lib/sanitize-lyrics";
import { cn } from "@/lib/utils";

type RichLyricsEditorProps = {
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const BLOCK_TAGS = new Set([
  "div",
  "p",
  "li",
  "tr",
  "td",
  "th",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "pre",
  "blockquote",
  "o:p",
]);

const INLINE_TAGS = new Set([
  "span",
  "a",
  "em",
  "i",
  "u",
  "sub",
  "sup",
  "font",
  "o:span",
  "o:r",
]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizePlainText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function isBoldElement(element: Element): boolean {
  const tag = element.tagName.toLowerCase();
  if (tag === "b" || tag === "strong") return true;

  const style = element.getAttribute("style") ?? "";
  const fontWeightMatch = style.match(/font-weight:\s*([^;]+)/i);
  if (!fontWeightMatch) return false;

  const weight = fontWeightMatch[1].trim().toLowerCase();
  if (weight === "bold" || weight === "bolder") return true;

  const numericWeight = Number.parseInt(weight, 10);
  return !Number.isNaN(numericWeight) && numericWeight >= 600;
}

function wrapBold(content: string, isBold: boolean): string {
  if (!content) return "";
  return isBold ? `<strong>${content}</strong>` : content;
}

function serializeLyricsNodes(
  nodes: NodeList | Iterable<Node>,
  inheritedBold = false,
): string {
  let result = "";
  const nodeArray = Array.from(nodes);

  nodeArray.forEach((node, index) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += escapeHtml(node.textContent ?? "");
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const isBold = inheritedBold || isBoldElement(element);

    if (tag === "br") {
      result += "\n";
      return;
    }

    if (INLINE_TAGS.has(tag)) {
      result += wrapBold(
        serializeLyricsNodes(element.childNodes, isBold),
        isBold,
      );
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      if (index > 0 && !result.endsWith("\n")) {
        result += "\n";
      }

      result += wrapBold(
        serializeLyricsNodes(element.childNodes, isBold),
        isBold,
      );

      if (index < nodeArray.length - 1) {
        result += "\n";
      }
      return;
    }

    result += wrapBold(
      serializeLyricsNodes(element.childNodes, isBold),
      isBold,
    );
  });

  return result;
}

function convertPasteToLyricsHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return serializeLyricsNodes(doc.body.childNodes);
}

function setEditorHtml(editor: HTMLElement, html: string) {
  editor.innerHTML = html;
}

function insertHtmlAtCursor(html: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);

  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function RichLyricsEditor({
  id,
  defaultValue = "",
  value,
  onChange,
  placeholder = "Collez les paroles ici...",
  className,
}: RichLyricsEditorProps) {
  const editorRef = useRef<HTMLPreElement>(null);
  const initializedRef = useRef(false);

  function syncContent() {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(sanitizeLyrics(editor.innerHTML));
  }

  function handleBold() {
    editorRef.current?.focus();
    document.execCommand("bold");
    syncContent();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLPreElement>) {
    const plain = normalizePlainText(event.clipboardData.getData("text/plain"));
    const html = event.clipboardData.getData("text/html");
    const editor = editorRef.current;

    if (!editor) return;

    if (plain.length > 0 && !htmlHasBoldMarkup(html)) {
      return;
    }

    event.preventDefault();

    let storageHtml = "";

    if (plain.length > 0) {
      storageHtml = plainTextToStorageHtml(plain);
    } else if (html) {
      storageHtml = lyricsHtmlToEditorHtml(convertPasteToLyricsHtml(html));
    }

    if (!storageHtml) return;

    const selection = window.getSelection();
    const isEditorEmpty = editor.textContent?.trim().length === 0;
    const isAllSelected =
      selection &&
      !selection.isCollapsed &&
      selection.toString().length === editor.textContent?.length;

    if (isEditorEmpty || isAllSelected) {
      setEditorHtml(editor, storageHtml);
    } else {
      insertHtmlAtCursor(storageHtml);
    }

    syncContent();
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (!initializedRef.current && defaultValue) {
      editor.innerHTML = lyricsHtmlToEditorHtml(defaultValue);
      initializedRef.current = true;
      return;
    }

    if (value === "" && editor.innerHTML !== "") {
      editor.innerHTML = "";
      initializedRef.current = false;
    }
  }, [defaultValue, value]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        {id ? (
          <Label htmlFor={id} className="sr-only">
            Paroles
          </Label>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBold}
          aria-label="Gras"
        >
          <Bold className="size-4" />
          Gras
        </Button>
      </div>

      <pre
        ref={editorRef}
        id={id}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={syncContent}
        onPaste={handlePaste}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
            event.preventDefault();
            handleBold();
          }
        }}
        className={cn(
          "rich-lyrics-editor min-h-40 w-full overflow-auto whitespace-pre-wrap rounded-lg border border-input bg-transparent px-2.5 py-2 font-sans text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
