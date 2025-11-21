"use client";

import { LoaderCircleIcon, PaperclipIcon } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import DecryptionFailed from "@/components/decryption-failed";
import { Editor } from "@/components/editor";
import { QRCode } from "@/components/qr-code";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptContent } from "@/lib/crypto";
import { Content } from "@/lib/types";

export default function Page() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [data, setData] = useState<Content>();
  const [loading, setLoading] = useState(true);
  const [fragment, setFragment] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [textContent, setTextContent] = useState<string>();
  const [blobContent, setBlobContent] = useState<Blob>();
  const [isOpenAlertDialog, setIsOpenAlertDialog] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        notFound();
      } else {
        setFragment(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (data && data.title) {
      document.title = `${data.title} - Paaster – Secure Text and File Sharing`;
    }
  }, [data]);

  const decryptData = useCallback(
    async (content: Content, fragment: string, password?: string) => {
      if (content.text) {
        const decryptedText = await decryptContent<string>(
          content.text,
          fragment,
          password
        );
        setTextContent(decryptedText);
      }
      if (content.attachment) {
        const response = await fetch(content.attachment.data);
        const blob = await response.blob();
        const decryptedBlob = await decryptContent<Blob>(
          blob,
          fragment,
          password
        );
        setBlobContent(decryptedBlob);
      }
    },
    []
  );

  useEffect(() => {
    const fetchContent = async () => {
      if (id && fragment) {
        try {
          const response = await fetch(`/api/${id}`);
          if (!response.ok) {
            const error = await response.text();
            setError(error);
            return;
          }

          const content: Content = await response.json();
          setData(content);

          if (content) {
            if (content.hasPassword) {
              setIsOpenAlertDialog(true);
              return;
            }

            try {
              await decryptData(content, fragment);
            } catch (err: any) {
              setError(err.message);
            }
          }
        } catch {
          toast.error("Failed to fetch content");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchContent();
  }, [id, fragment, decryptData]);

  const handleDownload = useCallback(
    (filename: string) => {
      if (!blobContent) return;

      try {
        const url = URL.createObjectURL(blobContent);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("Failed to download file");
      }
    },
    [blobContent]
  );

  return (
    <>
      {error && <DecryptionFailed>{error}</DecryptionFailed>}
      {!error && loading && (
        <div className="h-full flex items-center justify-center">
          <LoaderCircleIcon className="size-10 animate-spin text-neutral-300" />
        </div>
      )}
      {!error && !loading && !isOpenAlertDialog && data && (
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card p-4 sm:p-6 flex flex-col rounded-xl shadow-sm border border-border/50">
                <Alert className="text-center mb-6 rounded-lg bg-yellow-500/10 border-yellow-500/20 border">
                  <AlertTitle className="text-yellow-600 dark:text-yellow-500 font-semibold">
                    {data.burnAfterRead &&
                      "This content will be deleted after viewing"}
                    {!data.burnAfterRead &&
                      data.expiresAt &&
                      `This content will be deleted after ${new Date(
                        data.expiresAt
                      ).toLocaleString()}`}
                  </AlertTitle>
                </Alert>
                <Editor
                  className="h-110 rounded-md border border-border/50 overflow-hidden"
                  theme={theme}
                  language={data?.format}
                  value={textContent}
                />
                {data.attachment && (
                  <div className="mt-6">
                    <div className="p-6 border border-border/50 rounded-xl bg-muted/30 flex flex-col items-center justify-center transition-colors hover:bg-muted/50">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-2 bg-background rounded-full shadow-sm">
                          <PaperclipIcon className="size-5 text-primary" />
                        </div>
                        <div className="font-medium">
                          {data.attachment.name}
                        </div>
                        <div className="text-muted-foreground text-sm bg-background px-2 py-0.5 rounded-full border border-border/50">
                          <span>{data.attachment.size}</span>
                          <span className="pl-1">MB</span>
                        </div>
                      </div>
                      <Button
                        className="w-full sm:w-auto min-w-40"
                        onClick={() =>
                          data.attachment &&
                          handleDownload(data.attachment.name)
                        }
                      >
                        Download File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex flex-col items-center text-center">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  Share via QR Code
                </h3>
                <div className="bg-white p-3 rounded-lg shadow-sm mb-2">
                  <QRCode
                    value={
                      typeof window !== "undefined" ? window.location.href : ""
                    }
                    size={160}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Scan to open on mobile
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <AlertDialog open={isOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Protected</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter password to decrypt"
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  if (data && fragment) {
                    decryptData(data, fragment, password)
                      .then(() => setIsOpenAlertDialog(false))
                      .catch((err: any) => toast.error(err.message));
                  }
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              disabled={!password}
              onClick={async () => {
                if (data && fragment && password) {
                  try {
                    await decryptData(data, fragment, password);
                    setIsOpenAlertDialog(false);
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                }
              }}
            >
              Decrypt Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
