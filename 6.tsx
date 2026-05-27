import { useState } from "react";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const HEBREW_DAYS   = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const HEBREW_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const HOURS         = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const COLOR_THEMES = [
  { id:"rose",   label:"ורוד",    primary:"#c96060", dark:"#a03030", bg1:"#0d0d0d", bg2:"#1a0a0f", accent:"#ffcccc" },
  { id:"purple", label:"סגול",   primary:"#9b6bc9", dark:"#6b3a99", bg1:"#0d0d12", bg2:"#110a1a", accent:"#deccff" },
  { id:"teal",   label:"טורקיז", primary:"#3fb8af", dark:"#207a74", bg1:"#090d0d", bg2:"#081515", accent:"#bbf0ee" },
  { id:"gold",   label:"זהב",    primary:"#c9a03a", dark:"#8a6615", bg1:"#0d0c08", bg2:"#1a1508", accent:"#ffe9a0" },
  { id:"blush",  label:"בז׳",   primary:"#c97a6b", dark:"#994433", bg1:"#0d0908", bg2:"#1a100d", accent:"#ffd5cc" },
];

const DEFAULT_SERVICES = [
  { id:1, name:"לק ג׳ל",          duration:60,  price:120, icon:"💅" },
  { id:2, name:"לק ג׳ל + עיצוב", duration:90,  price:160, icon:"✨" },
  { id:3, name:"הסרת לק ג׳ל",    duration:30,  price:60,  icon:"🫧" },
  { id:4, name:"טיפול מלא",       duration:120, price:220, icon:"👑" },
  { id:5, name:"פדיקור",          duration:60,  price:130, icon:"🦶" },
  { id:6, name:"נייל ארט",        duration:20,  price:40,  icon:"🎨" },
];

const SERVICE_ICONS = ["💅","✨","🫧","👑","🦶","🎨","💎","🌸","🦋","⭐","🌙","🔥"];

const DEMO_APPOINTMENTS = [
  { id:1, firstName:"מיכל", lastName:"כהן",    service:"לק ג׳ל + עיצוב", dayLabel:"היום", hour:"10:00", phone:"050-1234567", status:"confirmed", notes:"" },
  { id:2, firstName:"שירה", lastName:"לוי",    service:"לק ג׳ל",         dayLabel:"מחר",  hour:"11:00", phone:"052-9876543", status:"confirmed", notes:"אלרגיה לג׳ל מסוים" },
  { id:3, firstName:"נועה",  lastName:"בן דוד", service:"פדיקור",         dayLabel:"מחר",  hour:"14:00", phone:"054-5551234", status:"pending",   notes:"" },
];

function getDays(n) {
  const days = [], today = new Date();
  for (let i=0;i<n;i++) { const d=new Date(today); d.setDate(today.getDate()+i); days.push(d); }
  return days;
}

function fmtDay(d, days) {
  const today=new Date(), tmrw=new Date(); tmrw.setDate(today.getDate()+1);
  if (d.toDateString()===today.toDateString()) return "היום";
  if (d.toDateString()===tmrw.toDateString())  return "מחר";
  return `${HEBREW_DAYS[d.getDay()]} ${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]}`;
}

// Trial
const TRIAL_KEY = "nails_trial_v2";
function initTrial() { try { if(!localStorage.getItem(TRIAL_KEY)) localStorage.setItem(TRIAL_KEY,new Date().toISOString()); } catch {} }
function getRemaining() {
  try {
    const v=localStorage.getItem(TRIAL_KEY);
    if(!v) return 7;
    return Math.max(0, 7-Math.floor((Date.now()-new Date(v).getTime())/86400000));
  } catch { return 7; }
}

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;900&family=Playfair+Display:ital@1&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:var(--p)55;border-radius:10px}
body{overscroll-behavior:none}

/* ── Accessibility ── */
/* Skip to main content link (screen readers + keyboard) */
.skip-link{position:absolute;top:-100px;right:0;background:var(--p);color:#fff;padding:10px 18px;border-radius:0 0 12px 12px;font-family:'Heebo';font-size:15px;font-weight:700;text-decoration:none;z-index:9999;transition:top .2s}
.skip-link:focus{top:0}
/* Visible focus ring for keyboard navigation */
*:focus-visible{outline:3px solid var(--p);outline-offset:3px;border-radius:6px}
/* Remove focus ring for mouse users only */
*:focus:not(:focus-visible){outline:none}
/* Minimum touch target 44×44px (WCAG 2.5.5) */
button,a,[role="button"]{min-height:44px;min-width:44px}
/* High contrast text — never below 4.5:1 ratio */
body{color:#f0e8e8}
/* Respect reduced motion preference */
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms !important;transition-duration:.01ms !important}
}
/* Larger base font for readability */
html{font-size:16px;-webkit-text-size-adjust:100%}

.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:16px;transition:all .22s}
.card-active{border-color:var(--p) !important;background:color-mix(in srgb,var(--p) 12%,transparent) !important}
.card-hover:hover{background:rgba(255,255,255,0.07);border-color:color-mix(in srgb,var(--p) 35%,transparent);transform:translateY(-2px)}

