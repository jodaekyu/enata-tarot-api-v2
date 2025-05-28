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

const basePrompt = (question, cardMeanings) => `
너는 타로 리더야. 사용자가 입력한 질문과 선택된 타로 카드 의미를 바탕으로 조언을 줘.

반드시 다음 기준을 지켜줘:
1. 말투는 친구처럼 말하는 편한 반말
2. 200자 이내로 요약
3. 실천할 수 있게 조언으로 마무리

[질문]
${question}

[카드 해석 요약]
${cardMeanings}
`;

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const cardMeanings = cards.map(
    (c, i) => `${i + 1}번째 카드: ${c.name} (${c.position}) - ${c.meaning}`
  ).join("\n");

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: basePrompt(question, cardMeanings),
        },
      ],
      temperature: 0.9,
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
