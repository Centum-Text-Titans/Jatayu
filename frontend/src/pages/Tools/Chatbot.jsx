import React, { useState } from "react";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    const defaultQA = [
        {
            question: "What is your name?",
            answer: "I'm your friendly ChatBot!",
        },
        {
            question: "How can you help me?",
            answer: "I can answer FAQs and guide you through our services.",
        },
        {
            question: "What services do you offer?",
            answer: "I provide information and can direct you to the right resources.",
        },
        {
            question: "How do I get started?",
            answer: "Simply click on a question or type your query below.",
        },
    ];

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleDefaultQuestion = (qna) => {
        // Append the user's question.
        setMessages((prev) => [...prev, { sender: "user", text: qna.question }]);
        // Simulate ChatBot response after a brief delay.
        setTimeout(() => {
            setMessages((prev) => [...prev, { sender: "bot", text: qna.answer }]);
        }, 500);
    };

    const handleUserMessage = (event) => {
        event.preventDefault();
        if (userInput.trim()) {
            setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
            // Simulate ChatBot response
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        text: "I'm still learning. Please try asking something else.",
                    },
                ]);
            }, 500);
        }
        setUserInput("");
    };

    return (
        <>
            {/* Minimized Chat Icon */}
            {!isOpen && (
                <div
                    onClick={toggleOpen}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1000,
                        cursor: "pointer",
                    }}
                >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">💬</span>
                    </div>
                </div>
            )}

            {/* Expanded Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 1000,
                    }}
                    className="w-80 h-96 bg-white border border-gray-300 shadow-lg rounded-lg flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-2 border-b">
                        <h3 className="font-bold">ChatBot</h3>
                        <button className="text-gray-500" onClick={toggleOpen}>
                            X
                        </button>
                    </div>
                    {/* Chat history / messages */}
                    <div className="flex-1 p-2 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div>
                                <p className="text-gray-600 text-sm mb-2">
                                    Here are some questions you can ask:
                                </p>
                                <div className="flex flex-col space-y-2">
                                    {defaultQA.map((qna, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleDefaultQuestion(qna)}
                                            className="text-blue-500 text-sm underline text-left"
                                        >
                                            {qna.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"
                                        }`}
                                >
                                    <p
                                        className={`text-sm ${msg.sender === "user"
                                                ? "text-gray-700 font-semibold"
                                                : "text-gray-600 font-semibold"
                                            }`}
                                    >
                                        {msg.sender === "user" ? "User:" : "ChatBot:"}
                                    </p>
                                    <p className="text-sm text-gray-800">{msg.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Input field */}
                    <div className="p-2 border-t">
                        <form onSubmit={handleUserMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full px-2 py-1 border rounded outline-none"
                            />
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
