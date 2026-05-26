import { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminLogin({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.adminLogin(phone, password);
      if (r.success) onLogin(r.token, r.user);
      else setError(r.error || 'Invalid credentials');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">ABC College · Chatbot Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Admin phone"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60 shadow-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
