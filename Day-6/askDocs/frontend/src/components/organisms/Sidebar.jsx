import { MessageSquarePlus, MessageCircle, LogOut } from "lucide-react";

const Sidebar = ({ conversations, currentConversation, onSelectConversation, onNewChat, onLogout }) => {
  return (
    <div className="flex flex-col w-64 h-screen bg-slate-900 border-r border-slate-800">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center w-full gap-2 p-3 text-sm font-medium transition-colors border rounded-lg text-slate-200 border-slate-700 hover:bg-slate-800"
        >
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-sm text-center text-slate-500">No recent chats</div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-800 ${
                  currentConversation?._id === conv._id ? "bg-slate-800 shadow-inner" : ""
                }`}
              >
                <MessageCircle size={18} className="text-slate-500" />
                <span className="truncate text-sm">{conv.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-3 text-sm font-medium transition-colors rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 w-full"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
