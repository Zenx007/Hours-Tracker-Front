import {
  ArrowRight,
  Braces,
  CheckCircle2,
  ClipboardList,
  Code2,
  Command,
  History,
  MonitorDot,
  TerminalSquare,
} from "lucide-react";

const codeLines = [
  { indent: 0, type: "muted", text: "const startWorkSession = async () => {" },
  { indent: 1, type: "blue", text: "const task = await selectTask();" },
  { indent: 1, type: "green", text: "timer.start({ project: task.project });" },
  { indent: 1, type: "muted", text: "while (timer.isRunning) {" },
  { indent: 2, type: "cyan", text: "await recordFocusBlock(task.id);" },
  { indent: 2, type: "orange", text: "syncWorkspace('manual-entry');" },
  { indent: 1, type: "muted", text: "}" },
  { indent: 1, type: "green", text: "return timesheet.commit();" },
  { indent: 0, type: "muted", text: "};" },
];

const secondaryLines = [
  "task: refactor billing adapter",
  "project: chronos-web",
  "elapsed: 02:18:41",
  "status: awaiting commit",
];

const features = [
  {
    icon: ClipboardList,
    tone: "cyan",
    title: "Registro Manual Simples",
    description:
      "Lance suas horas de trabalho em segundos. Sem a pressão de cronômetros rodando, apenas uma interface limpa para registrar sua produtividade diária.",
  },
  {
    icon: History,
    tone: "green",
    title: "Gerenciamento de Histórico",
    description:
      "Visualize e edite seus registros de tempo facilmente. Mantenha um histórico claro de onde suas horas foram investidas de forma intuitiva.",
  },
  {
    icon: MonitorDot,
    tone: "amber",
    title: "Interface Focada em Devs",
    description:
      "Um design limpo, nativo no modo escuro, que se integra naturalmente ao seu ambiente de trabalho e não distrai você do código principal.",
  },
];

function App() {
  return (
    <main className="site-shell">
      <header className="site-header" aria-label="Topo">
        <a className="brand" href="#" aria-label="Chronos">
          <span>Chronos</span>
          <b>_</b>
        </a>

        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#features">/features</a>
          <a href="#docs">/docs</a>
          <a href="#api">/api</a>
        </nav>

        <div className="header-actions">
          <a className="login-link" href="#login">
            login
          </a>
          <a className="signup-link" href="#signup">
            sign_up
          </a>
        </div>
      </header>

      <section className="hero-section">
        <div className="grid-backdrop" aria-hidden="true" />
        <div className="hero-copy">
          <h1>
            Domine seu tempo de <span>execução</span>
          </h1>
          <p>
            A solução simples de registro de horas desenvolvida para
            engenheiros. Lance suas horas manualmente e mantenha o foco no que
            realmente importa: seu código.
          </p>
          <a className="primary-cta" href="#signup">
            Começar Agora
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="editor-frame" aria-label="Previa do workspace Chronos">
          <div className="editor-sidebar" aria-hidden="true">
            <span className="active">src</span>
            <span>tasks</span>
            <span>logs</span>
            <span>api</span>
            <span>docs</span>
            <span>types</span>
            <span>tests</span>
          </div>

          <div className="editor-body">
            <div className="editor-tabs" aria-hidden="true">
              <span>work_session.ts</span>
              <span>timesheet.json</span>
            </div>

            <div className="code-pane">
              {codeLines.map((line, index) => (
                <div className="code-line" key={`${line.text}-${index}`}>
                  <span className="line-number">{String(index + 12).padStart(2, "0")}</span>
                  <code
                    className={`syntax-${line.type}`}
                    style={{ paddingLeft: `${line.indent * 22}px` }}
                  >
                    {line.text}
                  </code>
                </div>
              ))}
            </div>

            <div className="console-pane">
              <span className="console-title">session.output</span>
              {secondaryLines.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading centered">
          <h2>
            Foco e <span>Simplicidade</span>
          </h2>
          <p>
            Ferramentas simples projetadas para reduzir distrações e manter
            você focado no código, não na administração.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.title}>
                <div className={`feature-icon ${feature.tone}`}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ecosystem-section" id="docs">
        <div className="ecosystem-copy">
          <span className="section-kicker">developer-first</span>
          <h2>
            Construido para o ecossistema <span>&lt;dev/&gt;</span>
          </h2>
          <p>
            Criado especificamente para as necessidades técnicas de engenheiros
            de software, DevOps e data scientists.
          </p>
        </div>

        <div className="device-art" aria-label="Mesa de trabalho com código">
          <div className="ambient-light" aria-hidden="true" />
          <div className="desk-window">
            <div className="window-controls" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="device-code">
              <code className="cyan">function track()</code>
              <code className="green">commit("02:18:41")</code>
              <code className="orange">sync(workspace)</code>
              <code className="cyan">return report</code>
            </div>
          </div>
          <div className="device-base" aria-hidden="true" />
          <div className="coffee-cup" aria-hidden="true" />
          <div className="keyboard" aria-hidden="true">
            {Array.from({ length: 26 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" id="api">
        <div className="cta-card">
          <div className="cta-icons" aria-hidden="true">
            <TerminalSquare size={22} />
            <Braces size={22} />
            <Command size={22} />
            <CheckCircle2 size={22} />
          </div>
          <h2>
            Pronto para inicializar seu <span>workspace</span>?
          </h2>
          <p>
            Junte-se a milhares de desenvolvedores que simplificaram o registro
            de horas nos seus workflows técnicos.
          </p>
          <a className="primary-cta" href="#signup">
            Cadastrar agora
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#" aria-label="Chronos">
            <span>Chronos</span>
            <b>_</b>
          </a>
          <small>© 2024 Chronos Tech. All rights reserved.</small>
        </div>

        <nav aria-label="Links secundarios">
          <a href="#privacy">/privacy</a>
          <a href="#terms">/terms</a>
          <a href="#support">/support</a>
          <a href="#api-docs">/api-docs</a>
        </nav>
      </footer>
    </main>
  );
}

export default App;
