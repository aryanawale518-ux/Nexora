import React, { useState } from 'react';
import {
  Send,
  Search,
  Paperclip,
  Pin,
  ShieldCheck,
  Megaphone,
  Users,
  FlaskConical,
  Leaf,
  MessageSquare,
  Plus,
  Info,
  X,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';

export const MessagesView: React.FC = () => {
  const {
    channels,
    activeChannelId,
    setActiveChannelId,
    messages,
    sendMessage,
    pinMessage,
    currentUser,
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [isOfficialNoticeToggle, setIsOfficialNoticeToggle] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; size: string } | null>(null);

  // Mobile state: 'channels' | 'chat'
  const [mobilePane, setMobilePane] = useState<'channels' | 'chat'>('chat');

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages[activeChannel.id] || [];

  const isFacultyOrAdmin =
    currentUser.role === 'teacher' ||
    currentUser.role === 'class_teacher' ||
    currentUser.role === 'admin';

  const canUserPost = activeChannel.canPost.includes(currentUser.role);
  const pinnedMessages = channelMessages.filter((m) => m.pinned);

  const filteredMessages = channelMessages.filter((m) => {
    if (!conversationSearch) return true;
    return (
      m.content.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      m.senderName.toLowerCase().includes(conversationSearch.toLowerCase())
    );
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedAttachment) return;

    const attachments = selectedAttachment
      ? [
          {
            name: selectedAttachment.name,
            size: selectedAttachment.size,
            type: 'pdf' as const,
            url: '#',
          },
        ]
      : [];

    sendMessage(activeChannel.id, messageInput, isOfficialNoticeToggle && isFacultyOrAdmin, attachments);
    setMessageInput('');
    setSelectedAttachment(null);
    setIsOfficialNoticeToggle(false);
  };

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className="w-4 h-4 text-indigo-500" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-purple-500" />;
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-emerald-500" />;
      case 'Users':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      {/* Left Column: Channels / Conversations List */}
      <div
        className={`${
          mobilePane === 'channels' ? 'flex' : 'hidden'
        } md:flex w-full md:w-80 border-r border-slate-200 flex-col bg-slate-50/50 shrink-0`}
      >
        {/* Header & Search */}
        <div className="p-3.5 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Conversations</h2>
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs flex items-center gap-1 shadow-2xs"
                title="Create Group"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold pr-1">New</span>
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search groups & channels..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-0.5 text-xs">
          {channels.map((c) => {
            const isSelected = c.id === activeChannel.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveChannelId(c.id);
                  setMobilePane('chat');
                }}
                className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white shadow-2xs border border-slate-200 font-semibold'
                    : 'hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    c.isOfficial ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {getChannelIcon(c.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 truncate flex items-center gap-1">
                      {c.name}
                      {c.isOfficial && (
                        <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums font-normal">
                      {c.lastMessageTime || ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                    {c.lastMessageSnippet || c.description}
                  </p>
                </div>

                {c.unreadCount > 0 && (
                  <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 font-mono tabular-nums">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle/Right Column: Active Conversation */}
      <div
        className={`${
          mobilePane === 'chat' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col min-w-0`}
      >
        {/* Active Channel Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile back to channel list button */}
            <button
              onClick={() => setMobilePane('channels')}
              className="p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
              title="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              {getChannelIcon(activeChannel.icon)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm truncate">{activeChannel.name}</h3>
                {activeChannel.isOfficial && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded">
                    Official Channel
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {activeChannel.membersCount} members · {activeChannel.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Conversation search input */}
            <div className="relative hidden sm:block w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                placeholder="Find in chat..."
                className="w-full pl-7 pr-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs placeholder-slate-400 focus:outline-none"
              />
              {conversationSearch && (
                <button
                  onClick={() => setConversationSearch('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowChannelInfo(!showChannelInfo)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Channel Information"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Messages Banner */}
        {pinnedMessages.length > 0 && (
          <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2 min-w-0">
              <Pin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="font-bold shrink-0">Pinned:</span>
              <span className="truncate">{pinnedMessages[0].content}</span>
            </div>
            <span className="text-[10px] text-amber-700 shrink-0 ml-2">
              By {pinnedMessages[0].senderName}
            </span>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <Avatar
                  src={msg.senderAvatar}
                  name={msg.senderName}
                  size="sm"
                  className="mt-0.5"
                />

                <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender metadata */}
                  <div className={`flex items-center gap-2 text-[11px] ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-slate-800">{msg.senderName}</span>
                    <span className="text-slate-400 font-mono tabular-nums">{msg.timestamp}</span>
                    {msg.isOfficialNotice && (
                      <span className="text-[10px] font-bold text-indigo-700">
                        · Official
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed whitespace-pre-line ${
                      msg.isOfficialNotice
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                        : isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-slate-200 text-[11px] text-slate-800 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{att.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Faculty moderation controls: Pin message */}
                  {isFacultyOrAdmin && (
                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 pt-0.5 ${isMe ? 'justify-end' : ''}`}>
                      <button
                        onClick={() => pinMessage(activeChannel.id, msg.id)}
                        className="hover:text-indigo-600 flex items-center gap-1 transition"
                      >
                        <Pin className="w-3 h-3" />
                        {msg.pinned ? 'Unpin' : 'Pin to header'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">No messages found matching "{conversationSearch}".</p>
              <button
                onClick={() => setConversationSearch('')}
                className="mt-2 text-indigo-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          {!canUserPost ? (
            <div className="p-2.5 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
              Only verified faculty members and administrators can publish in this official announcement channel.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Selected Attachment preview */}
              {selectedAttachment && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium">{selectedAttachment.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">({selectedAttachment.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setSelectedAttachment({
                      name: 'Observation_Handout.pdf',
                      size: '840 KB',
                    })
                  }
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Attach document (Simulated)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim() && !selectedAttachment}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Faculty toggle: Mark as Official Notice */}
              {isFacultyOrAdmin && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOfficialNoticeToggle}
                      onChange={(e) => setIsOfficialNoticeToggle(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-700">Publish as Official Verified Notice</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Triggers institutional notification</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Slide-out Channel Info Drawer */}
      {showChannelInfo && (
        <div className="w-72 border-l border-slate-200 bg-slate-50/70 p-4 flex flex-col text-xs overflow-y-auto shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-sm">Channel Info</span>
            <button
              onClick={() => setShowChannelInfo(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Description
              </span>
              <p className="text-slate-700 leading-relaxed">{activeChannel.description}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Category
              </span>
              <span className="text-slate-700 font-medium">{activeChannel.category}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Authorized Publishers
              </span>
              <div className="flex flex-wrap gap-1">
                {activeChannel.canPost.map((r) => (
                  <span
                    key={r}
                    className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold"
                  >
                    {r.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Members ({activeChannel.members.length})
              </span>
              <div className="space-y-1">
                {activeChannel.members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800"
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Group */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Create Academic or Project Group</h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Olympiad Preparations"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <option>Academics & Classes</option>
                  <option>Labs & Practicals</option>
                  <option>Activities & Clubs</option>
                  <option>Official Notices</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="State the purpose and guidelines of this channel..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
