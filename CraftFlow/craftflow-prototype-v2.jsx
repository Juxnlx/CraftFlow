import { useState } from "react";

const COLORS = {
  bg: "#F5F0EB",
  bgWarm: "#EDE6DD",
  bgCard: "#FFFFFF",
  primary: "#8B6F47",
  primaryDark: "#6B5335",
  primaryLight: "#A8956F",
  accent: "#C4956A",
  accentSoft: "#D4A97A",
  green: "#7A9B6D",
  greenLight: "#E8F0E5",
  greenDark: "#5C7A4F",
  text: "#3D3229",
  textMid: "#6B5D50",
  textLight: "#9B8E82",
  border: "#E0D6CC",
  borderLight: "#EDE6DD",
  white: "#FFFFFF",
  danger: "#C0564F",
  shadow: "rgba(61,50,41,0.08)",
};

const CATEGORIES = {
  lana: {
    name: "Lana / Hilo",
    icon: "🧶",
    fields: [
      { key: "color", label: "Color", type: "text" },
      { key: "grosor", label: "Grosor (mm)", type: "number" },
      { key: "metros", label: "Metros", type: "number" },
      { key: "material", label: "Material", type: "select", options: ["Algodón", "Acrílico", "Lana merino", "Mixto"] },
    ],
  },
  pintura: {
    name: "Pintura",
    icon: "🎨",
    fields: [
      { key: "color", label: "Color", type: "text" },
      { key: "tipo", label: "Tipo", type: "select", options: ["Acrílica", "Óleo", "Acuarela", "Gouache"] },
      { key: "ml", label: "Mililitros", type: "number" },
    ],
  },
  ceramica: {
    name: "Cerámica / Arcilla",
    icon: "🏺",
    fields: [
      { key: "tipo", label: "Tipo", type: "select", options: ["Arcilla roja", "Porcelana", "Gres", "Arcilla blanca"] },
      { key: "kg", label: "Kilogramos", type: "number" },
    ],
  },
  tela: {
    name: "Tela / Tejido",
    icon: "🧵",
    fields: [
      { key: "color", label: "Color", type: "text" },
      { key: "tipo", label: "Tipo", type: "select", options: ["Algodón", "Lino", "Fieltro", "Seda", "Yute"] },
      { key: "metros", label: "Metros", type: "number" },
    ],
  },
  papel: {
    name: "Papel / Cartón",
    icon: "📄",
    fields: [
      { key: "tipo", label: "Tipo", type: "select", options: ["Cartulina", "Papel kraft", "Cartón", "Papel de seda", "Papel reciclado"] },
      { key: "color", label: "Color", type: "text" },
      { key: "unidades", label: "Hojas/Unidades", type: "number" },
    ],
  },
  herramienta: {
    name: "Herramientas",
    icon: "✂️",
    fields: [
      { key: "tipo", label: "Tipo", type: "select", options: ["Tijeras", "Agujas crochet", "Agujas punto", "Pinceles", "Rodillo", "Espátula", "Regla", "Cúter", "Pistola silicona", "Otro"] },
      { key: "tamaño", label: "Tamaño / Número", type: "text" },
      { key: "unidades", label: "Cantidad", type: "number" },
    ],
  },
};

const MOCK_INVENTORY = [
  { id: 1, name: "Ovillo algodón verde menta", category: "lana", color: "Verde menta", grosor: "3.5", metros: "200", material: "Algodón" },
  { id: 2, name: "Ovillo lana violeta", category: "lana", color: "Violeta", grosor: "4", metros: "150", material: "Acrílico" },
  { id: 3, name: "Pintura acrílica blanca", category: "pintura", color: "Blanco", tipo: "Acrílica", ml: "250" },
  { id: 4, name: "Fieltro rojo", category: "tela", color: "Rojo", tipo: "Fieltro", metros: "1" },
  { id: 5, name: "Ovillo algodón beige", category: "lana", color: "Beige", grosor: "3", metros: "180", material: "Algodón" },
  { id: 6, name: "Aguja crochet 3.5mm", category: "herramienta", tipo: "Agujas crochet", tamaño: "3.5mm", unidades: "1" },
  { id: 7, name: "Tijeras de costura", category: "herramienta", tipo: "Tijeras", tamaño: "Medium", unidades: "1" },
  { id: 8, name: "Pinceles set x5", category: "herramienta", tipo: "Pinceles", tamaño: "Variados", unidades: "5" },
];

const SAVED_IDS_INIT = [1, 2, 6];

