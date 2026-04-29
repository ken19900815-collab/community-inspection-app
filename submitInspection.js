import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  try {
    const { dataUrl, filename } = req.body || {};
    if (!dataUrl) return res.status(400).send("Missing dataUrl");
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return res.status(400).send("Invalid dataUrl");
    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const safeName = String(filename || "photo.jpg").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const pathname = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const blob = await put(pathname, buffer, { access: "public", contentType });
    return res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
  }
}
