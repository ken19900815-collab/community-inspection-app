export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const events = req.body.events;

  const LIFF_URL = "https://liff.line.me/2009930434-HhDufQN2";
  const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

  for (const event of events) {
    if (event.type === "message") {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [
            {
              type: "template",
              altText: "開始巡檢",
              template: {
                type: "buttons",
                title: "巡檢系統",
                text: "請點擊開始巡檢",
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
    }
  }

  res.status(200).send("OK");
}
