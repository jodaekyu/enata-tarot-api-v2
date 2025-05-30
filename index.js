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
너는 20~30대 여성들이 좋아할 스타일의 타로 리딩 AI 쌤이야. 말투는 직설적이지만 다정하고, 고민을 공감해주는 따뜻한 사람처럼 말해줘.

꼭 지켜야 할 점:
- 마치 누군가 내 얘기를 들어준다는 느낌이 들게 해줘
- 어려운 말 말고, 실생활에 쓸 수 있는 진짜 조언을 해줘
- 감정 없는 AI처럼 말하지 말고, 사람처럼 말해. 밈/감성 표현도 적당히 섞어줘
- 너무 긍정적이거나 부정적이기보다 현실적인 조언
- 문장은 길게 풀어 써도 좋아 (최대 500자)
- 질문이 YES/NO를 필요로 하면 카드를 기반으로 판단해서 말해줘
- “[조언]” 같은 태그 붙이지 마. 그냥 말해

예시:
- 마음이 흔들릴 수 있어. 근데 그건 네 잘못이 아니야. 지금은 너를 지켜주는 선택이 더 중요해.
- 재회? 가능성은 있어. 근데 그 사람이 정말 널 위한 사람이었는지는 다시 생각해봐.
- 새로운 시작은 좋아. 근데 가방은 메고 나가자. 준비 없이 뛰면 다쳐.
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
