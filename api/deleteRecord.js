import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { id, blobUrl, blobPathname } = req.body || {};
    if (!id && !blobUrl && !blobPathname) {
      return res.status(400).json({ ok: false, error: '缺少刪除目標 id / blobUrl / blobPathname' });
    }

    let targetUrl = blobUrl || '';
    let targetPathname = blobPathname || '';

    if (!targetUrl) {
      const blobs = await list({ prefix: 'records/', limit: 1000 });
      const matched = (blobs.blobs || []).find(b => {
        if (targetPathname && b.pathname === targetPathname) return true;
        if (id && (b.pathname === `records/${id}.json` || b.pathname.endsWith(`/${id}.json`) || b.pathname.includes(String(id)))) return true;
        return false;
      });
      if (matched) {
        targetUrl = matched.url;
        targetPathname = matched.pathname;
      }
    }

    if (!targetUrl && targetPathname) {
      // Vercel Blob delete accepts URLs reliably; if only pathname exists, try pathname as fallback.
      await del(targetPathname);
      return res.status(200).json({ ok: true, deleted: targetPathname });
    }

    if (!targetUrl) {
      return res.status(404).json({ ok: false, error: '找不到要刪除的雲端紀錄' });
    }

    await del(targetUrl);
    return res.status(200).json({ ok: true, deleted: targetUrl, pathname: targetPathname });
  } catch (error) {
    console.error('deleteRecord error:', error);
    return res.status(500).json({ ok: false, error: '刪除紀錄失敗', detail: String(error?.message || error) });
  }
}
