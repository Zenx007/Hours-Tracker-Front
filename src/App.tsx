import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Clock3,
  LogOut,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react";
import { HoursRecord, HoursRecordPayload, User as ApiUser, api } from "./api";

type Route = "landing" | "login" | "create-account" | "dashboard";

type RecordFormState = {
  date: string;
  startTime: string;
  endTime: string;
  whereToPlace: string;
  dailyResume: string;
};

const userStorageKey = "chronos:user";

const getRoute = (): Route => {
  if (window.location.hash === "#login") {
    return "login";
  }

  if (window.location.hash === "#create-account") {
    return "create-account";
  }

  if (window.location.hash === "#dashboard") {
    return "dashboard";
  }

  return "landing";
};

const loadStoredUser = (): ApiUser | null => {
  const rawUser = window.localStorage.getItem(userStorageKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as ApiUser;
  } catch {
    window.localStorage.removeItem(userStorageKey);
    return null;
  }
};

const getTodayValue = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const emptyRecordForm = (): RecordFormState => ({
  date: getTodayValue(),
  startTime: "09:00",
  endTime: "18:00",
  whereToPlace: "",
  dailyResume: "",
});

const normalizeDateValue = (value?: string) => value?.split("T")[0] || getTodayValue();

const normalizeTimeValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const isoTime = value.match(/T(\d{2}:\d{2})/);
  const rawTime = value.match(/^(\d{2}:\d{2})/);
  return isoTime?.[1] || rawTime?.[1] || "";
};

const calculateTotalHours = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) {
    return "00:00";
  }

  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;

  if (end < start) {
    end += 24 * 60;
  }

  const minutes = Math.max(end - start, 0);
  const hoursPart = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minutesPart = String(minutes % 60).padStart(2, "0");
  return `${hoursPart}:${minutesPart}`;
};

const formatRecordDate = (value: string) => {
  const [year, month, day] = normalizeDateValue(value).split("-");
  return [day, month, year].filter(Boolean).join("/");
};

const getRecordTotal = (record: HoursRecord) =>
  record.totalHours || calculateTotalHours(normalizeTimeValue(record.startTime), normalizeTimeValue(record.endTime));

const recordToForm = (record: HoursRecord): RecordFormState => ({
  date: normalizeDateValue(record.date),
  startTime: normalizeTimeValue(record.startTime),
  endTime: normalizeTimeValue(record.endTime),
  whereToPlace: record.whereToPlace || "",
  dailyResume: record.dailyResume || "",
});

const sumRecordMinutes = (records: HoursRecord[]) =>
  records.reduce((total, record) => {
    const [hours, minutes] = getRecordTotal(record).split(":").map(Number);
    return total + (Number.isNaN(hours) ? 0 : hours * 60) + (Number.isNaN(minutes) ? 0 : minutes);
  }, 0);

const formatMinutes = (minutes: number) => {
  const hoursPart = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  return `${hoursPart}h ${String(minutesPart).padStart(2, "0")}m`;
};