const MOCK_PROJECTS = [
  {
    id: 1, title: "Amigurumi Rana", author: "María López", authorImg: "🧑‍🎨",
    tags: ["crochet", "amigurumi"], difficulty: "Intermedio",
    description: "Rana tejida a crochet de 15cm. Perfecta para regalar o decorar. Se usa punto bajo y aumentos simples.",
    materials: [
      { name: "Hilo algodón verde", category: "lana", color: "Verde", metros: 80 },
      { name: "Hilo algodón blanco", category: "lana", color: "Blanco", metros: 20 },
      { name: "Aguja crochet 3.5mm", category: "herramienta" },
    ],
    matchPercent: 95, canMake: true,
    steps: ["Anillo mágico 6pb", "Aumentos hasta 36pb", "Tejer cuerpo 10 vueltas", "Cerrar y rellenar", "Ojos y detalles"],
    img: "🐸"
  },
  {
    id: 2, title: "Posavasos Macramé", author: "Ana García", authorImg: "👩‍🎨",
    tags: ["macramé", "hogar"], difficulty: "Fácil",
    description: "Set de 4 posavasos en macramé con patrón espiral. Ideal para principiantes.",
    materials: [
      { name: "Cuerda algodón natural", category: "lana", color: "Beige", metros: 50 },
      { name: "Tijeras", category: "herramienta" },
    ],
    matchPercent: 88, canMake: true,
    steps: ["Cortar 8 hilos de 60cm", "Nudo plano central", "Espiral hacia afuera", "Rematar bordes"],
    img: "🍵"
  },
  {
    id: 3, title: "Taza Cerámica Pintada", author: "Pedro Ruiz", authorImg: "🧑‍🎨",
    tags: ["cerámica", "pintura"], difficulty: "Intermedio",
    description: "Taza hecha a mano con diseños geométricos pintados a mano.",
    materials: [
      { name: "Arcilla blanca", category: "ceramica", tipo: "Arcilla blanca", kg: 0.5 },
      { name: "Pintura acrílica", category: "pintura", color: "Varios", ml: 30 },
      { name: "Pinceles", category: "herramienta" },
    ],
    matchPercent: 72, canMake: false,
    steps: ["Moldear la taza", "Dejar secar 24h", "Lijar suavemente", "Pintar diseños", "Barnizar"],
    img: "☕"
  },
  {
    id: 4, title: "Flores de Fieltro", author: "Lucía Martín", authorImg: "👩‍🎨",
    tags: ["fieltro", "decoración"], difficulty: "Fácil",
    description: "Ramo de flores decorativas con fieltro de colores. Quedan genial en cualquier rincón.",
    materials: [
      { name: "Fieltro colores", category: "tela", tipo: "Fieltro", metros: 0.5 },
      { name: "Tijeras", category: "herramienta" },
      { name: "Pistola de silicona", category: "herramienta" },
    ],
    matchPercent: 100, canMake: true,
    steps: ["Recortar pétalos", "Enrollar centro", "Pegar capas con silicona", "Añadir tallo de alambre"],
    img: "🌸"
  },
  {
    id: 5, title: "Cuadro Acuarela Abstracto", author: "Carlos Vega", authorImg: "🧑‍🎨",
    tags: ["pintura", "arte"], difficulty: "Avanzado",
    description: "Composición abstracta con técnica húmedo sobre húmedo. Resultado único cada vez.",
    materials: [
      { name: "Acuarela set", category: "pintura", tipo: "Acuarela", ml: 12 },
      { name: "Papel acuarela", category: "papel", tipo: "Cartulina", unidades: 1 },
      { name: "Pinceles", category: "herramienta" },
    ],
    matchPercent: 30, canMake: false,
    steps: ["Humedecer papel", "Aplicar manchas base", "Capas sucesivas", "Detalles con pincel fino", "Secar 2h"],
    img: "🎨"
  },
  {
    id: 6, title: "Granny Square Manta", author: "Elena Torres", authorImg: "👩‍🎨",
    tags: ["crochet", "hogar"], difficulty: "Fácil",
    description: "Manta compuesta de granny squares multicolor. Perfecta para tardes de sofá.",
    materials: [
      { name: "Lana varios colores", category: "lana", color: "Varios", metros: 500 },
      { name: "Aguja crochet 5mm", category: "herramienta" },
    ],
    matchPercent: 82, canMake: true,
    steps: ["Anillo mágico", "3 vueltas por cuadrado", "Hacer 20 cuadrados", "Unir con punto raso", "Borde final"],
    img: "🛋️"
  },
];

const MY_PROJECTS = [
  { id: 101, title: "Bolso de ganchillo", img: "👜", tags: ["crochet", "moda"], date: "15 Feb 2026", visibility: "publico" },
  { id: 102, title: "Posavasos arcoíris", img: "🌈", tags: ["crochet", "hogar"], date: "28 Ene 2026", visibility: "publico" },
  { id: 103, title: "Amigurumi gato (WIP)", img: "🐱", tags: ["crochet", "amigurumi"], date: "2 Mar 2026", visibility: "privado" },
];

const PhoneFrame = ({ children }) => (
  <div style={{
    width: 375, minHeight: 720, maxHeight: 780, background: COLORS.bg,
    borderRadius: 40, border: `3px solid ${COLORS.border}`,
    boxShadow: `0 20px 60px ${COLORS.shadow}, 0 8px 20px ${COLORS.shadow}`,
    overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
    fontFamily: "'DM Sans', 'Nunito', sans-serif",
  }}>
    <div style={{
      height: 44, background: COLORS.bg, display: "flex", alignItems: "center",
      justifyContent: "center", paddingTop: 8,
    }}>
      <div style={{ width: 120, height: 5, background: COLORS.border, borderRadius: 10 }} />
    </div>
    {children}
  </div>
);

