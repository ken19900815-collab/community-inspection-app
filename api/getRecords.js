import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");
  try {
    let cursor;
    const blobs = [];
    do {
      const page = await list({ prefix: "records/", cursor, limit: 1000 });
      blobs.push(...page.blobs);
      cursor = page.cursor;
    } while (cursor);
    const records = [];
    for (const b of blobs.sort((a,b)=>String(b.uploadedAt).localeCompare(String(a.uploadedAt)))) {
      const r = await fetch(b.url);
      if (r.ok) records.push(await r.json());
    }
    return res.status(200).json(records);
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
  }
}
