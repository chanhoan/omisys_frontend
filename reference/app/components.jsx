// components.jsx — MUTE shared UI. Exports to window.
// All components take the theme token object `T` (from buildTheme).

// ── Icons (simple line glyphs, currentColor) ───────────────────────
function Icon({ name, size = 22, stroke = 2, style = {} }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    heart: <path d="M12 20s-7-4.4-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.1 1.2 4 2.4C10.9 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.6 12 20 12 20Z" />,
    heartFill: <path d="M12 20s-7-4.4-9.2-8.5C1.3 8.3 2.8 5 6 5c2 0 3.1 1.2 4 2.4C10.9 6.2 12 5 14 5c3.2 0 4.7 3.3 3.2 6.5C19 15.6 12 20 12 20Z" fill="currentColor" stroke="none" />,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /></>,
    back: <path d="M15 5l-7 7 7 7" />,
    chevR: <path d="M9 5l7 7-7 7" />,
    chevD: <path d="M5 9l7 7 7-7" />,
    close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    check: <path d="M5 12.5 10 17l9-10" />,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    sliders: <><path d="M4 8h10" /><path d="M18 8h2" /><circle cx="16" cy="8" r="2" /><path d="M4 16h2" /><path d="M10 16h10" /><circle cx="8" cy="16" r="2" /></>,
    share: <><path d="M12 15V4" /><path d="M8 7l4-3 4 3" /><path d="M5 12v7h14v-7" /></>,
    star: <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6 6.9 19.2l1-5.7-4.1-4 5.7-.8L12 3.5Z" />,
    truck: <><rect x="2" y="7" width="12" height="9" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
    ruler: <><rect x="3" y="8" width="18" height="8" rx="0" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>,
    arrowR: <><path d="M5 12h14" /><path d="M14 6l6 6-6 6" /></>,
    pin: <><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z" /><circle cx="12" cy="11" r="2" /></>,
    card: <><rect x="3" y="6" width="18" height="12" rx="1" /><path d="M3 10h18" /></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

// ── Display text (per-direction headline font) ─────────────────────
function Disp({ T, size = 32, lh, style = {}, children }) {
  return <span style={{ fontFamily: T.dispFam, fontWeight: T.dispWeight, fontSize: size,
    lineHeight: lh || T.dispLine, letterSpacing: T.dispTrack,
    textTransform: T.dispUpper ? 'uppercase' : 'none', display: 'block', ...style }}>{children}</span>;
}

// mono label (Space Grotesk, tracked, upper)
function Mono({ T, size = 11, style = {}, children }) {
  return <span style={{ fontFamily: T.monoFam, fontSize: size, fontWeight: 600,
    letterSpacing: '0.16em', textTransform: 'uppercase', ...style }}>{children}</span>;
}

// ── Image placeholder (monochrome diagonal stripes + label) ────────
function Ph({ T, ratio = '4 / 5', label = 'IMAGE', seed = 0, rounded = true, style = {}, children }) {
  const ang = 45 + (seed % 3) * 0;
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: ratio, overflow: 'hidden',
      borderRadius: rounded ? T.rImg : 0, background: T.phB,
      backgroundImage: `repeating-linear-gradient(${ang}deg, ${T.phA}, ${T.phA} 8px, ${T.phB} 8px, ${T.phB} 16px)`,
      border: `1px solid ${T.phBorder}`, ...style }}>
      <div style={{ position: 'absolute', left: 10, bottom: 9 }}>
        <Mono T={T} size={9} style={{ color: T.phLabel }}>{label}</Mono>
      </div>
      {children}
    </div>
  );
}

// ── Tag / badge ────────────────────────────────────────────────────
function Tag({ T, children, solid = false, style = {} }) {
  return <span style={{ fontFamily: T.monoFam, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', padding: '3px 7px 2px', lineHeight: 1.1,
    borderRadius: T.corners === 'soft' ? 999 : 0,
    background: solid ? T.accent : 'transparent', color: solid ? T.accentText : T.text,
    border: solid ? 'none' : `1px solid ${T.text}`, ...style }}>{children}</span>;
}

