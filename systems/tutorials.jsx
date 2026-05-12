// Tutorial content and UI
// Loaded by index.html. Keep script order unless moving to a build step.

const TUTORIAL_STEPS_LOBBY = [
  {
    title:"¡Bienvenido a Mesa Dungeon!",
    text:"Esta es tu mesa de rol online multijugador. Acá vas a poder crear partidas de D&D 5e con amigos en tiempo real.",
    icon:"🎲"
  },
  {
    title:"¿Sos Owner/DM o Jugador?",
    text:"Los Owner y DM crean y gestionan las partidas. Los Jugadores se unen a aventuras creadas por un DM.",
    icon:"🎭"
  },
  {
  title:"Acceso Owner / DM",
  text:"Si sos DM necesitás crear una cuenta con email y solicitar acceso. El Owner de la plataforma deberá aprobar tu solicitud antes de que puedas crear partidas.",
  icon:"👑"
},
  {
    title:"Acceso Jugadores",
    text:"Como jugador también podés crear una cuenta para guardar tu personaje y tus partidas entre sesiones.",
    icon:"⚔️"
  },
  {
    title:"Unirse a una partida",
    text:"Para unirte pedile el código de 6 letras a tu DM e ingresalo en 'Unirse con código'. ¡Listo para la aventura!",
    icon:"🚪"
  },
];

const TUTORIAL_STEPS_CHAR = [
  {
    title:"Creación de Personaje",
    text:"Vas a crear tu aventurero en 4 pasos: Nombre y Raza, Clase, Atributos y Resumen final.",
    icon:"📜"
  },
  {
    title:"Raza",
    text:"Cada raza tiene bonificaciones distintas a tus estadísticas. ¡Elegí la que más se adapte a tu estilo de juego!",
    icon:"🧝"
  },
  {
    title:"Clase",
    text:"La clase define tu rol en combate. Los guerreros pelean cuerpo a cuerpo, los magos lanzan hechizos, los pícaros atacan desde las sombras...",
    icon:"⚔️"
  },
  {
    title:"Atributos",
    text:"Podés usar el Array Estándar (valores fijos balanceados) o Tirar Dados (4d6 descarta el menor — más emocionante pero impredecible).",
    icon:"🎲"
  },
  {
    title:"¡A jugar!",
    text:"Una vez creado tu personaje vas a entrar directo al chat de la partida. ¡El DM te estará esperando!",
    icon:"🏰"
  },
];
      
const TUTORIAL_STEPS_GAME_PLAYER = [
  {
    title:"¡Bienvenido a la partida!",
    text:"Estás en la sala de juego. Acá es donde transcurre toda la aventura en tiempo real con tus compañeros.",
    icon:"🏰"
  },
  {
    title:"El Chat",
    text:"En el centro escribís las acciones de tu personaje. El Dungeon Master responderá narrando lo que pasa.",
    icon:"💬"
  },
  {
    title:"Tu Ficha",
    text:"A la derecha (o tocando 📜 en móvil) ves tu ficha con HP, CA, velocidad y estadísticas de tu personaje.",
    icon:"📜"
  },
  {
    title:"Los Dados",
    text:"Cuando el DM habilite los dados, podés tirar desde el panel 🎲. Hay ventaja, desventaja y tiradas rápidas.",
    icon:"🎲"
  },
  {
    title:"Tu Personaje",
    text:"En el panel 🎒 manejás tu equipo, mochila, monedero y estadísticas completas. Equipá items desde la mochila.",
    icon:"🎒"
  },
];

const TUTORIAL_STEPS_GAME_DM = [
  {
    title:"Panel del Dungeon Master",
    text:"Sos el DM de esta partida. Tenés herramientas especiales para controlar la sesión.",
    icon:"🎭"
  },
  {
    title:"Narración",
    text:"Tocá el botón '🎭 DM' en el header para abrir tu panel. Desde ahí podés narrar eventos directamente al chat.",
    icon:"📖"
  },
  {
    title:"Control de Dados",
    text:"Desde tu panel podés habilitar o bloquear las tiradas de dados para los jugadores cuando vos lo decidas.",
    icon:"🎲"
  },
  {
    title:"Stock del DM",
    text:"Con '🎁 Stock del DM' podés cargar items y monedas para repartir a los jugadores como recompensas.",
    icon:"🎁"
  },
  {
    title:"Los Jugadores",
    text:"En la barra superior ves el HP de cada jugador en tiempo real. Supervisá el estado del grupo.",
    icon:"⚔️"
  },
];

const Tutorial = ({ steps, onClose, storageKey }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={()=>isLast?onClose():setStep(s=>s+1)}>
      <div style={{background:"var(--bg1)",border:"1px solid var(--gold)",borderRadius:6,padding:32,maxWidth:420,width:"100%",textAlign:"center",animation:"fadeIn .3s"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:48,marginBottom:16}}>{current.icon}</div>
        <div style={{fontFamily:"Cinzel,serif",fontSize:20,color:"var(--gold)",marginBottom:12}}>{current.title}</div>
        <div style={{fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:24}}>{current.text}</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:8,height:8,borderRadius:"50%",
              background:i===step?"var(--gold)":"rgba(201,168,76,.3)",
              cursor:"pointer",transition:"all .2s"}}
              onClick={()=>setStep(i)}/>
          ))}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          {step>0&&<button className="btn btn-sm" onClick={()=>setStep(s=>s-1)}>← Anterior</button>}
          <button className="btn btn-r" style={{padding:"8px 28px"}} onClick={()=>isLast?onClose():setStep(s=>s+1)}>
            {isLast?"¡Entendido! ✓":"Siguiente →"}
          </button>
        </div>
        <div style={{marginTop:12}}>
          <button className="btn btn-sm" style={{opacity:.5,fontSize:10}} onClick={onClose}>Saltar tutorial</button>
        </div>
      </div>
    </div>
  );
};
// ─── LOBBY ────────────────────────────────────────────────────