const BottomNav = ({ active, onNavigate }) => {
  const items = [
    { id: "home", icon: "✦", label: "Para ti" },
    { id: "explore", icon: "◎", label: "Explorar" },
    { id: "inventory", icon: "◈", label: "Inventario" },
    { id: "saved", icon: "♡", label: "Guardados" },
    { id: "profile", icon: "○", label: "Perfil" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 8px 20px", background: COLORS.white,
      borderTop: `1px solid ${COLORS.borderLight}`,
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNavigate(item.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
        }}>
          <span style={{
            fontSize: active === item.id ? 22 : 18,
            opacity: active === item.id ? 1 : 0.4,
            transition: "all 0.2s ease",
          }}>{item.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: active === item.id ? 700 : 500,
            color: active === item.id ? COLORS.primary : COLORS.textLight,
          }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const BackButton = ({ onBack, label }) => (
  <button onClick={onBack} style={{
    background: "none", border: "none", fontSize: 14, color: COLORS.primary,
    cursor: "pointer", fontWeight: 600, padding: 0, fontFamily: "inherit",
  }}>← {label || "Volver"}</button>
);

const InputField = ({ label, placeholder, type, value, onChange, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>
      {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
    </label>
    <input
      type={type || "text"} placeholder={placeholder || label} value={value} onChange={onChange}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 12,
        border: `1.5px solid ${COLORS.border}`, fontSize: 14,
        outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        background: COLORS.white, color: COLORS.text,
      }}
    />
  </div>
);

const SelectField = ({ label, options, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>
      {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
    </label>
    <select style={{
      width: "100%", padding: "11px 14px", borderRadius: 12,
      border: `1.5px solid ${COLORS.border}`, fontSize: 14,
      fontFamily: "inherit", background: COLORS.white, color: COLORS.text,
      boxSizing: "border-box",
    }}>
      <option value="">Selecciona...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const PrimaryButton = ({ children, onClick, color, disabled, style: s }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", padding: "14px", background: color || COLORS.primary,
    color: "#fff", border: "none", borderRadius: 14, fontSize: 15,
    fontWeight: 700, cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit", opacity: disabled ? 0.5 : 1, ...s,
  }}>{children}</button>
);

const ProjectCard = ({ project, onTap, compact, savedSet, onToggleSave }) => {
  const isSaved = savedSet.has(project.id);
  if (compact) {
    return (
      <button onClick={onTap} style={{
        background: COLORS.white, borderRadius: 16, overflow: "hidden",
        border: `1px solid ${COLORS.borderLight}`, cursor: "pointer",
        width: "100%", textAlign: "left", position: "relative",
      }}>
        <div style={{
          height: 100, background: `linear-gradient(135deg, ${COLORS.bgWarm}, ${COLORS.border})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
          position: "relative",
        }}>
          {project.img}
          {isSaved && (
            <div style={{
              position: "absolute", top: 6, right: 6, background: COLORS.accent,
              borderRadius: "50%", width: 22, height: 22, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff",
            }}>♥</div>
          )}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{project.title}</div>
          <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>{project.author}</div>
        </div>
      </button>
    );
  }
  return (
    <button onClick={onTap} style={{
      background: COLORS.white, borderRadius: 20, overflow: "hidden",
      border: `1px solid ${COLORS.borderLight}`, cursor: "pointer",
      width: "100%", textAlign: "left", position: "relative",
    }}>
      <div style={{
        height: 140, background: `linear-gradient(135deg, ${COLORS.bgWarm}, ${COLORS.border})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52,
        position: "relative",
      }}>
        {project.img}
        {project.canMake && (
          <div style={{
            position: "absolute", top: 10, left: 10, background: COLORS.green,
            color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
          }}>✓ Puedes hacerlo</div>
        )}
        <div style={{
          position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)",
          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
          color: project.matchPercent >= 80 ? COLORS.green : project.matchPercent >= 50 ? COLORS.accent : COLORS.textLight,
        }}>{project.matchPercent}% match</div>
        <button onClick={(e) => { e.stopPropagation(); onToggleSave(project.id); }} style={{
          position: "absolute", bottom: 10, right: 10,
          background: isSaved ? COLORS.accent : "rgba(255,255,255,0.9)",
          border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: isSaved ? "#fff" : COLORS.textLight,
        }}>{isSaved ? "♥" : "♡"}</button>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{project.title}</div>
            <div style={{ fontSize: 12, color: COLORS.textMid, marginTop: 2 }}>{project.author}</div>
          </div>
          <span style={{
            fontSize: 10, background: COLORS.bgWarm, color: COLORS.textMid,
            padding: "3px 8px", borderRadius: 8, fontWeight: 600,
          }}>{project.difficulty}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, background: COLORS.borderLight, color: COLORS.primaryDark,
              padding: "3px 8px", borderRadius: 10, fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textLight, display: "flex", alignItems: "center", gap: 4 }}>
          <span>◈</span> {project.materials.length} material{project.materials.length !== 1 ? "es" : ""}
          {isSaved && <span style={{ marginLeft: 8, color: COLORS.accent, fontWeight: 600 }}>♥ Guardado</span>}
        </div>
      </div>
    </button>
  );
};

// ========== AUTH SCREENS ==========

const LoginScreen = ({ onLogin, onNavigate }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: "0 30px",
  }}>
    <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.primary, letterSpacing: -1 }}>CraftFlow</div>
    <div style={{ fontSize: 14, color: COLORS.textLight, marginTop: 6, textAlign: "center" }}>
      Descubre lo que puedes crear con lo que tienes
    </div>
    <div style={{ width: "100%", marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
      <input placeholder="Email" style={{
        width: "100%", padding: "13px 16px", borderRadius: 14,
        border: `1.5px solid ${COLORS.border}`, fontSize: 14,
        fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
      }} />
      <input placeholder="Contraseña" type="password" style={{
        width: "100%", padding: "13px 16px", borderRadius: 14,
        border: `1.5px solid ${COLORS.border}`, fontSize: 14,
        fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
      }} />
      <PrimaryButton onClick={onLogin}>Iniciar sesión</PrimaryButton>
    </div>
    <button onClick={() => onNavigate("forgotPassword")} style={{
      marginTop: 16, fontSize: 13, color: COLORS.primary, fontWeight: 600,
      cursor: "pointer", background: "none", border: "none", fontFamily: "inherit",
    }}>¿Olvidaste tu contraseña?</button>
    <div style={{ marginTop: 24, fontSize: 13, color: COLORS.textLight }}>
      ¿No tienes cuenta?{" "}
      <button onClick={() => onNavigate("register")} style={{
        color: COLORS.primary, fontWeight: 700, cursor: "pointer",
        background: "none", border: "none", fontFamily: "inherit", fontSize: 13,
      }}>Regístrate</button>
    </div>
  </div>
);

const RegisterScreen = ({ onBack, onRegister }) => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const interests = ["🧶 Crochet", "🎨 Pintura", "🏺 Cerámica", "🧵 Costura", "📄 Papel", "✂️ Otras"];
  const toggleInterest = (i) => {
    setSelectedInterests(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", padding: "0 30px", justifyContent: "center",
    }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.primary, letterSpacing: -1, textAlign: "center" }}>
        CraftFlow
      </div>
      <div style={{ fontSize: 14, color: COLORS.textLight, marginTop: 6, textAlign: "center" }}>
        {step === 1 ? "Crea tu cuenta y empieza a crear" : "Personaliza tu experiencia"}
      </div>

      {step === 1 && (
        <div style={{ width: "100%", marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Nombre de usuario" style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
          }} />
          <input placeholder="Email" type="email" style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
          }} />
          <input placeholder="Contraseña" type="password" style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
          }} />
          <input placeholder="Confirmar contraseña" type="password" style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
          }} />
          <PrimaryButton onClick={() => setStep(2)}>Siguiente</PrimaryButton>
          <div style={{ marginTop: 8, fontSize: 13, color: COLORS.textLight, textAlign: "center" }}>
            ¿Ya tienes cuenta?{" "}
            <button onClick={onBack} style={{
              color: COLORS.primary, fontWeight: 700, cursor: "pointer",
              background: "none", border: "none", fontFamily: "inherit", fontSize: 13,
            }}>Inicia sesión</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ width: "100%", marginTop: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", background: COLORS.bgWarm,
              border: `2px dashed ${COLORS.border}`, margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, color: COLORS.textLight, cursor: "pointer",
            }}>📷</div>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 8 }}>
              Foto de perfil (opcional)
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMid, marginBottom: 10 }}>
              ¿Qué tipo de manualidades te gustan?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {interests.map(tag => (
                <button key={tag} onClick={() => toggleInterest(tag)} style={{
                  background: selectedInterests.has(tag) ? COLORS.primary : COLORS.white,
                  color: selectedInterests.has(tag) ? "#fff" : COLORS.text,
                  border: `1.5px solid ${selectedInterests.has(tag) ? COLORS.primary : COLORS.border}`,
                  borderRadius: 20, padding: "8px 14px", fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease",
                }}>{tag}</button>
              ))}
            </div>
          </div>
          <PrimaryButton onClick={onRegister} style={{ marginTop: 8 }}>Crear cuenta</PrimaryButton>
          <button onClick={() => setStep(1)} style={{
            width: "100%", marginTop: 10, background: "none", border: "none",
            fontSize: 13, color: COLORS.primary, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", padding: "8px",
          }}>← Volver atrás</button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
        <div style={{ width: 28, height: 4, borderRadius: 2, background: step === 1 ? COLORS.primary : COLORS.border }} />
        <div style={{ width: 28, height: 4, borderRadius: 2, background: step === 2 ? COLORS.primary : COLORS.border }} />
      </div>
    </div>
  );
};

