import { useState } from 'react';
import { GraduationCap, ArrowRight, Shield, RefreshCw, Loader2, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AuthFlow() {
  const { login } = useAuth();
  const [step, setStep] = useState(0); // 0=name+phone, 1=otp
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Please enter your full name');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter valid 10-digit mobile number');
    setLoading(true);
    try {
      const r = await api.sendOtp(name.trim(), phone);
      if (r.success) {
        setStep(1);
        if (r.devOtp) setDevOtp(r.devOtp);
      } else setError(r.error || 'Failed to send OTP');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) return setError('Enter valid 6-digit OTP');
    setLoading(true);
    try {
      const r = await api.verifyOtp(phone, otp);
      if (r.success) login(r.user, r.token);
      else setError(r.error || 'Invalid OTP');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      {/* Header */}
      <div className="pt-8 pb-6 px-6 text-center text-white flex-shrink-0">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold">ABC College</h1>
        <p className="text-blue-200 text-sm mt-0.5">Admission Assistant</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-7 pb-6 flex flex-col overflow-auto">
        {step === 0 ? (
          <>
            <h2 className="text-gray-800 text-lg font-semibold mb-1">Welcome! 👋</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your details to get started</p>
            <form onSubmit={handleSend} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium gap-1">
                    <Phone className="w-3.5 h-3.5" /> +91
                  </div>
                  <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="mt-auto pt-4">
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-blue-500/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Get OTP <ArrowRight className="w-4 h-4" /></>)}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">We'll send a 6-digit OTP to verify you</p>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-gray-800 text-lg font-semibold">Verify OTP</h2>
              <p className="text-gray-500 text-sm mt-0.5">Sent to +91 {phone}</p>
              {devOtp && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700">🔧 Dev OTP: <strong>{devOtp}</strong></p>
                </div>
              )}
            </div>
            <form onSubmit={handleVerify} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="• • • • • •" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-2xl tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="mt-auto pt-4 flex flex-col gap-3">
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-blue-500/25">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Start Chat'}
                </button>
                <button type="button" onClick={() => { setStep(0); setOtp(''); setError(''); setDevOtp(''); }}
                  className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 py-2 transition">
                  <RefreshCw className="w-3.5 h-3.5" /> Change number / Resend OTP
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