.btn{border:none;border-radius:12px;font-family:'Heebo',sans-serif;font-weight:700;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-primary{background:linear-gradient(135deg,var(--p),var(--d));color:#fff;padding:13px 26px;font-size:15px}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 22px color-mix(in srgb,var(--p) 38%,transparent)}
.btn-primary:disabled{opacity:.38;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:transparent;color:var(--p);border:1px solid color-mix(in srgb,var(--p) 40%,transparent);padding:10px 20px;font-size:14px}
.btn-ghost:hover{background:color-mix(in srgb,var(--p) 10%,transparent)}
.btn-danger{background:rgba(220,50,50,0.15);color:#ff7777;border:1px solid rgba(220,50,50,0.3);padding:8px 14px;font-size:13px;border-radius:10px}
.btn-danger:hover{background:rgba(220,50,50,0.25)}
.btn-call{background:rgba(80,200,120,0.15);color:#50c878;border:1px solid rgba(80,200,120,0.3);padding:8px 14px;font-size:13px;border-radius:10px}
.btn-call:hover{background:rgba(80,200,120,0.25)}
.btn-wa{background:rgba(37,211,102,0.15);color:#25d366;border:1px solid rgba(37,211,102,0.3);padding:8px 14px;font-size:13px;border-radius:10px}
.btn-wa:hover{background:rgba(37,211,102,0.25)}
.btn-sm{padding:7px 14px;font-size:13px;border-radius:10px}
.btn-icon{background:rgba(255,255,255,0.06);border:none;border-radius:10px;padding:10px;cursor:pointer;transition:all .18s;color:inherit;font-size:18px;line-height:1}
.btn-icon:hover{background:rgba(255,255,255,0.12)}

.field{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:11px;padding:12px 15px;font-size:15px;font-family:'Heebo',sans-serif;color:var(--text);width:100%;outline:none;transition:all .18s;direction:rtl}
.field:focus{border-color:var(--p);background:rgba(255,255,255,0.08)}
.field::placeholder{color:rgba(200,185,185,0.32)}
textarea.field{resize:vertical;min-height:70px}

.chip{display:inline-flex;align-items:center;padding:7px 15px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:13px;cursor:pointer;transition:all .18s;white-space:nowrap;gap:5px}
.chip:hover{border-color:color-mix(in srgb,var(--p) 50%,transparent)}
.chip-on{background:color-mix(in srgb,var(--p) 16%,transparent);border-color:var(--p);color:var(--a);font-weight:700}

.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.14);transition:all .28s}
.dot-on{background:var(--p);transform:scale(1.35)}

.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.b-ok{background:rgba(80,200,120,.14);color:#50c878;border:1px solid rgba(80,200,120,.28)}
.b-wait{background:rgba(255,200,0,.11);color:#ffd700;border:1px solid rgba(255,200,0,.24)}
.b-cancel{background:rgba(220,50,50,.12);color:#ff7777;border:1px solid rgba(220,50,50,.25)}

.tab{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px 13px;font-size:13px;font-family:'Heebo';color:rgba(210,195,195,.58);cursor:pointer;transition:all .18s;white-space:nowrap}
.tab:hover{color:var(--text)}
.tab-on{background:color-mix(in srgb,var(--p) 16%,transparent);border-color:var(--p);color:var(--a);font-weight:700}

.nav{background:none;border:none;color:rgba(210,195,195,.52);font-family:'Heebo';font-size:14px;cursor:pointer;padding:8px 14px;border-radius:9px;transition:all .18s}
.nav:hover{color:var(--text);background:rgba(255,255,255,0.06)}
.nav-on{color:var(--p)}

.hour{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 8px;font-size:14px;font-family:'Heebo';color:var(--text);cursor:pointer;transition:all .18s;text-align:center;width:100%}
.hour:hover:not(.hour-off):not(.hour-on){background:color-mix(in srgb,var(--p) 10%,transparent);border-color:var(--p)}
.hour-on{background:color-mix(in srgb,var(--p) 20%,transparent);border-color:var(--p);color:var(--a);font-weight:700}
.hour-off{opacity:.28;cursor:not-allowed;text-decoration:line-through}
.hour-blocked{background:rgba(200,50,50,0.12) !important;border-color:rgba(200,50,50,0.35) !important;color:#ff8888 !important;opacity:.7}
.hour-appt{background:color-mix(in srgb,var(--p) 10%,transparent) !important;border-color:color-mix(in srgb,var(--p) 35%,transparent) !important;color:var(--a) !important;cursor:not-allowed !important}

.social-link{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--text);text-decoration:none;font-size:14px;font-family:'Heebo';transition:all .18s}
.social-link:hover{background:rgba(255,255,255,0.11);border-color:var(--p)}

.swatch{width:30px;height:30px;border-radius:50%;cursor:pointer;transition:all .2s;border:3px solid transparent;flex-shrink:0}
.swatch-on{border-color:#fff !important;transform:scale(1.22)}

.icon-opt{font-size:20px;cursor:pointer;padding:5px 8px;border-radius:8px;transition:background .14s}
.icon-opt:hover{background:rgba(255,255,255,0.1)}
.icon-opt-on{background:color-mix(in srgb,var(--p) 22%,transparent)}

@keyframes pop{0%{transform:scale(.45);opacity:0}72%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.pop{animation:pop .38s ease}
.up{animation:up .3s ease}

.divider{height:1px;background:rgba(255,255,255,0.06);margin:14px 0}

/* modal overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:200;display:flex;align-items:flex-end;justify-content:center;padding:0}
.sheet{background:var(--bg2);border-radius:22px 22px 0 0;padding:24px 20px 32px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;direction:rtl;animation:up .25s ease}
`;

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  initTrial();
  const remaining   = getRemaining();
  const trialExpired = remaining <= 0;

  // ── Settings ──
  const [theme, setTheme]       = useState(COLOR_THEMES[0]);
  const [appName, setAppName]   = useState("Nails by Dana");
  const [appSub, setAppSub]     = useState("NAIL STUDIO");
  const [appIcon, setAppIcon]     = useState("💅");
  const [appIconImg, setAppIconImg] = useState(null); // base64 custom photo
  const [social, setSocial]     = useState({ instagram:"", tiktok:"", whatsapp:"" });
  const [address, setAddress]   = useState(""); // business address for Waze
  const [services, setServices] = useState(DEFAULT_SERVICES);

  // ── Client profile (shown on first open) ──
  const [clientProfile, setClientProfile] = useState(null); // {firstName,lastName,phone}
  const [profileStep, setProfileStep]     = useState("form"); // "form" | "done"
  const [profileForm, setProfileForm]     = useState({ firstName:"", lastName:"", phone:"" });
  const [profileErr, setProfileErr]       = useState("");

  // ── Booking ──
  const [view, setView]                   = useState("home");
  const [step, setStep]                   = useState(1);
  const [selSvc, setSelSvc]               = useState(null);
  const [selDay, setSelDay]               = useState(null);
  const [selHour, setSelHour]             = useState(null);
  const [bookNotes, setBookNotes]         = useState("");
  const [appointments, setAppointments]   = useState(DEMO_APPOINTMENTS);

  // ── Owner ──
  const [ownerPin, setOwnerPin]         = useState("");
  const [ownerIn, setOwnerIn]           = useState(false);
  const [pinErr, setPinErr]             = useState(false);
  const [ownerTab, setOwnerTab]         = useState("appts");
  const [cancelModal, setCancelModal]   = useState(null); // appointment obj
  const [cancelReason, setCancelReason] = useState("");

  // ── Availability ──
  const [blockedSlots, setBlockedSlots] = useState({});
  const [blockedDays, setBlockedDays]   = useState({});
  const [availDay, setAvailDay]         = useState(null);

  // ── Settings edit buffers ──
  const [editName, setEditName]       = useState("");
  const [editSub, setEditSub]         = useState("");
  const [editIcon, setEditIcon]       = useState("💅");
  const [editIconImg, setEditIconImg] = useState(null); // base64 custom image
  const [editSocial, setEditSocial]   = useState({ instagram:"", tiktok:"", whatsapp:"" });
  const [editAddress, setEditAddress] = useState("");
  const [editTheme, setEditTheme]     = useState(theme.id);
  const [editSvcs, setEditSvcs]       = useState([]);
  const [saved, setSaved]             = useState(false);

  const C    = theme;
  const days = getDays(14);

  const dayLabel = (i) => fmtDay(days[i]);

  const isSlotBlocked = (di, h) =>
    blockedSlots[`${di}-${h}`] || blockedDays[di];

  const slotHasAppt = (di, h) =>
    appointments.some(a => a.hour===h && a.dayLabel===dayLabel(di) && a.status!=="cancelled");

  // ── Actions ──
  const submitProfile = () => {
    const f = profileForm;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.phone.trim()) {
      setProfileErr("יש למלא את כל השדות"); return;
    }
    if (!/^[\d\-+\s]{7,}$/.test(f.phone)) {
      setProfileErr("מספר טלפון לא תקין"); return;
    }
    setClientProfile({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim() });
    setProfileErr("");
  };

  const handleBook = () => {
    const ap = {
      id: Date.now(),
      firstName: clientProfile.firstName,
      lastName:  clientProfile.lastName,
      phone:     clientProfile.phone,
      service:   selSvc.name,
      dayLabel:  dayLabel(selDay),
      hour:      selHour,
      status:    "confirmed",
      notes:     bookNotes,
    };
    setAppointments(prev => [...prev, ap]);
    setView("confirm");
  };

  const cancelAppointment = (id, reason) => {
    setAppointments(prev => prev.map(a =>
      a.id===id ? { ...a, status:"cancelled", cancelReason: reason } : a
    ));
    setCancelModal(null); setCancelReason("");
  };

  const confirmAppt = (id) =>
    setAppointments(prev => prev.map(a => a.id===id ? {...a, status:"confirmed"} : a));

  const resetBook = () => {
    setStep(1); setSelSvc(null); setSelDay(null); setSelHour(null); setBookNotes(""); setView("home");
  };

  const openSettings = () => {
    setEditName(appName); setEditSub(appSub); setEditIcon(appIcon);
    setEditIconImg(appIconImg); setEditAddress(address);
    setEditSocial({...social}); setEditTheme(theme.id); setOwnerTab("settings"); setSaved(false);
  };

  const handleIconImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditIconImg(ev.target.result);
      setEditIcon(null); // clear emoji when image chosen
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = () => {
    if (editName.trim()) setAppName(editName.trim());
    if (editSub.trim()) setAppSub(editSub.trim());
    setAppIcon(editIcon);
    setAppIconImg(editIconImg);
    setSocial({...editSocial});
    setAddress(editAddress);
    const newTheme = COLOR_THEMES.find(t=>t.id===editTheme)||COLOR_THEMES[0];
    setTheme(newTheme);
    try {
      document.title = `${editIconImg?"📸":(editIcon||"💅")} ${editName.trim()||appName}`;
      const manifestEl = document.querySelector('link[rel="manifest"]');
      if (manifestEl) {
        const icons = editIconImg
          ? [{ src:editIconImg, sizes:"512x512", type:"image/png", purpose:"any maskable" }]
          : [{ src:"icon-192.png", sizes:"192x192", type:"image/png", purpose:"any maskable" },
             { src:"icon-512.png", sizes:"512x512", type:"image/png", purpose:"any maskable" }];
        const blob = new Blob([JSON.stringify({
          name: editName.trim()||appName,
          short_name: (editName.trim()||appName).split(" ")[0],
          start_url:"/", display:"standalone",
          background_color: newTheme.bg1,
          theme_color: newTheme.primary,
          icons,
        })], { type:"application/json" });
        manifestEl.href = URL.createObjectURL(blob);
      }
    } catch(e) {}
    setSaved(true); setTimeout(()=>setSaved(false),2200);
  };

  const hasSocial = social.instagram||social.tiktok||social.whatsapp||address;

  const vars = { "--p":C.primary,"--d":C.dark,"--a":C.accent,"--bg2":C.bg2,"--text":"#f0e8e8" };

  // ─────────────────────────────────────────────
  // PROFILE GATE — shown before anything else
  // ─────────────────────────────────────────────
  if (!clientProfile && view !== "owner") {
    return (
      <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.bg1},${C.bg2},${C.bg1})`,
        fontFamily:"'Heebo',sans-serif",direction:"rtl",color:"#f0e8e8",display:"flex",
        alignItems:"center",justifyContent:"center",padding:20,...vars}}>
        <style>{BASE_CSS}</style>
        <div style={{width:"100%",maxWidth:440}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:56,marginBottom:12,filter:`drop-shadow(0 0 24px color-mix(in srgb,${C.primary} 55%,transparent))`}}>
              {appIconImg
                ? <img src={appIconImg} alt="icon" style={{width:64,height:64,borderRadius:16,objectFit:"cover"}}/>
                : (appIcon||"💅")}
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:32,color:C.accent,marginBottom:6}}>{appName}</h1>
            <p style={{color:"rgba(200,185,185,0.5)",fontSize:15}}>ברוכה הבאה! נשמח להכיר אותך לפני שמקבעים תור</p>
          </div>

          <div className="card" style={{padding:24}}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>פרטים אישיים</h2>
            <p style={{color:"rgba(200,185,185,0.45)",fontSize:13,marginBottom:20}}>ימולאו פעם אחת בלבד ויישמרו לתורים הבאים</p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:10}}>
                <input className="field" placeholder="שם פרטי *" value={profileForm.firstName}
                  aria-label="שם פרטי" aria-required="true" autoComplete="given-name"
                  onChange={e=>setProfileForm({...profileForm,firstName:e.target.value})}/>
                <input className="field" placeholder="שם משפחה *" value={profileForm.lastName}
                  aria-label="שם משפחה" aria-required="true" autoComplete="family-name"
                  onChange={e=>setProfileForm({...profileForm,lastName:e.target.value})}/>
              </div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",fontSize:18,pointerEvents:"none"}} aria-hidden="true">📱</span>
                <input className="field" style={{paddingRight:40}} placeholder="מספר טלפון *" type="tel"
                  aria-label="מספר טלפון" aria-required="true" autoComplete="tel" inputMode="tel"
                  value={profileForm.phone}
                  onChange={e=>setProfileForm({...profileForm,phone:e.target.value})}
                  onKeyDown={e=>e.key==="Enter"&&submitProfile()}/>
              </div>
              {profileErr && (
                <div style={{background:"rgba(220,50,50,0.12)",border:"1px solid rgba(220,50,50,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#ff8888"}}>
                  ⚠️ {profileErr}
                </div>
              )}
              <button className="btn btn-primary" style={{marginTop:4,width:"100%",padding:"14px"}}
                onClick={submitProfile}>
                יאללה, בואי נקבע תור! 💅
              </button>
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:16}}>
            <button className="nav" onClick={()=>{ setView("owner"); }}>
              כניסה לניהול →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // CANCEL MODAL
  // ─────────────────────────────────────────────
  const CancelModal = () => (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="ביטול תור" onClick={()=>setCancelModal(null)}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,textAlign:"center",marginBottom:12}}>😟</div>
        <h3 style={{fontSize:18,fontWeight:700,textAlign:"center",marginBottom:4}}>ביטול תור</h3>
        <p style={{color:"rgba(200,185,185,0.5)",fontSize:13,textAlign:"center",marginBottom:20}}>
          {cancelModal.firstName} {cancelModal.lastName} — {cancelModal.service}<br/>
          {cancelModal.dayLabel} ב-{cancelModal.hour}
        </p>
        <div style={{marginBottom:14}}>
          <p style={{fontSize:13,fontWeight:600,marginBottom:8}}>סיבת הביטול (תישלח ללקוחה):</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {["הלקוחה ביקשה לבטל","לא הגיעה לתור","שינוי בלוח זמנים","סיבה אחרת"].map(r=>(
              <div key={r} className={`chip ${cancelReason===r?"chip-on":""}`}
                style={{justifyContent:"flex-start"}}
                onClick={()=>setCancelReason(r)}>{r}</div>
            ))}
          </div>
        </div>
        <textarea className="field" placeholder="הוספת פרטים (לא חובה)..." value={cancelReason.startsWith("סיבה")?"":cancelReason==="סיבה אחרת"?cancelReason:""}
          onChange={e=>setCancelReason(e.target.value)} style={{marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setCancelModal(null)}>חזרה</button>
          <button className="btn btn-danger" style={{flex:1,padding:"12px"}}
            disabled={!cancelReason}
            onClick={()=>cancelAppointment(cancelModal.id, cancelReason)}>
            ❌ אישור ביטול
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // APPOINTMENT CARD (owner view)
  // ─────────────────────────────────────────────
  const ApptCard = ({ ap }) => {
    const cancelled = ap.status==="cancelled";
    const pending   = ap.status==="pending";
    return (
      <div className="card" style={{padding:"16px 18px",opacity:cancelled?.55:1,
        borderColor: cancelled?"rgba(220,50,50,0.2)": pending?"rgba(255,200,0,0.2)":"rgba(255,255,255,0.07)"}}>
        {/* Top row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Avatar */}
            <div style={{width:42,height:42,borderRadius:12,background:`color-mix(in srgb,${C.primary} 20%,transparent)`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.accent,flexShrink:0}}>
              {ap.firstName[0]}{ap.lastName[0]}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>{ap.firstName} {ap.lastName}</div>
              <a href={`tel:${ap.phone}`} style={{fontSize:13,color:"rgba(200,185,185,0.55)",textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>
                📞 {ap.phone}
              </a>
            </div>
          </div>
          <span className={`badge ${ap.status==="confirmed"?"b-ok":ap.status==="pending"?"b-wait":"b-cancel"}`}>
            {ap.status==="confirmed"?"✓ מאושר":ap.status==="pending"?"⏳ ממתין":"✗ בוטל"}
          </span>
        </div>

        {/* Info row */}
        <div style={{display:"flex",gap:10,fontSize:13,flexWrap:"wrap",marginBottom:10}}>
          <span style={{color:C.accent}}>💅 {ap.service}</span>
          <span style={{color:"rgba(200,185,185,0.55)"}}>📅 {ap.dayLabel}</span>
          <span style={{color:"rgba(200,185,185,0.55)"}}>🕐 {ap.hour}</span>
        </div>

        {ap.notes && (
          <div style={{fontSize:12,color:"rgba(200,185,185,0.42)",fontStyle:"italic",marginBottom:10}}>
            📝 {ap.notes}
          </div>
        )}

        {ap.cancelReason && (
          <div style={{fontSize:12,color:"#ff8888",marginBottom:10}}>
            סיבת ביטול: {ap.cancelReason}
          </div>
        )}

        {/* Action buttons */}
        {!cancelled && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {/* Call */}
            <a href={`tel:${ap.phone}`} className="btn btn-call btn-sm btn"
              style={{textDecoration:"none",fontFamily:"'Heebo'",fontWeight:700}}>
              📞 התקשרי
            </a>
            {/* WhatsApp */}
            <a href={`https://wa.me/${ap.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`היי ${ap.firstName}! 💅 רציתי לתאם איתך לגבי התור`)}`}
              target="_blank" rel="noreferrer"
              className="btn btn-wa btn-sm btn"
              style={{textDecoration:"none",fontFamily:"'Heebo'",fontWeight:700}}>
              💬 וואטסאפ
            </a>
            {/* Confirm if pending */}
            {pending && (
              <button className="btn btn-primary btn-sm" onClick={()=>confirmAppt(ap.id)}>
                ✓ אשרי תור
              </button>
            )}
            {/* Cancel */}
            <button className="btn btn-danger btn-sm" onClick={()=>setCancelModal(ap)}>
              ❌ בטלי תור
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div lang="he" style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 50%,${C.bg1} 100%)`,
      fontFamily:"'Heebo',sans-serif",direction:"rtl",color:"#f0e8e8",position:"relative",...vars}}>
      <style>{BASE_CSS}</style>

      {/* Skip to main content — for keyboard / screen reader users */}
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>

      {/* BG glow */}
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",
        background:`radial-gradient(circle,color-mix(in srgb,${C.primary} 9%,transparent),transparent 70%)`,
        top:-120,right:-120,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",width:350,height:350,borderRadius:"50%",
        background:`radial-gradient(circle,color-mix(in srgb,${C.dark} 7%,transparent),transparent 70%)`,
        bottom:60,left:-80,pointerEvents:"none",zIndex:0}}/>

      {/* Cancel modal */}
      {cancelModal && <CancelModal/>}

      {/* ── HEADER ── */}
      <header role="banner" style={{padding:"15px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",
        borderBottom:`1px solid rgba(255,255,255,0.06)`,backdropFilter:"blur(12px)",
        position:"sticky",top:0,zIndex:100,background:`color-mix(in srgb,${C.bg1} 88%,transparent)`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}} aria-hidden="true">
            {appIconImg
              ? <img src={appIconImg} alt="" style={{width:32,height:32,borderRadius:8,objectFit:"cover",verticalAlign:"middle"}}/>
              : (appIcon||"💅")}
          </span>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:18,color:C.accent,lineHeight:1}}
              aria-label={`${appName} — ${appSub}`}>{appName}</div>
            <div style={{fontSize:10,color:"rgba(200,185,185,0.38)",letterSpacing:2}} aria-hidden="true">{appSub}</div>
          </div>
        </div>
        <nav aria-label="ניווט ראשי" style={{display:"flex",gap:2,alignItems:"center"}}>
          {clientProfile && (
            <span style={{fontSize:12,color:"rgba(200,185,185,0.45)",marginLeft:6}} aria-live="polite">
              שלום, {clientProfile.firstName}
            </span>
          )}
          <button className={`nav ${view==="home"||view==="book"||view==="confirm"?"nav-on":""}`}
            onClick={resetBook} aria-current={view==="home"?"page":undefined}>הזמנה</button>
          <button className={`nav ${view==="owner"?"nav-on":""}`}
            aria-current={view==="owner"?"page":undefined}
            onClick={()=>{setView("owner");setOwnerIn(false);setOwnerPin("");}}>ניהול</button>
        </nav>
      </header>

      {/* Trial banner */}
      {remaining<=3 && (
        <div style={{background:`linear-gradient(90deg,${C.dark},${C.primary})`,padding:"8px 18px",
          textAlign:"center",fontSize:13,fontWeight:600,cursor:"pointer",zIndex:99,position:"relative"}}
          onClick={()=>setView("owner")}>
          {trialExpired
            ? "⛔ תקופת הניסיון הסתיימה — לחצי לחידוש"
            : `⏳ ${remaining} ימים נותרו בניסיון — לחצי לשדרוג`}
        </div>
      )}

      <main id="main-content" role="main" style={{maxWidth:620,margin:"0 auto",padding:"20px 15px",minHeight:"calc(100vh - 66px)",position:"relative",zIndex:1}}>

        {/* ══ HOME ══ */}
        {view==="home" && (
          <div className="up" style={{textAlign:"center",paddingTop:32}}>
            <div style={{fontSize:58,marginBottom:12,filter:`drop-shadow(0 0 26px color-mix(in srgb,${C.primary} 52%,transparent))`}}>
              {appIconImg
                ? <img src={appIconImg} alt="icon" style={{width:80,height:80,borderRadius:20,objectFit:"cover"}}/>
                : (appIcon||"💅")}
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:38,color:C.accent,lineHeight:1.2,marginBottom:8}}>
              {clientProfile ? `שלום, ${clientProfile.firstName}!` : appName}
            </h1>
            <p style={{color:"rgba(200,185,185,0.48)",fontSize:15,marginBottom:32,lineHeight:1.65}}>
              קבעי תור עכשיו בקלות ובשניות.<br/>שירות, תאריך, שעה — וזהו!
            </p>
            <button className="btn btn-primary" style={{fontSize:17,padding:"15px 44px",borderRadius:14}}
              onClick={()=>setView("book")}>✨ קביעת תור</button>

            {hasSocial && (
              <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:26,flexWrap:"wrap"}}>
                {social.whatsapp && <a className="social-link" href={`https://wa.me/${social.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" aria-label="פתחי וואטסאפ"><span aria-hidden="true">📱</span>WhatsApp</a>}
                {social.instagram && <a className="social-link" href={`https://instagram.com/${social.instagram.replace("@","")}`} target="_blank" rel="noreferrer" aria-label="פתחי אינסטגרם"><span aria-hidden="true">📸</span>Instagram</a>}
                {social.tiktok && <a className="social-link" href={`https://tiktok.com/@${social.tiktok.replace("@","")}`} target="_blank" rel="noreferrer" aria-label="פתחי טיקטוק"><span aria-hidden="true">🎵</span>TikTok</a>}
                {address && (
                  <a className="social-link"
                    href={`https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`}
                    target="_blank" rel="noreferrer"
                    aria-label={`נווטי ב-Waze לכתובת ${address}`}
                    style={{background:"rgba(0,210,100,0.1)",borderColor:"rgba(0,210,100,0.25)"}}>
                    <span aria-hidden="true">🗺️</span>נווטי אלינו
                  </a>
                )}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:36}}>
              {[{e:"⚡",t:"מהיר",d:"פחות מדקה"},{e:"🔒",t:"מאובטח",d:"פרטייך שמורות"},{e:"✏️",t:"גמיש",d:"ביטול עד 24שעות"}].map(f=>(
                <div key={f.t} className="card" style={{padding:"13px 8px",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:5}}>{f.e}</div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{f.t}</div>
                  <div style={{fontSize:11,color:"rgba(200,185,185,0.4)"}}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ BOOKING ══ */}
        {view==="book" && (
          <div className="up">
            <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}
              aria-label={`שלב ${step} מתוך 3`}
              style={{display:"flex",justifyContent:"center",gap:8,marginBottom:22}}>
              {[1,2,3].map(s=><div key={s} className={`dot ${step>=s?"dot-on":""}`}/>)}
            </div>

            {/* Step 1 */}
            {step===1 && (
              <div>
                <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>בחרי שירות</h2>
                <p style={{color:"rgba(200,185,185,0.44)",fontSize:13,marginBottom:16}}>מה תרצי לעשות היום?</p>
                <div role="radiogroup" aria-label="בחרי שירות" style={{display:"flex",flexDirection:"column",gap:9}}>
                  {services.map(s=>(
                    <div key={s.id} className={`card card-hover ${selSvc?.id===s.id?"card-active":""}`}
                      style={{padding:"14px 17px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onClick={()=>setSelSvc(s)}
                      onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&setSelSvc(s)}
                      tabIndex={0} role="radio" aria-checked={selSvc?.id===s.id}
                      aria-label={`${s.name}, ${s.duration} דקות, ₪${s.price}`}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:26}} aria-hidden="true">{s.icon}</span>
                        <div>
                          <div style={{fontWeight:600,fontSize:15}}>{s.name}</div>
                          <div style={{color:"rgba(200,185,185,0.44)",fontSize:12}}>{s.duration} דקות</div>
                        </div>
                      </div>
                      <div style={{fontWeight:700,fontSize:17,color:C.accent}} aria-hidden="true">₪{s.price}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}>
                  <button className="btn btn-primary" disabled={!selSvc} onClick={()=>setStep(2)}
                    aria-label="המשך לבחירת תאריך">הבא →</button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step===2 && (
              <div>
                <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>תאריך ושעה</h2>
                <p style={{color:"rgba(200,185,185,0.44)",fontSize:13,marginBottom:16}}>{selSvc?.name} · {selSvc?.duration} דק׳</p>
                <div role="listbox" aria-label="בחרי תאריך" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
                  {days.map((d,i)=>(
                    <div key={i} className={`chip ${selDay===i?"chip-on":""}`}
                      style={blockedDays[i]?{opacity:.35,pointerEvents:"none"}:{}}
                      onClick={()=>{setSelDay(i);setSelHour(null);}}
                      onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&!blockedDays[i]&&(setSelDay(i),setSelHour(null))}
                      tabIndex={blockedDays[i]?-1:0} role="option"
                      aria-selected={selDay===i}
                      aria-disabled={!!blockedDays[i]}
                      aria-label={blockedDays[i]?`${fmtDay(d)} — לא זמין`:fmtDay(d)}>
                      {fmtDay(d)}
                    </div>
                  ))}
                </div>
                {selDay!==null && (
                  <div className="up">
                    <p style={{fontSize:12,color:"rgba(200,185,185,0.44)",marginBottom:10}}>שעות פנויות — {fmtDay(days[selDay])}</p>
                    <div role="listbox" aria-label="בחרי שעה" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                      {HOURS.map(h=>{
                        const off  = isSlotBlocked(selDay,h);
                        const appt = slotHasAppt(selDay,h);
                        const cls  = `hour ${off||appt?"hour-off":""} ${selHour===h?"hour-on":""}`;
                        const label = off?"חסום":appt?"תפוס":selHour===h?`${h} — נבחר`:`${h} — פנוי`;
                        return (
                          <button key={h} className={cls}
                            onClick={()=>!off&&!appt&&setSelHour(h)}
                            aria-label={label} aria-disabled={off||appt}
                            aria-pressed={selHour===h}>
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{marginTop:20,display:"flex",justifyContent:"space-between"}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(1)}>← חזרה</button>
                  <button className="btn btn-primary" disabled={selDay===null||!selHour} onClick={()=>setStep(3)}>הבא →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step===3 && (
              <div>
                <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>אישור תור</h2>
                <p style={{color:"rgba(200,185,185,0.44)",fontSize:13,marginBottom:16}}>הפרטים שלך כבר שמורים 🎉</p>

                {/* Client summary */}
                <div className="card" style={{padding:14,marginBottom:12,background:`color-mix(in srgb,${C.primary} 7%,transparent)`,borderColor:`color-mix(in srgb,${C.primary} 25%,transparent)`}}>
                  <div style={{fontSize:12,color:"rgba(200,185,185,0.5)",marginBottom:6}}>הפרטים שלך</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
                    <span style={{fontWeight:600}}>{clientProfile.firstName} {clientProfile.lastName}</span>
                    <span style={{color:"rgba(200,185,185,0.55)"}}>📞 {clientProfile.phone}</span>
                  </div>
                </div>

                {/* Booking summary */}
                <div className="card" style={{padding:14,marginBottom:14,background:`color-mix(in srgb,${C.primary} 5%,transparent)`}}>
                  <div style={{fontSize:12,color:"rgba(200,185,185,0.5)",marginBottom:6}}>סיכום התור</div>
                  {[["שירות",selSvc?.name],["תאריך",fmtDay(days[selDay])],["שעה",selHour],["מחיר",`₪${selSvc?.price}`]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:14}}>
                      <span style={{color:"rgba(200,185,185,0.5)"}}>{k}</span>
                      <strong style={k==="מחיר"?{color:C.accent}:{}}>{v}</strong>
                    </div>
                  ))}
                </div>

                <textarea className="field" placeholder="הערות (לא חובה) — אלרגיות, בקשות מיוחדות..."
                  aria-label="הערות לטיפול"
                  value={bookNotes} onChange={e=>setBookNotes(e.target.value)} style={{marginBottom:16}}/>

                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(2)}>← חזרה</button>
                  <button className="btn btn-primary" onClick={handleBook}>✅ קבעי תור!</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CONFIRM ══ */}
        {view==="confirm" && (
          <div className="up" style={{textAlign:"center",paddingTop:28}}>
            <div style={{fontSize:66,marginBottom:14}} className="pop">🎉</div>
            <h2 style={{fontSize:26,fontWeight:700,color:C.accent,marginBottom:6}}>התור נקבע!</h2>
            <p style={{color:"rgba(200,185,185,0.5)",marginBottom:22}}>נשלח אישור לוואטסאפ שלך</p>
            <div className="card" style={{padding:20,textAlign:"right",marginBottom:20,background:`color-mix(in srgb,${C.primary} 6%,transparent)`}}>
              {[["שם",`${clientProfile?.firstName} ${clientProfile?.lastName}`],["שירות",selSvc?.name],["תאריך",fmtDay(days[selDay])],["שעה",selHour],["מחיר",`₪${selSvc?.price}`]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                  <span style={{color:"rgba(200,185,185,0.5)"}}>{k}</span>
                  <strong style={k==="מחיר"?{color:C.accent}:{}}>{v}</strong>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={resetBook}>קביעת תור נוסף</button>
          </div>
        )}

        {/* ══ OWNER ══ */}
        {view==="owner" && (
          <div className="up">
            {!ownerIn ? (
              <div style={{textAlign:"center",paddingTop:32}}>
                <div style={{fontSize:44,marginBottom:12}}>🔐</div>
                <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>כניסה לניהול</h2>
                <p style={{color:"rgba(200,185,185,0.44)",marginBottom:20}}>הזיני קוד גישה</p>
                <div style={{maxWidth:200,margin:"0 auto 10px"}}>
                  <input className="field" type="password" placeholder="קוד" value={ownerPin}
                    onChange={e=>setOwnerPin(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&(ownerPin==="1234"?(setOwnerIn(true),setPinErr(false)):setPinErr(true))}
                    style={{textAlign:"center",fontSize:22,letterSpacing:10}}/>
                </div>
                {pinErr && <p style={{color:"#ff7777",fontSize:13,marginBottom:10}}>קוד שגוי</p>}
                <button className="btn btn-primary"
                  onClick={()=>ownerPin==="1234"?(setOwnerIn(true),setPinErr(false)):setPinErr(true)}>
                  כניסה
                </button>
                <p style={{marginTop:10,fontSize:11,color:"rgba(200,185,185,0.26)"}}>קוד הדגמה: 1234</p>
              </div>
            ) : (
              <div>
                {/* Tab bar */}
                <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:18}}>
                  {[["appts","📋 תורים"],["avail","🚫 זמינות"],["svcs","💅 שירותים"],["settings","🎨 עיצוב"],["pay","💳 תשלום"]].map(([id,lbl])=>(
                    <button key={id} className={`tab ${ownerTab===id?"tab-on":""}`}
                      onClick={()=>{ if(id==="settings") openSettings(); else if(id==="svcs") {setEditSvcs(services.map(s=>({...s})));setOwnerTab("svcs");} else setOwnerTab(id); }}>
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* ── APPOINTMENTS ── */}
                {ownerTab==="appts" && (
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div>
                        <h2 style={{fontSize:19,fontWeight:700}}>תורים</h2>
                        <p style={{color:"rgba(200,185,185,0.44)",fontSize:12}}>
                          {appointments.filter(a=>a.status!=="cancelled").length} פעילים
                        </p>
                      </div>
                      <div className="card" style={{padding:"9px 14px",textAlign:"center"}}>
                        <div style={{fontSize:17,fontWeight:900,color:C.primary}}>
                          ₪{appointments.filter(a=>a.status==="confirmed")
                            .reduce((s,a)=>s+(services.find(sv=>sv.name===a.service)?.price||0),0)}
                        </div>
                        <div style={{fontSize:10,color:"rgba(200,185,185,0.4)"}}>הכנסה צפויה</div>
                      </div>
                    </div>

                    {/* Filter chips */}
                    {(() => {
                      const [filter, setFilter] = useState("all");
                      const filtered = appointments.filter(a=>
                        filter==="all" ? a.status!=="cancelled" :
                        filter==="cancelled" ? a.status==="cancelled" :
                        a.status===filter
                      );
                      return (
                        <div>
                          <div style={{display:"flex",gap:7,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
                            {[["all","הכל"],["confirmed","מאושרות"],["pending","ממתינות"],["cancelled","בוטלו"]].map(([v,l])=>(
                              <div key={v} className={`chip ${filter===v?"chip-on":""}`} style={{fontSize:12}} onClick={()=>setFilter(v)}>{l}</div>
                            ))}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {filtered.length===0
                              ? <div style={{textAlign:"center",color:"rgba(200,185,185,0.35)",padding:"32px 0",fontSize:14}}>אין תורים להצגה</div>
                              : filtered.map(ap=><ApptCard key={ap.id} ap={ap}/>)
                            }
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── AVAILABILITY ── */}
                {ownerTab==="avail" && (
                  <div>
                    <h2 style={{fontSize:19,fontWeight:700,marginBottom:4}}>ניהול זמינות</h2>
                    <p style={{color:"rgba(200,185,185,0.44)",fontSize:12,marginBottom:14}}>בחרי יום וסמני שעות שאינך זמינה</p>

                    <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
                      {days.map((d,i)=>(
                        <div key={i} className={`chip ${availDay===i?"chip-on":""}`}
                          style={blockedDays[i]?{opacity:.45,textDecoration:"line-through"}:{}}
                          onClick={()=>setAvailDay(availDay===i?null:i)}>
                          {fmtDay(d)}
                          {blockedDays[i]&&" 🚫"}
                        </div>
                      ))}
                    </div>

                    {availDay!==null && (
                      <div className="up">
                        <div className="card" style={{padding:"12px 16px",marginBottom:12,display:"flex",
                          justifyContent:"space-between",alignItems:"center",
                          background: blockedDays[availDay]?"rgba(200,50,50,0.1)":"rgba(255,255,255,0.03)"}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:14}}>🚫 חסימת יום שלם</div>
                            <div style={{fontSize:12,color:"rgba(200,185,185,0.48)"}}>חופשה, מחלה, יום פנוי</div>
                          </div>
                          <button className={`btn ${blockedDays[availDay]?"btn-danger":"btn-ghost"} btn-sm`}
                            onClick={()=>setBlockedDays(p=>{const n={...p};n[availDay]?delete n[availDay]:n[availDay]=true;return n;})}>
                            {blockedDays[availDay]?"שחרר":"חסמי יום"}
                          </button>
                        </div>

                        {!blockedDays[availDay] && (
                          <div>
                            <p style={{fontSize:12,color:"rgba(200,185,185,0.44)",marginBottom:10}}>לחצי לחסום / לשחרר שעה:</p>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                              {HOURS.map(h=>{
                                const key=`${availDay}-${h}`;
                                const blocked=blockedSlots[key];
                                const hasA=slotHasAppt(availDay,h);
                                return (
                                  <button key={h}
                                    style={{
                                      padding:"10px 6px",borderRadius:10,fontSize:13,width:"100%",
                                      fontFamily:"'Heebo'",cursor:hasA?"not-allowed":"pointer",
                                      border:`1px solid ${blocked?"rgba(200,50,50,0.4)":hasA?`color-mix(in srgb,${C.primary} 35%,transparent)`:"rgba(255,255,255,0.08)"}`,
                                      background: blocked?"rgba(200,50,50,0.14)":hasA?`color-mix(in srgb,${C.primary} 10%,transparent)`:"rgba(255,255,255,0.04)",
                                      color: blocked?"#ff8888":hasA?C.accent:"rgba(210,195,195,0.8)",
                                      transition:"all .18s",
                                    }}
                                    onClick={()=>{
                                      if(hasA)return;
                                      setBlockedSlots(p=>{const n={...p};n[key]?delete n[key]:n[key]=true;return n;});
                                    }}>
                                    {h}
                                    {blocked&&<div style={{fontSize:9,marginTop:2}}>🚫חסום</div>}
                                    {hasA&&<div style={{fontSize:9,marginTop:2}}>📅תור</div>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{marginTop:12,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",
                          border:"1px solid rgba(255,255,255,0.06)",fontSize:13}}>
                          {blockedDays[availDay]
                            ? <span style={{color:"#ff8888"}}>🚫 יום חסום לחלוטין</span>
                            : (() => {
                                const cnt=HOURS.filter(h=>blockedSlots[`${availDay}-${h}`]).length;
                                return <span style={{color:cnt>0?"#ffaa44":"#50c878"}}>{cnt>0?`🚫 ${cnt} שעות חסומות`:"✅ כל השעות פתוחות"}</span>;
                              })()
                          }
                        </div>
                      </div>
                    )}
                    {availDay===null && (
                      <div style={{textAlign:"center",color:"rgba(200,185,185,0.32)",fontSize:14,paddingTop:20}}>
                        👆 בחרי יום למעלה
                      </div>
                    )}
                  </div>
                )}

                {/* ── SERVICES ── */}
                {ownerTab==="svcs" && (
                  <div>
                    <h2 style={{fontSize:19,fontWeight:700,marginBottom:4}}>עריכת שירותים</h2>
                    <p style={{color:"rgba(200,185,185,0.44)",fontSize:12,marginBottom:14}}>שנה שמות, מחירים וזמנים</p>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {editSvcs.map((s,i)=>(
                        <div key={s.id} className="card" style={{padding:14}}>
                          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                            {SERVICE_ICONS.map(ic=>(
                              <span key={ic} className={`icon-opt ${s.icon===ic?"icon-opt-on":""}`}
                                onClick={()=>{const n=[...editSvcs];n[i]={...n[i],icon:ic};setEditSvcs(n);}}>{ic}</span>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <input className="field" style={{flex:2,minWidth:90}} placeholder="שם שירות" value={s.name}
                              onChange={e=>{const n=[...editSvcs];n[i]={...n[i],name:e.target.value};setEditSvcs(n);}}/>
                            <input className="field" style={{flex:1,minWidth:65}} placeholder="₪" type="number" value={s.price}
                              onChange={e=>{const n=[...editSvcs];n[i]={...n[i],price:Number(e.target.value)};setEditSvcs(n);}}/>
                            <input className="field" style={{flex:1,minWidth:60}} placeholder="דק׳" type="number" value={s.duration}
                              onChange={e=>{const n=[...editSvcs];n[i]={...n[i],duration:Number(e.target.value)};setEditSvcs(n);}}/>
                            <button className="btn-icon" onClick={()=>setEditSvcs(editSvcs.filter((_,j)=>j!==i))}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:12}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setEditSvcs([...editSvcs,{id:Date.now(),name:"",duration:60,price:100,icon:"💅"}])}>
                        + הוספה
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={()=>{setServices(editSvcs.filter(s=>s.name.trim()));setOwnerTab("appts");}}>
                        שמירה ✓
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SETTINGS ── */}
                {ownerTab==="settings" && (
                  <div>
                    <h2 style={{fontSize:19,fontWeight:700,marginBottom:4}}>עיצוב והגדרות</h2>
                    <p style={{color:"rgba(200,185,185,0.44)",fontSize:12,marginBottom:16}}>התאמת האפליקציה לסגנון שלך</p>

                    {/* Live preview */}
                    <div className="card" style={{padding:16,marginBottom:14,background:`color-mix(in srgb,${C.primary} 6%,transparent)`,borderColor:`color-mix(in srgb,${C.primary} 30%,transparent)`}}>
                      <div style={{fontSize:12,color:"rgba(200,185,185,0.5)",marginBottom:10}}>👁 תצוגה מקדימה — כך ייראה על המסך הבית</div>
                      <div style={{display:"flex",alignItems:"center",gap:16}}>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                          <div style={{
                            width:60,height:60,borderRadius:15,overflow:"hidden",
                            background:`linear-gradient(135deg,${COLOR_THEMES.find(t=>t.id===editTheme)?.bg2||"#1a0a0f"},${COLOR_THEMES.find(t=>t.id===editTheme)?.primary||"#c96060"})`,
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,
                            boxShadow:`0 5px 18px color-mix(in srgb,${COLOR_THEMES.find(t=>t.id===editTheme)?.primary||"#c96060"} 42%,transparent)`,
                            flexShrink:0,
                          }}>
                            {editIconImg
                              ? <img src={editIconImg} alt="icon" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                              : (editIcon||"💅")}
                          </div>
                          <div style={{fontSize:11,color:"rgba(200,185,185,0.75)",textAlign:"center",maxWidth:64,wordBreak:"break-word",lineHeight:1.2,fontWeight:500}}>
                            {(editName||appName).split(" ")[0]}
                          </div>
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:16}}>{editName||appName}</div>
                          <div style={{fontSize:11,color:"rgba(200,185,185,0.42)",letterSpacing:1,marginTop:2}}>{editSub||appSub}</div>
                          {editIconImg && <div style={{fontSize:11,color:"#50c878",marginTop:6}}>✅ תמונה אישית נבחרה</div>}
                        </div>
                      </div>
                    </div>

                    {/* App name */}
                    <div className="card" style={{padding:16,marginBottom:12}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>📛 שם האפליקציה</div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <input className="field" placeholder="שם הסטודיו" value={editName} onChange={e=>setEditName(e.target.value)}/>
                        <input className="field" placeholder="כותרת משנה" value={editSub} onChange={e=>setEditSub(e.target.value)}/>
                      </div>
                    </div>

                    {/* Icon picker */}
                    <div className="card" style={{padding:16,marginBottom:12}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>🎭 אייקון האפליקציה</div>
                      <p style={{fontSize:12,color:"rgba(200,185,185,0.44)",marginBottom:14}}>בחרי תמונה מהגלריה או אימוג׳י</p>

                      {/* ── Upload from gallery ── */}
                      <div style={{marginBottom:16}}>
                        <div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"rgba(200,185,185,0.7)"}}>📷 העלאת תמונה מהגלריה</div>
                        <label style={{
                          display:"flex",alignItems:"center",gap:12,cursor:"pointer",
                          padding:"14px 16px",borderRadius:12,
                          border:`2px dashed ${editIconImg?"color-mix(in srgb,#50c878 60%,transparent)":"color-mix(in srgb,"+C.primary+" 40%,transparent)"}`,
                          background: editIconImg?"rgba(80,200,120,0.07)":"rgba(255,255,255,0.03)",
                          transition:"all .2s",
                        }}>
                          <input type="file" accept="image/*" style={{display:"none"}}
                            onChange={handleIconImageUpload}/>
                          {editIconImg ? (
                            <>
                              <img src={editIconImg} alt="preview"
                                style={{width:48,height:48,borderRadius:12,objectFit:"cover",flexShrink:0,boxShadow:"0 2px 10px rgba(0,0,0,0.4)"}}/>
                              <div>
                                <div style={{fontWeight:600,fontSize:14,color:"#50c878"}}>✅ תמונה נבחרה!</div>
                                <div style={{fontSize:12,color:"rgba(200,185,185,0.5)"}}>לחצי להחלפה</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{
                                width:48,height:48,borderRadius:12,
                                background:`color-mix(in srgb,${C.primary} 15%,transparent)`,
                                display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,
                              }}>🖼️</div>
                              <div>
                                <div style={{fontWeight:600,fontSize:14}}>בחרי תמונה מהגלריה</div>
                                <div style={{fontSize:12,color:"rgba(200,185,185,0.5)"}}>לוגו, תמונה אישית, או כל תמונה שתרצי</div>
                              </div>
                            </>
                          )}
                        </label>
                        {editIconImg && (
                          <button className="btn btn-danger" style={{marginTop:8,fontSize:12,padding:"6px 14px"}}
                            onClick={()=>{setEditIconImg(null);setEditIcon("💅");}}>
                            🗑 הסרת התמונה
                          </button>
                        )}
                      </div>

                      {/* divider */}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
                        <div style={{fontSize:12,color:"rgba(200,185,185,0.35)"}}>או בחרי אימוג׳י</div>
                        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
                      </div>

                      {/* Emoji categories */}
                      {[
                        { label:"💅 יופי וטיפוח", icons:["💅","✨","💎","👑","🌸","🦋","🪷","🌺","💄","👄","🌙","⭐"] },
                        { label:"🎨 עיצוב ואמנות", icons:["🎨","🖌️","✏️","🖊️","🎭","🔮","💫","🌟","🪄","🎀","🏅","🎪"] },
                        { label:"🌿 טבע ורוגע",    icons:["🌿","🍃","🌻","🌷","🌹","🍀","🦚","🦜","🐚","🌊","🌈","☀️"] },
                        { label:"💖 חמוד ומיוחד",  icons:["💖","🩷","🫶","🤍","💜","🩵","💛","🧡","❤️","🎁","🎊","🥂"] },
                      ].map(cat=>(
                        <div key={cat.label} style={{marginBottom:14}}>
                          <div style={{fontSize:12,color:"rgba(200,185,185,0.42)",marginBottom:8}}>{cat.label}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                            {cat.icons.map(ic=>(
                              <button key={ic} onClick={()=>{setEditIcon(ic);setEditIconImg(null);}}
                                style={{
                                  fontSize:24,padding:"6px 10px",borderRadius:10,cursor:"pointer",
                                  border:`2px solid ${(!editIconImg&&editIcon===ic)?`color-mix(in srgb,${C.primary} 80%,transparent)`:"transparent"}`,
                                  background: (!editIconImg&&editIcon===ic)?`color-mix(in srgb,${C.primary} 18%,transparent)`:"rgba(255,255,255,0.04)",
                                  transition:"all .15s",
                                  transform: (!editIconImg&&editIcon===ic)?"scale(1.2)":"scale(1)",
                                  opacity: editIconImg?0.4:1,
                                }}>
                                {ic}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="card" style={{padding:16,marginBottom:12}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>🎨 ערכת צבעים</div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
                        {COLOR_THEMES.map(t=>(
                          <div key={t.id} style={{textAlign:"center"}}>
                            <div className={`swatch ${editTheme===t.id?"swatch-on":""}`}
                              style={{background:t.primary,margin:"0 auto 4px"}}
                              onClick={()=>setEditTheme(t.id)}/>
                            <div style={{fontSize:11,color:"rgba(200,185,185,0.52)"}}>{t.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card" style={{padding:16,marginBottom:16}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>🔗 רשתות חברתיות וניווט</div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {[["📸","אינסטגרם — @username","instagram"],["🎵","טיקטוק — @username","tiktok"],["📱","וואטסאפ — מספר","whatsapp"]].map(([ico,ph,key])=>(
                          <div key={key} style={{position:"relative"}}>
                            <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:16}} aria-hidden="true">{ico}</span>
                            <input className="field" style={{paddingRight:38}} placeholder={ph}
                              aria-label={ph}
                              value={editSocial[key]} onChange={e=>setEditSocial({...editSocial,[key]:e.target.value})}/>
                          </div>
                        ))}
                        {/* Waze address */}
                        <div style={{position:"relative"}}>
                          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:16}} aria-hidden="true">🗺️</span>
                          <input className="field" style={{paddingRight:38}}
                            placeholder="כתובת לניווט ב-Waze (למשל: רוטשילד 1, תל אביב)"
                            aria-label="כתובת העסק לניווט"
                            value={editAddress} onChange={e=>setEditAddress(e.target.value)}/>
                        </div>
                        {editAddress && (
                          <a href={`https://waze.com/ul?q=${encodeURIComponent(editAddress)}&navigate=yes`}
                            target="_blank" rel="noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:10,
                              background:"rgba(0,210,100,0.1)",border:"1px solid rgba(0,210,100,0.25)",
                              color:"#00d264",fontSize:13,textDecoration:"none",fontFamily:"'Heebo'",fontWeight:600}}
                            aria-label={`בדיקת ניווט ל-${editAddress}`}>
                            🗺️ בדיקת ניווט — {editAddress}
                          </a>
                        )}
                      </div>
                    </div>

                    <button className="btn btn-primary" style={{width:"100%"}} onClick={saveSettings}>
                      {saved?"✅ נשמר!":"💾 שמירת שינויים"}
                    </button>
                  </div>
                )}

                {/* ── PAYMENT ── */}
                {ownerTab==="pay" && (
                  <div>
                    <h2 style={{fontSize:19,fontWeight:700,marginBottom:4}}>מנוי ותשלום</h2>
                    <p style={{color:"rgba(200,185,185,0.44)",fontSize:13,marginBottom:18}}>אפליקציית קביעת תורים חכמה</p>

                    <div className="card" style={{padding:16,marginBottom:14,
                      background:trialExpired?"rgba(200,50,50,0.08)":`color-mix(in srgb,${C.primary} 7%,transparent)`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>
                            {trialExpired?"⛔ הניסיון הסתיים":"✅ שבוע ניסיון חינמי"}
                          </div>
                          <div style={{fontSize:13,color:"rgba(200,185,185,0.5)"}}>
                            {trialExpired?"יש לחדש מנוי":`נותרו ${remaining} ימים`}
                          </div>
                        </div>
                        <div style={{fontSize:34}}>{trialExpired?"😔":"🎁"}</div>
                      </div>
                    </div>

                    <div className="card" style={{padding:18,marginBottom:12,border:`1px solid color-mix(in srgb,${C.primary} 38%,transparent)`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                        <div>
                          <div style={{fontWeight:800,fontSize:22,color:C.accent}}>₪200</div>
                          <div style={{fontSize:13,color:"rgba(200,185,185,0.5)"}}>לחודש · כולל הכל</div>
                        </div>
                        <div style={{background:`color-mix(in srgb,${C.primary} 18%,transparent)`,padding:"4px 12px",
                          borderRadius:20,fontSize:12,color:C.accent,fontWeight:600,height:"fit-content"}}>פופולרי</div>
                      </div>
                      {["✓ תורים ללא הגבלה","✓ ניהול שירותים ומחירים","✓ עיצוב מותאם","✓ קישורי סושיאל","✓ חסימת שעות וימים","✓ התקשרות ישירה ללקוחות"].map(f=>(
                        <div key={f} style={{fontSize:13,color:"rgba(200,185,185,0.68)",marginBottom:5}}>{f}</div>
                      ))}
                    </div>

                    <div style={{fontWeight:600,fontSize:14,marginBottom:10}}>בחרי אמצעי תשלום:</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {[
                        {icon:"💙",bg:"linear-gradient(135deg,#0066ff,#0044cc)",name:"Bit",sub:"שלחי ₪200 למספר",val:"050-000-0000",btn:"פתחי Bit"},
                        {icon:"🟠",bg:"linear-gradient(135deg,#ff6600,#cc4400)",name:"Paybox",sub:"תשלום דרך Paybox",val:"paybox.me/nailsbydana",btn:"פתחי"},
                      ].map(pm=>(
                        <div key={pm.name} className="card" style={{padding:16,display:"flex",alignItems:"center",gap:14}}>
                          <div style={{width:42,height:42,borderRadius:12,background:pm.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{pm.icon}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:15}}>{pm.name}</div>
                            <div style={{fontSize:12,color:"rgba(200,185,185,0.5)"}}>{pm.sub}</div>
                            <div style={{fontSize:14,fontWeight:700,color:C.accent,marginTop:2}}>{pm.val}</div>
                          </div>
                          <button className="btn btn-primary btn-sm">{pm.btn}</button>
                        </div>
                      ))}

                      <div className="card" style={{padding:16}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                          <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏦</div>
                          <div>
                            <div style={{fontWeight:700,fontSize:15}}>העברה בנקאית</div>
                            <div style={{fontSize:12,color:"rgba(200,185,185,0.5)"}}>העברה ישירה לחשבון</div>
                          </div>
                        </div>
                        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12}}>
                          {[["בנק","פועלים (12)"],["סניף","000"],["חשבון","12-345-67"],["שם","דנה כהן"]].map(([k,v])=>(
                            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                              <span style={{color:"rgba(200,185,185,0.5)"}}>{k}</span>
                              <strong>{v}</strong>
                            </div>
                          ))}
                        </div>
                        <p style={{marginTop:10,fontSize:11,color:"rgba(200,185,185,0.32)"}}>לאחר ההעברה שלחי אישור בוואטסאפ ונפעיל תוך 24 שעות.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
