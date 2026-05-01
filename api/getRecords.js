import { list } from '@vercel/blob';

function pick(obj, keys, fallback = '') {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
  }
  return fallback;
}

function deepPick(obj, predicates, fallback = '') {
  const seen = new Set();
  function walk(x, depth = 0) {
    if (!x || typeof x !== 'object' || depth > 4 || seen.has(x)) return '';
    seen.add(x);
    for (const [k, v] of Object.entries(x)) {
      const key = String(k).toLowerCase();
      if (v !== undefined && v !== null && typeof v !== 'object' && String(v).trim() !== '') {
        if (predicates.some(fn => fn(k, key))) return v;
      }
    }
    for (const v of Object.values(x)) {
      const got = walk(v, depth + 1);
      if (got !== '') return got;
    }
    return '';
  }
  const got = walk(obj);
  return got === '' ? fallback : got;
}

function normalizeItem(item) {
  const result = pick(item, ['result','status','value','判定結果','判定','檢查結果','狀態'], '');
  return {
    ...item,
    location: pick(item, ['location','locationName','巡檢點','點位','區域'], ''),
    category: pick(item, ['category','類別'], ''),
    item: pick(item, ['item','itemName','點檢項目','項目','name'], ''),
    standard: pick(item, ['standard','標準','檢查標準','requirement'], ''),
    result,
    note: pick(item, ['note','remark','remarks','備註','說明'], ''),
    abnormalNote: pick(item, ['abnormalNote','abnormalDescription','異常說明','異常內容'], ''),
    action: pick(item, ['action','process','handling','處理方式','改善方式','處理結果'], ''),
    photos: item.photos || item.photoUrls || item.photoURLs || item.images || item['照片'] || []
  };
}

function normalizeRecord(data, blob) {
  const itemsRaw = Array.isArray(data.items) ? data.items : Array.isArray(data.records) ? data.records : Array.isArray(data.details) ? data.details : [];
  const items = itemsRaw.map(normalizeItem);

  const resultOf = (it) => String(it.result || '').trim();
  const normalCount = items.filter(it => /正常|OK|Normal/i.test(resultOf(it))).length;
  const attentionCount = items.filter(it => /待注意|注意|Attention/i.test(resultOf(it))).length;
  const abnormalCount = items.filter(it => /異常|Abnormal|NG/i.test(resultOf(it))).length;
  const naCount = items.filter(it => /N\/A|NA|不適用/i.test(resultOf(it))).length;

  const inspector = pick(data, ['inspector','inspectorName','staffName','userName','name','displayName','lineDisplayName','巡檢人員','填表人員','檢查人員'], '') ||
    pick(data.meta, ['inspector','inspectorName','staffName','userName','name','displayName','lineDisplayName','巡檢人員','填表人員','檢查人員'], '') ||
    deepPick(data, [
      (k, key) => ['巡檢人員','填表人員','檢查人員','inspector','inspectorname','staffname'].includes(key),
      (k, key) => key.includes('displayname') || key === 'name'
    ], '未填人員');

  const shift = pick(data, ['shift','班別'], '') || pick(data.meta, ['shift','班別'], '');
  const weather = pick(data, ['weather','天氣'], '') || pick(data.meta, ['weather','天氣'], '');
  const submittedAt = pick(data, ['submittedAt','createdAt','time','timestamp','送出時間','巡檢時間'], '') || pick(data.meta, ['submittedAt','createdAt','time','timestamp','送出時間','巡檢時間'], '');

  return {
    ...data,
    id: data.id || data.recordId || data['紀錄ID'] || (blob?.pathname ? blob.pathname.replace(/^records\//, '').replace(/\.json$/, '') : String(Date.now())),
    blobUrl: blob?.url || data.blobUrl || '',
    blobPathname: blob?.pathname || data.blobPathname || '',
    inspector: String(inspector || '未填人員'),
    shift: String(shift || ''),
    weather: String(weather || ''),
    submittedAt: String(submittedAt || ''),
    totalItems: Number(data.totalItems || data.total || data['總項目'] || items.length || 0),
    normalCount: Number(data.normalCount ?? data.normal ?? data['正常'] ?? normalCount),
    attentionCount: Number(data.attentionCount ?? data.attention ?? data['待注意'] ?? attentionCount),
    abnormalCount: Number(data.abnormalCount ?? data.abnormal ?? data['異常'] ?? abnormalCount),
    naCount: Number(data.naCount ?? data.na ?? data['N/A'] ?? naCount),
    items
  };
}

export default async function handler(req, res) {
  try {
    const blobs = await list({ prefix: 'records/', limit: 1000 });
    const records = [];

    for (const blob of blobs.blobs || []) {
      if (!blob.pathname.endsWith('.json')) continue;
      const response = await fetch(blob.url);
      if (!response.ok) continue;
      const data = await response.json();
      records.push(normalizeRecord(data, blob));
    }

    records.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    res.status(200).json(records);
  } catch (error) {
    console.error('getRecords error:', error);
    res.status(500).json({ error: '讀取紀錄失敗', detail: String(error?.message || error) });
  }
}