function App() {
  const [route, setRoute] = useState<Route>(() => {
    const initialRoute = getRoute();
    return initialRoute === "landing" && loadStoredUser() ? "dashboard" : initialRoute;
  });
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(() => loadStoredUser());
  const [records, setRecords] = useState<HoursRecord[]>([]);
  const [recordForm, setRecordForm] = useState<RecordFormState>(() => emptyRecordForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState("Conectando...");
  const isCreateAccount = route === "create-account";

  const navigate = useCallback((nextRoute: Route) => {
    setRoute(nextRoute);
    window.location.hash = nextRoute;
  }, []);

  const storeUserSession = useCallback(
    (user: ApiUser) => {
      window.localStorage.setItem(userStorageKey, JSON.stringify(user));
      setCurrentUser(user);
      setMessage(`Ola, ${user.name}.`);
      setError(null);
      navigate("dashboard");
    },
    [navigate],
  );

  const loadRecords = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    setIsRecordsLoading(true);
    setError(null);

    try {
      const userRecords = await api.getRecordsByUserId(currentUser.id);
      setRecords(userRecords);
    } catch (err) {
      setRecords([]);
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar os registros.");
    } finally {
      setIsRecordsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const syncRoute = () => {
      setRoute(getRoute());
    };

    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (route === "dashboard" && !currentUser) {
      navigate("login");
    }
  }, [currentUser, navigate, route]);

  useEffect(() => {
    if (route !== "dashboard" || !currentUser) {
      return;
    }

    api
      .health()
      .then((status) => setApiStatus(status))
      .catch((err) => setApiStatus(err instanceof Error ? err.message : "API indisponivel"));

    loadRecords();
  }, [currentUser, loadRecords, route]);

  const totals = useMemo(() => {
    const today = getTodayValue();
    const todayRecords = records.filter((record) => normalizeDateValue(record.date) === today);

    return {
      today: formatMinutes(sumRecordMinutes(todayRecords)),
      all: formatMinutes(sumRecordMinutes(records)),
      count: records.length,
    };
  }, [records]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();

    try {
      const user = isCreateAccount ? await api.createUser({ name, email }) : await api.login(email);
      storeUserSession(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel autenticar.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRecordChange = (field: keyof RecordFormState, value: string) => {
    setRecordForm((current) => ({ ...current, [field]: value }));
  };

  const buildRecordPayload = (): HoursRecordPayload | null => {
    if (!currentUser) {
      return null;
    }

    return {
      id: editingId || undefined,
      date: recordForm.date,
      startTime: recordForm.startTime,
      endTime: recordForm.endTime,
      totalHours: calculateTotalHours(recordForm.startTime, recordForm.endTime),
      whereToPlace: recordForm.whereToPlace.trim(),
      dailyResume: recordForm.dailyResume.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
    };
  };

  const handleRecordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = buildRecordPayload();

    if (!payload) {
      return;
    }

    setIsSavingRecord(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await api.updateRecord({ ...payload, id: editingId });
        setMessage("Registro atualizado.");
      } else {
        await api.createRecord(payload);
        setMessage("Registro criado.");
      }

      setRecordForm(emptyRecordForm());
      setEditingId(null);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar o registro.");
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleEditRecord = (record: HoursRecord) => {
    setEditingId(record.id);
    setRecordForm(recordToForm(record));
    setMessage(`Editando registro #${record.id}.`);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRecordForm(emptyRecordForm());
    setMessage(null);
    setError(null);
  };

  const handleDeleteRecord = async (id: number) => {
    const shouldDelete = window.confirm("Remover este registro de horas?");

    if (!shouldDelete) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await api.deleteRecord(id);
      setMessage("Registro removido.");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel remover o registro.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(userStorageKey);
    setCurrentUser(null);
    setRecords([]);
    setRecordForm(emptyRecordForm());
    setEditingId(null);
    setMessage(null);
    setError(null);
    navigate("login");
  };

  if (route === "dashboard" && currentUser) {
    return (
      <main className="dashboard-page">
        <nav className="app-nav" aria-label="Chronos">
          <a className="nav-brand" href="#dashboard" onClick={() => navigate("dashboard")}>
            Chronos
          </a>
          <div className="session-actions">
            <span>{currentUser.name}</span>
            <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sair">
              <LogOut size={20} aria-hidden="true" />
            </button>
          </div>
        </nav>

        <section className="dashboard-header" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Hours tracker</p>
            <h1 id="dashboard-title">Registros de horas</h1>
            <p>{apiStatus}</p>
          </div>
          <button className="secondary-button compact-button" type="button" onClick={loadRecords} disabled={isRecordsLoading}>
            <RefreshCw size={18} aria-hidden="true" />
            Atualizar
          </button>
        </section>

        <section className="summary-grid" aria-label="Resumo">
          <div className="summary-card">
            <CalendarClock size={22} aria-hidden="true" />
            <span>Hoje</span>
            <strong>{totals.today}</strong>
          </div>
          <div className="summary-card">
            <Clock3 size={22} aria-hidden="true" />
            <span>Total registrado</span>
            <strong>{totals.all}</strong>
          </div>
          <div className="summary-card">
            <BarChart3 size={22} aria-hidden="true" />
            <span>Registros</span>
            <strong>{totals.count}</strong>
          </div>
        </section>

        {(message || error) && (
          <div className={`status-banner ${error ? "error-banner" : ""}`} role="status">
            {error || message}
          </div>
        )}

        <section className="work-area">
          <form className="record-form" onSubmit={handleRecordSubmit}>
            <header>
              <div>
                <p className="eyebrow">{editingId ? "Edicao" : "Novo registro"}</p>
                <h2>{editingId ? `Registro #${editingId}` : "Adicionar horas"}</h2>
              </div>
              {editingId && (
                <button className="icon-button" type="button" onClick={handleCancelEdit} aria-label="Cancelar edicao">
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </header>

            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="record-date">Data</label>
                <input
                  id="record-date"
                  type="date"
                  value={recordForm.date}
                  onChange={(event) => handleRecordChange("date", event.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="start-time">Inicio</label>
                <input
                  id="start-time"
                  type="time"
                  value={recordForm.startTime}
                  onChange={(event) => handleRecordChange("startTime", event.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="end-time">Fim</label>
                <input
                  id="end-time"
                  type="time"
                  value={recordForm.endTime}
                  onChange={(event) => handleRecordChange("endTime", event.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="total-hours">Total</label>
                <input id="total-hours" type="text" value={calculateTotalHours(recordForm.startTime, recordForm.endTime)} readOnly />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="where-to-place">Projeto / destino</label>
              <input
                id="where-to-place"
                type="text"
                value={recordForm.whereToPlace}
                onChange={(event) => handleRecordChange("whereToPlace", event.target.value)}
                placeholder="Projeto X"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="daily-resume">Resumo do dia</label>
              <textarea
                id="daily-resume"
                value={recordForm.dailyResume}
                onChange={(event) => handleRecordChange("dailyResume", event.target.value)}
                placeholder="Desenvolvimento da feature Y"
                rows={5}
                required
              />
            </div>

            <button className="primary-button" type="submit" disabled={isSavingRecord}>
              {editingId ? <Save size={19} aria-hidden="true" /> : <Plus size={19} aria-hidden="true" />}
              {isSavingRecord ? "Salvando..." : editingId ? "Salvar alteracoes" : "Criar registro"}
            </button>
          </form>

          <section className="records-panel" aria-labelledby="records-title">
            <header>
              <div>
                <p className="eyebrow">Historico</p>
                <h2 id="records-title">Meus registros</h2>
              </div>
              {isRecordsLoading && <span className="loading-label">Carregando...</span>}
            </header>

            {records.length === 0 && !isRecordsLoading ? (
              <div className="empty-state">
                <Timer size={28} aria-hidden="true" />
                <strong>Nenhum registro ainda</strong>
                <span>Crie seu primeiro apontamento para enviar dados para a API.</span>
              </div>
            ) : (
              <div className="record-list">
                {records.map((record) => (
                  <article className="record-item" key={record.id}>
                    <div className="record-main">
                      <span>{formatRecordDate(record.date)}</span>
                      <strong>{record.whereToPlace}</strong>
                      <p>{record.dailyResume}</p>
                    </div>
                    <div className="record-meta">
                      <strong>{getRecordTotal(record)}</strong>
                      <span>
                        {normalizeTimeValue(record.startTime)} - {normalizeTimeValue(record.endTime)}
                      </span>
                    </div>
                    <div className="record-actions">
                      <button className="icon-button" type="button" onClick={() => handleEditRecord(record)} aria-label="Editar registro">
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button className="icon-button danger-button" type="button" onClick={() => handleDeleteRecord(record.id)} aria-label="Remover registro">
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }

  if (route === "landing") {
    return (
      <main className="landing-page">
        <nav className="landing-nav" aria-label="Primary">
          <a className="nav-brand" href="#landing" onClick={() => navigate("landing")}>
            Chronos
          </a>
          <div className="nav-actions">
            <a className="ghost-link" href="#login" onClick={() => navigate("login")}>
              Login
            </a>
            <a className="nav-button" href="#create-account" onClick={() => navigate("create-account")}>
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
              <a className="primary-button hero-button" href="#create-account" onClick={() => navigate("create-account")}>
                Get started
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="secondary-button" href="#login" onClick={() => navigate("login")}>
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
      <section className={`login-shell ${isCreateAccount ? "create-shell" : ""}`} aria-labelledby="auth-title">
        <header className="login-heading">
          <p className="brand-mark">Chronos</p>
          <h1 id="auth-title">{isCreateAccount ? "Criar conta" : "Bem-vindo de volta"}</h1>
          <p>{isCreateAccount ? "Crie seu usuario na API para registrar horas." : "Entre com o e-mail cadastrado na API."}</p>
        </header>

        <div className="login-card">
          <form className="login-form" onSubmit={handleAuthSubmit}>
            {isCreateAccount && (
              <div className="field-group">
                <label htmlFor="name">Nome completo</label>
                <div className="input-shell">
                  <User size={20} aria-hidden="true" />
                  <input id="name" name="name" type="text" autoComplete="name" placeholder="Joao Silva" required />
                </div>
              </div>
            )}

            <div className="field-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-shell">
                <Mail size={20} aria-hidden="true" />
                <input id="email" name="email" type="email" autoComplete="email" placeholder="nome@empresa.com" required />
              </div>
            </div>

            {(message || error) && (
              <div className={`status-banner ${error ? "error-banner" : ""}`} role="status">
                {error || message}
              </div>
            )}

            <button className="primary-button" type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? "Enviando..." : isCreateAccount ? "Criar conta" : "Login"}
            </button>
          </form>
        </div>

        <p className="signup-copy">
          {isCreateAccount ? "Ja tem uma conta? " : "Ainda nao tem conta? "}
          <a href={isCreateAccount ? "#login" : "#create-account"} onClick={() => navigate(isCreateAccount ? "login" : "create-account")}>
            {isCreateAccount ? "Login" : "Criar conta"}
          </a>
        </p>
      </section>
    </main>
  );
}

export default App;
