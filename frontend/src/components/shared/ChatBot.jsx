import React, { useState } from "react";
import axios from "axios";
import { RiCustomerService2Fill } from "react-icons/ri";
import { motion } from "framer-motion";
import { FAQ_API_END_POINT } from "@/utils/ApiEndPoint";
import { FaArrowLeftLong } from "react-icons/fa6";

const ChatBot = () => {
  const [openChatBot, setOpenChatBot] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    "How to create a company?",
    "How to post a job?",
    "How to apply for a job?",
  ];

  const fetchAnswer = async () => {
    if (!selectedQuestion) return; // Prevents fetching without selection
    setLoading(true);
    setAnswer(null); // Clear previous answer

    try {
      const response = await axios.post(`${FAQ_API_END_POINT}/getAnswer`, {
        question: selectedQuestion,
      });

      if (response.data.success) {
        setAnswer(response.data.answer); // Expecting an array from backend
      } else {
        setAnswer(["Sorry, I couldn't find an answer."]);
      }
    } catch (err) {
      console.error("Error fetching FAQ:", err);
      setAnswer(["Something went wrong. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    setAnswer(null);
    setOpenChatBot(false);
  };

  const handleBack = () => {
    setAnswer(null);
    setSelectedQuestion(null);
  };

  return (
    <>
      {openChatBot ? (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg p-4 rounded-lg w-80 border-[1px] border-blue-500 h-80">
          {/* Close Button */}
          <div
            className="absolute top-3 right-5 flex justify-end p-1 font-bold text-blue-700 w-fit rounded-full cursor-pointer"
            onClick={handleClose}
          >
            X
          </div>
          <h3 className="text-lg font-bold mb-2">Ask Me Anything!</h3>

          {/* Chat Area with Animation */}
          <motion.div
            className="h-40 overflow-y-auto flex flex-col gap-2 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {answer ? (
              <div className="p-2 bg-gray-100 rounded-lg">
                <button
                  onClick={handleBack}
                  className="text-blue-700 font-bold mb-2"
                >
                  <FaArrowLeftLong />
                </button>
                {answer.map((step, idx) => (
                  <p key={idx} className="text-gray-800">
                    {step}
                  </p>
                ))}
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={index}
                  className={`p-2 bg-blue-100 text-blue-700 font-semibold rounded-lg cursor-pointer ${
                    selectedQuestion === question &&
                    "border-[1px] border-blue-500"
                  }`}
                  onClick={() => setSelectedQuestion(question)}
                >
                  {question}
                </div>
              ))
            )}
          </motion.div>

          {/* Send Button */}
          <button
            onClick={fetchAnswer}
            disabled={loading || !selectedQuestion}
            className={`absolute bottom-2 w-72 text-white p-2 mt-2 rounded-lg ${
              loading || !selectedQuestion
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700"
            }`}
          >
            {loading ? "Loading..." : "Find Answer"}
          </button>
        </div>
      ) : (
        <div
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition duration-300 shadow-xl p-3 rounded-full h-14 w-14 flex justify-center items-center cursor-pointer ring-2 ring-white hover:scale-105"
          onClick={() => setOpenChatBot(true)}
        >
          <RiCustomerService2Fill className="text-white" size={32} />
        </div>
      )}
    </>
  );
};

export default ChatBot;
