import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, KeyRound, Mail, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastProvider';
import api from '../../lib/api';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Timer effect for code verification step
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Password validation checks
  const isMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const isMatching = newPassword && newPassword === confirmPassword;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Masukkan alamat email Anda', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      addToast('Kode verifikasi telah dikirim ke email Anda!', 'success');
      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal mengirim kode verifikasi';
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 4) {
      addToast('Masukkan 4 digit kode verifikasi', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-code', { email, code });
      addToast('Kode verifikasi berhasil dikonfirmasi!', 'success');
      setStep(3);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Kode verifikasi salah atau kedaluwarsa';
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      addToast('Kode verifikasi baru telah dikirim!', 'success');
      setCountdown(60);
      setCanResend(false);
      setCode('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal mengirim ulang kode';
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      addToast('Mohon lengkapi semua kolom kata sandi', 'error');
      return;
    }

    if (!isMinLength || !hasNumber || !hasUppercase) {
      addToast('Kata sandi belum memenuhi kriteria keamanan', 'error');
      return;
    }

    if (!isMatching) {
      addToast('Konfirmasi kata sandi tidak cocok', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        password: newPassword,
        confirm_password: confirmPassword,
      });
      addToast('Kata sandi berhasil direset! Silakan masuk kembali.', 'success');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal mengganti kata sandi';
      addToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-4 font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
        
        {/* Back Button */}
        {step < 4 && (
          <div className="text-left mb-2">
            <button
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigate('/login');
                }
              }}
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {step === 1 ? 'Kembali ke Masuk' : 'Kembali'}
            </button>
          </div>
        )}

        {/* Step 1: Input Email */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-primary mb-2">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
                Lupa Kata Sandi?
              </h1>
              <p className="text-sm text-muted-foreground">
                Masukkan alamat email Anda untuk menerima 4 digit kode verifikasi.
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold rounded-full mt-6 h-11"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Email
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Input Verification Code */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
                Verifikasi Kode
              </h1>
              <p className="text-sm text-muted-foreground">
                Masukkan 4 digit kode verifikasi yang dikirim ke <span className="font-semibold text-gray-900">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6 text-left">
              <div className="space-y-2 text-center">
                <label className="text-sm font-medium leading-none text-gray-700 block text-left">
                  Kode Verifikasi
                </label>
                <Input
                  type="text"
                  maxLength={4}
                  placeholder="0000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="rounded-xl bg-gray-50 border-gray-200 text-center tracking-[1.2em] font-bold text-2xl h-14 focus:bg-white"
                  required
                />
              </div>

              <div className="flex flex-col items-center justify-center space-y-3 mt-4">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Kirim ulang kode dalam <span className="font-semibold text-primary">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Kirim Ulang Kode (Resend Code)
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-bold rounded-full h-11"
                disabled={isLoading || code.length !== 4}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Code
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-heading font-bold tracking-tight text-primary">
                Kata Sandi Baru
              </h1>
              <p className="text-sm text-muted-foreground">
                Buat kata sandi baru yang kuat untuk akun Anda.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700">Kata Sandi Baru</label>
                <Input
                  type="password"
                  placeholder="Masukkan kata sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-full bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700">Konfirmasi Kata Sandi Baru</label>
                <Input
                  type="password"
                  placeholder="Masukkan ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-full bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
              </div>

              {/* Security checklist */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mt-4 border border-gray-100 text-xs">
                <p className="font-semibold text-gray-700 mb-2">Ketentuan Kata Sandi:</p>
                <div className="flex items-center gap-2">
                  {isMinLength ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <span className={isMinLength ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    Minimal 8 karakter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    Menggunakan angka
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUppercase ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    Terdapat minimal 1 huruf kapital
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isMatching ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <span className={isMatching ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                    Kata sandi cocok
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-bold rounded-full mt-6 h-11"
                disabled={isLoading || !isMinLength || !hasNumber || !hasUppercase || !isMatching}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset & Ganti Sandi
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
