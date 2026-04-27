import { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1200));
    onLogin();
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={`${styles.loginCard} animate-pop-in`}>
        
        <div className={`${styles.header} animate-slide-up delay-100`}>
          <div className={styles.logo}>🔍</div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="animate-slide-up delay-200">
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className={styles.forgotPassword}>Forgot password?</span>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.loadingText}>Authenticating...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={`${styles.divider} animate-slide-up delay-300`}>
          Or continue with
        </div>

        <div className={`${styles.socialGroup} animate-slide-up delay-400`}>
          <button type="button" className={styles.socialBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.71 22.36 9.98H12V14.27H17.92C17.66 15.66 16.88 16.84 15.69 17.64V20.44H19.26C21.34 18.52 22.56 15.66 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.26 20.44L15.69 17.64C14.71 18.3 13.46 18.7 12 18.7C9.17 18.7 6.78 16.79 5.92 14.22H2.23V17.08C4.03 20.65 7.71 23 12 23Z" fill="#34A853"/>
              <path d="M5.92 14.22C5.7 13.56 5.58 12.87 5.58 12.16C5.58 11.45 5.7 10.76 5.92 10.1V7.24H2.23C1.49 8.71 1.05 10.38 1.05 12.16C1.05 13.94 1.49 15.61 2.23 17.08L5.92 14.22Z" fill="#FBBC05"/>
              <path d="M12 5.62C13.62 5.62 15.07 6.18 16.21 7.27L19.34 4.14C17.45 2.38 14.97 1.34 12 1.34C7.71 1.34 4.03 3.67 2.23 7.24L5.92 10.1C6.78 7.53 9.17 5.62 12 5.62Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className={styles.socialBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017C2 16.441 4.863 20.193 8.828 21.503C9.328 21.595 9.51 21.286 9.51 21.025C9.51 20.793 9.501 19.98 9.497 19.112C6.716 19.716 6.129 17.973 6.129 17.973C5.674 16.818 5.018 16.51 5.018 16.51C4.112 15.892 5.087 15.904 5.087 15.904C6.088 15.974 6.615 16.932 6.615 16.932C7.504 18.455 8.948 18.016 9.53 17.766C9.62 17.106 9.886 16.668 10.183 16.417C7.962 16.165 5.625 15.308 5.625 11.493C5.625 10.407 6.012 9.518 6.643 8.823C6.541 8.571 6.202 7.558 6.74 6.183C6.74 6.183 7.572 5.917 9.497 7.22C10.288 7 11.144 6.89 12 6.886C12.855 6.89 13.71 7 14.503 7.22C16.427 5.917 17.258 6.183 17.258 6.183C17.798 7.558 17.459 8.571 17.358 8.823C17.99 9.518 18.375 10.407 18.375 11.493C18.375 15.319 16.035 16.161 13.808 16.406C14.179 16.726 14.512 17.355 14.512 18.32C14.512 19.704 14.5 20.824 14.5 21.025C14.5 21.289 14.68 21.6 15.185 21.5C19.146 20.19 22 16.44 22 12.017C22 6.484 17.523 2 12 2Z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
