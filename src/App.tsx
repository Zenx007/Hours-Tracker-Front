import { useEffect, useState } from "react";
import { LockKeyhole, Mail, User } from "lucide-react";

function App() {
  const [isCreateAccount, setIsCreateAccount] = useState(
    () => window.location.hash === "#create-account",
  );

  useEffect(() => {
    const syncRoute = () => {
      setIsCreateAccount(window.location.hash === "#create-account");
    };

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  return (
    <main className="login-page">
      <section
        className={`login-shell ${isCreateAccount ? "create-shell" : ""}`}
        aria-labelledby="auth-title"
      >
        <header className="login-heading">
          <p className="brand-mark">Chronos</p>
          <h1 id="auth-title">
            {isCreateAccount ? "Create account" : "Welcome back"}
          </h1>
          <p>
            {isCreateAccount
              ? "Set up your account to start tracking work hours."
              : "Enter your details to access your dashboard."}
          </p>
        </header>

        <div className="login-card">
          <form className="login-form" action="#" method="post">
            {isCreateAccount && (
              <div className="field-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-shell">
                  <User size={20} aria-hidden="true" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Developer"
                    required
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="email">
                {isCreateAccount ? "Email" : "Email or Username"}
              </label>
              <div className="input-shell">
                <Mail size={20} aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <div className="input-shell">
                <LockKeyhole size={20} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isCreateAccount ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isCreateAccount && (
              <div className="field-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-shell">
                  <LockKeyhole size={20} aria-hidden="true" />
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-options">
              <label className="remember-option" htmlFor="remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  required={isCreateAccount}
                />
                <span>{isCreateAccount ? "I agree to the terms" : "Remember me"}</span>
              </label>
            </div>

            <button className="primary-button" type="submit">
              {isCreateAccount ? "Create account" : "Login"}
            </button>
          </form>
        </div>

        <p className="signup-copy">
          {isCreateAccount ? "Already have an account? " : "Don't have an account? "}
          <a
            href={isCreateAccount ? "#login" : "#create-account"}
            onClick={() => setIsCreateAccount(!isCreateAccount)}
          >
            {isCreateAccount ? "Login" : "Create an account"}
          </a>
        </p>
      </section>
    </main>
  );
}

export default App;
