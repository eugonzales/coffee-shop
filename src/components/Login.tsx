import React, { useState } from 'react';
import { ArrowLeft, Coffee, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateEmail } from '../utils/validation';
import './Login.css';

interface LoginProps {
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setErrors(['Invalid email or password']);
        }
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

        const success = await register(formData.email, formData.password, formData.name);
        if (!success) {
          setErrors(['Email already exists']);
        }
      }
    } catch {
      setErrors(['An error occurred. Please try again.']);
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
            <p className="auth-eyebrow">{isLogin ? 'Good to see you' : 'Join our table'}</p>
            <h2>{isLogin ? 'Welcome back.' : 'Make yourself at home.'}</h2>
            <p>
              {isLogin
                ? 'Sign in to order your favorites and pick up where you left off.'
                : 'Create an account to order ahead and make every cup yours.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
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
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <p>{isLogin ? "Don't have an account?" : 'Already have an account?'}</p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
                setErrors([]);
              }}
            >
              <UserPlus size={16} aria-hidden="true" />
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>

          {isLogin && (
            <aside className="auth-demo">
              <p className="auth-demo-heading">Demo admin access</p>
              <p><strong>Email</strong><span>admin@miakape.test</span></p>
              <p><strong>Password</strong><span>admin123</span></p>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;