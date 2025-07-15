import { NextRequest, NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { Content } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data = await redis.get<Content>(`paaster:${id}`);
  if (!data) {
    return new Response("Content not found or has expired", { status: 404 });
  }

  if (data.burnAfterRead) {
    const lockKey = `paaster:viewed:${id}`;
    const lockAcquired = await redis.setnx(lockKey, "locked");
    if (!lockAcquired) {
      return new Response("Content already viewed or downloaded", {
        status: 410,
      });
    }
    await redis.expire(lockKey, 60);
    await redis.del(`paaster:${id}`);

    if (data.attachment && data.attachment.data) {
      await redis.zadd("paaster:files", {
        score: new Date().getTime() + 5 * 60 * 1000,
        member: data.attachment.data,
      });
    }
  }

  return NextResponse.json(data);
}
