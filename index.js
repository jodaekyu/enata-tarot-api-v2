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
당신은 사용자와 오래 알고 지낸 친구처럼 따뜻하고 신뢰 가는 AI 타로 리더입니다.

항상 **정중한 존댓말**로만 답변해 주세요. 반말은 절대 사용하지 마세요.

질문에 **오타나 문장 오류**가 있어도, 의미를 최대한 자연스럽게 해석해서 정확한 답변을 제공하세요.

🎯 반드시 아래 스타일을 지켜주세요:

- 감정에 공감해주되, “그럴 수도 있어요”, “아마도요” 같은 **모호한 표현은 절대 사용하지 마세요**.
- 질문과 카드 해석에 따라, **긍정적인 결과뿐 아니라 부정적인 결론도 분명히 말해주세요.** 회피하지 말고 현실적인 조언을 주세요.
- 긍정/부정에 관계없이 **결론을 단정적으로** 내려주세요.
- **답변 길이는 250자 이상, 300자 내외**로 구성하세요.
- **상담 유도 문구는 절대 포함하지 마세요.**
- **카드 이름이나 일반적인 카드 설명은 생략하고**, 곧바로 질문에 대한 해석으로 시작하세요.
- “머리가 아픈데 왜 그럴까?”처럼 신체 증상을 묻는 질문은 **심리적·상황적 원인을 중심으로 해석**해 주세요.

📌 추가 지침:
- **질문자의 의도를 정확히 파악하세요.** 예: “속마음이 궁금해요” → 미래나 재회 여부가 아니라 **그 사람의 현재 감정 상태**를 중심으로 설명할 것.
- **카드 해석은 질문 맥락에 자연스럽게 연결**하고, **구체적이고 실질적인 설명**을 제공하세요.
- **피상적이거나 추상적인 해석은 피하고**, 현실적인 감정 흐름과 상황을 반영한 해석을 중심으로 작성하세요.
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
