"use client";

import { useEffect, useRef, useState } from "react";

type Region = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PageData = {
  name: string;
  url: string;
  type?: string;
};

type Props = {
  pages: PageData[];
  regions: Region[];
  questionNumber?: string;
};

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export function AnswerViewer({
  pages,
  regions,
  questionNumber,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfjs, setPdfjs] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load PDF.js only in the browser.
   * This avoids the previous Next.js/Webpack pdfjs-dist error.
   */
  useEffect(() => {
    let mounted = true;

    async function loadPdfJs() {
      try {
        if (window.pdfjsLib) {
          if (mounted) {
            setPdfjs(window.pdfjsLib);
          }
          return;
        }

        const existingScript = document.querySelector(
          'script[data-veda-pdfjs="true"]'
        ) as HTMLScriptElement | null;

        if (existingScript) {
          existingScript.addEventListener("load", () => {
            if (mounted) {
              setPdfjs(window.pdfjsLib);
            }
          });

          return;
        }

        const script = document.createElement("script");

        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

        script.type = "module";
        script.dataset.vedaPdfjs = "true";

        script.onload = () => {
          if (mounted) {
            setPdfjs(window.pdfjsLib);
          }
        };

        script.onerror = () => {
          if (mounted) {
            setError("Unable to load PDF viewer.");
            setLoading(false);
          }
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError("Unable to load PDF viewer.");
          setLoading(false);
        }
      }
    }

    loadPdfJs();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Render selected PDF page.
   */
  useEffect(() => {
    if (!pdfjs || !pages.length) return;

    let cancelled = false;

    async function render() {
      try {
        setLoading(true);
        setError("");

        const pageData = pages[page - 1];

        if (!pageData) {
          setLoading(false);
          return;
        }

        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

        const task = pdfjs.getDocument(pageData.url);

        const pdf = await task.promise;

        if (cancelled) return;

        setTotalPages(pdf.numPages);

        const pdfPage = await pdf.getPage(1);

        if (cancelled) return;

        const canvas = canvasRef.current;

        if (!canvas) return;

        const viewport = pdfPage.getViewport({
          scale: 1.5,
        });

        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await pdfPage.render({
          canvasContext: context,
          viewport,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF render error:", err);

        if (!cancelled) {
          setError("Unable to display this answer sheet.");
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfjs, pages, page]);

  const currentRegions = regions.filter(
    (region) => region.page === page
  );

  /*
   * If the backend provides image pages instead of PDFs,
   * display the image directly.
   */
  const currentPage = pages[page - 1];

  return (
    <div className="answerViewer">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 10,
        }}
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          ← Previous
        </button>

        <span style={{ fontSize: 12, color: "#666" }}>
          {questionNumber
            ? `Evidence for Q${questionNumber} • `
            : ""}
          Page {page} of {Math.max(totalPages, pages.length)}
        </span>

        <button
          type="button"
          disabled={
            page >= Math.max(totalPages, pages.length)
          }
          onClick={() =>
            setPage((p) =>
              Math.min(
                Math.max(totalPages, pages.length),
                p + 1
              )
            )
          }
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor:
              page >= Math.max(totalPages, pages.length)
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next →
        </button>
      </div>

      {loading && (
        <div
          style={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#777",
            fontSize: 13,
          }}
        >
          Loading answer sheet...
        </div>
      )}

      {error && (
        <div
          style={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d94b32",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && currentPage && (
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          {currentPage.type === "image" ? (
            <img
              src={currentPage.url}
              alt={`Answer sheet page ${page}`}
              style={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              style={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,.08)",
              }}
            />
          )}

          {currentRegions.map((region, index) => (
            <div
              key={`${region.page}-${index}`}
              style={{
                position: "absolute",
                left: `${region.x * 100}%`,
                top: `${region.y * 100}%`,
                width: `${region.width * 100}%`,
                height: `${region.height * 100}%`,
                border: "2px solid #ff6844",
                background: "rgba(255,104,68,.18)",
                borderRadius: 4,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>
      )}

      {!loading && !error && !currentPage && (
        <div
          style={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#777",
          }}
        >
          No answer sheet available.
        </div>
      )}
    </div>
  );
}