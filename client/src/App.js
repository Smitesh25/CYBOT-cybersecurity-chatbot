import React, { useState, useEffect } from "react";
import Chat, { Bubble, useMessages } from "@chatui/core";
import "@chatui/core/dist/index.css";
import { getGPTReplyClient } from "./components/openai";
import FileUploadModal from "./components/fileUploadModal";
import filterText from "./apis/filterText";
import queryIndex from "./apis/queryIndex";
import emailScanner from "./apis/emailScanner";
import { textSummarisation } from "./apis/summarisation";

const initialMessages = [
  {
    type: "text",
    content: { text: "Hey there, how can I help you?" },
    user: {
      avatar:
        "https://w7.pngwing.com/pngs/529/418/png-transparent-computer-icons-internet-bot-eyes-miscellaneous-people-sticker-thumbnail.png",
    },
  },
];
const defaultQuickReplies = [
  {
    icon: "message",
    name: "CYBOT",
  },
  {
    icon: "folder",
    name: "CUSTOM CYBOT",
  },
  {
    icon: "search",
    name: "EMAIL SCANNER",
  },
];

export default function App() {
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  const [activeQuickReply, setActiveQuickReply] = useState(
    defaultQuickReplies[0].name
  );
  const [openModal, setOpenModal] = useState(false);

  async function handleSend(type, val) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });
      let filteredText = val;
      try {
        const filteredTextJSON = await filterText(val);
        filteredText = JSON.parse(filteredTextJSON).filtered_text;
      } catch (err) {
        console.log(err, "err in filterText");
      }
      console.log(filteredText);

      const noOfWords = filteredText.trim().split(/\s+/);
      if (noOfWords.length > 2500) {
        const summarisedText = await textSummarisation({ text: filteredText });
        filteredText = summarisedText;
      }

      console.log(activeQuickReply);
      switch (activeQuickReply) {
        case "CYBOT":
          setTyping(true);
          setTimeout(async () => {
            const result = await getGPTReplyClient.getGPTReply({
              text: filteredText,
            });
            appendMsg({
              type: "text",
              content: { text: result },
              user: {
                avatar:
                  "https://w7.pngwing.com/pngs/529/418/png-transparent-computer-icons-internet-bot-eyes-miscellaneous-people-sticker-thumbnail.png",
              },
            });
          });
          break;
        case "CUSTOM CYBOT":
          setTyping(true);
          setTimeout(async () => {
            const queryIndexResponse = await queryIndex(val);
            console.log(queryIndexResponse.text);
            const result = await getGPTReplyClient.getGPTReply({
              text: queryIndexResponse.text,
            });
            console.log(result);
            appendMsg({
              type: "text",
              content: { text: result },
              user: {
                avatar:
                  "https://w7.pngwing.com/pngs/529/418/png-transparent-computer-icons-internet-bot-eyes-miscellaneous-people-sticker-thumbnail.png",
              },
            });
          });
          break;
        case "EMAIL SCANNER":
          setTyping(true);
          setTimeout(async () => {
            const emailScannerResponse = await emailScanner(val);
            console.log(emailScannerResponse, "emailScannerResponse");
            const emailScannerResult = JSON.parse(emailScannerResponse).result;
            appendMsg({
              type: "text",
              content: { text: emailScannerResult },
              user: {
                avatar:
                  "https://w7.pngwing.com/pngs/529/418/png-transparent-computer-icons-internet-bot-eyes-miscellaneous-people-sticker-thumbnail.png",
              },
            });
          });

          break;
        default:
          break;
      }
    }
  }

  function handleQuickReplyClick(data) {
    const clickedOption = data.name;

    setActiveQuickReply(clickedOption);

    // Handle the logic for the clicked option
    switch (clickedOption) {
      case "CYBOT":
        // Handle CYBOT option
        break;
      case "CUSTOM CYBOT":
        // Handle CUSTOM CYBOT option
        break;
      case "EMAIL SCANNER":
        // Handle EMAIL SCANNER option
        break;
      default:
        break;
    }
  }

  function renderMessageContent(msg) {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

  const handleRightActionClick = (event) => {
    console.log(openModal);
    setOpenModal((prev) => !prev);
  };

  const handleOpenModal = (props) => {
    setOpenModal(props)
  }
  return (
    <>
      <FileUploadModal openModal={openModal} handleOpenModal={handleOpenModal} />
      <Chat
        navbar={{ title: "CYBOT - a cyber security chatbot" }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        onSend={handleSend}
        quickReplies={defaultQuickReplies.map((reply) => ({
          ...reply,
          isHighlight: reply.name === activeQuickReply,
        }))}
        onQuickReplyClick={handleQuickReplyClick}
        locale="en-US"
        placeholder="type here ..."
        rightAction={{
          disabled: activeQuickReply !== "CUSTOM CYBOT",
          icon: "plus",
          onClick: handleRightActionClick,
        }}
      />
    </>
  );
}
