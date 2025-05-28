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

// ✨ GPT 응답을 150자 이내로 자연스럽게 잘라주는 함수
function trimTo150(text) {
  const clean = text.replace(/\s+/g, " ").trim(); // 공백 정리
  if (clean.length <= 150) return clean;

  const end = clean.lastIndexOf('.', 150); // 150자 내 마지막 마침표 위치
  if (end > 50) return clean.slice(0, end + 1); // 자연스럽게 마침표까지 자르기

  return clean.slice(0, 150) + '…'; // 마침표가 없으면 그냥 150자 자르고 '…' 붙이기
}

app.post("/generate", async (req, res) => {
  const { question, cards } = req.body;

  const messages = [
    {
      role: "system",
      content: `
너는 타로 리딩을 해주는 친구 같은 AI야. 사용자가 뽑은 타로 카드와 질문 내용을 바탕으로,
현실적인 조언을 150자 이내의 반말로 해줘. 다음을 꼭 지켜:

- 말투는 친구처럼 반말
- 맞춤법 철저히 지켜. 오타 없게
- 너무 긍정적이거나 부정적이지 않게 균형 있게 말해
- 구체적인 방향 제시 (실행 유도)
- '[조언]' 같은 말 붙이지 말고, 바로 시작
- 답변은 150자 이내로

예시:
- 마음은 있지만 지금은 타이밍이 아니야. 너무 조급해하지 말고 너 자신부터 챙겨봐.
- 너무 신중하게 고민만 하지 말고, 가볍게 움직여봐. 의외의 기회가 올 수도 있어.
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
      temperature: 0.7,
      max_tokens: 300
    });

    const rawResult = chatCompletion.choices[0].message.content.trim();
    const result = trimTo150(rawResult); // ✨ 150자 이내로 정제
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
