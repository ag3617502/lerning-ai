import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import api from "../../services/api";
import ReactMarkdown from "react-markdown";
import  remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ChatArea = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      api.get(`/chat/${conversationId}`).then((res) => {
        setMessages(res.data);
      }).catch(err => console.error(err));
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userText = input;
    setInput("");
    
    // Optimistic UI
    setMessages((prev) => [...prev, { _id: Date.now(), text: userText, sender: "user" }]);
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { conversationId, text: userText });
      // Update with actual DB IDs and append AI response
      setMessages((prev) => [
        ...prev.filter(m => m._id !== Date.now()), // remove optimistic
        data.userMessage,
        data.aiMessage
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { _id: Date.now()+1, text: "Error sending message.", sender: "ai" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 border-b bg-white/80 backdrop-blur border-slate-200">
        <h3 className="font-semibold text-slate-800">Document Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Send a message to start chatting with your document.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-2xl leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <div className="bg-slate-800 text-slate-100 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono shadow-inner">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code className="bg-slate-200 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono mx-1" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-outside mb-4 ml-6 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-outside mb-4 ml-6 space-y-1">{children}</ol>;
                    },
                    li({ children }) {
                      return <li>{children}</li>;
                    },
                    a({ children, href }) {
                      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
                          <table className="min-w-full text-sm text-left">{children}</table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return <thead className="bg-slate-100 text-slate-700 font-semibold">{children}</thead>;
                    },
                    tbody({ children }) {
                      return <tbody className="divide-y divide-slate-200">{children}</tbody>;
                    },
                    tr({ children }) {
                      return <tr className="hover:bg-slate-50 transition-colors">{children}</tr>;
                    },
                    th({ children }) {
                      return <th className="px-4 py-3">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-4 py-3 align-top">{children}</td>;
                    }
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-3 bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-none text-slate-800">
              <Loader2 className="animate-spin text-slate-400" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all text-slate-800 placeholder-slate-400"
            placeholder="Ask a question about your document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center justify-center p-3 text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 focus:ring-4 focus:ring-blue-500/50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
