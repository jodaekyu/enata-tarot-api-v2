const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const basePrompt = (question, cardMeanings) => `
당신은 타로 마스터입니다. 사용자의 질문과 아래 카드 의미를 보고 리딩을 해주세요.

- 질문과 카드의 상징을 연결하여 직설적이고 구체적인 리딩을 해주세요.
- 긍정적인 조언만 하지 말고, 상황에 따라 냉정하거나 부정적인 조언도 포함해주세요.
- 마지막 문장은 사용자에게 전하는 따뜻한 조언으로 마무리해주세요.

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
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: basePrompt(question, cardMeanings),
      }],
      temperature: 0.9,
    });

    res.json({ result: completion.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI 응답 생성 중 오류 발생" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
