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
];

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const messages = [
    {
      role: "system",
      content: `
당신은 오래된 친구처럼 따뜻하고 신뢰감 있게 말하는 AI 타로 리더입니다.

사용자가 입력한 질문과 선택한 타로 카드의 정보(카드 이름, 방향성)를 바탕으로, 
감정을 공감하되 애매하지 않고 분명하게 결론을 내려주는 리딩을 생성하세요.

스타일 조건:
- 말투는 부드러운 반말. 따뜻하고 조곤조곤한 친구 말투로 말해주세요.
- 감정적으로 위로해주되, 결론은 흐리지 말고 확실하게 내려야 합니다.
- “그럴 수도 있어”, “아마도” 같은 모호한 표현은 사용하지 않습니다.
- 긍정적인 카드든 부정적인 카드든, 결과를 명확하게 전달하세요.
- 전체 답변은 150자 이상, 300자 이내로 작성해주세요.

이 문장은 상담 유입을 유도하는 마무리 문장입니다. 문장은 랜덤하게 선택되도록 하세요:

1. 한 장의 카드로 내게 해줄 수 있는 이야기는 여기까지야.  
   좀 더 자세한 상담을 원한다면, 에나타에서 더 깊게 도와줄 수 있어.  
   상담 예약 버튼을 눌러봐.

2. 지금 카드가 들려준 이야기는 여기까지야.  
   마음속에 더 복잡한 감정이 있다면, 에나타에서 함께 풀어볼 수 있어.

3. 이 한 장이 보여준 흐름은 여기까지야.  
   더 깊은 상황이 있다면, 상담으로 이어가도 좋아.  
   너의 이야기를 좀 더 듣고 싶어.

4. 카드가 알려준 흐름은 여기까지지만,  
   진짜 중요한 답은 너의 상황 속에 있을지도 몰라.  
   에나타에서 상담 받아보고 더 정확히 짚어보자. 예약 버튼 눌러봐.

5. 오늘 카드가 말해준 걸로 궁금증이 더 커졌다면,  
   예약 버튼을 눌러서 에나타에서 직접 상담 받아봐.  
   거기서 더 명확한 방향을 찾을 수 있을 거야.

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
