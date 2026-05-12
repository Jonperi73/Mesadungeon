// Owner management panel
// Loaded by index.html. Keep script order unless moving to a build step.

const OwnerPanel = ({ ownerAccount, pendingDMs = [], approvedDMs = [], sessions, onApproveDm, onRevokeDm }) => {
  const activeRoomsFor=(uid)=>(sessions||[]).filter(s=>s.dmUid===uid&&(s.lifecycleStatus||"active")==="active").length;
  return(
    <div className="card" style={{padding:18,marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:10}}>
        <div>
          <div style={{fontFamily:"Cinzel,serif",fontSize:15,color:"var(--gold)"}}>Panel Owner</div>
          <div className="auth-meta">Aprobás quién puede masterear y controlás la capa alta de la app.</div>
        </div>
        <span className="badge badge-l">{(ownerAccount&&ownerAccount.displayName)||"Owner"}</span>
      </div>

      <div className="split-2" style={{marginBottom:14}}>
        <div className="card" style={{padding:12}}>
          <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Solicitudes de DM</div>
          {pendingDMs.length===0
            ? <div className="auth-meta">No hay solicitudes pendientes.</div>
            : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {pendingDMs.map(dm=>(
                  <div key={dm.uid} className="itm" style={{padding:"10px 12px"}}>
                    <div style={{fontSize:13,color:"var(--text)"}}>{dm.displayName||"DM sin alias"}</div>
                    <div className="auth-meta">{dm.email}</div>
                    <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                      <button className="btn btn-sm btn-r" onClick={()=>onApproveDm(dm.uid)}>Aprobar</button>
                      <button className="btn btn-sm" onClick={()=>onRevokeDm(dm.uid)}>Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>}
        </div>

        <div className="card" style={{padding:12}}>
          <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:"var(--muted)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>DMs aprobados</div>
          {approvedDMs.length===0
            ? <div className="auth-meta">Todavía no hay DMs aprobados.</div>
            : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {approvedDMs.map(dm=>(
                  <div key={dm.uid} className="itm" style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--gold)"}}>{dm.displayName||"DM sin alias"}</div>
                        <div className="auth-meta">{dm.email}</div>
                        <div className="auth-meta">Partidas activas: {activeRoomsFor(dm.uid)}/{ACTIVE_ROOM_LIMIT}</div>
                      </div>
                      <button className="btn btn-sm" onClick={()=>onRevokeDm(dm.uid)}>Revocar</button>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </div>
    </div>
  );
};