const ForgotPasswordScreen = ({ onBack }) => {
  const [sent, setSent] = useState(false);
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 30px",
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{sent ? "✅" : "🔑"}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, textAlign: "center" }}>
        {sent ? "¡Correo enviado!" : "Recuperar contraseña"}
      </div>
      <div style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
        {sent
          ? "Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña."
          : "Introduce tu correo electrónico y te enviaremos las instrucciones para restablecerla."}
      </div>
      {!sent ? (
        <div style={{ width: "100%", marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Email" type="email" style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.white,
          }} />
          <PrimaryButton onClick={() => setSent(true)}>Enviar enlace de recuperación</PrimaryButton>
        </div>
      ) : (
        <div style={{ width: "100%", marginTop: 28 }}>
          <PrimaryButton onClick={onBack}>Volver al inicio de sesión</PrimaryButton>
        </div>
      )}
      {!sent && (
        <button onClick={onBack} style={{
          marginTop: 20, fontSize: 13, color: COLORS.primary, fontWeight: 600,
          cursor: "pointer", background: "none", border: "none", fontFamily: "inherit",
        }}>← Volver al inicio de sesión</button>
      )}
    </div>
  );
};

// ========== MAIN SCREENS ==========

const HomeScreen = ({ onNavigate, onProjectTap, savedSet, onToggleSave }) => {
  const canMake = MOCK_PROJECTS.filter(p => p.canMake).sort((a, b) => b.matchPercent - a.matchPercent);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 500 }}>CraftFlow</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginTop: 2, lineHeight: 1.2 }}>
              ¿Qué puedo hacer<br />hoy?
            </div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: COLORS.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff", fontWeight: 700,
          }}>JL</div>
        </div>
        <div style={{
          marginTop: 16, background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenDark})`,
          borderRadius: 20, padding: "18px 20px", color: "#fff",
        }}>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>Con tus materiales actuales</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{canMake.length} proyectos</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>disponibles para ti ahora mismo</div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["🧶 5 hilos", "✂️ 3 herramientas", "🎨 1 pintura", "🧵 1 tela"].map(tag => (
              <span key={tag} style={{
                background: "rgba(255,255,255,0.2)", padding: "4px 10px",
                borderRadius: 12, fontSize: 11, fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Proyectos para ti</div>
          <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, cursor: "pointer" }}>Ver todos →</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>Basados en tu inventario actual</div>
      </div>
      <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {canMake.map(project => (
          <ProjectCard key={project.id} project={project} onTap={() => onProjectTap(project)} savedSet={savedSet} onToggleSave={onToggleSave} />
        ))}
      </div>
    </div>
  );
};

const ExploreScreen = ({ onProjectTap, savedSet, onToggleSave }) => {
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const filters = ["todos", "crochet", "cerámica", "pintura", "macramé", "fieltro"];
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>Explorar</div>
        <div style={{
          marginTop: 12, background: COLORS.white, borderRadius: 14,
          border: `1.5px solid ${COLORS.border}`, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ color: COLORS.textLight }}>◎</span>
          <input value={searchText} onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar proyectos o usuarios..."
            style={{
              border: "none", outline: "none", flex: 1, fontSize: 14,
              background: "transparent", color: COLORS.text, fontFamily: "inherit",
            }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              background: activeFilter === f ? COLORS.primary : COLORS.white,
              color: activeFilter === f ? "#fff" : COLORS.textMid,
              border: `1px solid ${activeFilter === f ? COLORS.primary : COLORS.border}`,
              borderRadius: 20, padding: "6px 14px", fontSize: 12,
              fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {MOCK_PROJECTS.map(p => (
          <ProjectCard key={p.id} project={p} compact onTap={() => onProjectTap(p)} savedSet={savedSet} onToggleSave={onToggleSave} />
        ))}
      </div>
    </div>
  );
};

const InventoryScreen = ({ onNavigate }) => {
  const grouped = {};
  MOCK_INVENTORY.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>Mi Inventario</div>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
              {MOCK_INVENTORY.length} items · {Object.keys(grouped).length} categorías
            </div>
          </div>
          <button onClick={() => onNavigate("addMaterial")} style={{
            background: COLORS.primary, color: "#fff", border: "none",
            borderRadius: 14, width: 40, height: 40, fontSize: 22,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>+</button>
        </div>
        <div style={{
          marginTop: 16, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentSoft})`,
          borderRadius: 16, padding: "14px 16px", color: "#fff",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>¡Añade más materiales!</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Cuantos más tengas, más proyectos descubrirás</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {Object.entries(grouped).map(([catKey, items]) => (
          <div key={catKey} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{CATEGORIES[catKey]?.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{CATEGORIES[catKey]?.name}</span>
              <span style={{
                fontSize: 11, background: COLORS.borderLight, color: COLORS.textMid,
                padding: "2px 8px", borderRadius: 8, fontWeight: 600,
              }}>{items.length}</span>
            </div>
            {items.map(item => (
              <div key={item.id} style={{
                background: COLORS.white, borderRadius: 14, padding: "12px 14px",
                border: `1px solid ${COLORS.borderLight}`, marginBottom: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3, display: "flex", gap: 8 }}>
                    {item.color && <span>● {item.color}</span>}
                    {item.metros && <span>{item.metros}m</span>}
                    {item.grosor && <span>{item.grosor}mm</span>}
                    {item.ml && <span>{item.ml}ml</span>}
                    {item.kg && <span>{item.kg}kg</span>}
                    {item.tamaño && <span>{item.tamaño}</span>}
                    {item.unidades && item.category === "herramienta" && <span>x{item.unidades}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ background: COLORS.bgWarm, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14 }}>✎</button>
                  <button style={{ background: COLORS.bgWarm, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const AddMaterialScreen = ({ onBack }) => {
  const [selectedCat, setSelectedCat] = useState(null);
  const [name, setName] = useState("");
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <BackButton onBack={onBack} />
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginTop: 8 }}>Añadir material</div>
      </div>
      {!selectedCat ? (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 12 }}>¿Qué quieres añadir?</div>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setSelectedCat(key)} style={{
              width: "100%", background: COLORS.white, border: `1.5px solid ${COLORS.border}`,
              borderRadius: 16, padding: "16px 18px", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
              textAlign: "left", fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 28 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>{cat.fields.length} campos</div>
              </div>
              <span style={{ marginLeft: "auto", color: COLORS.textLight, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: "16px 20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
            background: COLORS.bgWarm, borderRadius: 14, padding: "12px 16px",
          }}>
            <span style={{ fontSize: 24 }}>{CATEGORIES[selectedCat].icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{CATEGORIES[selectedCat].name}</div>
              <button onClick={() => setSelectedCat(null)} style={{
                background: "none", border: "none", fontSize: 11, color: COLORS.primary,
                cursor: "pointer", padding: 0, fontWeight: 600, fontFamily: "inherit",
              }}>Cambiar categoría</button>
            </div>
          </div>
          <InputField label="Nombre" placeholder={selectedCat === "herramienta" ? "Ej: Aguja crochet 3.5mm" : "Ej: Ovillo algodón verde"} required value={name} onChange={e => setName(e.target.value)} />
          {CATEGORIES[selectedCat].fields.map(f =>
            f.type === "select"
              ? <SelectField key={f.key} label={f.label} options={f.options} />
              : <InputField key={f.key} label={f.label} type={f.type} />
          )}
          {selectedCat !== "herramienta" && <InputField label="Precio (opcional)" type="number" placeholder="€" />}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>Imagen (opcional)</label>
            <div style={{
              width: "100%", padding: "20px", borderRadius: 12,
              border: `2px dashed ${COLORS.border}`, textAlign: "center",
              color: COLORS.textLight, fontSize: 13, cursor: "pointer", background: COLORS.bgWarm,
            }}>📷 Toca para añadir foto</div>
          </div>
          <PrimaryButton>Añadir al inventario</PrimaryButton>
        </div>
      )}
    </div>
  );
};

const SavedScreen = ({ onProjectTap, savedSet, onToggleSave }) => {
  const saved = MOCK_PROJECTS.filter(p => savedSet.has(p.id));
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>Guardados</div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>{saved.length} proyectos guardados</div>
      </div>
      {saved.length === 0 ? (
        <div style={{ padding: "60px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Aún no has guardado proyectos</div>
          <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>Explora el feed y guarda los que te inspiren</div>
        </div>
      ) : (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {saved.map(p => (
            <ProjectCard key={p.id} project={p} onTap={() => onProjectTap(p)} savedSet={savedSet} onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileScreen = ({ onNavigate, savedSet }) => (
  <div style={{ flex: 1, overflow: "auto" }}>
    <div style={{ padding: "4px 20px 0", textAlign: "center" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: COLORS.primaryLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, color: "#fff", fontWeight: 700, margin: "0 auto",
      }}>JL</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginTop: 10 }}>Juan Luis</div>
      <div style={{ fontSize: 13, color: COLORS.textLight }}>juanluis@email.com</div>
      <button style={{
        marginTop: 12, background: COLORS.bgWarm, border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 600,
        color: COLORS.primary, cursor: "pointer", fontFamily: "inherit",
      }}>Editar perfil</button>
    </div>
    <div style={{ padding: "16px 20px", display: "flex", gap: 12, justifyContent: "center" }}>
      {[
        { n: MOCK_INVENTORY.length, label: "Materiales" },
        { n: MY_PROJECTS.length, label: "Proyectos" },
        { n: savedSet.size, label: "Guardados" },
      ].map(s => (
        <div key={s.label} style={{
          background: COLORS.white, borderRadius: 14, padding: "12px 18px",
          border: `1px solid ${COLORS.borderLight}`, textAlign: "center", flex: 1,
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary }}>{s.n}</div>
          <div style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
    <div style={{ padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Mis Proyectos</div>
        <button onClick={() => onNavigate("createProject")} style={{
          background: COLORS.primary, color: "#fff", border: "none",
          borderRadius: 12, padding: "8px 14px", fontSize: 12,
          fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 4,
        }}>+ Crear proyecto</button>
      </div>
      {MY_PROJECTS.map(p => (
        <div key={p.id} style={{
          background: COLORS.white, borderRadius: 16, padding: "12px 14px",
          border: `1px solid ${COLORS.borderLight}`, marginBottom: 10,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: COLORS.bgWarm,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0,
          }}>{p.img}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.title}</div>
            <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
              <span>{p.date}</span>
              <span style={{
                background: p.visibility === "publico" ? COLORS.greenLight : COLORS.bgWarm,
                color: p.visibility === "publico" ? COLORS.greenDark : COLORS.textMid,
                padding: "1px 6px", borderRadius: 6, fontSize: 10, fontWeight: 600,
              }}>{p.visibility === "publico" ? "Público" : "Privado"}</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
              {p.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 9, background: COLORS.borderLight, color: COLORS.primaryDark,
                  padding: "2px 6px", borderRadius: 8, fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button style={{ background: COLORS.bgWarm, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 12 }}>✎</button>
            <button style={{ background: COLORS.bgWarm, border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 12 }}>✕</button>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: "16px 20px" }}>
      <button style={{
        width: "100%", padding: "12px", background: "transparent",
        border: `1.5px solid ${COLORS.danger}`, borderRadius: 14,
        color: COLORS.danger, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      }}>Cerrar sesión</button>
    </div>
  </div>
);

const CreateProjectScreen = ({ onBack }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [visibility, setVisibility] = useState("publico");
  const [tags, setTags] = useState(["crochet"]);
  const toggleMaterial = (id) => setSelectedMaterials(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "4px 20px 0" }}>
        <BackButton onBack={onBack} />
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginTop: 8 }}>Crear proyecto</div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>Comparte tu creación con la comunidad</div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>Imagen del proyecto</label>
          <div style={{
            width: "100%", height: 150, borderRadius: 16,
            border: `2px dashed ${COLORS.border}`, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: COLORS.textLight, cursor: "pointer", background: COLORS.bgWarm, gap: 6,
          }}>
            <span style={{ fontSize: 36 }}>📷</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Toca para subir imagen</span>
            <span style={{ fontSize: 11 }}>JPG, PNG · máx 10MB</span>
          </div>
        </div>
        <InputField label="Nombre del proyecto" placeholder="Ej: Amigurumi rana verde" required />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>
            Descripción <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <textarea placeholder="Describe tu proyecto, el proceso, trucos..." style={{
            width: "100%", padding: "11px 14px", borderRadius: 12,
            border: `1.5px solid ${COLORS.border}`, fontSize: 14,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            background: COLORS.white, color: COLORS.text, minHeight: 70, resize: "vertical",
          }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>Etiquetas</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {tags.map(tag => (
              <span key={tag} style={{
                background: COLORS.primary, color: "#fff", padding: "5px 10px",
                borderRadius: 12, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
              }}>
                {tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.7)",
                  cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1,
                }}>×</button>
              </span>
            ))}
            <button onClick={() => { const t = prompt("Nueva etiqueta:"); if (t) setTags([...tags, t.toLowerCase()]); }} style={{
              background: COLORS.bgWarm, border: `1px dashed ${COLORS.border}`,
              borderRadius: 12, padding: "5px 10px", fontSize: 12,
              color: COLORS.textMid, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}>+ Añadir</button>
          </div>
        </div>
        <SelectField label="Dificultad" options={["Fácil", "Intermedio", "Avanzado"]} required />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 6 }}>Visibilidad</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["publico", "privado"].map(v => (
              <button key={v} onClick={() => setVisibility(v)} style={{
                flex: 1, padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", border: "1.5px solid",
                background: visibility === v ? (v === "publico" ? COLORS.greenLight : COLORS.bgWarm) : COLORS.white,
                borderColor: visibility === v ? (v === "publico" ? COLORS.green : COLORS.border) : COLORS.border,
                color: visibility === v ? (v === "publico" ? COLORS.greenDark : COLORS.textMid) : COLORS.textLight,
              }}>{v === "publico" ? "🌍 Público" : "🔒 Privado"}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 8 }}>Materiales utilizados</label>
          <div style={{ background: COLORS.bgWarm, borderRadius: 14, padding: "10px 12px", maxHeight: 150, overflow: "auto" }}>
            {MOCK_INVENTORY.filter(m => m.category !== "herramienta").map(mat => {
              const sel = selectedMaterials.includes(mat.id);
              return (
                <button key={mat.id} onClick={() => toggleMaterial(mat.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10, marginBottom: 4,
                  background: sel ? COLORS.greenLight : "transparent",
                  border: sel ? `1.5px solid ${COLORS.green}` : "1.5px solid transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${sel ? COLORS.green : COLORS.border}`,
                    background: sel ? COLORS.green : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{sel && "✓"}</div>
                  <span style={{ fontSize: 15 }}>{CATEGORIES[mat.category]?.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{mat.name}</div>
                    <div style={{ fontSize: 10, color: COLORS.textLight }}>
                      {mat.color} {mat.metros && `· ${mat.metros}m`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedMaterials.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
              {selectedMaterials.filter(id => MOCK_INVENTORY.find(m => m.id === id)?.category !== "herramienta").length} material(es) seleccionado(s)
            </div>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMid, display: "block", marginBottom: 8 }}>Herramientas utilizadas</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MOCK_INVENTORY.filter(m => m.category === "herramienta").map(tool => {
              const sel = selectedMaterials.includes(tool.id);
              return (
                <button key={tool.id} onClick={() => toggleMaterial(tool.id)} style={{
                  background: sel ? COLORS.primary : COLORS.white,
                  color: sel ? "#fff" : COLORS.textMid,
                  border: `1.5px solid ${sel ? COLORS.primary : COLORS.border}`,
                  borderRadius: 12, padding: "6px 12px", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>✂️ {tool.name}</button>
              );
            })}
          </div>
        </div>
        <PrimaryButton color={COLORS.green} style={{ marginTop: 4 }}>Publicar proyecto</PrimaryButton>
        <button onClick={onBack} style={{
          width: "100%", marginTop: 10, padding: "12px", background: "transparent",
          border: `1.5px solid ${COLORS.border}`, borderRadius: 14,
          color: COLORS.textMid, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>Cancelar</button>
      </div>
    </div>
  );
};

const ProjectDetailScreen = ({ project, onBack, savedSet, onToggleSave }) => {
  const isSaved = savedSet.has(project.id);
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{
        height: 200, background: `linear-gradient(135deg, ${COLORS.bgWarm}, ${COLORS.border})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative",
      }}>
        {project.img}
        <button onClick={onBack} style={{
          position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.9)",
          border: "none", borderRadius: 12, width: 36, height: 36, cursor: "pointer",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        {project.canMake && (
          <div style={{
            position: "absolute", bottom: 12, left: 12, background: COLORS.green,
            color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20,
          }}>✓ Tienes todos los materiales</div>
        )}
        {isSaved && (
          <div style={{
            position: "absolute", top: 10, right: 10, background: COLORS.accent,
            color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
            display: "flex", alignItems: "center", gap: 4,
          }}>♥ Guardado</div>
        )}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{project.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: COLORS.accent,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>{project.authorImg}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, cursor: "pointer", textDecoration: "underline" }}>
            {project.author}
          </span>
          <span style={{
            fontSize: 11, background: COLORS.bgWarm, color: COLORS.textMid,
            padding: "2px 8px", borderRadius: 8, fontWeight: 600,
          }}>{project.difficulty}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, background: COLORS.borderLight, color: COLORS.primaryDark,
              padding: "4px 10px", borderRadius: 10, fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, color: COLORS.textMid, lineHeight: 1.6, marginTop: 14 }}>{project.description}</p>
        <div style={{ marginTop: 18, background: COLORS.bgWarm, borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Materiales necesarios</div>
          {project.materials.map((mat, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0",
              borderBottom: i < project.materials.length - 1 ? `1px solid ${COLORS.border}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{CATEGORIES[mat.category]?.icon || "📦"}</span>
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{mat.name}</span>
              </div>
              <div style={{
                background: project.canMake ? COLORS.greenLight : "#FFF3E8",
                padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                color: project.canMake ? COLORS.greenDark : COLORS.accent,
              }}>{project.canMake ? "✓ Tienes" : "Falta"}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Paso a paso</div>
          {project.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", background: COLORS.primary,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, paddingTop: 3 }}>{step}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => onToggleSave(project.id)} style={{
            flex: 1, padding: "14px",
            background: isSaved ? COLORS.accent : COLORS.white,
            color: isSaved ? "#fff" : COLORS.textMid,
            border: isSaved ? "none" : `1.5px solid ${COLORS.border}`,
            borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6, transition: "all 0.2s ease",
          }}>{isSaved ? "♥ Guardado" : "♡ Guardar"}</button>
          {project.canMake && (
            <button style={{
              flex: 1, padding: "14px", background: COLORS.green,
              color: "#fff", border: "none", borderRadius: 14, fontSize: 14,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>¡Empezar!</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== MAIN APP ==========

export default function CraftFlowPrototype() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [history, setHistory] = useState([]);
  const [savedSet, setSavedSet] = useState(new Set(SAVED_IDS_INIT));

  const toggleSave = (id) => {
    setSavedSet(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const navigate = (target) => {
    if (["addMaterial", "projectDetail", "createProject", "register", "forgotPassword"].includes(target)) {
      setHistory(prev => [...prev, { screen, tab }]);
      setScreen(target);
    } else {
      setTab(target);
      setScreen("main");
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setScreen(prev.screen);
      setTab(prev.tab);
    } else setScreen("login");
  };

  const openProject = (project) => { setSelectedProject(project); navigate("projectDetail"); };
  const goToMain = () => { setScreen("main"); setTab("home"); setHistory([]); };

  const renderScreen = () => {
    switch (screen) {
      case "login": return <LoginScreen onLogin={goToMain} onNavigate={navigate} />;
      case "register": return <RegisterScreen onBack={goBack} onRegister={goToMain} />;
      case "forgotPassword": return <ForgotPasswordScreen onBack={goBack} />;
      case "addMaterial": return <AddMaterialScreen onBack={goBack} />;
      case "createProject": return <CreateProjectScreen onBack={goBack} />;
      case "projectDetail": return selectedProject ? <ProjectDetailScreen project={selectedProject} onBack={goBack} savedSet={savedSet} onToggleSave={toggleSave} /> : null;
      default:
        switch (tab) {
          case "home": return <HomeScreen onNavigate={navigate} onProjectTap={openProject} savedSet={savedSet} onToggleSave={toggleSave} />;
          case "explore": return <ExploreScreen onProjectTap={openProject} savedSet={savedSet} onToggleSave={toggleSave} />;
          case "inventory": return <InventoryScreen onNavigate={navigate} />;
          case "saved": return <SavedScreen onProjectTap={openProject} savedSet={savedSet} onToggleSave={toggleSave} />;
          case "profile": return <ProfileScreen onNavigate={navigate} savedSet={savedSet} />;
          default: return <HomeScreen onNavigate={navigate} onProjectTap={openProject} savedSet={savedSet} onToggleSave={toggleSave} />;
        }
    }
  };

  const showNav = screen === "main";
  const navButtons = [
    { id: "login", label: "Login" }, { id: "register", label: "Registro" },
    { id: "forgotPassword", label: "Recuperar" }, { id: "home", label: "Para ti" },
    { id: "explore", label: "Explorar" }, { id: "inventory", label: "Inventario" },
    { id: "addMaterial", label: "+ Material" }, { id: "saved", label: "Guardados" },
    { id: "profile", label: "Perfil" }, { id: "createProject", label: "+ Proyecto" },
  ];
  const isActive = (id) => screen === id || (screen === "main" && tab === id);

  return (
    <div style={{
      minHeight: "100vh", background: "#E8E0D8",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primaryDark, letterSpacing: 2, textTransform: "uppercase" }}>
          CraftFlow — Prototipo v2
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
          Navega entre pantallas · Guarda proyectos y comprueba que se sincronizan · Crea proyectos
        </div>
      </div>
      <PhoneFrame>
        {renderScreen()}
        {showNav && <BottomNav active={tab} onNavigate={navigate} />}
      </PhoneFrame>
      <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
        {navButtons.map(btn => (
          <button key={btn.id} onClick={() => {
            if (["login", "register", "forgotPassword"].includes(btn.id)) { setScreen(btn.id); setHistory([]); }
            else if (["addMaterial", "createProject"].includes(btn.id)) navigate(btn.id);
            else { setTab(btn.id); setScreen("main"); }
          }} style={{
            background: isActive(btn.id) ? COLORS.primary : COLORS.white,
            color: isActive(btn.id) ? "#fff" : COLORS.textMid,
            border: `1px solid ${COLORS.border}`, borderRadius: 20,
            padding: "5px 12px", fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>{btn.label}</button>
        ))}
      </div>
    </div>
  );
}
