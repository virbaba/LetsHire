import React, { useState } from "react";
import axios from "axios";
import { RiCustomerService2Fill } from "react-icons/ri";
import { toast } from "react-hot-toast";
import Loading from "../Loading";
const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [openChatBot, setOpenChatBot] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [questionSelected, setQuestionSelected] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const questions = [
    "How to create a company?",
    "How to post a job?",
    "How to apply for a job?",
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    setMessages([...messages, { text: input, sender: "user" }]);

    try {
      const response = await axios.post("/api/faq", { question: input });
      setMessages([
        ...messages,
        { text: input, sender: "user" },
        { text: response.data.answer, sender: "bot" },
      ]);
    } catch (error) {
      setMessages([
        ...messages,
        { text: "Error fetching response", sender: "bot" },
      ]);
    }

    setInput("");
  };

  const getAnswer = async (question) => {
    try {
      setQuestionSelected(true);
      setQuestion(question);
      setLoading(true);
      setTimeout(() => {
        console.log("heelo");
        setLoading(false);
        setQuestionSelected(false);
      }, 5000);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuestionSelected(false);
    setOpenChatBot(false);
  };

  return (
    <>
      {openChatBot ? (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg p-4 rounded-lg w-80 border-[1px] border-blue-500 h-80">
          <div
            className="absolute top-3 right-5 flex justify-end p-1 font-bold text-blue-700 w-fit rounded-full cursor-pointer"
            onClick={handleClose}
          >
            X
          </div>
          <h3 className="text-lg font-bold mb-2">Ask Me Anything!</h3>
          <div className="h-40 overflow-y-auto flex flex-col gap-2 mt-2">
            {questionSelected ? (
              loading ? (
                <Loading color={"blue"} />
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 ${
                      msg.sender === "user"
                        ? "text-right text-blue-500"
                        : "text-left text-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )
            ) : (
              questions.map((question, index) => (
                <div
                  key={index}
                  className={`p-2 bg-blue-100 text-blue-700 font-semibold rounded-lg cursor-pointer`}
                  onClick={() => {
                    getAnswer(question);
                  }}
                >
                  {question}
                </div>
              ))
            )}
            <button
              onClick={sendMessage}
              className="absolute bottom-2 w-72 bg-blue-700 text-white p-2 mt-2"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div
          className="fixed bottom-6 right-6 bg-white shadow-lg p-4 rounded-full h-14 w-14 flex justify-center items-center cursor-pointer border-t-[1px] border-b-[1px] border-blue-700"
          onClick={() => setOpenChatBot(true)}
        >
          <RiCustomerService2Fill className="text-blue-700" size={50} />
        </div>
      )}
    </>
  );
};

export default ChatBot;
