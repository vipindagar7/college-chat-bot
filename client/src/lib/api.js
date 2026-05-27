// In production: API calls go to /chatbot-api/ (NGINX proxies to port 3001)
// In dev:        API calls go to http://localhost:3001 (Vite proxies /api)

const getApiBase = () => {
  // Check if running inside the widget iframe (apiBase passed as query param)
  const params = new URLSearchParams(window.location.search);
  const fromWidget = params.get('apiBase');
  if (fromWidget) return fromWidget.replace(/\/$/, '');

  // Production: use relative path (NGINX handles routing)
  if (import.meta.env.PROD) return '';

  // Dev: explicit localhost
  return import.meta.env.VITE_API_BASE || 'http://localhost:3001';
};

// In production: /chatbot-api/auth/send-otp
// In dev:        http://localhost:3001/api/auth/send-otp
const apiPath = (path) => {
  const base = getApiBase();
  if (import.meta.env.PROD && !base) {
    // production — use /chatbot-api prefix
    return `/chatbot-api${path}`;
  }
  return `${base}/${path}`;
};

const h = (tok) => ({
  'Content-Type': 'application/json',
  ...(tok ? { Authorization: `Bearer ${tok}` } : {})
});

const post = (url, body, tok) =>
  fetch(url, { method: 'POST', headers: h(tok), body: JSON.stringify(body) }).then(r => r.json());
const get = (url, tok) =>
  fetch(url, { headers: h(tok) }).then(r => r.json());
const patch = (url, body, tok) =>
  fetch(url, { method: 'PATCH', headers: h(tok), body: JSON.stringify(body) }).then(r => r.json());
const del = (url, tok) =>
  fetch(url, { method: 'DELETE', headers: h(tok) }).then(r => r.json());
const put = (url, body, tok) =>
  fetch(url, { method: 'PUT', headers: h(tok), body: JSON.stringify(body) }).then(r => r.json());

export const api = {
  // Auth
  sendOtp:  (name, phone)           => post(apiPath('/auth/send-otp'), { name, phone }),
  verifyOtp: (phone, otp)           => post(apiPath('/auth/verify-otp'), { phone, otp }),
  // Chat
  startSession: (tok, widgetId)     => post(apiPath('/chat/session'), { widgetId }, tok),
  sendMessage:  (tok, message, sid) => post(apiPath('/chat/message'), { message, sessionId: sid }, tok),
  saveLead:     (tok, data)         => post(apiPath('/chat/lead'), data, tok),
  // Admin
  adminLogin:        (phone, pw)       => post(apiPath('/admin/login'), { phone, password: pw }),
  adminStats:        (tok)             => get(apiPath('/admin/stats'), tok),
  adminLeads:        (tok, q = '')     => get(`${apiPath('/admin/leads')}?${q}`, tok),
  adminUpdateLead:   (tok, id, data)   => patch(apiPath(`/admin/leads/${id}`), data, tok),
  adminSessions:     (tok)             => get(apiPath('/admin/conversations'), tok),
  adminMessages:     (tok, sid)        => get(apiPath(`/admin/conversations/${sid}`), tok),
  // Data / FAQs
  adminGetData:      (tok)             => get(apiPath('/admin/data'), tok),
  adminUpdateSection:(tok, sec, val)   => patch(apiPath(`/admin/data/${sec}`), { value: val }, tok),
  adminGetFaqs:      (tok)             => get(apiPath('/admin/faqs'), tok),
  adminAddFaq:       (tok, data)       => post(apiPath('/admin/faqs'), data, tok),
  adminUpdateFaq:    (tok, id, data)   => put(apiPath(`/admin/faqs/${id}`), data, tok),
  adminDeleteFaq:    (tok, id)         => del(apiPath(`/admin/faqs/${id}`), tok),
  // Export — token passed in URL (browser download, can't send headers)
  exportUrl: (tok) => `${apiPath('/admin/leads/export')}?token=${encodeURIComponent(tok)}`,
};
