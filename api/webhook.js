export default async function handler(req, res) {
  const LIFF_URL = "https://liff.line.me/2009930434-iD9N0AwB";
  const TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
  if (req.method === "GET") return res.status(200).send(TOKEN ? "OK_TOKEN_SET" : "MISSING_TOKEN");
  const events = req.body?.events || [];
  for (const event of events) {
    if (!event.replyToken) continue;
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [{
          type: "template",
          altText: "開始巡檢",
          template: {
            type: "buttons",
            title: "社區巡檢系統",
            text: "請點選下方按鈕開始今日巡檢。",
            actions: [{ type: "uri", label: "開始巡檢", uri: LIFF_URL }]
          }
        }]
      })
    });
    console.log("LINE reply:", response.status, await response.text());
  }
  return res.status(200).send("OK");
}
