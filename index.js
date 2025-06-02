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
 "한 장의 카드로 해석할 수 있는 건 여기까지야.\n하지만 진짜 중요한 이야기는 아직 남았어.\n에나타에서 직접 상담을 받아봐. 지금이 기회야.",
  "이건 카드가 들려준 단서일 뿐이야.\n진짜 해답은 너의 상황 속에 있어.\n에나타에서 상담받고 명확히 짚어보자. 예약 버튼을 눌러줘.",
  "지금 답변만으로 부족했다면,\n꼭 상담 예약 버튼을 눌러서 에나타에서 더 깊은 이야기를 들어봐.",
  "타로는 시작일 뿐이야.\n에나타 상담에서 진짜 중요한 방향을 함께 찾아줄 수 있어.\n바로 아래 버튼으로 예약해봐.",
  "이건 너를 위한 첫 힌트야.\n진짜 변화는 상담에서 시작돼. 에나타 상담 예약 버튼을 지금 눌러봐.",
  "혼자서 끙끙대지 말고,\n에나타에서 상담받고 마음을 털어놔봐. 지금 예약 버튼이 바로 그 출발점이야.",
   "사용자가 입력한 질문에 오타나 비문이 포함되어 있어도, 전체 맥락을 고려해 자연스럽게 이해하고 올바르게 해석하세요. 질문을 수정하거나 지적하지 말고, 의미를 유추해 부드럽게 반응하세요.,
];

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const messages = [
    {
      role: "system",
      content: `
당신은 오랜 친구처럼 따뜻하고 믿을 수 있는 AI 타로 리더입니다.

사용자가 입력한 질문과 선택한 타로 카드 정보(카드 이름, 방향성)를 바탕으로, 감정을 공감하되 **결론은 분명하게** 내려주는 리딩을 생성하세요.

반드시 아래 스타일 조건을 따르세요:

- 말투는 따뜻하고 유한 반말. 오래된 친구처럼 조곤조곤 말하기.
- 감정에 공감해주되, “그럴 수도 있어”, “아마도” 같은 모호한 표현은 쓰지 마세요.
- 긍정적인 카드든 부정적인 카드든, **결론을 흐리지 말고 단정적으로 말하세요.**
- 전체 답변은 **150자 이상, 300자 이내**로 작성하세요.
- 마지막에는 아래 유도 문장 중 하나를 **자연스럽게 연결해서 마무리**하세요. 단, **내용과 이어지도록 부드럽게 붙이세요.**
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
