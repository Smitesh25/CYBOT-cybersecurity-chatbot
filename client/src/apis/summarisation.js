import { isEmpty } from "lodash";
const { Configuration, OpenAIApi } = require("openai");

const generateSummary = async (openai, text) => {
  try {
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 2056,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    return result.data.choices[0].message.content;
  } catch (error) {
    return null;
  }
};
const splitTextIntoBatches = (text) => {
  console.log("HI bye");
  const words = text.trim().split(/\s+/);
  const batchSize = 1000;
  const textBatches = [];

  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize).join(" ");
    textBatches.push(batch);
  }

  return textBatches;
};

const textSummarisation = async (params) => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const { text } = params;

  const textBatches = splitTextIntoBatches(text);
  console.log(textBatches.length, "textBatches.length");
  if (isEmpty(textBatches)) {
    console.log("isEmpty textBatches");
    return null;
  }

  let summarisedText = "";
  for (const batch of textBatches) {
    const summary = await generateSummary(openai, `${batch} \n Tl;dr`);
    if (!summary) {
      return null;
    }
    summarisedText = summary;
  }

  return summarisedText;
};

export { textSummarisation };
