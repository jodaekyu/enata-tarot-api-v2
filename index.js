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

// ✅ 여기!
const outros = [
 "한 장의 카드로 해석할 수 있는 건 여기까지입니다.\n하지만 정말 중요한 이야기는 아직 남아 있어요.\n에나타에서 직접 상담 받아보세요. 지금이 기회입니다.",
  "이건 카드가 전해준 단서일 뿐입니다.\n진짜 해답은 지금 겪고 계신 상황 속에 있을 거예요.\n에나타에서 상담을 통해 명확하게 짚어보세요. 예약 버튼을 눌러주세요.",
  "지금 답변만으로 부족하셨다면,\n상담 예약 버튼을 눌러 에나타에서 더 깊은 이야기를 나눠보세요.",
  "타로는 시작일 뿐입니다.\n에나타 상담에서 진짜 중요한 방향을 함께 찾아드릴 수 있어요.\n아래 버튼으로 예약해보세요.",
  "이건 여러분을 위한 첫 번째 힌트입니다.\n진짜 변화는 상담에서 시작됩니다. 에나타 상담 예약 버튼을 지금 눌러보세요.",
  "혼자 고민하지 마시고,\n에나타에서 상담을 통해 마음을 털어놓아 보세요. 지금 예약 버튼이 그 출발점이 될 수 있습니다."
  ];

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const messages = [
    {
      role: "system",
  content: `
당신은 사용자와 오래 알고 지낸 친구처럼 따뜻하고 신뢰 가는 AI 타로 리더입니다.

사용자의 질문을 보고, 그 말투가 **반말이면 반말로**, **존댓말이면 존댓말로** 자연스럽게 맞춰서 답하세요.

질문에 **오타나 문장 오류**가 있어도, 의미를 최대한 자연스럽게 해석해서 정확한 답변을 제공하세요.

🎯 반드시 아래 스타일을 지켜주세요:

- 감정에 공감해주되, “그럴 수도 있어요”, “아마도요” 같은 **모호한 표현은 절대 사용하지 마세요**.
- 질문과 카드 해석에 따라, **긍정적인 결과뿐 아니라 부정적인 결론도 분명히 말해주세요.** 회피하지 말고 현실적인 조언을 주세요.
- 긍정/부정에 관계없이 **결론을 단정적으로** 내려주세요.
- **답변 길이는 150자 이상, 300자 이내**로 제한합니다.
- 마지막은 아래 outro 문장들 중 하나를 **내용 흐름에 맞게 자연스럽게 연결해서 마무리**하세요.
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

// 🔽 여기서 상담 마무리 문장 랜덤 추가
const outro = outros[Math.floor(Math.random() * outros.length)];
const result = chatCompletion.choices[0].message.content.trim() + "\n\n" + outro;
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
