"use client";

import { Editor } from "@monaco-editor/react";
import { LoaderCircleIcon, PaperclipIcon } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import DecryptionFailed from "@/components/decryption-failed";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptContent } from "@/lib/crypto";
import { Content } from "@/lib/types";

export default function SharePage() {
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
    <div className="h-full bg-background p-6 flex flex-col rounded-lg shadow-lg">
      {error && <DecryptionFailed>{error}</DecryptionFailed>}
      {!error && loading && (
        <div className="h-full flex items-center justify-center">
          <LoaderCircleIcon className="size-10 animate-spin text-neutral-300" />
        </div>
      )}
      {!error && !loading && !isOpenAlertDialog && data && (
        <>
          <Alert className="text-center mb-4 rounded-sm bg-muted border-0">
            <AlertTitle>
              {data.burnAfterRead &&
                "This content will be deleted after viewing"}
              {!data.burnAfterRead &&
                data.expiresAt &&
                `This content will be deleted after ${new Date(
                  data.expiresAt
                ).toLocaleString()}`}
            </AlertTitle>
          </Alert>
          <div className="flex-1 rounded-sm dark:bg-[#1e1e1e]">
            <Editor
              loading=""
              theme={theme === "dark" ? "vs-dark" : "light"}
              options={{
                readOnly: true,
                contextmenu: false,
                minimap: { enabled: false },
              }}
              className="border rounded-sm overflow-hidden p-1 py-3 h-full"
              language={data.format || "plaintext"}
              value={textContent}
            />
          </div>
          {data.attachment && (
            <div className="mt-4">
              <div className="p-4 border-1 rounded-sm flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <PaperclipIcon className="size-4 text-muted-foreground" />
                  <div>{data.attachment.name}</div>
                  <div className="text-muted-foreground">
                    <span>{data.attachment.size}</span>
                    <span className="pl-1">MB</span>
                  </div>
                </div>
                <Button
                  className="w-full lg:w-50"
                  onClick={() =>
                    data.attachment && handleDownload(data.attachment.name)
                  }
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      <AlertDialog open={isOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="px-px">
            <Input onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="text-right">
            <Button
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
              Submit
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
