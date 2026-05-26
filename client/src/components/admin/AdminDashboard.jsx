import { useState, useEffect, useRef } from 'react';
import {
  Users, MessageSquare, TrendingUp, UserCheck, Download,
  Search, Eye, LogOut, GraduationCap, Plus, Trash2, Edit3,
  Save, X, ChevronDown, ChevronRight, Database, HelpCircle, AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// ─── FAQ Manager ──────────────────────────────────────────────────────────────
function FaqManager({ token }) {
  const [faqs, setFaqs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', keywords: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.adminGetFaqs(token).then(r => { if (r.success) setFaqs(r.faqs || []); });
  }, [token]);

  const startEdit = (faq) => {
    setEditing(faq.id);
    setForm({ question: faq.question, answer: faq.answer, keywords: (faq.keywords || []).join(', ') });
    setMsg('');
  };

  const startNew = () => {
    setEditing('new');
    setForm({ question: '', answer: '', keywords: '' });
    setMsg('');
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setMsg('Question and answer are required.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      if (editing === 'new') {
        const r = await api.adminAddFaq(token, form);
        if (r.success) { setFaqs(p => [...p, r.faq]); setMsg('✅ FAQ added!'); }
        else setMsg('❌ ' + (r.error || 'Failed'));
      } else {
        const r = await api.adminUpdateFaq(token, editing, form);
        if (r.success) { setFaqs(p => p.map(f => f.id === editing ? r.faq : f)); setMsg('✅ Saved!'); }
        else setMsg('❌ ' + (r.error || 'Failed'));
      }
      setEditing(null);
    } catch { setMsg('❌ Network error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    const r = await api.adminDeleteFaq(token, id);
    if (r.success) setFaqs(p => p.filter(f => f.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-800 flex-1">FAQ Manager</h2>
        <button onClick={startNew}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {editing && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm font-semibold text-blue-800 mb-3">
            {editing === 'new' ? '➕ New FAQ' : '✏️ Edit FAQ'}
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
              <input
                placeholder="e.g. What is the fee for BCA?"
                value={form.question}
                onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
              <textarea
                rows={3}
                placeholder="The annual fee for BCA is ₹65,000."
                value={form.answer}
                onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Keywords <span className="text-gray-400">(comma separated — what students might type)</span>
              </label>
              <input
                placeholder="bca fee, bca cost, bca charges, bachelor fee"
                value={form.keywords}
                onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            {msg && (
              <p className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {msg}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save FAQ'}
              </button>
              <button onClick={() => { setEditing(null); setMsg(''); }}
                className="flex items-center gap-1.5 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {faqs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            No FAQs yet. Click "Add FAQ" to create your first one!
          </p>
        )}
        {faqs.map(faq => (
          <div key={faq.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{faq.question}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{faq.answer}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(faq.keywords || []).map(kw => (
                    <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(faq)}
                  className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(faq.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Data Editor — FIXED: no crash on keypress ────────────────────────────────
function DataEditor({ token }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({}); // raw text per section
  const [jsonErrors, setJsonErrors] = useState({}); // parse error per section
  const [saving, setSaving] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.adminGetData(token).then(r => {
      if (r.success) {
        setData(r.data);
        // Initialize drafts as formatted JSON strings
        const d = {};
        Object.keys(r.data).forEach(k => { d[k] = JSON.stringify(r.data[k], null, 2); });
        setDrafts(d);
      }
    });
  }, [token]);

  const handleTextChange = (section, text) => {
    // Always update the raw text — never crash
    setDrafts(p => ({ ...p, [section]: text }));
    // Try to parse silently — only update data if valid
    try {
      const parsed = JSON.parse(text);
      setData(p => ({ ...p, [section]: parsed }));
      setJsonErrors(p => ({ ...p, [section]: '' }));
    } catch {
      // Invalid JSON mid-edit — just show error, don't crash
      setJsonErrors(p => ({ ...p, [section]: '⚠️ Invalid JSON — fix before saving' }));
    }
  };

  const saveSection = async (section) => {
    if (jsonErrors[section]) {
      setSaveMsg('❌ Fix JSON errors before saving');
      return;
    }
    setSaving(section);
    setSaveMsg('');
    try {
      const r = await api.adminUpdateSection(token, section, data[section]);
      if (r.success) setSaveMsg(`✅ ${section} saved!`);
      else setSaveMsg('❌ ' + (r.error || 'Save failed'));
    } catch {
      setSaveMsg('❌ Network error');
    }
    setSaving('');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (!data) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
      Loading college data...
    </div>
  );

  const sections = [
    { key: 'college', label: '🏫 College Info', desc: 'Name, phone, email, address, website' },
    { key: 'courses', label: '📚 Courses', desc: `${data.courses?.length || 0} programs with fees` },
    { key: 'scholarships', label: '🎓 Scholarships', desc: `${data.scholarships?.length || 0} scholarships` },
    { key: 'hostel', label: '🏠 Hostel', desc: 'Boys & girls hostel facilities and fees' },
    { key: 'placements', label: '💼 Placements', desc: 'Package stats and top recruiters' },
    { key: 'importantDates', label: '📅 Important Dates', desc: 'Application deadlines and schedules' },
    { key: 'admissionProcess', label: '📝 Admission Process', desc: 'Step-by-step process list' },
    { key: 'documentsRequired', label: '📋 Documents Required', desc: 'List of required documents' },
    { key: 'theme', label: '🎨 Bot Theme', desc: 'Bot name, colors, welcome message' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <Database className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">College Data Editor</h2>
          <p className="text-xs text-gray-400">Edit your college info — changes take effect immediately in the chatbot</p>
        </div>
        {saveMsg && (
          <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${saveMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {saveMsg}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {sections.map(({ key, label, desc }) => (
          <div key={key}>
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition text-left"
            >
              {open === key
                ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              }
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              {jsonErrors[key] && <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            </button>

            {open === key && (
              <div className="px-4 pb-4">
                <textarea
                  rows={14}
                  value={drafts[key] || ''}
                  onChange={e => handleTextChange(key, e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 bg-gray-50 resize-y ${
                    jsonErrors[key]
                      ? 'border-amber-300 focus:ring-amber-400'
                      : 'border-gray-200 focus:ring-purple-500'
                  }`}
                  spellCheck={false}
                />
                {jsonErrors[key] && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {jsonErrors[key]}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => saveSection(key)}
                    disabled={!!saving || !!jsonErrors[key]}
                    className="flex items-center gap-1.5 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving === key ? 'Saving...' : 'Save Changes'}
                  </button>
                  <p className="text-xs text-gray-400">Changes apply instantly to the bot — no restart needed</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState('leads');
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [convs, setConvs] = useState([]);
  const [selConv, setSelConv] = useState(null);
  const [convMsgs, setConvMsgs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminStats(token).then(r => { if (r.success) setStats(r.stats); });
  }, [token]);

  useEffect(() => {
    setLoading(true);
    if (tab === 'leads') {
      const q = new URLSearchParams();
      if (statusFilter) q.set('status', statusFilter);
      if (search) q.set('search', search);
      api.adminLeads(token, q.toString()).then(r => {
        if (r.success) setLeads(r.leads || []);
        setLoading(false);
      });
    } else if (tab === 'conversations') {
      api.adminSessions(token).then(r => {
        if (r.success) setConvs(r.sessions || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [tab, token, statusFilter, search]);

  const viewConv = async (sid) => {
    setSelConv(sid);
    const r = await api.adminMessages(token, sid);
    if (r.success) setConvMsgs(r.messages || []);
  };

  const updateStatus = async (id, status) => {
    const r = await api.adminUpdateLead(token, id, { status });
    if (r.success) setLeads(p => p.map(l => l._id === id ? { ...l, status } : l));
  };

  // ── Fixed export: pass token in URL so server can authenticate ──
  const handleExport = () => { window.open(api.exportUrl(token), '_blank'); };

  const TABS = [
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'conversations', label: 'Chats', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'data', label: 'College Data', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shadow-sm flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">College Bot</p>
            <p className="text-[11px] text-gray-400">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Stat icon={Users} label="Total Leads" value={stats?.totalLeads} color="bg-blue-50 text-blue-600" />
          <Stat icon={UserCheck} label="Verified Users" value={stats?.totalUsers} color="bg-green-50 text-green-600" />
          <Stat icon={MessageSquare} label="Chat Sessions" value={stats?.totalSessions} color="bg-purple-50 text-purple-600" />
          <Stat icon={TrendingUp} label="New Leads" value={stats?.newLeads} color="bg-amber-50 text-amber-600" />
          <Stat icon={UserCheck} label="Converted" value={stats?.converted} color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Leads Tab */}
        {tab === 'leads' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <h2 className="font-semibold text-gray-800 flex-1">Student Leads</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone..."
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                <option value="">All Status</option>
                {['new', 'contacted', 'converted', 'lost'].map(s =>
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                )}
              </select>
              {/* ── Fixed Export button ── */}
              <button onClick={handleExport}
                className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Phone', 'Course', 'City', 'Year', 'Status', 'Date', 'Update'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
                    : leads.length === 0
                      ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">No leads found</td></tr>
                      : leads.map(l => (
                        <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">{l.userId?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{l.userId?.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{l.courseInterest || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{l.city || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{l.passingYear || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[l.status]}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(l.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <select value={l.status} onChange={e => updateStatus(l._id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                              {['new', 'contacted', 'converted', 'lost'].map(s =>
                                <option key={s} value={s}>{s}</option>
                              )}
                            </select>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {tab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Chat Sessions</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {loading
                  ? <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>
                  : convs.length === 0
                    ? <p className="text-center py-8 text-gray-400 text-sm">No conversations yet</p>
                    : convs.map(s => (
                      <button key={s._id} onClick={() => viewConv(s.sessionId)}
                        className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition text-left ${selConv === s.sessionId ? 'bg-blue-50' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {(s.userId?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{s.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{s.userId?.phone}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(s.lastActivity).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </button>
                    ))
                }
              </div>
            </div>

            {selConv && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-[600px]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">Conversation</h3>
                  <button onClick={() => setSelConv(null)} className="text-xs text-gray-400 hover:text-gray-600">
                    ✕ Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {convMsgs.length === 0
                    ? <p className="text-center text-gray-400 text-sm py-6">No messages</p>
                    : convMsgs.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                          m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                          <p className={`text-[10px] mt-0.5 ${m.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'faqs' && <FaqManager token={token} />}
        {tab === 'data' && <DataEditor token={token} />}
      </main>
    </div>
  );
}
