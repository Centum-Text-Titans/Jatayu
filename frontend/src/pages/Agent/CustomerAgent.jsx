import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const FLASK_API_URL = import.meta.env.VITE_FLASK_URL;
const CHAT_API_URL = import.meta.env.VITE_CHAT_URL;

const CustomerAgent = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
        setMessages(savedMessages);
    }, []);

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", type: "text", content: input }];
        setMessages(newMessages);

        try {
            const response = await axios.post(`${FLASK_API_URL}/chat/`, { question: input });
            console.log(response.data);

            let botReply = response.data.response || "Sorry, I couldn't understand that.";
            let messageType = "text";

            if (typeof botReply === "string" && /\.(png|jpg|jpeg)$/i.test(botReply)) {
                const filename = botReply.split("/").pop();
                botReply = `${CHAT_API_URL}/${filename}`;
                messageType = "image";
            }

            setMessages(prev => [...prev, { sender: "bot", type: messageType, content: botReply }]);
        } catch (error) {
            console.error("Error communicating with the chatbot:", error);
            setMessages(prev => [...prev, { sender: "bot", type: "text", content: "❌ Error contacting server." }]);
        }

        setInput("");
    };

    const openImageFullscreen = (src) => {
        setFullscreenImage(src);
    };

    const closeImageFullscreen = () => {
        setFullscreenImage(null);
    };

    return (
        <div className="flex flex-col h-[90vh] mx-auto p-4 border rounded-lg shadow-lg bg-white">
            <h2 className="text-3xl font-bold text-center mb-4 text-blue-700">📈 Customer DB Query Chatbot</h2>

            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 rounded-lg">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-5 py-4 rounded-2xl shadow ${
                                msg.sender === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gradient-to-r from-green-300 to-green-500 text-black rounded-bl-none"
                            }`}
                        >
                            {msg.type === "text" ? (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            ) : msg.type === "image" ? (
                                <img
                                    src={msg.content}
                                    alt="Generated Chart"
                                    onClick={() => openImageFullscreen(msg.content)}
                                    className="rounded-lg cursor-pointer w-full max-h-80 object-contain border-2 border-gray-400 hover:scale-105 transition-transform duration-300"
                                />
                            ) : null}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex mt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your question..."
                    className="flex-1 border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700"
                >
                    Send
                </button>
            </form>

            {/* Fullscreen Image Modal */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={closeImageFullscreen}
                >
                    <img
                        src={fullscreenImage}
                        alt="Fullscreen Preview"
                        className="max-w-full max-h-full object-contain p-4"
                    />
                </div>
            )}
        </div>
    );
};

export default CustomerAgent;
