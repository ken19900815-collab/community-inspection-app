export default async function handler(req, res) {
  const LIFF_URL = "https://liff.line.me/2009930434-iD9N0AwB";
  const TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

  if (req.method === "GET") {
    return res.status(200).send(TOKEN ? "OK_TOKEN_SET" : "MISSING_TOKEN");
  }

  if (!TOKEN) {
    console.error("Missing CHANNEL_ACCESS_TOKEN");
    return res.status(200).send("Missing token");
  }

  const events = req.body?.events || [];

  for (const event of events) {
    if (!event.replyToken) continue;

    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [
          {
            type: "template",
            altText: "開始巡檢",
            template: {
              type: "buttons",
              title: "社區巡檢系統",
              text: "請點選下方按鈕開始今日巡檢。",
              actions: [
                {
                  type: "uri",
                  label: "開始巡檢",
                  uri: LIFF_URL,
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await response.text();
    console.log("LINE reply status:", response.status, result);
  }

  return res.status(200).send("OK");
}
