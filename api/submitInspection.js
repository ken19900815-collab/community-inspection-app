import { put } from '@vercel/blob';

function pick(obj, keys, fallback = '') {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
  }
  return fallback;
}

function count(items, pattern) {
  return items.filter(it => pattern.test(String(it.result || it.status || it['判定結果'] || it['判定'] || ''))).length;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const meta = body.meta || body.form || {};
    const now = new Date().toISOString();
    const id = body.id || body.recordId || `inspection-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const items = Array.isArray(body.items) ? body.items : [];

    const inspector = pick(body, ['inspector','inspectorName','staffName','userName','name','displayName','lineDisplayName','巡檢人員','填表人員','檢查人員'], '') ||
      pick(meta, ['inspector','inspectorName','staffName','userName','name','displayName','lineDisplayName','巡檢人員','填表人員','檢查人員'], '');
    const shift = pick(body, ['shift','班別'], '') || pick(meta, ['shift','班別'], '');
    const weather = pick(body, ['weather','天氣'], '') || pick(meta, ['weather','天氣'], '');
    const communityName = pick(body, ['communityName','社區名稱'], '') || pick(meta, ['communityName','社區名稱'], '');

    const record = {
      ...body,
      id,
      submittedAt: now,
      createdAt: body.createdAt || now,
      inspector,
      inspectorName: inspector,
      staffName: inspector,
      shift,
      weather,
      communityName,
      lineUserId: body.lineUserId || meta.lineUserId || '',
      lineDisplayName: body.lineDisplayName || meta.lineDisplayName || '',
      totalItems: Number(body.totalItems || items.length || 0),
      normalCount: Number(body.normalCount ?? count(items, /正常|OK|Normal/i)),
      attentionCount: Number(body.attentionCount ?? count(items, /待注意|注意|Attention/i)),
      abnormalCount: Number(body.abnormalCount ?? count(items, /異常|Abnormal|NG/i)),
      naCount: Number(body.naCount ?? count(items, /N\/A|NA|不適用/i)),
      items
    };

    const blob = await put(`records/${id}.json`, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false
    });

    res.status(200).json({ ok: true, id, url: blob.url, pathname: blob.pathname, record });
  } catch (error) {
    console.error('submitInspection error:', error);
    res.status(500).json({ error: '送出巡檢失敗', detail: String(error?.message || error) });
  }
}
