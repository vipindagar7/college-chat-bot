import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, GraduationCap, Minimize2, Loader2, Bot, User,
  BookOpen, indian-rupee, Award, Home, TrendingUp, FileText, ExternalLink, Headphones
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const QUICK = [
  { label: 'Courses', icon: BookOpen, msg: 'courses' },
  { label: 'Fee Structure', icon: indian-rupee, msg: 'fees' },
  { label: 'Scholarships', icon: Award, msg: 'scholarship' },
  { label: 'Hostel', icon: Home, msg: 'hostel' },
  { label: 'Placements', icon: TrendingUp, msg: 'placements' },
  { label: 'Documents', icon: FileText, msg: 'documents required' },
  { label: 'How to Apply', icon: ExternalLink, msg: 'how to apply' },
  { label: 'Talk to Counselor', icon: Headphones, msg: 'talk to counselor' },
];

// Simple markdown renderer (bold, bullet lines)
function RenderText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-0.5">
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p);
        if (!line.trim()) return <br key={i} />;
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-end gap-2 chat-in">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 chat-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${isUser ? 'bg-gray-200' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-gray-600" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
        isUser ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
      }`}>
        {isUser
          ? <p className="text-sm leading-relaxed">{msg.message}</p>
          : <RenderText text={msg.message} />
        }
        <p className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const { user, token, logout } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [sid, setSid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);
  const [showLead, setShowLead] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [lead, setLead] = useState({ courseInterest: '', qualification: '', city: '', state: '', passingYear: '' });
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const widgetId = new URLSearchParams(window.location.search).get('widgetId') || 'default';

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.startSession(token, widgetId);
        if (r.success) {
          setSid(r.sessionId);
          setMsgs([{
            role: 'bot',
            message: `Hi ${user?.name?.split(' ')[0]}! 👋 Welcome to **ECHELON INSTITUTE OF TECHNOLOGY** Admission Assistant.\n\nI can help you with courses, fees, scholarships, hostel, placements, and the admission process.\n\nWhat would you like to know?`,
            createdAt: new Date(),
          }]);
        }
      } catch (e) { console.error(e); }
      finally { setInit(false); }
    })();
  }, [token, user, widgetId]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading || !sid) return;
    setMsgs(p => [...p, { role: 'user', message: text.trim(), createdAt: new Date() }]);
    setInput('');
    setLoading(true);
    try {
      const r = await api.sendMessage(token, text.trim(), sid);
      if (r.success) {
        setMsgs(p => [...p, { role: 'bot', message: r.reply, createdAt: new Date() }]);
        if (!leadSaved && msgs.length >= 5) setShowLead(true);
      } else {
        setMsgs(p => [...p, { role: 'bot', message: 'Sorry, something went wrong. Please try again.', createdAt: new Date() }]);
      }
    } catch {
      setMsgs(p => [...p, { role: 'bot', message: 'Network error. Please check your connection.', createdAt: new Date() }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }, [loading, sid, token, msgs.length, leadSaved]);

  const handleSaveLead = async () => {
    try {
      await api.saveLead(token, { ...lead, sessionId: sid });
      setLeadSaved(true); setShowLead(false);
      setMsgs(p => [...p, { role: 'bot', message: '✅ Thank you! Your details have been saved. Our admission counselor will contact you soon. Is there anything else I can help you with?', createdAt: new Date() }]);
    } catch { /* silent */ }
  };

  if (init) return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Setting up your chat...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-700 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Admission Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <p className="text-blue-100 text-xs">Online · Hi, {user?.name?.split(' ')[0]}</p>
          </div>
        </div>
        <button onClick={logout} className="p-1.5 hover:bg-white/10 rounded-lg transition" title="Exit">
          <Minimize2 className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 thin-scroll">
        {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && <Typing />}

        {/* Lead Capture Card */}
        {showLead && !leadSaved && (
          <div className="chat-in bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 mb-0.5">🎓 Let us help you better</p>
            <p className="text-xs text-gray-500 mb-3">Share a few details for personalized guidance</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: 'courseInterest', p: 'Course interest', col: 2 },
                { k: 'qualification', p: 'Qualification (e.g. 12th PCM)' },
                { k: 'passingYear', p: 'Passing year' },
                { k: 'city', p: 'City' },
                { k: 'state', p: 'State' },
              ].map(({ k, p, col }) => (
                <input key={k} placeholder={p} value={lead[k]} onChange={e => setLead(x => ({ ...x, [k]: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${col === 2 ? 'col-span-2' : ''}`} />
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveLead} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:opacity-90 transition">
                Submit Details
              </button>
              <button onClick={() => setShowLead(false)} className="px-3 text-gray-400 text-xs hover:text-gray-600">Skip</button>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Actions */}
      { (
        <div className="flex-shrink-0 px-3 pt-2 pb-1 bg-white border-t border-gray-100">
          <p className="text-[11px] text-gray-400 mb-1.5 px-1">Quick questions</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
            {QUICK.map(({ label, icon: Icon, msg }) => (
              <button key={label} onClick={() => send(msg)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-2 rounded-full border border-blue-100 transition">
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input); }}
        className="flex-shrink-0 flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Type a question..." disabled={loading}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
        <button type="submit" disabled={!input.trim() || loading}
          className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shadow flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
