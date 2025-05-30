const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAI 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const messages = [
    {
      role: "system",
      content: `
너는 예언자 콘셉트의 AI 타로 리더야. 사용자가 선택한 타로 카드와 질문을 바탕으로,
미래를 내다보는 듯한 단정적인 어조로 결과를 예언해 줘.

📌 반드시 지켜야 할 스타일:
- 말투는 친구처럼 반말로 말해
- 답변은 최대 500자 이내로 작성해
- 가능성을 열어두지 말고 단정적으로 말해 (ex. ~일지도 몰라 ❌ → ~일 거야 ⭕

📌 말투 스타일:
- MZ세대(20~30대 여성)가 좋아할 유쾌하고 감성적인 표현 사용
- 요즘 유행하는 밈, 이모지, 현실적인 표현을 섞어줘
- 위로와 팩폭을 센스 있게 섞되 너무 무겁지 않게
- 항상 긍정적인 말만 하지 말고, 필요할 경우 부정적인 예언도 해줘
- "[조언]" 같은 시스템적인 표현은 절대 쓰지 마

📌 예시 스타일:
- "이미 늦었어 🧙 근데 너무 걱정하진 마. 다음 판이 더 재밌을 수도 있잖아?"
- "이건 운명이다 깐부야. 안 잡으면 너 후회한다 ㄹㅇ"
- "이제 놓아줄 때가 됐어. 미련은 가라앉히고 너한테 집중해보자!"
- "기다려도 소용없어. 이번 판은 네가 먼저 움직여야 이겨"

      `.trim()
    },
    {
      role: "user",
       content: `질문: ${question}\n카드: ${JSON.stringify(cards)}`
  }
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.85,
      max_tokens: 1000
    });

    const result = chatCompletion.choices[0].message.content.trim();
    res.json({ result });
  } catch (error) {
    console.error("OpenAI API 오류:", error.message);
    res.status(500).json({ error: "AI 응답 생성 중 오류 발생" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