// ── Chip (filter pills) ────────────────────────────────────────────
function Chip({ T, active, children, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: T.bodyFam, fontSize: 13 * T.fs, fontWeight: 600,
      padding: '9px 15px', borderRadius: T.pill, whiteSpace: 'nowrap', cursor: 'pointer',
      background: active ? T.accent : 'transparent', color: active ? T.accentText : T.text,
      border: `1px solid ${active ? T.accent : T.line}`, transition: 'all .15s', letterSpacing: '-0.01em' }}>
      {children}
    </button>
  );
}

// ── Icon button (round/square) ─────────────────────────────────────
function IconBtn({ T, name, onClick, badge, size = 40, fill = false }) {
  return (
    <button onClick={onClick} style={{ position: 'relative', width: size, height: size, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      background: 'transparent', border: 'none', color: 'inherit', padding: 0 }}>
      <Icon name={fill ? name + 'Fill' : name} size={23} stroke={1.9} />
      {badge > 0 && (
        <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px',
          borderRadius: 999, background: T.accent, color: T.accentText, fontFamily: T.monoFam,
          fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
      )}
    </button>
  );
}

// ── Buttons ────────────────────────────────────────────────────────
function PrimaryBtn({ T, children, onClick, full = true, style = {} }) {
  return (
    <button onClick={onClick} style={{ fontFamily: T.bodyFam, fontSize: 15 * T.fs, fontWeight: 700,
      width: full ? '100%' : 'auto', padding: '16px 22px', borderRadius: T.corners === 'soft' ? T.r : 0,
      background: T.accent, color: T.accentText, border: 'none', cursor: 'pointer', letterSpacing: '-0.01em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style }}>{children}</button>
  );
}
function GhostBtn({ T, children, onClick, full = true, style = {} }) {
  return (
    <button onClick={onClick} style={{ fontFamily: T.bodyFam, fontSize: 15 * T.fs, fontWeight: 600,
      width: full ? '100%' : 'auto', padding: '15px 22px', borderRadius: T.corners === 'soft' ? T.r : 0,
      background: 'transparent', color: T.text, border: `1px solid ${T.text}`, cursor: 'pointer',
      letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style }}>{children}</button>
  );
}

// ── Color dots ─────────────────────────────────────────────────────
function ColorDots({ colors, T, size = 13, sel = -1, onSel }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {colors.map((c, i) => (
        <button key={i} onClick={onSel ? () => onSel(i) : undefined} style={{ width: size, height: size,
          borderRadius: 999, background: c, cursor: onSel ? 'pointer' : 'default', padding: 0,
          border: `1px solid ${T.line}`, outline: i === sel ? `1.5px solid ${T.text}` : 'none', outlineOffset: 2 }} />
      ))}
    </div>
  );
}

// ── Sold-through bar ───────────────────────────────────────────────
function SoldBar({ T, pct }) {
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ height: 3, background: T.hair, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: (pct * 100) + '%', height: '100%', background: T.text }} />
      </div>
      <Mono T={T} size={8.5} style={{ color: T.textMut, display: 'block', marginTop: 5 }}>
        {pct >= 0.8 ? 'Almost gone · ' : 'Sold '}{Math.round(pct * 100)}%
      </Mono>
    </div>
  );
}

