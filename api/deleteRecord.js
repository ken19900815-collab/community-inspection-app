import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id, pathname } = req.body || {};
    const target = pathname || (id ? `records/${id}.json` : "");
    if (!target) return res.status(400).json({ error: "缺少紀錄 ID" });
    await del(target);
    res.status(200).json({ ok: true, deleted: target });
  } catch (error) {
    console.error("deleteRecord error", error);
    res.status(500).json({ error: "刪除紀錄失敗", detail: String(error.message || error) });
  }
}
