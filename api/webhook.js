const LIFF_URL = "https://liff.line.me/2009930434-HhDufQN2";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("LINE Webhook is running");
  }

  const events = req.body.events || [];
  const token = process.env.CHANNEL_ACCESS_TOKEN;

  for (const event of events) {
    if (
      event.type === "message" &&
      event.message &&
      event.message.type === "text"
    ) {
      const text = event.message.text.trim();

      if (
        text.includes("開始巡檢") ||
        text.includes("巡檢") ||
        text.includes("點檢")
      ) {
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
                  text: "請點選下方按鈕，開始今日巡檢。",
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
  }

  return res.status(200).json({ ok: true });
};