// ── Product card ───────────────────────────────────────────────────
function ProductCard({ p, T, onOpen, onFav, faved, full = false }) {
  return (
    <div onClick={() => onOpen(p)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <Ph T={T} ratio={full ? '4 / 5' : '4 / 5'} label={p.id.toUpperCase()} seed={p.seed}
        style={{ border: T.cardBorder ? `1px solid ${T.phBorder}` : `1px solid ${T.phBorder}` }}>
        <div style={{ position: 'absolute', top: 9, left: 9, display: 'flex', gap: 5 }}>
          {p.tags.slice(0, 1).map((tg) => <Tag key={tg} T={T} solid={tg === 'HOT'}>{tg}</Tag>)}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onFav(p.id); }}
          style={{ position: 'absolute', top: 7, right: 7, width: 32, height: 32, border: 'none',
            background: 'transparent', cursor: 'pointer', color: T.text, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <Icon name={faved ? 'heartFill' : 'heart'} size={20} stroke={1.8} />
        </button>
      </Ph>
      <div style={{ paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: T.bodyFam, fontSize: 13.5 * T.fs, fontWeight: 600, color: T.text,
            letterSpacing: '-0.01em', lineHeight: 1.25 }}>{p.name}</span>
        </div>
        <span style={{ fontFamily: T.bodyFam, fontSize: 11.5 * T.fs, color: T.textMut, display: 'block', marginTop: 2 }}>{p.ko}</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontFamily: T.monoFam, fontSize: 12.5 * T.fs, fontWeight: 600, color: T.text }}>{p.priceLabel}</span>
          <ColorDots colors={p.colors} T={T} size={10} />
        </div>
        {full && p.sold >= 0.6 && <SoldBar T={T} pct={p.sold} />}
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────
function SectionHead({ T, kicker, title, action, onAction, size = 24 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
      <div>
        {kicker && <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', marginBottom: 7 }}>{kicker}</Mono>}
        <Disp T={T} size={size}>{title}</Disp>
      </div>
      {action && (
        <button onClick={onAction} style={{ background: 'transparent', border: 'none', cursor: 'pointer',
          color: T.text, display: 'flex', alignItems: 'center', gap: 4, padding: '0 0 3px',
          fontFamily: T.bodyFam, fontSize: 12.5, fontWeight: 600 }}>
          {action}<Icon name="arrowR" size={15} stroke={1.8} />
        </button>
      )}
    </div>
  );
}

// ── Top bar ────────────────────────────────────────────────────────
function TopBar({ T, title, onBack, right, center, wordmark, sub, transparent, border }) {
  const onDark = transparent && T.dark;
  const col = transparent ? T.text : T.text;
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30,
      background: transparent ? 'transparent' : T.bg,
      borderBottom: border ? `1px solid ${T.line}` : 'none', color: col,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '46px 12px 8px', minHeight: 52, gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 44 }}>
        {onBack && <IconBtn T={T} name="back" onClick={onBack} />}
        {wordmark && (
          <div style={{ paddingLeft: 6 }}>
            <span style={{ fontFamily: T.dispFam, fontWeight: T.dispUpper ? T.dispWeight : 700, fontSize: 23,
              letterSpacing: T.dispUpper ? '-0.02em' : '0.01em', color: 'inherit', textTransform: 'uppercase' }}>MUTE</span>
          </div>
        )}
      </div>
      {(title || center) && (
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontFamily: T.bodyFam, fontSize: 15, fontWeight: 700, color: 'inherit', letterSpacing: '-0.01em' }}>{title}</span>
          {sub && <Mono T={T} size={8.5} style={{ color: T.textMut, display: 'block', marginTop: 1 }}>{sub}</Mono>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 44, justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ── Bottom nav ─────────────────────────────────────────────────────
function BottomNav({ T, tab, onTab, bagCount, savedCount }) {
  const items = [
    { k: 'home', icon: 'home', label: 'Home' },
    { k: 'shop', icon: 'grid', label: 'Shop' },
    { k: 'search', icon: 'search', label: 'Search' },
    { k: 'saved', icon: 'heart', label: 'Saved', badge: savedCount },
    { k: 'account', icon: 'user', label: 'You' },
  ];
  return (
    <div style={{ display: 'flex', borderTop: `1px solid ${T.line}`, background: T.bg,
      padding: '8px 6px 6px', flexShrink: 0 }}>
      {items.map((it) => {
        const on = tab === it.k;
        return (
          <button key={it.k} onClick={() => onTab(it.k)} style={{ flex: 1, background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, padding: '4px 0', color: on ? T.text : T.textFaint, position: 'relative' }}>
            <Icon name={on && (it.icon === 'heart') ? 'heartFill' : it.icon} size={22} stroke={on ? 2.1 : 1.8} />
            <span style={{ fontFamily: T.bodyFam, fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: '-0.01em' }}>{it.label}</span>
            {it.badge > 0 && <span style={{ position: 'absolute', top: -2, right: '50%', marginRight: -18,
              minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999, background: T.accent,
              color: T.accentText, fontFamily: T.monoFam, fontSize: 9, fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Bottom sheet (modal) ───────────────────────────────────────────
function BottomSheet({ T, title, onClose, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: T.overlay, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: T.surface, borderTopLeftRadius: T.corners === 'soft' ? 24 : 0,
        borderTopRightRadius: T.corners === 'soft' ? 24 : 0, borderTop: `1px solid ${T.line}`,
        maxHeight: '82%', overflowY: 'auto', padding: `0 ${T.pad}px ${T.pad}px`, animation: 'sheetUp .28s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ position: 'sticky', top: 0, background: T.surface, paddingTop: 14, paddingBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
          <Disp T={T} size={20}>{title}</Disp>
          <IconBtn T={T} name="close" onClick={onClose} size={32} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────
function Toast({ T, children }) {
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 90,
      background: T.dark ? '#f5f4f1' : '#0b0a09', color: T.dark ? '#0b0a09' : '#fff', padding: '13px 20px',
      borderRadius: T.corners === 'soft' ? 999 : 0, fontFamily: T.bodyFam, fontSize: 13.5, fontWeight: 600,
      whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
      animation: 'toastIn .3s cubic-bezier(.2,.8,.2,1)' }}>
      <Icon name="check" size={17} stroke={2.4} /> {children}
    </div>
  );
}

// ── Quantity stepper ───────────────────────────────────────────────
function Stepper({ T, value, onChange, min = 1 }) {
  const btn = (name, dis, fn) => (
    <button onClick={fn} disabled={dis} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'transparent', border: 'none', cursor: dis ? 'default' : 'pointer',
      color: dis ? T.textFaint : T.text, padding: 0 }}><Icon name={name} size={16} stroke={2} /></button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${T.line}`,
      borderRadius: T.corners === 'soft' ? 999 : 0 }}>
      {btn('minus', value <= min, () => value > min && onChange(value - 1))}
      <span style={{ fontFamily: T.monoFam, fontSize: 13, fontWeight: 600, color: T.text, minWidth: 22, textAlign: 'center' }}>{value}</span>
      {btn('plus', false, () => onChange(value + 1))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ T, icon, title, sub, cta, onCta }) {
  return (
    <div style={{ textAlign: 'center', padding: '70px 30px' }}>
      <div style={{ display: 'inline-flex', width: 64, height: 64, alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? 999 : 0, color: T.text, marginBottom: 18 }}>
        <Icon name={icon} size={28} stroke={1.6} />
      </div>
      <Disp T={T} size={26}>{title}</Disp>
      {sub && <p style={{ fontFamily: T.bodyFam, fontSize: 14, color: T.textMut, marginTop: 8, lineHeight: 1.55 }}>{sub}</p>}
      {cta && <div style={{ marginTop: 22, maxWidth: 220, marginLeft: 'auto', marginRight: 'auto' }}><PrimaryBtn T={T} onClick={onCta}>{cta}</PrimaryBtn></div>}
    </div>
  );
}

Object.assign(window, {
  Icon, Disp, Mono, Ph, Tag, Chip, IconBtn, PrimaryBtn, GhostBtn,
  ColorDots, SoldBar, ProductCard, SectionHead, TopBar, BottomNav,
  BottomSheet, Toast, Stepper, EmptyState,
});
