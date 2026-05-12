// Owner and DM authentication UI
// Loaded by index.html. Keep script order unless moving to a build step.

const AuthCard = ({ authReady, authUser, account, ownerExists, onLogin, onRegister, onLogout, onClaimOwner, onRequestDM, onResendVerification }) => {
  const [tab,setTab]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [requestName,setRequestName]=useState("");
  const [working,setWorking]=useState(false);

  useEffect(()=>{
    if(authUser){
      const fallback=(account&&account.displayName)||authUser.displayName||"";
      setRequestName(fallback);
      setDisplayName(fallback);
    }
  },[authUser,account]);

  const submitLogin=async()=>{
    if(!email.trim()||!password)return;
    setWorking(true);
    try{await onLogin({email:email.trim(),password});setEmail("");setPassword("");}
    finally{setWorking(false);}
  };
  const submitRegister=async()=>{
    if(!displayName.trim()||!email.trim()||password.length<6)return;
    setWorking(true);
    try{await onRegister({displayName:displayName.trim(),email:email.trim(),password});setEmail("");setPassword("");}
    finally{setWorking(false);}
  };
  const submitRequestDM=async()=>{
    if(!requestName.trim())return;
    setWorking(true);
    try{await onRequestDM({displayName:requestName.trim()});}
    finally{setWorking(false);}
  };

  if(!window._firebaseReady) return (
  <div className="card" style={{padding:18,marginBottom:18}}>
    <div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"var(--gold)",marginBottom:6}}>
      Acceso Owner / DM
    </div>
    <div className="auth-meta">Conectando el portal de acceso...</div>
  </div>
);

  if(!authUser)return(
    <div className="card" style={{padding:18,marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:10}}>
        <div>
          <div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"var(--gold)"}}>Acceso Owner / DM</div>
          <div className="auth-meta">Solo cuentas aprobadas pueden crear partidas.</div>
        </div>
        <span className={`badge ${ownerExists?"badge-r":"badge-p"}`}>{ownerExists?"Owner activo":"Owner inactivo"}</span>
      </div>
      <div style={{display:"flex",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:3,marginBottom:12,padding:2}}>
        {[["login","Ingresar"],["register","Crear cuenta"]].map(([id,label])=>(
          <button key={id} className={`tab${tab===id?" act":""}`} style={{flex:1}} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>
      {tab==="login"
        ? <div className="auth-grid">
            <input className="inp" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitLogin()} />
            <button className="btn btn-r" disabled={working||!email.trim()||!password} onClick={submitLogin}>Entrar</button>
          </div>
        : <div className="auth-grid">
            <input className="inp" placeholder="Nombre visible" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
            <input className="inp" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Contraseña (mín. 6)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitRegister()} />
            <button className="btn btn-r" disabled={working||!displayName.trim()||!email.trim()||password.length<6} onClick={submitRegister}>Crear cuenta</button>
            <div className="auth-meta">Si todavía no hay owner, la primera cuenta podrá reclamar ese rol. Si ya existe, la cuenta podrá pedir acceso como DM.</div>
          </div>}
    </div>
  );

  const badge=roleBadgeMeta(account);
  const isOwner=isApprovedRole(account,OWNER_ROLE);
  const isDm=isApprovedRole(account,DM_ROLE);

  return(
    <div className="card" style={{padding:18,marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
        <div>
          <div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"var(--gold)"}}>Portal de Mando</div>
          <div style={{fontSize:13,color:"var(--text)"}}>{(account&&account.displayName)||authUser.displayName||"Cuenta autenticada"}</div>
          <div className="auth-meta">{authUser.email}</div>
        </div>
        <span className={`badge ${badge.cls}`}>{badge.label}</span>
      </div>

      {!ownerExists&&!account&&<div className="auth-grid">
        <div className="auth-meta">Todavía no hay owner global. Si esta es tu cuenta principal, reclamá el control total ahora mismo.</div>
        <button className="btn btn-r" disabled={working} onClick={async()=>{setWorking(true);try{await onClaimOwner();}finally{setWorking(false);}}}>Reclamar Owner</button>
      </div>}

      {ownerExists&&!account&&<div className="auth-grid">
        <div className="auth-meta">Esta cuenta todavía no tiene permisos administrativos. Podés solicitar acceso como DM para que el Owner lo apruebe.</div>
        <input className="inp" placeholder="Nombre visible de DM" value={requestName} onChange={e=>setRequestName(e.target.value)} />
        <button className="btn btn-r" disabled={working||!requestName.trim()} onClick={submitRequestDM}>Solicitar acceso DM</button>
      </div>}

      {account&&account.status===STATUS_PENDING&&<div className="auth-meta">Tu acceso de DM está pendiente de aprobación del Owner.</div>}

      {account&&account.status===STATUS_REVOKED&&<div className="auth-meta">El Owner revocó este acceso. Si querés volver a masterear, necesitás una nueva aprobación.</div>}

      {isDm&&<div className="auth-meta">Tu cuenta ya puede crear y administrar partidas como DM.</div>}

      {isOwner&&<div className="auth-meta">Tenés control global sobre la app y la aprobación de DMs.</div>}

      {authUser&&!authUser.emailVerified&&(
        <div className="auth-grid" style={{marginTop:10}}>
          <div className="auth-meta" style={{color:"#E24B4A"}}>
            Email no verificado. Revisa tu bandeja de entrada antes de continuar.
          </div>
          <button className="btn btn-sm btn-r" disabled={working} onClick={async()=>{setWorking(true);try{await onResendVerification();}finally{setWorking(false);}}}>
            Reenviar email de verificacion
          </button>
        </div>
      )}

      {false&&authUser&&!authUser.emailVerified&&(
        <div className="auth-meta" style={{color:"#E24B4A"}}>
          ⚠ Email no verificado — revisá tu bandeja de entrada antes de continuar.
        </div>
      )}

     <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
        <button className="btn btn-sm" onClick={onLogout}>Cerrar sesión</button>
     </div>
    </div>
  );
};
