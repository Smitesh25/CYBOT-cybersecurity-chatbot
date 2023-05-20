const { Configuration, OpenAIApi } = require("openai");

const getGPTReply = async (params) => {
  const { text } = params;
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Act as a friendly cyber security chatbot. Your name is CYBOT - a cyber security chatbot`,
        },
        {
          role: "user",
          content: `Your have to generate responses to user questions in the cyber security domain, any questions of other domains strictly needs to be ignored. A user is asking the following question generate a suitable reply for the same: ${text}`,
        },
      ],
      temperature: 0,
      max_tokens: 256,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    return result.data.choices[0].message.content;
  } catch (error) {
    console.log(JSON.stringify(error), "error in getSummaryForLimitedChats");
  }
  return null;
};

export const getGPTReplyClient = {
  getGPTReply,
};
