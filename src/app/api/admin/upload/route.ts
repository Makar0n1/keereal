import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// Authenticated upload endpoint used by the admin image/media fields.
// Images are processed (resize + webp) by the storage adapter; video/gif are
// stored as-is. A Media row is created and returned.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой (макс. 25 МБ)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorage();
  const isImage = file.type.startsWith("image/") && file.type !== "image/gif";

  const stored = isImage
    ? await storage.saveImage(buffer, file.name)
    : await storage.saveRaw(buffer, file.name, file.type || "application/octet-stream");

  const media = await prisma.media.create({
    data: {
      key: stored.key,
      url: stored.url,
      mimeType: stored.mimeType,
      width: stored.width ?? null,
      height: stored.height ?? null,
      size: stored.size ?? null,
    },
  });

  return NextResponse.json({
    id: media.id,
    url: media.url,
    mimeType: media.mimeType,
    width: media.width,
    height: media.height,
  });
}
