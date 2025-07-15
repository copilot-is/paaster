import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import { redis } from "@/lib/redis";
import { Content } from "@/lib/types";
import { generateId, parseExpires } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get("text") as string | undefined;
  const title = formData.get("title") as string | undefined;
  const format = formData.get("format") as string | "plaintext";
  const attachmentData = formData.get("attachment_data") as File | undefined;
  const attachmentName = formData.get("attachment_name") as string | undefined;
  const attachmentSize = formData.get("attachment_size") as string | undefined;
  const expires = formData.get("expires") as string;
  const hasPassword = formData.get("hasPassword") === "true";
  const burnAfterRead = expires === "b";

  const ttl = parseExpires(expires);
  if (!ttl && !burnAfterRead) {
    return new Response("Expires is invalid", { status: 400 });
  }

  let id = generateId();
  while (await redis.exists(`paaster:${id}`)) {
    id = generateId();
  }

  let encryptedFileUrl;
  if (attachmentData) {
    if (attachmentData.size > 50 * 1024 * 1024) {
      return new Response("File too large, max 50MB", { status: 400 });
    }

    const uploadPath = process.env.UPLOAD_PATH || "paaster";
    const pathname = path.join(uploadPath, "encrypted", `${id}.bin`);
    const blob = await put(pathname, attachmentData, {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: ttl || 3600,
    });
    encryptedFileUrl = blob.url;
  }

  const createdAt = new Date().toISOString();
  const expiresAt = ttl
    ? new Date(Date.now() + ttl * 1000).toISOString()
    : undefined;

  const content: Content = {
    id,
    title: title || undefined,
    format,
    expires,
    burnAfterRead,
    hasPassword,
    text: text || undefined,
    attachment:
      encryptedFileUrl && attachmentName && attachmentSize
        ? {
            data: encryptedFileUrl,
            name: attachmentName,
            size: parseFloat(attachmentSize),
          }
        : undefined,
    createdAt: createdAt,
    expiresAt: expiresAt,
  };

  if (!burnAfterRead && expiresAt && encryptedFileUrl) {
    await redis.zadd("paaster:files", {
      score: new Date(expiresAt).getTime(),
      member: encryptedFileUrl,
    });
  }

  await redis.set(`paaster:${id}`, content, ttl ? { ex: ttl } : {});

  return NextResponse.json(content);
}
