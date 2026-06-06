// theme.js — MUTE design tokens. 3 directions × light/dark × tweaks.
// Attaches window.buildTheme(tweaks) -> flat token object.
(function () {
  // Monochrome ramps (0=white … 100=ink). Three tones, all near-neutral.
  const RAMPS = {
    warm:    { 0:'#ffffff',5:'#f5f4f1',10:'#ecebe6',20:'#dad8d2',35:'#b6b3ab',55:'#84817a',70:'#56534d',85:'#2c2b27',93:'#1a1916',100:'#0b0a09' },
    neutral: { 0:'#ffffff',5:'#f5f5f6',10:'#ebebed',20:'#d8d8db',35:'#b3b4b8',55:'#828388',70:'#535458',85:'#28292c',93:'#171819',100:'#09090a' },
    cool:    { 0:'#ffffff',5:'#f2f4f6',10:'#e7ebef',20:'#d3d8de',35:'#abb2bb',55:'#7b828b',70:'#4d535b',85:'#24282d',93:'#13161a',100:'#070809' },
  };

  // Per-direction character.
  const DIRS = {
    editorial: { display:'serif',   dispUpper:false, dispWeight:400, dispTrack:'-0.01em', dispLine:0.98,
                 radius:2,  pill:2,  unit:1.15, cardGap:14, ground:0,  tone:'warm',    cardBorder:true,  shadow:false },
    street:    { display:'grotesk', dispUpper:true,  dispWeight:900, dispTrack:'-0.03em', dispLine:0.86,
                 radius:0,  pill:0,  unit:0.92, cardGap:8,  ground:0,  tone:'neutral', cardBorder:true,  shadow:false },
    soft:      { display:'sans',    dispUpper:false, dispWeight:800, dispTrack:'-0.02em', dispLine:1.0,
                 radius:18, pill:999,unit:1.1,  cardGap:14, ground:5,  tone:'warm',    cardBorder:false, shadow:true },
  };

  const FONTS = {
    serif:   { fam:"'Instrument Serif',Georgia,serif", up:false },
    grotesk: { fam:"'Archivo','Space Grotesk',sans-serif", up:true },
    sans:    { fam:"'Pretendard Variable',-apple-system,system-ui,sans-serif", up:false },
  };

  const DENS = { compact:{m:0.85,fs:0.96}, regular:{m:1,fs:1}, comfy:{m:1.18,fs:1.04} };

  window.DIRECTION_KEYS = ['editorial','street','soft'];

  window.buildTheme = function (t) {
    const d = DIRS[t.direction] || DIRS.editorial;
    const tone = t.tone && t.tone !== 'auto' ? t.tone : d.tone;
    const R = RAMPS[tone] || RAMPS.warm;
    const dark = !!t.dark;
    const dens = DENS[t.density] || DENS.regular;

    // ground & surfaces
    const bg      = dark ? R[100] : R[d.ground];
    const surface = dark ? R[93]  : R[0];
    const surfAlt = dark ? R[85]  : R[5];
    const text    = dark ? R[5]   : R[100];
    const textMut = dark ? R[55]  : R[55];
    const textFaint = dark ? R[70] : R[35];
    const line    = dark ? 'rgba(255,255,255,0.13)' : R[20];
    const hair    = dark ? 'rgba(255,255,255,0.08)' : R[10];
    // primary action = max contrast block
    const accent     = dark ? R[5]   : R[100];
    const accentText = dark ? R[100] : R[0];

    // corners
    const corners = t.corners || (d.radius > 6 ? 'soft' : 'sharp');
    const soft = corners === 'soft';
    const r   = soft ? Math.max(d.radius, 14) : Math.min(d.radius, 2);
    const rSm = soft ? 10 : Math.min(d.radius, 2);
    const rImg= soft ? 16 : 0;
    const pill= soft ? 999 : (d.display === 'grotesk' ? 0 : 2);

    // display font (tweak overrides direction default)
    const dispKey = (t.display && t.display !== 'auto') ? t.display : d.display;
    const f = FONTS[dispKey] || FONTS.serif;

    const u = 8 * d.unit * dens.m; // base spacing unit (px)

    return {
      key: t.direction, dark, tone, corners,
      // colors
      bg, surface, surfAlt, text, textMut, textFaint, line, hair, accent, accentText,
      overlay: dark ? 'rgba(0,0,0,0.6)' : 'rgba(10,10,9,0.45)',
      // placeholder stripe tones
      phA: dark ? '#1c1b19' : R[10], phB: dark ? '#161513' : R[5], phBorder: dark ? 'rgba(255,255,255,0.08)' : R[20],
      phLabel: dark ? R[55] : R[55],
      // radii
      r, rSm, rImg, pill,
      // spacing
      u, pad: Math.round(u * 2.2), gap: d.cardGap, sectionGap: Math.round(u * 4.2),
      // type
      bodyFam: "'Pretendard Variable',-apple-system,system-ui,sans-serif",
      monoFam: "'Space Grotesk',ui-monospace,monospace",
      dispFam: f.fam, dispUpper: f.up, dispWeight: d.dispWeight, dispTrack: d.dispTrack, dispLine: d.dispLine,
      fs: dens.fs,
      // flags
      cardBorder: d.cardBorder || !soft, shadow: d.shadow && soft,
      uppercaseTags: true,
    };
  };
})();
