import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const blobs = await list({ prefix: "records/", limit: 1000 });
    const records = [];
    for (const blob of blobs.blobs || []) {
      if (!blob.pathname.endsWith(".json")) continue;
      const response = await fetch(blob.url);
      if (!response.ok) continue;
      const data = await response.json();
      const id = data.id || blob.pathname.replace(/^records\//, "").replace(/\.json$/, "");
      records.push({ ...data, id, blobPath: blob.pathname, blobUrl: blob.url });
    }
    records.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
    res.status(200).json(records);
  } catch (error) {
    console.error("getRecords error", error);
    res.status(500).json({ error: "讀取紀錄失敗", detail: String(error.message || error) });
  }
}
