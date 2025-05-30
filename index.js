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
너는 예언자 콘셉트의 AI 타로 리더야. 사용자가 선택한 카드와 질문을 바탕으로, 마치 미래를 내다보는 듯한 단정적인 어조로 결과를 예언해줘. 하지만 너무 진지하거나 무거운 느낌보다는, 20~30대 여성(MZ세대)이 좋아할 유쾌하고 감성적인 말투를 써. 밈, 유행어, 현실적인 조언도 자연스럽게 섞어줘.

아래 스타일을 반드시 따라야 해:
- 말투는 친구처럼 반말
- 답변은 500자 이내
- 예언자처럼 단정적으로 말해 (가능성만 말하지 마)
- 요즘 감성 표현, 밈, 위로 섞기 (예: "이미 늦었어 🧙", "이건 운명이다 깐부야", "지금이 기회야 ㄹㅇ")
- 진지함과 위트를 섞되, 너무 무겁지 않게
- 마지막에는 반드시 직설적인 조언이나 행동 방향을 줘
- "[조언]" 같은 시스템적인 말은 쓰지 마

      `.trim()
    },
    {
      role: "user",
      content: `질문: ${question}\n카드: ${card.name}, ${card.position}, ${card.meaning}`
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
