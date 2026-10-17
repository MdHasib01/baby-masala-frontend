import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, FriendUser } from '../../types';
import { ArrowLeft, Search, Send, Image as ImageIcon, MoreVertical, ShieldAlert, CheckCheck, X } from 'lucide-react';
import { EmojiButton } from '../EmojiPicker';

interface MessengerScreenProps {
  conversations: Conversation[];
  onUpdateConversations: (convs: Conversation[]) => void;
  messages: Message[];
  onUpdateMessages: (msgs: Message[]) => void;
  friends: FriendUser[];
  initialActiveFriend?: FriendUser | null;
  onBack: () => void;
  onOpenTimeline?: (friend: FriendUser) => void;
}

export const MessengerScreen: React.FC<MessengerScreenProps> = ({
  conversations,
  onUpdateConversations,
  messages,
  onUpdateMessages,
  friends,
  initialActiveFriend,
  onBack,
  onOpenTimeline,
}) => {
  const [activeConv, setActiveConv] = useState<Conversation | null>(() => {
    if (initialActiveFriend) {
      const existing = conversations.find((c) => c.participant.id === initialActiveFriend.id);
      if (existing) return existing;
      return {
        id: 'conv-' + Date.now(),
        participant: initialActiveFriend,
        lastMessage: 'কথোপকথন শুরু হয়েছে',
        lastTimestamp: 'এইমাত্র',
        unreadCount: 0,
        isRequest: false,
      };
    }
    return conversations[0] || null;
  });

  const [inputText, setInputText] = useState('');
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeConv
    ? messages.filter((m) => m.conversationId === activeConv.id)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg: Message = {
      id: 'm-' + Date.now(),
      conversationId: activeConv.id,
      senderId: 'me',
      text: inputText,
      timestamp: 'এইমাত্র',
      status: 'sent',
    };

    const updatedMsgs = [...messages, newMsg];
    onUpdateMessages(updatedMsgs);

    const updatedConvs = conversations.map((c) =>
      c.id === activeConv.id
        ? { ...c, lastMessage: inputText, lastTimestamp: 'এইমাত্র' }
        : c
    );
    if (!conversations.some((c) => c.id === activeConv.id)) {
      updatedConvs.push({
        ...activeConv,
        lastMessage: inputText,
        lastTimestamp: 'এইমাত্র',
      });
    }
    onUpdateConversations(updatedConvs);
    setInputText('');

    // Simulated automated reply demo
    setTimeout(() => {
      const replyMsg: Message = {
        id: 'm-reply-' + Date.now(),
        conversationId: activeConv.id,
        senderId: activeConv.participant.id,
        text: 'ধন্যবাদ আপু! মেসেজটি পেয়েছি। (ডেমো অটো-রিপ্লাই)',
        timestamp: 'এইমাত্র',
        status: 'delivered',
      };
      onUpdateMessages([...updatedMsgs, replyMsg]);
    }, 2000);
  };

  const filteredConvs = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      {/* Top Header */}
      <div className="bg-[#56020A] text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">মেসেঞ্জার</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row max-w-4xl mx-auto w-full bg-white shadow-sm border-x border-[#EDD6A9]">
        {/* Conversation List Sidebar */}
        <div className="w-full sm:w-80 border-r border-[#EDD6A9] flex flex-col h-[calc(100vh-130px)] bg-[#FAF6F0]">
          <div className="p-3 border-b border-[#EDD6A9]">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="চ্যাট খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConvs.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EDD6A9]/30 font-semibold' : 'hover:bg-white'
                  }`}
                >
                  <div className="relative">
                    <img src={conv.participant.avatar} alt={conv.participant.name} className="w-11 h-11 rounded-full object-cover" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#56020A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-xs font-bold text-[#56020A] truncate">{conv.participant.name}</h4>
                      <span className="text-[10px] text-gray-400">{conv.lastTimestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Chat Window */}
        <div className="flex-1 flex flex-col h-[calc(100vh-130px)] bg-[#FAF6F0]">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-white border-b border-[#EDD6A9] flex items-center justify-between shadow-sm">
                <div
                  onClick={() => onOpenTimeline?.(activeConv.participant)}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                >
                  <img src={activeConv.participant.avatar} alt={activeConv.participant.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xs font-bold text-[#56020A]">{activeConv.participant.name}</h3>
                    <p className="text-[10px] text-green-700 font-medium">সক্রিয় (ডেমো) • প্রোফাইল দেখুন</p>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${
                        isMe ? 'bg-[#56020A] text-white rounded-br-none' : 'bg-white text-gray-800 border border-[#EDD6A9] rounded-bl-none'
                      }`}>
                        <p>{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-[#EDD6A9]' : 'text-gray-400'}`}>
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#EDD6A9] flex gap-2">
                <EmojiButton fieldRef={messageInputRef} value={inputText} onChange={setInputText} />
                <input
                  ref={messageInputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#56020A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#56020A] text-white rounded-xl text-xs font-bold hover:bg-[#56020A]/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
              কথোপকথন শুরু করতে বাম দিক থেকে একটি চ্যাট নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
