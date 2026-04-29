import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  try {
    const record = req.body;
    if (!record || !record.id) return res.status(400).send("Invalid record");
    const day = new Date(record.submittedAt || Date.now()).toISOString().slice(0,10);
    const pathname = `records/${day}/${record.id}.json`;
    const blob = await put(pathname, JSON.stringify(record, null, 2), {
      access: "public",
      contentType: "application/json"
    });
    return res.status(200).json({ ok: true, url: blob.url, pathname: blob.pathname });
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
  }
}
