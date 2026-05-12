// Global styles
// Loaded by index.html. Keep script order unless moving to a build step.

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root {
    --gold:#C9A84C; --gold-dim:rgba(201,168,76,0.25); --gold-glow:rgba(201,168,76,0.10);
    --crimson:#8B1A1A; --crimson2:#C42B2B;
    --bg:#080604; --bg1:#110D07; --bg2:#1A1410; --bg3:#221A10;
    --text:#F0E6D3; --muted:#9A8A72; --border:rgba(201,168,76,0.22);
    font-family:'Crimson Pro',Georgia,serif;
    background:var(--bg); color:var(--text);
  }
  body { background:var(--bg); }
  h1,h2,h3,.cz { font-family:'Cinzel',serif; letter-spacing:.05em; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--gold-dim); border-radius:3px; }

  .btn { font-family:'Cinzel',serif; font-size:12px; letter-spacing:.1em; text-transform:uppercase;
    padding:8px 18px; border:1px solid var(--gold-dim); background:transparent;
    color:var(--gold); cursor:pointer; transition:all .2s; border-radius:2px; }
  .btn:hover { background:var(--gold-glow); border-color:var(--gold); }
  .btn:disabled { opacity:.4; cursor:not-allowed; }
  .btn-r { background:rgba(139,26,26,.5); border-color:#8B1A1A; color:#F0E6D3; }
  .btn-r:hover { background:var(--crimson2); border-color:var(--crimson2); }
  .btn-g { background:rgba(201,168,76,.15); border-color:var(--gold); }
  .btn-g:hover { background:rgba(201,168,76,.28); }
  .btn-sm { padding:5px 12px; font-size:11px; }
  .inp { background:rgba(0,0,0,.5); border:1px solid var(--border); color:var(--text);
    padding:8px 12px; font-family:'Crimson Pro',serif; font-size:16px; outline:none;
    width:100%; border-radius:2px; transition:border .2s; }
  .inp:focus { border-color:var(--gold); }
  .sel { background:rgba(0,0,0,.5); border:1px solid var(--border); color:var(--text);
    padding:7px 10px; font-family:'Cinzel',serif; font-size:12px; outline:none;
    cursor:pointer; border-radius:2px; }
  .card { background:var(--bg1); border:1px solid var(--border); border-radius:3px; }
  .rc { cursor:pointer; transition:all .18s; border:1px solid var(--border);
    background:var(--bg1); border-radius:4px; padding:12px; }
  .rc:hover { border-color:var(--gold); background:var(--gold-glow); }
  .rc.sel { border-color:var(--gold); background:rgba(201,168,76,.14); box-shadow:0 0 14px rgba(201,168,76,.1); }
  .tab { padding:8px 14px; font-family:'Cinzel',serif; font-size:11px; letter-spacing:.1em;
    text-transform:uppercase; cursor:pointer; border:none; background:transparent;
    border-bottom:2px solid transparent; color:var(--muted); transition:all .2s; }
  .tab.act { color:var(--gold); border-bottom-color:var(--gold); }
  .tab:hover { color:var(--text); }
  .stat-b { background:var(--bg2); border:1px solid var(--border); border-radius:3px;
    text-align:center; padding:7px 4px; }
  .dice-btn { width:52px; height:52px; display:flex; align-items:center; justify-content:center;
    font-family:'Cinzel',serif; font-size:16px; font-weight:700; cursor:pointer;
    border:2px solid var(--border); background:var(--bg2); border-radius:4px;
    transition:all .2s; color:var(--gold); }
  .dice-btn:hover { border-color:var(--gold); background:rgba(201,168,76,.1); transform:translateY(-2px); }
  .dice-btn.sel { border-color:var(--gold); background:rgba(201,168,76,.18); box-shadow:0 0 12px rgba(201,168,76,.2); }
  .dice-btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }
  .dice-btn:disabled:hover { border-color:var(--border); background:var(--bg2); transform:none; }
  .msg-dm { background:rgba(139,26,26,.18); border-left:3px solid var(--crimson); padding:10px 14px; border-radius:2px; }
  .msg-player { background:rgba(201,168,76,.05); border-left:3px solid rgba(201,168,76,.3); padding:8px 12px; border-radius:2px; }
  .msg-roll { background:rgba(40,100,200,.12); border-left:3px solid rgba(80,150,240,.4); padding:8px 12px; border-radius:2px; }
  .msg-sys { opacity:.55; font-style:italic; font-size:14px; padding:4px 8px; }
  .hp-bar { height:8px; background:rgba(255,255,255,.08); border-radius:4px; overflow:hidden; }
  .hp-fill { height:100%; border-radius:4px; transition:width .4s; }
  .itm { border:1px solid var(--border); background:var(--bg1); border-radius:4px;
    padding:9px 12px; cursor:pointer; transition:all .2s; }
  .itm:hover { border-color:var(--gold); background:var(--gold-glow); }
  .badge { display:inline-block; font-family:'Cinzel',serif; font-size:10px; letter-spacing:.08em;
    padding:2px 8px; border-radius:2px; text-transform:uppercase; }
  .badge-c { background:rgba(120,120,120,.15); color:#999; border:1px solid rgba(120,120,120,.3); }
  .badge-u { background:rgba(76,175,80,.12); color:#5cb85c; border:1px solid rgba(76,175,80,.3); }
  .badge-r { background:rgba(74,144,217,.12); color:#5ba3e0; border:1px solid rgba(74,144,217,.3); }
  .badge-l { background:rgba(201,168,76,.15); color:var(--gold); border:1px solid var(--gold-dim); }
  .badge-p { background:rgba(255,193,7,.12); color:#FFD66B; border:1px solid rgba(255,193,7,.32); }
  .badge-x { background:rgba(226,75,74,.12); color:#F18F8F; border:1px solid rgba(226,75,74,.32); }
  .notif { position:fixed; top:16px; right:16px; z-index:9999; background:var(--bg2);
    border:1px solid var(--gold); padding:11px 18px; font-family:'Cinzel',serif;
    font-size:12px; color:var(--gold); max-width:280px; animation:fadeIn .3s; border-radius:2px; z-index:10000; }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:500;
    display:flex; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px); }
  .modal { background:var(--bg1); border:1px solid var(--gold); border-radius:4px;
    padding:24px; max-width:520px; width:100%; max-height:92vh; overflow-y:auto; }
  .spell-slot { width:24px; height:24px; border:1px solid var(--border); border-radius:50%;
    display:inline-flex; align-items:center; justify-content:center; font-size:10px;
    cursor:pointer; transition:all .2s; margin:2px; }
  .spell-slot.used { background:transparent; color:var(--muted); border-color:var(--border); }
  .spell-slot.avail { background:rgba(139,26,26,.3); border-color:var(--crimson); color:var(--crimson2); }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes roll { 0%{transform:rotate(0) scale(1)} 30%{transform:rotate(200deg) scale(1.3)}
    70%{transform:rotate(560deg) scale(.85)} 100%{transform:rotate(720deg) scale(1)} }
  @keyframes glow { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
  .roll-a { animation:roll .65s ease-in-out; }

  /* ── LINEAGE 2 CHARACTER PANEL ── */
  .l2-panel {
    background: linear-gradient(160deg, #0e0b06 0%, #1a1208 50%, #0a0804 100%);
    border: 1px solid rgba(201,168,76,.35);
    border-radius: 6px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }
  .l2-panel::before {
    content:""; position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,.08) 0%, transparent 70%);
  }
  .l2-char-portrait {
    position: relative;
    width: 120px;
    height: 160px;
    margin: 0 auto 12px;
    flex-shrink: 0;
  }
  .l2-slot {
    width: 44px; height: 44px;
    border: 1px solid rgba(201,168,76,.35);
    border-radius: 4px;
    background: rgba(0,0,0,.45);
    display: flex; flex-direction:column; align-items:center; justify-content:center;
    cursor: pointer; transition: all .2s; position:relative; overflow:hidden;
    font-size: 9px; color: var(--muted); font-family:'Cinzel',serif; letter-spacing:.03em;
    text-align:center; gap:2px;
  }
  .l2-slot:hover { border-color: var(--gold); background: rgba(201,168,76,.1); }
  .l2-slot.filled { border-color: rgba(201,168,76,.6); background: rgba(201,168,76,.06); }
  .l2-slot.filled .slot-icon { font-size:18px; }
  .l2-slot .slot-label { font-size:8px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; line-height:1; }
  .l2-slot .slot-name { font-size:8px; color:var(--gold); line-height:1.1; }
  .l2-slot .slot-rarity { position:absolute; bottom:2px; right:3px; font-size:7px; }

  /* Inventory grid */
  .inv-grid { display:grid; grid-template-columns: repeat(6,1fr); gap:4px; }
  .inv-cell {
    width:100%; aspect-ratio:1;
    border: 1px solid rgba(201,168,76,.2);
    border-radius: 3px;
    background: rgba(0,0,0,.35);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    cursor:pointer; transition:all .18s; font-size:18px; position:relative;
    min-height:44px;
  }
  .inv-cell:hover { border-color:var(--gold); background:rgba(201,168,76,.08); }
  .inv-cell.equipped { border-color:rgba(201,168,76,.7); background:rgba(201,168,76,.12); }
  .inv-cell.empty { cursor:default; opacity:.3; }
  .inv-cell .cell-name { font-size:7px; color:var(--muted); font-family:'Cinzel',serif;
    text-align:center; line-height:1.1; padding:0 2px; max-width:100%; overflow:hidden;
    text-overflow:ellipsis; white-space:nowrap; }
  .inv-cell .cell-dot { position:absolute; top:2px; right:2px; width:5px; height:5px;
    border-radius:50%; }
  .inv-cell .cell-dot.c { background:#888; }
  .inv-cell .cell-dot.u { background:#5cb85c; }
  .inv-cell .cell-dot.r { background:#5ba3e0; }

  /* Wallet */
  .wallet { display:flex; gap:8px; }
  .coin-box {
    flex:1; background:rgba(0,0,0,.35); border:1px solid var(--border);
    border-radius:4px; padding:8px; text-align:center;
  }
  .coin-box .coin-icon { font-size:20px; }
  .coin-box .coin-amt { font-family:'Cinzel',serif; font-size:16px; font-weight:700; color:var(--gold); }
  .coin-box .coin-label { font-size:9px; color:var(--muted); font-family:'Cinzel',serif;
    text-transform:uppercase; letter-spacing:.06em; }

  /* Mobile char button */
  .char-fab {
    position:fixed; bottom:80px; right:16px; z-index:400;
    width:56px; height:56px; border-radius:50%;
    background:linear-gradient(135deg,rgba(139,26,26,.85),rgba(201,168,76,.35));
    border:2px solid var(--gold); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:24px; box-shadow:0 4px 20px rgba(0,0,0,.6);
    transition:all .2s;
  }
  .char-fab:hover { transform:scale(1.08); box-shadow:0 6px 24px rgba(201,168,76,.3); }

  /* L2 character SVG portrait wrapper */
  .l2-portrait-svg { width:100%; height:100%; }

  /* Online badge */
  .online-dot { width:7px; height:7px; border-radius:50%; background:#4CAF50;
    display:inline-block; margin-right:5px; animation:pulse 2s infinite; }
  .offline-dot { width:7px; height:7px; border-radius:50%; background:#666;
    display:inline-block; margin-right:5px; }

  /* Game layout */
  .game-wrap { display:flex; height:100vh; flex-direction:column; background:var(--bg); }
  .game-body { flex:1; display:flex; overflow:hidden; }
  .chat-col { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .right-col { width:280px; background:var(--bg1); border-left:1px solid var(--border);
    display:flex; flex-direction:column; flex-shrink:0; }
  .mobile-quickbar { display:none; }
  .footer-sign { margin-top:26px; font-size:11px; color:var(--muted); text-align:center; letter-spacing:.08em; }
  .auth-grid { display:grid; gap:10px; }
  .auth-meta { font-size:12px; color:var(--muted); line-height:1.5; }
  .split-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  @media(max-width:700px){
  .dm-panel { overflow-x:auto; }
    .right-col { display:none; }
    .show-mobile { display:flex!important; }
    .mobile-quickbar { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px; }
    .split-2 { grid-template-columns:1fr; }
  }
  @media(min-width:701px){
    .char-fab { display:none!important; }
  }

  /* L2 modal full */
  .l2-modal { background:var(--bg1); border:1px solid var(--gold); border-radius:6px;
    width:100%; max-width:480px; max-height:94vh; overflow-y:auto; }

  /* Ornaments */
  .ornament { color:var(--gold); opacity:.45; font-size:11px; }
`;

// ─── D&D DATA ────────────────────────────────────────────────
