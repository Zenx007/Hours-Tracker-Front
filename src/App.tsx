import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, CalendarClock, LockKeyhole, Mail, Timer, User } from "lucide-react";

type Route = "landing" | "login" | "create-account";

const getRoute = (): Route => {
  if (window.location.hash === "#login") {
    return "login";
  }

  if (window.location.hash === "#create-account") {
    return "create-account";
  }

  return "landing";
};

function App() {
  const [route, setRoute] = useState<Route>(() => getRoute());
  const isCreateAccount = route === "create-account";

  useEffect(() => {
    const syncRoute = () => {
      setRoute(getRoute());
    };

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  if (route === "landing") {
    return (
      <main className="landing-page">
        <nav className="landing-nav" aria-label="Primary">
          <a className="nav-brand" href="#landing" onClick={() => setRoute("landing")}>
            Chronos
          </a>
          <div className="nav-actions">
            <a className="ghost-link" href="#login" onClick={() => setRoute("login")}>
              Login
            </a>
            <a className="nav-button" href="#create-account" onClick={() => setRoute("create-account")}>
              Start
            </a>
          </div>
        </nav>

        <section className="hero-section" aria-labelledby="landing-title">
          <div className="hero-copy">
            <p className="eyebrow">Time tracking for focused teams</p>
            <h1 id="landing-title">Record hours with less friction and clearer context.</h1>
            <p>
              Chronos helps teams log shifts, review work patterns, and keep every hour easy
              to audit without slowing down the day.
            </p>
            <div className="hero-actions">
              <a className="primary-button hero-button" href="#create-account" onClick={() => setRoute("create-account")}>
                Get started
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="secondary-button" href="#login" onClick={() => setRoute("login")}>
                Login
              </a>
            </div>
          </div>

          <div className="product-panel" aria-label="Chronos overview">
            <div className="panel-header">
              <span>Today</span>
              <strong>07h 45m</strong>
            </div>
            <div className="timer-card">
              <Timer size={28} aria-hidden="true" />
              <div>
                <span>Active record</span>
                <strong>Design review</strong>
              </div>
              <p>02:18:42</p>
            </div>
            <div className="metric-grid">
              <div>
                <CalendarClock size={22} aria-hidden="true" />
                <span>Week</span>
                <strong>38h</strong>
              </div>
              <div>
                <BarChart3 size={22} aria-hidden="true" />
                <span>Focus</span>
                <strong>86%</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
            onClick={() => setRoute(isCreateAccount ? "login" : "create-account")}
          >
            {isCreateAccount ? "Login" : "Create an account"}
          </a>
        </p>
      </section>
    </main>
  );
}

export default App;
