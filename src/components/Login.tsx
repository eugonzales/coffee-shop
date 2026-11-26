import React, { useState } from 'react';
import { ArrowLeft, Coffee, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateEmail } from '../utils/validation';
import './Login.css';

interface LoginProps {
  onBack?: () => void;
  passwordRecovery?: boolean;
}

const Login: React.FC<LoginProps> = ({ onBack, passwordRecovery = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetRequest, setIsResetRequest] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(passwordRecovery);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, requestPasswordReset, updatePassword } = useAuth();

  React.useEffect(() => {
    setIsPasswordRecovery(passwordRecovery);
  }, [passwordRecovery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setNotice('');

    try {
      if (isPasswordRecovery) {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          setErrors(passwordValidation.errors);
          return;
        }
        await updatePassword(formData.password);
        setIsPasswordRecovery(false);
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '' });
        setNotice('Password updated. You can now sign in with your new password.');
      } else if (isResetRequest) {
        if (!validateEmail(formData.email)) {
          setErrors(['Please enter a valid email address']);
          return;
        }
        await requestPasswordReset(formData.email);
        setNotice('If that email has an account, a password reset link is on its way.');
      } else if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // Validate form data
        const validationErrors: string[] = [];
        
        if (!formData.name.trim()) {
          validationErrors.push('Name is required');
        }
        
        if (!validateEmail(formData.email)) {
          validationErrors.push('Please enter a valid email address');
        }
        
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          validationErrors.push(...passwordValidation.errors);
        }
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        const requiresEmailConfirmation = await register(
          formData.email,
          formData.password,
          formData.name,
        );
        if (requiresEmailConfirmation) {
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', name: '' });
          setNotice('Account created. Check your email to confirm your address before signing in.');
        }
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unable to complete sign-in. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <section className="auth-story" aria-label="mia.kape coffee shop">
        <img className="auth-story-image" src="/images/coffee.jpg" alt="" />
        <div className="auth-story-overlay" />
        <div className="auth-story-content">
          <a className="auth-brand" href="/" aria-label="mia.kape home">
            <span className="auth-brand-mark"><Coffee size={19} aria-hidden="true" /></span>
            <span>mia.kape</span>
          </a>
          <div className="auth-story-message">
            <p className="auth-eyebrow">Good coffee, good company</p>
            <h1>Your daily pause,<br /><em>starts here.</em></h1>
            <p>Thoughtful coffee, made fresh and ready when you are.</p>
          </div>
          <p className="auth-story-footer">A little pause. A really good cup.</p>
        </div>
      </section>

      <main className="auth-panel">
        <div className="auth-panel-inner">
          {onBack && (
            <button type="button" onClick={onBack} className="auth-back">
              <ArrowLeft size={16} aria-hidden="true" /> Back to mia.kape
            </button>
          )}

          <div className="auth-heading">
            <p className="auth-eyebrow">
              {isPasswordRecovery ? 'Secure your account' : isResetRequest ? 'Account recovery' : isLogin ? 'Good to see you' : 'Join our table'}
            </p>
            <h2>
              {isPasswordRecovery
                ? 'Choose a new password.'
                : isResetRequest
                  ? 'Reset your password.'
                  : isLogin
                    ? 'Welcome back.'
                    : 'Make yourself at home.'}
            </h2>
            <p>
              {isPasswordRecovery
                ? 'Choose a new password for your mia.kape account.'
                : isResetRequest
                  ? 'We’ll email you a secure link to reset your password.'
                  : isLogin
                ? 'Sign in to order your favorites and pick up where you left off.'
                : 'Create an account to order ahead and make every cup yours.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            {!isLogin && !isResetRequest && !isPasswordRecovery && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            {!isPasswordRecovery && (
              <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              </div>
            )}

            {!isResetRequest && (
              <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword
                    ? <EyeOff size={18} aria-hidden="true" />
                    : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="auth-errors" role="alert" aria-live="polite">
                <ul>
                  {errors.map((error, index) => <li key={index}>{error}</li>)}
                </ul>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Please wait…
                </>
              ) : (
                isPasswordRecovery
                  ? 'Update password'
                  : isResetRequest
                    ? 'Send reset link'
                    : isLogin
                      ? 'Sign in'
                      : 'Create account'
              )}
            </button>
          </form>

          {isLogin && !isResetRequest && !isPasswordRecovery && (
            <button type="button" className="auth-recovery-link" onClick={() => {
              setIsResetRequest(true);
              setNotice('');
              setErrors([]);
            }}>
              Forgot password?
            </button>
          )}

          {!isPasswordRecovery && (
            <div className="auth-toggle">
              <p>{isResetRequest ? 'Remembered your password?' : isLogin ? "Don't have an account?" : 'Already have an account?'}</p>
              <button
                type="button"
                onClick={() => {
                  if (isResetRequest) {
                    setIsResetRequest(false);
                    setIsLogin(true);
                  } else {
                    setIsLogin(!isLogin);
                  }
                  setFormData({ email: '', password: '', name: '' });
                  setErrors([]);
                  setNotice('');
                }}
              >
                <UserPlus size={16} aria-hidden="true" />
                {isResetRequest ? 'Sign in' : isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Login;