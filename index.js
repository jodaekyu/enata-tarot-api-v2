 index.js
const express = require(express);
const cors = require(cors);
const bodyParser = require(body-parser);
const { Configuration, OpenAIApi } = require(openai);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

 프롬프트 긍정적 + 부정적 조언 모두 가능하게 설정
const basePrompt = (question, cardMeanings) = `
당신은 타로 마스터입니다. 사용자가 던진 고민 질문에 대해 아래 3장의 카드 의미를 참고하여 타로 리딩을 해주세요. 답변은 간결하고 핵심적으로 해주세요. 
 반드시 고민과 카드의 상징을 연결해 해석해주세요.
 긍정적인 조언만 하지 말고, 필요한 경우 부정적인 측면도 정직하게 조언해주세요.
 마지막 문장은 항상 사용자를 위한 따뜻한 조언 한 마디로 마무리해주세요.

[사용자 질문]
${question}

[카드 의미 요약]
${cardMeanings}
`;

app.post(generate, async (req, res) = {
  const { question, cards } = req.body;

  const cardMeanings = cards.map(
    (c, i) = `${i + 1}번째 카드 ${c.name} (${c.position}) - ${c.meaning}`
  ).join(n);

  try {
    const completion = await openai.createChatCompletion({
      model gpt-3.5-turbo,
      messages [{
        role user,
        content basePrompt(question, cardMeanings),
      }],
      temperature 0.9,
    });

    res.json({ result completion.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error(Error, error.response.data  error.message);
    res.status(500).json({ error AI 응답 생성 중 오류 발생 });
  }
});

const PORT = process.env.PORT  3000;
app.listen(PORT, () = {
  console.log(`서버 실행 중 포트 ${PORT}`);
});
