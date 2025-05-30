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
너는 타로 리딩을 해주는 따뜻하지만 현실적인 쌤이야.

사용자는 주로 20~30대 여성이고, 감정적으로 위로를 받으면서도
결정에 도움을 받고 싶어해. 너무 추상적이거나 피상적인 조언은 피하고,
카드 해석을 기반으로 현실적이고 실행 가능한 조언을 줘.

말투는 아래 스타일을 유지해줘:
- 너무 가볍지 않게, 진심 어린 공감과 위로를 담아
- 지나치게 긍정적이지 않고, 필요하면 따끔하게 말해도 좋아
- 따뜻한 쌤이 동생 상담해주는 듯한 말투로
- "~일 수 있어요", "~해보는 것도 좋아요", "~한 걸 추천해요" 등으로 마무리
- 절대 AI처럼 요약하거나 분석적으로 쓰지 마. 꼭 사람 말처럼 자연스럽게 써줘

[중요]
✔ 답변은 500자 이내로 써줘
✔ 질문이 YES/NO로 답해야 하는 거라면, 카드 해석에 근거해서 명확하게 YES인지 NO인지 알려줘
✔ "[조언]" 같은 말은 붙이지 마. 바로 시작
      `.trim()
    },
    {
      role: "user",
      content: `질문: ${question}\n뽑힌 카드: ${JSON.stringify(cards)}`
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
