"use client";

import {
  LoaderCircleIcon,
  PaperclipIcon,
  PlusIcon,
  RotateCwIcon,
  XIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";

import { Editor } from "@/components/editor";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { encryptContent } from "@/lib/crypto";
import { editorLanguages, generateId } from "@/lib/utils";

export default function Page() {
  const { theme } = useTheme();
  const [title, setTitle] = useState<string>();
  const [format, setFormat] = useState("plaintext");
  const [text, setText] = useState<string>();
  const [file, setFile] = useState<File>();
  const [expires, setExpires] = useState("1d");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [password, setPassword] = useState<string>();
  const [shareLink, setShareLink] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [isOpenAlertDialog, setIsOpenAlertDialog] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!text && !file) {
        toast.error("Publish failed");
        return;
      }

      if (file && file.size > 50 * 1024 * 1024) {
        toast.error("File too large, max 50MB");
        return;
      }

      if (password && (password.length < 6 || password.length > 12)) {
        toast.error("Password must be 6-12 characters");
        return;
      }

      const { fragment, encryptedText, encryptedFile } = await encryptContent(
        text,
        file,
        password
      );

      const formData = new FormData();
      formData.append("expires", expires);

      if (title) {
        formData.append("title", title);
      }
      if (password) {
        formData.append("hasPassword", "true");
      }
      if (text && encryptedText) {
        formData.append("format", format);
        formData.append("text", encryptedText);
      }
      if (file && encryptedFile) {
        formData.append("attachment_data", encryptedFile, "encrypted.bin");
        formData.append("attachment_name", file.name);
        formData.append(
          "attachment_size",
          (file.size / (1024 * 1024)).toFixed(2)
        );
      }

      const res = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error(error);
        return;
      }

      const { id } = await res.json();
      const url = new URL(window.location.origin);
      setShareLink(`${url.toString()}${id}#${fragment}`);
      setIsOpenAlertDialog(true);
    } catch {
      toast.error("Publish failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File too large, max 50MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast.error("File too large, max 50MB");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(undefined);
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card p-4 sm:p-6 flex flex-col rounded-xl shadow-sm border border-border/50">
            <div className="mb-6">
              <Editor
                className="h-96 rounded-md border border-border/50 overflow-hidden"
                theme={theme}
                language={format}
                value={text}
                onChange={(value: string) => setText(value)}
              />
            </div>
            <div>
              {file ? (
                <div className="p-4 border border-border/50 rounded-xl bg-muted/30 flex items-center justify-between gap-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      <PaperclipIcon className="size-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{file.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
                    title="Remove file"
                    onClick={handleRemoveFile}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="p-8 border-2 border-dashed border-border/50 rounded-xl relative flex flex-col items-center justify-center gap-2 transition-colors hover:bg-muted/30 hover:border-primary/50"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    disabled={submitting}
                    onChange={handleFileChange}
                    className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="p-3 bg-muted/50 rounded-full mb-2">
                    <PlusIcon className="size-6 text-muted-foreground" />
                  </div>
                  <div className="font-medium text-sm">
                    Drop file here or click to upload
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max file size: 50MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-4 sm:p-5 rounded-xl shadow-sm border border-border/50 space-y-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Settings
            </h3>

            <div className="space-y-2">
              <Label className="text-xs font-medium" htmlFor="title">
                Title{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="title"
                type="text"
                disabled={submitting}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Format</Label>
              <Select
                defaultValue={format}
                onValueChange={(value) => setFormat(value)}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {editorLanguages.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Expires</Label>
              <Select
                value={expires}
                onValueChange={(value) => {
                  if (value === "b") {
                    setBurnAfterRead(true);
                  }
                  setExpires(value);
                }}
                disabled={burnAfterRead || submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b">Burn after read</SelectItem>
                  <SelectItem value="10m">10 minutes</SelectItem>
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="12h">12 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="3d">3 days</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="burn_after_read"
                  checked={burnAfterRead}
                  disabled={submitting}
                  onCheckedChange={(checked) => {
                    setExpires(checked ? "b" : "1d");
                    setBurnAfterRead(checked ? true : false);
                  }}
                />
                <Label
                  htmlFor="burn_after_read"
                  className="text-xs cursor-pointer"
                >
                  Burn after read
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium" htmlFor="password">
                Password{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <div className="flex items-center">
                <Input
                  id="password"
                  minLength={4}
                  maxLength={12}
                  disabled={submitting}
                  value={password || ""}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => setPassword(generateId())}
                  className="rounded-l-none border-l-0"
                >
                  <RotateCwIcon className="size-4" />
                </Button>
              </div>
              {password && (password.length < 6 || password.length > 12) && (
                <div className="text-destructive text-xs mt-1">
                  Password must be 6-12 characters
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting || (!text && !file)}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <LoaderCircleIcon className="animate-spin mr-2 size-4" />
                    Publishing...
                  </>
                ) : (
                  "Publish Paste"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={isOpenAlertDialog && !!shareLink}>
        <AlertDialogContent className="max-w-lg w-[calc(100%-2rem)] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              <Button
                variant="ghost"
                className="rounded-full size-6"
                onClick={() => {
                  setIsOpenAlertDialog(false);
                  window.location.reload();
                }}
              >
                <XIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTitle>
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full mb-4">
              <div className="flex-1 grid w-full gap-3 order-2 sm:order-1">
                <Textarea
                  className="w-full h-20 text-sm"
                  value={shareLink}
                  readOnly
                />
                <Button
                  onClick={() => {
                    if (shareLink && navigator.clipboard) {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Link copied to clipboard", {
                        duration: 2000,
                      });
                    }
                  }}
                >
                  Copy link
                </Button>
              </div>
              <div className="flex-none order-1 sm:order-2">
                <QRCodeSVG
                  value={shareLink || ""}
                  size={120}
                  className="sm:w-32 sm:h-32"
                />
              </div>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
