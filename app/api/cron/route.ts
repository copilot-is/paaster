import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const now = Date.now();
  const expiredFiles: string[] = await redis.zrange("paaster:files", 0, now, {
    byScore: true,
  });

  let deleted = 0;
  for (const fileUrl of expiredFiles) {
    try {
      const url = new URL(fileUrl);
      const blobPath = url.pathname.slice(1);
      await del(blobPath);
      deleted++;
    } catch (err: any) {
      console.error(err);
    }
  }

  if (expiredFiles.length > 0) {
    await redis.zrem("paaster:files", ...expiredFiles);
  }

  return NextResponse.json({ ok: true, deleted });
}
