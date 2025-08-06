"use client";

import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup, EditorView } from "codemirror";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const getLanguage = (language?: string) => {
  switch (language) {
    case "javascript":
    case "typescript":
      return javascript();
    case "python":
      return python();
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    case "markdown":
      return markdown();
    case "xml":
      return xml();
    case "sql":
      return sql();
    case "php":
      return php();
    case "java":
      return java();
    case "cpp":
    case "c":
      return cpp();
    case "rust":
      return rust();
    case "go":
      return go();
    case "yaml":
      return yaml();
    default:
      return [];
  }
};

type EditorProps = {
  theme?: string;
  value?: string;
  language?: string;
  readOnly?: boolean;
  className?: string;
  onChange?: (value: string) => void;
};

export function Editor({
  theme,
  value,
  language,
  readOnly = false,
  className,
  onChange,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>(null);
  const languageCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      languageCompartment.current.of(getLanguage(language)),
      themeCompartment.current.of(theme === "dark" ? oneDark : []),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorState.readOnly.of(readOnly),
      EditorView.editable.of(!readOnly),
      EditorView.theme({
        "&": {
          height: "100%",
        },
      }),
    ];

    const state = EditorState.create({
      doc: value || "",
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    viewRef.current.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
      editorRef.current = null;
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (viewRef.current && value) {
      const currentValue = viewRef.current.state.doc.toString();

      if (currentValue !== value) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
          annotations: [Transaction.remote.of(true)],
        });

        viewRef.current.dispatch(transaction);
      }
    }
  }, [value]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: languageCompartment.current.reconfigure(getLanguage(language)),
      });
    }
  }, [language]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure(
          theme === "dark" ? oneDark : []
        ),
      });
    }
  }, [theme]);

  return (
    <div
      className={cn("rounded-sm overflow-hidden border", className)}
      ref={editorRef}
    />
  );
}
