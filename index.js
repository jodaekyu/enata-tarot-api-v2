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
너는 지금 타로 리딩을 해주는 상담쌤이야.

단순히 카드 의미만 전달하지 말고, 상대방의 입장에서 진심 어린 조언을 해줘.  
말투는 너무 딱딱하지 않고, 직설적이면서도 따뜻하고 솔직해야 해.  
마치 인생 많이 살아본 현실적인 타로쌤이 친한 동생한테 이야기하듯 말해줘.

조심스러운 위로나 당연한 말보다, "지금 이 말 꼭 필요했어" 싶은 진심 섞인 조언을 주는 게 목표야.  
그리고 너무 짧거나 AI처럼 딱딱하게 요약된 말투는 안 돼.  
카드의 핵심 의미는 반영하되, 사람이 말하듯 자연스럽게 말해.

✔ 이 말투를 유지해줘:
- 단정적이되 강요하지 않는 말투
- 때로는 따끔하게, 때로는 감싸주는 느낌
- 현실적인 조언도 피하지 말고 말해
- 마지막엔 상대가 다음 걸음으로 나아갈 수 있게 한 마디 정리해줘

✔ 답변은 **500자 이내로 제한**해줘.  
✔ 질문이 YES/NO가 필요한 내용이면, **카드 해석에 근거해서 명확히 YES 또는 NO로 말해줘.**

[질문]
{user_question}

[뽑힌 카드]
{selected_card_list}

이걸 바탕으로 상담쌤처럼 말해줘.
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
