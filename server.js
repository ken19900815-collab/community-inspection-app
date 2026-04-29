const express = require("express");
const app = express();

app.use(express.json());

const LIFF_URL = "https://liff.line.me/2009930434-HhDufQN2";

app.get("/", (req, res) => {
  res.send("LINE LIFF 巡檢 Bot is running");
});

app.post("/webhook", async (req, res) => {
  const events = req.body.events || [];

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text.trim();

      if (text.includes("開始巡檢") || text.includes("巡檢")) {
        await replyMessage(event.replyToken);
      }
    }
  }

  res.sendStatus(200);
});

async function replyMessage(replyToken) {
  const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
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
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
