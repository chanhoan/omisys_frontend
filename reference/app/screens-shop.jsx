// screens-shop.jsx — Home, Shop (PLP), Product (PDP), Search

// ── HOME ───────────────────────────────────────────────────────────
function HomeScreen({ ctx }) {
  const { T, push, setTab, fav, toggleFav, addToBag } = ctx;
  const D = window.DATA;
  const newIn = D.products.filter((p) => p.tags.includes('NEW'));
  const hero = D.byId('out-01');
  return (
    <>
      <TopBar T={T} transparent wordmark right={<>
        <IconBtn T={T} name="search" onClick={() => setTab('search')} />
        <IconBtn T={T} name="bag" onClick={() => push('bag')} badge={ctx.bag.length} />
      </>} />
      {/* HERO */}
      <div style={{ position: 'relative', marginTop: -110 }}>
        <Ph T={T} ratio="3 / 4.1" label="HERO · LOOKBOOK 04 · MODEL-WORN" seed={3} rounded={false} />
        <div style={{ position: 'absolute', inset: 0, background: T.dark
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0) 36%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.35) 100%)'
          : 'linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0) 34%, rgba(255,255,255,0) 50%, rgba(245,244,241,0.55) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, padding: `0 ${T.pad}px`, color: T.text }}>
          <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', marginBottom: 12 }}>F/W 2026 · Night Shift</Mono>
          <Disp T={T} size={58} style={{ color: T.text }}>Drop 04</Disp>
          <p style={{ fontFamily: T.bodyFam, fontSize: 14, color: T.textMut, margin: '10px 0 18px', maxWidth: 280, lineHeight: 1.5 }}>
            새벽의 무드. 24 pieces, monochrome only — sizes going fast.</p>
          <button onClick={() => push('collection', { id: 'drop04' })} style={{ fontFamily: T.bodyFam, fontSize: 14.5,
            fontWeight: 700, padding: '14px 26px', border: 'none', cursor: 'pointer', color: T.accentText,
            background: T.accent, borderRadius: T.corners === 'soft' ? 999 : 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Shop the drop <Icon name="arrowR" size={16} stroke={2} /></button>
        </div>
      </div>

      {/* NEW IN rail */}
      <div style={{ padding: `${T.sectionGap}px 0 0` }}>
        <div style={{ padding: `0 ${T.pad}px` }}>
          <SectionHead T={T} kicker="Just landed" title="New in" action="All" onAction={() => { setTab('shop'); }} />
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: `0 ${T.pad}px 4px`, scrollbarWidth: 'none' }}>
          {newIn.map((p) => (
            <div key={p.id} style={{ width: 156, flexShrink: 0 }}>
              <ProductCard p={p} T={T} onOpen={(x) => push('pdp', { id: x.id })} onFav={toggleFav} faved={fav.has(p.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* COLLECTIONS */}
      <div style={{ padding: `${T.sectionGap}px ${T.pad}px 0` }}>
        <SectionHead T={T} kicker="Curated" title="Collections" size={24} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {D.collections.map((c) => (
            <div key={c.id} onClick={() => push('collection', { id: c.id })} style={{ position: 'relative', cursor: 'pointer' }}>
              <Ph T={T} ratio="16 / 7" label={'COLLECTION · ' + c.name.toUpperCase()} seed={c.count}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.05))' }} />
                <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
                  <Mono T={T} size={9} style={{ opacity: 0.85, marginBottom: 6 }}>{c.tag}</Mono>
                  <Disp T={T} size={28} style={{ color: '#fff' }}>{c.name}</Disp>
                  <span style={{ fontFamily: T.bodyFam, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{c.sub} · {c.count} items</span>
                </div>
              </Ph>
            </div>
          ))}
        </div>
      </div>

      {/* EDITORIAL statement */}
      <div style={{ padding: `${T.sectionGap}px ${T.pad}px 0` }}>
        <div style={{ borderTop: `1px solid ${T.text}`, paddingTop: 22 }}>
          <Disp T={T} size={34} style={{ maxWidth: 320 }}>Loud silhouettes, quiet palette.</Disp>
          <p style={{ fontFamily: T.bodyFam, fontSize: 14, color: T.textMut, marginTop: 14, lineHeight: 1.6, maxWidth: 300 }}>
            MUTE는 서울의 거리에서 시작된 모노크롬 스트릿웨어 레이블입니다. No noise, just fits.</p>
          <button onClick={() => push('about')} style={{ marginTop: 16, background: 'transparent', border: 'none',
            cursor: 'pointer', color: T.text, fontFamily: T.bodyFam, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
            Our story <Icon name="arrowR" size={15} stroke={2} /></button>
        </div>
      </div>

      {/* TRENDING */}
      <div style={{ padding: `${T.sectionGap}px ${T.pad}px 110px` }}>
        <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', marginBottom: 12 }}>Trending now</Mono>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {D.trending.map((t) => <Chip key={t} T={T} onClick={() => { setTab('search'); ctx.setSearch(t); }}>{t}</Chip>)}
        </div>
      </div>
    </>
  );
}

// ── SHOP / PLP ─────────────────────────────────────────────────────
function ShopScreen({ ctx }) {
  const { T, push, fav, toggleFav } = ctx;
  const D = window.DATA;
  const [cat, setCat] = React.useState(ctx.shopCat || 'All');
  const [twoCol, setTwoCol] = React.useState(true);
  const [sheet, setSheet] = React.useState(false);
  const [sort, setSort] = React.useState('Newest');
  React.useEffect(() => { ctx.shopCat = cat; }, [cat]);
  let items = D.inCat(cat);
  if (sort === 'Price ↑') items = [...items].sort((a, b) => a.price - b.price);
  if (sort === 'Price ↓') items = [...items].sort((a, b) => b.price - a.price);
  return (
    <>
      <TopBar T={T} title="Shop" sub={cat === 'All' ? 'All products' : cat} border right={<>
        <IconBtn T={T} name={twoCol ? 'grid' : 'grid'} onClick={() => setTwoCol(!twoCol)} />
        <IconBtn T={T} name="bag" onClick={() => push('bag')} badge={ctx.bag.length} />
      </>} />
      {/* category chips */}
      <div style={{ position: 'sticky', top: 98, zIndex: 20, background: T.bg, borderBottom: `1px solid ${T.hair}` }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: `10px ${T.pad}px`, scrollbarWidth: 'none' }}>
          {D.categories.map((c) => <Chip key={c} T={T} active={c === cat} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
      </div>
      {/* count + sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `12px ${T.pad}px 10px` }}>
        <Mono T={T} size={10} style={{ color: T.textMut }}>{items.length} items</Mono>
        <button onClick={() => setSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent',
          border: 'none', cursor: 'pointer', color: T.text, fontFamily: T.bodyFam, fontSize: 13, fontWeight: 600, padding: 0 }}>
          <Icon name="sliders" size={17} stroke={1.9} /> {sort} · Filter</button>
      </div>
      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol ? '1fr 1fr' : '1fr', gap: twoCol ? 14 : 22,
        padding: `0 ${T.pad}px 110px`, columnGap: 12 }}>
        {items.map((p) => <ProductCard key={p.id} p={p} T={T} full onOpen={(x) => push('pdp', { id: x.id })}
          onFav={toggleFav} faved={fav.has(p.id)} />)}
      </div>

      {/* FILTER SHEET */}
      {sheet && <BottomSheet T={T} title="Sort & filter" onClose={() => setSheet(false)}>
        <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', margin: '4px 0 10px' }}>Sort by</Mono>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
          {['Newest', 'Price ↑', 'Price ↓', 'Best selling'].map((s) => <Chip key={s} T={T} active={s === sort} onClick={() => setSort(s)}>{s}</Chip>)}
        </div>
        <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', margin: '4px 0 10px' }}>Category</Mono>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {D.categories.map((c) => <Chip key={c} T={T} active={c === cat} onClick={() => setCat(c)}>{c}</Chip>)}
        </div>
        <div style={{ marginTop: 22 }}><PrimaryBtn T={T} onClick={() => setSheet(false)}>Show {items.length} items</PrimaryBtn></div>
      </BottomSheet>}
    </>
  );
}

// ── PRODUCT / PDP ──────────────────────────────────────────────────
function PdpScreen({ ctx, params }) {
  const { T, pop, push, fav, toggleFav, addToBag } = ctx;
  const D = window.DATA;
  const p = D.byId(params.id);
  const [img, setImg] = React.useState(0);
  const [color, setColor] = React.useState(0);
  const [size, setSize] = React.useState(null);
  const [acc, setAcc] = React.useState('details');
  const [toast, setToast] = React.useState(false);
  const related = D.inCat(p.cat).filter((x) => x.id !== p.id).slice(0, 6);
  const add = () => { if (!size) { setAcc('fit'); return; } addToBag(p, size, color); setToast(true); setTimeout(() => setToast(false), 1600); };
  return (
    <>
      <TopBar T={T} transparent onBack={pop} right={<>
        <IconBtn T={T} name="share" />
        <IconBtn T={T} name="heart" fill={fav.has(p.id)} onClick={() => toggleFav(p.id)} />
      </>} />
      {/* gallery */}
      <div style={{ marginTop: -110 }}>
        <Ph T={T} ratio="3 / 4" label={p.id.toUpperCase() + ' · 0' + (img + 1)} seed={p.seed + img} rounded={false} />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: `10px ${T.pad}px`, scrollbarWidth: 'none' }}>
          {Array.from({ length: p.gallery }).map((_, i) => (
            <button key={i} onClick={() => setImg(i)} style={{ width: 56, flexShrink: 0, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <Ph T={T} ratio="3 / 4" label="" seed={p.seed + i}
                style={{ outline: i === img ? `1.5px solid ${T.text}` : 'none', outlineOffset: 1, opacity: i === img ? 1 : 0.55 }} />
            </button>
          ))}
        </div>
      </div>
      {/* info */}
      <div style={{ padding: `8px ${T.pad}px 0` }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {p.tags.map((tg) => <Tag key={tg} T={T} solid={tg === 'HOT'}>{tg}</Tag>)}
          <Mono T={T} size={9.5} style={{ color: T.textMut, alignSelf: 'center' }}>{p.cat} · {p.sub}</Mono>
        </div>
        <Disp T={T} size={30}>{p.name}</Disp>
        <span style={{ fontFamily: T.bodyFam, fontSize: 14, color: T.textMut, display: 'block', marginTop: 4 }}>{p.ko}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <span style={{ fontFamily: T.monoFam, fontSize: 19, fontWeight: 600, color: T.text }}>{p.priceLabel}</span>
          <span style={{ fontFamily: T.bodyFam, fontSize: 12, color: T.textMut }}>or 4 × {D.won(Math.round(p.price / 4))} interest-free</span>
        </div>
        {p.sold >= 0.6 && <div style={{ maxWidth: 220, marginTop: 10 }}><SoldBar T={T} pct={p.sold} /></div>}

        {/* color */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Mono T={T} size={10} style={{ color: T.textMut }}>Color — Mono {color + 1}</Mono>
        </div>
        <div style={{ marginTop: 10 }}><ColorDots colors={p.colors} T={T} size={26} sel={color} onSel={setColor} /></div>

        {/* size */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <Mono T={T} size={10} style={{ color: T.textMut }}>Size</Mono>
          <button onClick={() => setAcc('fit')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent',
            border: 'none', cursor: 'pointer', color: T.text, fontFamily: T.bodyFam, fontSize: 12, fontWeight: 600, padding: 0 }}>
            <Icon name="ruler" size={15} stroke={1.8} /> Size guide</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.sizes.length, 5)}, 1fr)`, gap: 8, marginTop: 10 }}>
          {p.sizes.map((s) => {
            const on = size === s;
            return <button key={s} onClick={() => setSize(s)} style={{ padding: '13px 0', cursor: 'pointer',
              fontFamily: T.bodyFam, fontSize: 13.5, fontWeight: 600, borderRadius: T.corners === 'soft' ? T.rSm : 0,
              background: on ? T.accent : 'transparent', color: on ? T.accentText : T.text,
              border: `1px solid ${on ? T.accent : T.line}` }}>{s}</button>;
          })}
        </div>
        <span style={{ fontFamily: T.bodyFam, fontSize: 12, color: T.textMut, display: 'block', marginTop: 10 }}>Fit · {p.fit}</span>

        {/* accordion */}
        <div style={{ marginTop: 24, borderTop: `1px solid ${T.line}` }}>
          {[['details', 'Details & materials'], ['fit', 'Size & fit'], ['ship', 'Shipping & returns']].map(([k, label]) => (
            <div key={k} style={{ borderBottom: `1px solid ${T.line}` }}>
              <button onClick={() => setAcc(acc === k ? '' : k)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer',
                color: T.text, fontFamily: T.bodyFam, fontSize: 14, fontWeight: 600 }}>
                {label} <Icon name={acc === k ? 'minus' : 'plus'} size={18} stroke={1.9} /></button>
              {acc === k && <div style={{ paddingBottom: 18, fontFamily: T.bodyFam, fontSize: 13.5, color: T.textMut, lineHeight: 1.65 }}>
                {k === 'details' && '100% heavyweight cotton, garment-washed for a lived-in hand. Boxy body, dropped shoulder. Designed in Seoul, ethically made.'}
                {k === 'fit' && `${p.fit} fit. Model is 182cm / wears size M. Runs true to size — size down for a cleaner silhouette. 어깨가 넓다면 한 사이즈 업을 추천합니다.`}
                {k === 'ship' && 'Free express shipping over ₩100,000. Delivered in 2–4 days. Free 14-day returns on unworn items.'}
              </div>}
            </div>
          ))}
        </div>

        {/* shipping note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, padding: '14px 0' }}>
          <Icon name="truck" size={20} stroke={1.7} style={{ color: T.text }} />
          <span style={{ fontFamily: T.bodyFam, fontSize: 12.5, color: T.textMut }}>Free express over ₩100,000 · 2–4 day delivery</span>
        </div>
      </div>

      {/* related */}
      <div style={{ padding: `${T.sectionGap}px 0 130px` }}>
        <div style={{ padding: `0 ${T.pad}px` }}><SectionHead T={T} kicker="Complete the fit" title="You might also like" size={22} /></div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: `0 ${T.pad}px`, scrollbarWidth: 'none' }}>
          {related.map((r) => <div key={r.id} style={{ width: 150, flexShrink: 0 }}>
            <ProductCard p={r} T={T} onOpen={(x) => push('pdp', { id: x.id })} onFav={toggleFav} faved={fav.has(r.id)} /></div>)}
        </div>
      </div>

      {/* sticky add bar */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 25, background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: `12px ${T.pad}px`, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: T.monoFam, fontSize: 15, fontWeight: 600, color: T.text, display: 'block' }}>{p.priceLabel}</span>
          <Mono T={T} size={8.5} style={{ color: T.textMut }}>{size ? 'Size ' + size : 'Select size'}</Mono>
        </div>
        <div style={{ flex: 1 }}><PrimaryBtn T={T} onClick={add}>
          <Icon name="bag" size={18} stroke={1.9} /> {size ? 'Add to bag' : 'Select size'}</PrimaryBtn></div>
      </div>
      {toast && <Toast T={T}>Added to bag — {p.name}</Toast>}
    </>
  );
}

// ── SEARCH ─────────────────────────────────────────────────────────
function SearchScreen({ ctx }) {
  const { T, push, fav, toggleFav } = ctx;
  const D = window.DATA;
  const q = ctx.search;
  const setQ = ctx.setSearch;
  const [recent, setRecent] = React.useState(['cargo pants', 'mohair', 'sling bag']);
  const results = q.trim() ? D.products.filter((p) =>
    (p.name + ' ' + p.ko + ' ' + p.cat + ' ' + p.sub).toLowerCase().includes(q.toLowerCase())) : [];
  const inputRef = React.useRef(null);
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: T.bg, paddingTop: 46, borderBottom: `1px solid ${T.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `4px ${T.pad}px 12px` }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px',
            border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? 999 : 0, background: T.surfAlt }}>
            <Icon name="search" size={18} stroke={1.9} style={{ color: T.textMut }} />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search MUTE — 검색"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: T.bodyFam,
                fontSize: 15, color: T.text }} />
            {q && <button onClick={() => setQ('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, padding: 0, display: 'flex' }}><Icon name="close" size={16} stroke={2} /></button>}
          </div>
        </div>
      </div>

      {!q.trim() ? (
        <div style={{ padding: `18px ${T.pad}px 110px` }}>
          {recent.length > 0 && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Mono T={T} size={10} style={{ color: T.textMut }}>Recent</Mono>
              <button onClick={() => setRecent([])} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, fontFamily: T.bodyFam, fontSize: 12 }}>Clear</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
              {recent.map((r) => <span key={r} onClick={() => setQ(r)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                fontFamily: T.bodyFam, fontSize: 13, fontWeight: 500, padding: '8px 12px', cursor: 'pointer',
                border: `1px solid ${T.line}`, borderRadius: T.pill, color: T.text }}>
                {r}<button onClick={(e) => { e.stopPropagation(); setRecent(recent.filter((x) => x !== r)); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, padding: 0, display: 'flex' }}><Icon name="close" size={13} stroke={2} /></button></span>)}
            </div>
          </>}
          <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', marginBottom: 6 }}>Trending searches</Mono>
          <div>
            {D.trending.map((t, i) => (
              <button key={t} onClick={() => setQ(t)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', borderBottom: `1px solid ${T.hair}`, background: 'transparent', border: 'none',
                borderBottomStyle: 'solid', cursor: 'pointer', color: T.text }}>
                <Mono T={T} size={13} style={{ color: T.textFaint, width: 20 }}>{String(i + 1).padStart(2, '0')}</Mono>
                <span style={{ fontFamily: T.bodyFam, fontSize: 15, fontWeight: 500, flex: 1, textAlign: 'left' }}>{t}</span>
                <Icon name="arrowR" size={16} stroke={1.7} style={{ color: T.textMut }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: `14px ${T.pad}px 110px` }}>
          <Mono T={T} size={10} style={{ color: T.textMut, display: 'block', marginBottom: 14 }}>{results.length} results for “{q}”</Mono>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textMut }}>
              <Disp T={T} size={26} style={{ color: T.text }}>Nothing here</Disp>
              <p style={{ fontFamily: T.bodyFam, fontSize: 14, marginTop: 8 }}>Try “cargo”, “knit” or “cap”.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, columnGap: 12 }}>
              {results.map((p) => <ProductCard key={p.id} p={p} T={T} onOpen={(x) => push('pdp', { id: x.id })} onFav={toggleFav} faved={fav.has(p.id)} />)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

Object.assign(window, { HomeScreen, ShopScreen, PdpScreen, SearchScreen });
