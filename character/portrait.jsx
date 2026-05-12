// Character portrait
// Loaded by index.html. Keep script order unless moving to a build step.

const CharSVG = ({ char }) => {
  if (!char) return null;
  const eq = char.equipment || {};
  const race = char.race || "human";
  const cls = char.class || "fighter";

  // Body color by race
  const skinColors = {human:"#E8C9A0",elf:"#D4E8C0",dwarf:"#C8A878",halfling:"#F0D4A8",gnome:"#D8C4F0",halforc:"#98B878",tiefling:"#C890C0",dragonborn:"#A8C8D8"};
  const skin = skinColors[race] || "#E8C9A0";

  // Armor color by equipped body
  const bodyId = eq.body;
  const bodyItem = ITEMS[bodyId];
  const armorColor = bodyItem ? (bodyId==="chainmail"||bodyId==="scalemail"?"#9AA8B0":bodyId==="platemail"?"#C8D0D8":bodyId==="leather"?"#8B6040":bodyId==="robes"?"#5050A0":"#888") : "none";
  const hasArmor = !!bodyItem;
  const hasShield = !!eq.offhand;
  const hasWeapon = !!eq.mainhand;
  const hasCape = !!eq.cape;
  const hasHelm = !!eq.head;
  const capeColor = hasCape ? (eq.cape==="elvishcloak"?"#4A7A50":eq.cape==="cloakprotection"?"#8060A0":"#6A4020") : null;
  const weaponItem = ITEMS[eq.mainhand];
  const weaponColor = weaponItem ? (weaponItem.rar==="r"?"#C9A84C":weaponItem.rar==="u"?"#5BA3E0":"#9AA0A8") : "#9AA0A8";

  const isFemale = char.appearance&&char.appearance.bodyType === "female";
  const hairY = isFemale ? 18 : 20;

  return (
    <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" className="l2-portrait-svg">
      {/* Glow bg */}
      <radialGradient id="pglow" cx="50%" cy="80%" r="50%">
        <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
      </radialGradient>
      <ellipse cx="50" cy="130" rx="38" ry="14" fill="url(#pglow)"/>

      {/* Cape (back layer) */}
      {hasCape && <path d={`M${isFemale?36:38},50 Q${isFemale?18:20},95 ${isFemale?22:24},145 L${isFemale?32:34},145 Q${isFemale?28:30},95 ${isFemale?42:44},55Z`} fill={capeColor} opacity="0.9"/>}
      {hasCape && <path d={`M${isFemale?64:62},50 Q${isFemale?82:80},95 ${isFemale?78:76},145 L${isFemale?68:66},145 Q${isFemale?72:70},95 ${isFemale?58:56},55Z`} fill={capeColor} opacity="0.9"/>}

      {/* Legs */}
      <rect x={isFemale?37:38} y="105" width={isFemale?9:9} height="40" rx="3" fill={hasArmor?"#5A6068":skin}/>
      <rect x={isFemale?54:53} y="105" width={isFemale?9:9} height="40" rx="3" fill={hasArmor?"#5A6068":skin}/>
      {/* Boots */}
      <rect x={isFemale?36:37} y="138" width={isFemale?11:11} height="8" rx="3" fill="#3A2A18"/>
      <rect x={isFemale?53:52} y="138" width={isFemale?11:11} height="8" rx="3" fill="#3A2A18"/>

      {/* Body */}
      {hasArmor
        ? <rect x={isFemale?32:34} y="60" width={isFemale?36:32} height="48" rx="6" fill={armorColor}/>
        : <rect x={isFemale?32:34} y="60" width={isFemale?36:32} height="48" rx="6" fill={skin}/>
      }
      {hasArmor && <rect x={isFemale?32:34} y="60" width={isFemale?36:32} height="6" rx="3" fill="rgba(255,255,255,0.1)"/>}

      {/* Arms */}
      <rect x={isFemale?18:20} y="62" width={isFemale?14:13} height="38" rx="5" fill={hasArmor?armorColor:skin}/>
      <rect x={isFemale?68:67} y="62" width={isFemale?14:13} height="38" rx="5" fill={hasArmor?armorColor:skin}/>
      {/* Hands */}
      <ellipse cx={isFemale?25:26} cy="103" rx="6" ry="5" fill={skin}/>
      <ellipse cx={isFemale?75:74} cy="103" rx="6" ry="5" fill={skin}/>

      {/* Shield */}
      {hasShield && <ellipse cx={isFemale?15:15} cy="90" rx="10" ry="14" fill="#6A7880" stroke="#8A9098" strokeWidth="1.5"/>}
      {hasShield && <line x1={isFemale?15:15} y1="78" x2={isFemale?15:15} y2="102" stroke="#C9A84C" strokeWidth="1.2"/>}
      {hasShield && <line x1="8" y1="90" x2="22" y2="90" stroke="#C9A84C" strokeWidth="1.2"/>}

      {/* Weapon */}
      {hasWeapon && weaponItem&&weaponItem.ranged
        ? <path d="M82,50 L86,130" stroke={weaponColor} strokeWidth="2" strokeLinecap="round"/>
        : hasWeapon && <path d={`M78,45 L82,115`} stroke={weaponColor} strokeWidth="2.5" strokeLinecap="round"/>
      }
      {hasWeapon && weaponItem&&weaponItem.ranged && <path d={`M75,43 L85,43`} stroke={weaponColor} strokeWidth="2.5" strokeLinecap="round"/>}
      {weaponItem&&weaponItem.magical && hasWeapon && <circle cx="79" cy="50" r="4" fill="rgba(201,168,76,0.4)" style={{animation:"glow 2s infinite"}}/>}

      {/* Neck */}
      <rect x="44" y="50" width="12" height="13" rx="4" fill={skin}/>

      {/* Head */}
      <ellipse cx="50" cy={isFemale?36:38} rx={isFemale?16:15} ry={isFemale?18:17} fill={skin}/>

      {/* Helm */}
      {hasHelm && eq.head==="helm" && <path d="M34,38 Q34,20 50,20 Q66,20 66,38 L62,38 Q62,24 50,24 Q38,24 38,38Z" fill="#7A8890"/>}
      {hasHelm && eq.head==="wizardhat" && <>
        <path d="M50,5 L58,30 L42,30Z" fill="#3A2A70"/>
        <rect x="36" y="28" width="28" height="5" rx="2" fill="#5A4A90"/>
      </>}
      {hasHelm && eq.head==="crownvalor" && <>
        <path d="M34,30 L36,20 L40,28 L50,18 L60,28 L64,20 L66,30Z" fill="#C9A84C"/>
      </>}
      {hasHelm && eq.head==="adventurerhood" && <path d="M34,38 Q34,20 50,20 Q66,20 66,30 L62,32 Q60,22 50,22 Q38,22 38,35Z" fill="#4A3020" opacity="0.85"/>}
      {hasHelm && eq.head==="hairribbon" && <path d="M40,28 Q50,22 60,28 Q55,24 50,26 Q45,24 40,28Z" fill="#C83040"/>}

      {/* Hair */}
      {!hasHelm && isFemale && <path d="M34,36 Q34,14 50,14 Q66,14 66,36 Q60,20 50,20 Q40,20 34,36Z" fill="#4A3020"/>}
      {!hasHelm && isFemale && <path d="M34,36 Q28,50 30,65" stroke="#4A3020" strokeWidth="6" strokeLinecap="round" fill="none"/>}
      {!hasHelm && isFemale && <path d="M66,36 Q72,50 70,65" stroke="#4A3020" strokeWidth="6" strokeLinecap="round" fill="none"/>}
      {!hasHelm && !isFemale && <path d="M35,38 Q35,18 50,18 Q65,18 65,38 Q60,22 50,22 Q40,22 35,38Z" fill="#3A2818"/>}

      {/* Face */}
      <ellipse cx="44" cy={isFemale?37:39} rx="2.5" ry="2" fill="rgba(0,0,0,0.45)"/>
      <ellipse cx="56" cy={isFemale?37:39} rx="2.5" ry="2" fill="rgba(0,0,0,0.45)"/>
      <path d={`M45,${isFemale?44:46} Q50,${isFemale?47:49} 55,${isFemale?44:46}`} stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* Magical glow on armor */}
      {bodyItem&&bodyItem.magical && <rect x={isFemale?32:34} y="60" width={isFemale?36:32} height="48" rx="6" fill="rgba(90,90,200,0.08)" stroke="rgba(100,100,220,0.3)" strokeWidth="0.5"/>}

      {/* Shadow */}
      <ellipse cx="50" cy="148" rx="22" ry="5" fill="rgba(0,0,0,0.4)"/>
    </svg>
  );
};

// ─── EQUIPMENT SLOTS LAYOUT (Lineage 2 style) ────────────────
