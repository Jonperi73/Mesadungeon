// Player authentication UI
// Loaded by index.html. Keep script order unless moving to a build step.

const PlayerAuthCard = ({ authUser, account, onLogin, onRegister, onLogout, onSetName, onResendVerification }) => {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [working, setWorking] = useState(false);

  const isPlayer = account && account.role === "player" && account.status === "approved";

  const isOwnerOrDm = (account && account.role === "owner") || (account && account.role === "dm");

  if (isOwnerOrDm) return null;

  const submitLogin = async () => {
    if (!email.trim() || !password) return;
    setWorking(true);
    try { await onLogin({ email: email.trim(), password }); }
    finally { setWorking(false); }
  };

  const submitRegister = async () => {
    if (!displayName.trim() || !email.trim() || password.length < 6) return;
    setWorking(true);
    try { await onRegister({ displayName: displayName.trim(), email: email.trim(), password }); }
    finally { setWorking(false); }
  };

  if (authUser && isPlayer) {
  return (
    <div className="card" style={{ padding: 14, marginBottom: 18, borderColor: "rgba(201,168,76,.35)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: 13, color: "var(--gold)" }}>⚔ Jugador conectado</div>
          <div style={{fontSize:12,color:"var(--text)"}}>{(account&&account.displayName)||authUser.displayName}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{authUser.email}</div>
          {!authUser.emailVerified && (
            <div style={{fontSize:11,color:"#E24B4A",marginTop:4,fontFamily:"Cinzel,serif"}}>
              Email no verificado. Revisa tu bandeja de entrada.
            </div>
          )}
          {!authUser.emailVerified && (
            <button className="btn btn-sm btn-r" disabled={working} onClick={async()=>{setWorking(true);try{await onResendVerification();}finally{setWorking(false);}}} style={{marginTop:8}}>
              Reenviar email de verificacion
            </button>
          )}
          {false && !authUser.emailVerified && (
            <div style={{fontSize:11,color:"#E24B4A",marginTop:4,fontFamily:"Cinzel,serif"}}>
              ⚠ Email no verificado — revisá tu bandeja de entrada
            </div>
          )}
        </div>
        <button className="btn btn-sm" onClick={onLogout}>Salir</button>
      </div>
    </div>
  );
}

  if (authUser && !account) {
    return null;
  }

  return (
    <div className="card" style={{ padding: 18, marginBottom: 18 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "Cinzel,serif", fontSize: 14, color: "var(--gold)" }}>⚔ Acceso Jugadores</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Creá tu cuenta para guardar tu progreso entre sesiones.</div>
      </div>
      <div style={{ display: "flex", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 3, marginBottom: 12, padding: 2 }}>
        {[["login", "Ingresar"], ["register", "Registrarse"]].map(([id, label]) => (
          <button key={id} className={`tab${tab === id ? " act" : ""}`} style={{ flex: 1 }} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "login"
        ? <div className="auth-grid">
            <input className="inp" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submitLogin()} />
            <button className="btn btn-r" disabled={working || !email.trim() || !password} onClick={submitLogin}>Entrar</button>
          </div>
        : <div className="auth-grid">
            <input className="inp" placeholder="Tu nombre de aventurero" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <input className="inp" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Contraseña (mín. 6)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submitRegister()} />
            <button className="btn btn-r" disabled={working || !displayName.trim() || !email.trim() || password.length < 6} onClick={submitRegister}>Crear cuenta</button>
            <div className="auth-meta">Tu cuenta guarda tu nombre, partidas y personajes automáticamente.</div>
          </div>}
    </div>
  );
};
    
// ─── TUTORIAL ────────────────────────────────────────────────
