// screens-account.jsx — Bag, Checkout, Confirm, Wishlist, Account, Collection, About

// ── BAG ────────────────────────────────────────────────────────────
function BagScreen({ ctx }) {
  const { T, pop, push, setTab, bag, setBagQty, removeBag } = ctx;
  const D = window.DATA;
  const sub = bag.reduce((s, it) => s + it.price * it.qty, 0);
  const ship = sub === 0 ? 0 : (sub >= 100000 ? 0 : 3000);
  const total = sub + ship;
  return (
    <>
      <TopBar T={T} title="Bag" sub={bag.length + ' items'} onBack={pop} border right={<span style={{ width: 40 }} />} />
      {bag.length === 0 ? (
        <EmptyState T={T} icon="bag" title="Your bag is empty" sub="아직 담은 상품이 없어요. Let’s fix that."
          cta="Start shopping" onCta={() => { pop(); setTab('shop'); }} />
      ) : (
        <>
          <div style={{ padding: `8px ${T.pad}px 0` }}>
            {bag.map((it, i) => (
              <div key={it.key} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: `1px solid ${T.hair}` }}>
                <div style={{ width: 84, flexShrink: 0 }}><Ph T={T} ratio="4 / 5" label="" seed={it.seed} /></div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: T.bodyFam, fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{it.name}</span>
                    <button onClick={() => removeBag(it.key)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMut, padding: 0, display: 'flex', height: 18 }}><Icon name="close" size={16} stroke={1.8} /></button>
                  </div>
                  <Mono T={T} size={9} style={{ color: T.textMut, marginTop: 5 }}>Size {it.size} · Mono {it.color + 1}</Mono>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Stepper T={T} value={it.qty} onChange={(v) => setBagQty(it.key, v)} />
                    <span style={{ fontFamily: T.monoFam, fontSize: 14, fontWeight: 600, color: T.text }}>{D.won(it.price * it.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* promo */}
          <div style={{ padding: `18px ${T.pad}px 0`, display: 'flex', gap: 10 }}>
            <input placeholder="Promo code" style={{ flex: 1, padding: '13px 14px', border: `1px solid ${T.line}`,
              background: T.surfAlt, outline: 'none', fontFamily: T.bodyFam, fontSize: 14, color: T.text,
              borderRadius: T.corners === 'soft' ? T.rSm : 0 }} />
            <GhostBtn T={T} full={false} style={{ padding: '13px 20px' }}>Apply</GhostBtn>
          </div>
          {/* summary */}
          <div style={{ padding: `22px ${T.pad}px 0` }}>
            {[['Subtotal', D.won(sub)], ['Shipping', ship === 0 ? 'Free' : D.won(ship)]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontFamily: T.bodyFam, fontSize: 14, color: T.textMut }}>
                <span>{k}</span><span style={{ color: T.text }}>{v}</span></div>
            ))}
            {sub > 0 && sub < 100000 && <Mono T={T} size={9} style={{ color: T.textMut, display: 'block', padding: '4px 0' }}>Add {D.won(100000 - sub)} for free shipping</Mono>}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', marginTop: 8, borderTop: `1px solid ${T.line}` }}>
              <span style={{ fontFamily: T.bodyFam, fontSize: 15, fontWeight: 700, color: T.text }}>Total</span>
              <span style={{ fontFamily: T.monoFam, fontSize: 18, fontWeight: 700, color: T.text }}>{D.won(total)}</span>
            </div>
          </div>
          <div style={{ height: 110 }} />
          <div style={{ position: 'sticky', bottom: 0, background: T.bg, borderTop: `1px solid ${T.line}`, padding: `12px ${T.pad}px` }}>
            <PrimaryBtn T={T} onClick={() => push('checkout')}>Checkout · {D.won(total)}</PrimaryBtn>
          </div>
        </>
      )}
    </>
  );
}

// ── CHECKOUT ───────────────────────────────────────────────────────
function CheckoutScreen({ ctx }) {
  const { T, pop, bag, placeOrder } = ctx;
  const D = window.DATA;
  const [shipM, setShipM] = React.useState('express');
  const [pay, setPay] = React.useState('kakao');
  const sub = bag.reduce((s, it) => s + it.price * it.qty, 0);
  const ship = shipM === 'express' ? (sub >= 100000 ? 0 : 3000) : 0;
  const total = sub + ship;
  const Radio = ({ on }) => (
    <div style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px solid ${on ? T.text : T.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {on && <div style={{ width: 10, height: 10, borderRadius: 999, background: T.text }} />}</div>
  );
  const Row = ({ active, onClick, title, meta, right }) => (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 0',
      borderBottom: `1px solid ${T.hair}`, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
      <Radio on={active} />
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: T.bodyFam, fontSize: 14.5, fontWeight: 600, color: T.text, display: 'block' }}>{title}</span>
        {meta && <span style={{ fontFamily: T.bodyFam, fontSize: 12, color: T.textMut }}>{meta}</span>}
      </div>
      {right && <span style={{ fontFamily: T.monoFam, fontSize: 13, fontWeight: 600, color: T.text }}>{right}</span>}
    </button>
  );
  const Sec = ({ n, label, children }) => (
    <div style={{ padding: `0 ${T.pad}px`, marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Mono T={T} size={11} style={{ color: T.textFaint }}>{n}</Mono>
        <Disp T={T} size={19}>{label}</Disp>
      </div>
      {children}
    </div>
  );
  return (
    <>
      <TopBar T={T} title="Checkout" onBack={pop} border right={<span style={{ width: 40 }} />} />
      <Sec n="01" label="Delivery to">
        <div style={{ border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? T.r : 0, padding: 16, marginTop: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Icon name="pin" size={20} stroke={1.7} style={{ color: T.text, marginTop: 2 }} />
            <div>
              <span style={{ fontFamily: T.bodyFam, fontSize: 14, fontWeight: 700, color: T.text, display: 'block' }}>김민준 · Min-jun Kim</span>
              <span style={{ fontFamily: T.bodyFam, fontSize: 13, color: T.textMut, display: 'block', marginTop: 3, lineHeight: 1.5 }}>
                서울특별시 마포구 와우산로 94<br />Mapo-gu, Seoul · 04050</span>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text, fontFamily: T.bodyFam, fontSize: 12.5, fontWeight: 600 }}>Edit</button>
        </div>
      </Sec>
      <Sec n="02" label="Shipping">
        <Row active={shipM === 'express'} onClick={() => setShipM('express')} title="Express · 2–4 days" meta="CJ Logistics" right={sub >= 100000 ? 'Free' : D.won(3000)} />
        <Row active={shipM === 'pickup'} onClick={() => setShipM('pickup')} title="Store pickup — Seongsu" meta="Ready tomorrow 11:00" right="Free" />
      </Sec>
      <Sec n="03" label="Payment">
        {[['kakao', 'Kakao Pay', '간편결제'], ['naver', 'Naver Pay', '네이버페이'], ['toss', 'Toss', '토스'], ['card', 'Credit / debit card', 'Visa · Mastercard']].map(([k, t, m]) =>
          <Row key={k} active={pay === k} onClick={() => setPay(k)} title={t} meta={m} />)}
      </Sec>
      <Sec n="04" label="Order summary">
        {bag.map((it) => (
          <div key={it.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontFamily: T.bodyFam, fontSize: 13, color: T.textMut }}>
            <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.qty}× {it.name} · {it.size}</span>
            <span style={{ color: T.text, marginLeft: 10 }}>{D.won(it.price * it.qty)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontFamily: T.bodyFam, fontSize: 13, color: T.textMut }}>
          <span>Shipping</span><span style={{ color: T.text }}>{ship === 0 ? 'Free' : D.won(ship)}</span></div>
      </Sec>
      <div style={{ height: 120 }} />
      <div style={{ position: 'sticky', bottom: 0, background: T.bg, borderTop: `1px solid ${T.line}`, padding: `12px ${T.pad}px` }}>
        <PrimaryBtn T={T} onClick={() => placeOrder(total)}>Place order · {D.won(total)}</PrimaryBtn>
        <Mono T={T} size={8.5} style={{ color: T.textMut, display: 'block', textAlign: 'center', marginTop: 10 }}>Secure checkout · 안전한 결제</Mono>
      </div>
    </>
  );
}

// ── ORDER CONFIRM ──────────────────────────────────────────────────
function ConfirmScreen({ ctx, params }) {
  const { T, goHome } = ctx;
  const D = window.DATA;
  return (
    <>
      <TopBar T={T} title="" right={<span style={{ width: 40 }} />} />
      <div style={{ padding: `30px ${T.pad}px 40px`, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', width: 76, height: 76, alignItems: 'center', justifyContent: 'center',
          borderRadius: 999, background: T.accent, color: T.accentText, marginBottom: 24 }}>
          <Icon name="check" size={36} stroke={2.6} /></div>
        <Disp T={T} size={34}>Order placed</Disp>
        <p style={{ fontFamily: T.bodyFam, fontSize: 14.5, color: T.textMut, marginTop: 12, lineHeight: 1.6 }}>
          주문이 완료되었습니다. We’ve emailed your receipt — your fit ships in 2–4 days.</p>
        <div style={{ border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? T.r : 0, padding: 18, marginTop: 26, textAlign: 'left' }}>
          {[['Order no.', '#MUTE-' + params.no], ['Total paid', D.won(params.total)], ['Delivery', 'Express · 2–4 days'], ['Arrives by', 'Jun 10']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: T.bodyFam, fontSize: 13.5 }}>
              <span style={{ color: T.textMut }}>{k}</span><span style={{ color: T.text, fontWeight: 600, fontFamily: k === 'Total paid' || k.includes('no') ? T.monoFam : T.bodyFam }}>{v}</span></div>
          ))}
        </div>
        <div style={{ marginTop: 26 }}><PrimaryBtn T={T} onClick={() => ctx.openOrders()}>Track order</PrimaryBtn></div>
        <div style={{ marginTop: 12 }}><GhostBtn T={T} onClick={goHome}>Continue shopping</GhostBtn></div>
      </div>
    </>
  );
}

// ── WISHLIST / SAVED ───────────────────────────────────────────────
function WishlistScreen({ ctx }) {
  const { T, push, setTab, fav, toggleFav, addToBag } = ctx;
  const D = window.DATA;
  const items = D.products.filter((p) => fav.has(p.id));
  return (
    <>
      <TopBar T={T} title="Saved" sub={items.length + ' items'} border wordmark={false} right={<IconBtn T={T} name="bag" onClick={() => push('bag')} badge={ctx.bag.length} />} />
      {items.length === 0 ? (
        <EmptyState T={T} icon="heart" title="No saves yet" sub="탭한 하트는 여기에 모여요. Tap the heart on anything you love."
          cta="Browse the shop" onCta={() => setTab('shop')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, columnGap: 12, padding: `16px ${T.pad}px 110px` }}>
          {items.map((p) => (
            <div key={p.id}>
              <ProductCard p={p} T={T} onOpen={(x) => push('pdp', { id: x.id })} onFav={toggleFav} faved />
              <button onClick={() => addToBag(p, p.sizes[Math.floor(p.sizes.length / 2)], 0)} style={{ marginTop: 8, width: '100%',
                padding: '10px 0', cursor: 'pointer', fontFamily: T.bodyFam, fontSize: 12.5, fontWeight: 600,
                background: 'transparent', color: T.text, border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? 999 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="bag" size={15} stroke={1.8} /> Add to bag</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── ACCOUNT ────────────────────────────────────────────────────────
function AccountScreen({ ctx }) {
  const { T, push, orders } = ctx;
  const links = [
    ['bag', 'Orders & tracking', orders.length + ' orders'],
    ['pin', 'Addresses', 'Seoul · 1 saved'],
    ['card', 'Payment methods', 'Kakao Pay'],
    ['heart', 'Saved items', ctx.fav.size + ''],
    ['truck', 'Returns', ''],
    ['user', 'Settings & help', ''],
  ];
  return (
    <>
      <TopBar T={T} title="Account" border right={<IconBtn T={T} name="bag" onClick={() => push('bag')} badge={ctx.bag.length} />} />
      {/* profile */}
      <div style={{ padding: `18px ${T.pad}px`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 60, height: 60, flexShrink: 0 }}><Ph T={T} ratio="1 / 1" label="" seed={2} rounded /></div>
        <div style={{ flex: 1 }}>
          <Disp T={T} size={24}>Min-jun</Disp>
          <Mono T={T} size={9.5} style={{ color: T.textMut, display: 'block', marginTop: 4 }}>MUTE Member · since 2024</Mono>
        </div>
        <IconBtn T={T} name="chevR" onClick={() => {}} />
      </div>
      {/* membership card */}
      <div style={{ padding: `0 ${T.pad}px` }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: T.corners === 'soft' ? T.r : 0,
          background: T.accent, color: T.accentText, padding: 20 }}>
          <Mono T={T} size={9} style={{ opacity: 0.7 }}>Inner Circle</Mono>
          <Disp T={T} size={26} style={{ marginTop: 8, color: T.accentText }}>2,480 pts</Disp>
          <p style={{ fontFamily: T.bodyFam, fontSize: 12.5, opacity: 0.78, marginTop: 6 }}>520 pts to early access on Drop 05.</p>
          <div style={{ marginTop: 14, height: 4, background: 'rgba(128,128,128,0.4)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: '83%', height: '100%', background: T.accentText, opacity: 0.85 }} /></div>
        </div>
      </div>
      {/* recent order */}
      {orders.length > 0 && (
        <div style={{ padding: `26px ${T.pad}px 0` }}>
          <SectionHead T={T} kicker="Latest order" title="In transit" size={20} action="All" onAction={() => push('orders')} />
          <div onClick={() => push('orders')} style={{ display: 'flex', gap: 14, alignItems: 'center', border: `1px solid ${T.line}`,
            borderRadius: T.corners === 'soft' ? T.r : 0, padding: 12, cursor: 'pointer' }}>
            <div style={{ width: 56, flexShrink: 0 }}><Ph T={T} ratio="4 / 5" label="" seed={orders[0].seed} /></div>
            <div style={{ flex: 1 }}>
              <Mono T={T} size={9} style={{ color: T.textMut }}>#MUTE-{orders[0].no}</Mono>
              <span style={{ fontFamily: T.bodyFam, fontSize: 14, fontWeight: 600, color: T.text, display: 'block', marginTop: 3 }}>{orders[0].items} item{orders[0].items > 1 ? 's' : ''} · Out for delivery</span>
              <span style={{ fontFamily: T.bodyFam, fontSize: 12, color: T.textMut }}>Arrives Jun 10</span>
            </div>
            <Icon name="chevR" size={18} stroke={1.8} style={{ color: T.textMut }} />
          </div>
        </div>
      )}
      {/* links */}
      <div style={{ padding: `26px ${T.pad}px 110px` }}>
        {links.map(([icon, label, meta]) => (
          <button key={label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
            borderBottom: `1px solid ${T.hair}`, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <Icon name={icon} size={20} stroke={1.7} style={{ color: T.text }} />
            <span style={{ flex: 1, fontFamily: T.bodyFam, fontSize: 15, fontWeight: 500, color: T.text }}>{label}</span>
            {meta && <span style={{ fontFamily: T.bodyFam, fontSize: 12.5, color: T.textMut }}>{meta}</span>}
            <Icon name="chevR" size={17} stroke={1.7} style={{ color: T.textFaint }} />
          </button>
        ))}
        <button style={{ marginTop: 24, width: '100%', padding: '14px 0', background: 'transparent', cursor: 'pointer',
          border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? 999 : 0, fontFamily: T.bodyFam,
          fontSize: 14, fontWeight: 600, color: T.text }}>Sign out</button>
      </div>
    </>
  );
}

// ── COLLECTION (filtered product page) ─────────────────────────────
function CollectionScreen({ ctx, params }) {
  const { T, pop, push, fav, toggleFav } = ctx;
  const D = window.DATA;
  const c = D.collections.find((x) => x.id === params.id) || { name: 'Drop 04', ko: '드롭 04', tag: 'F/W 2026', sub: 'Night Shift', count: 24 };
  const items = params.id === 'archive' ? D.products.slice(4) : (params.id === 'essentials' ? D.products.filter((p) => p.price < 80000) : D.products);
  return (
    <>
      <TopBar T={T} transparent onBack={pop} right={<IconBtn T={T} name="bag" onClick={() => push('bag')} badge={ctx.bag.length} />} />
      <div style={{ position: 'relative', marginTop: -110 }}>
        <Ph T={T} ratio="3 / 3.4" label={'COLLECTION · ' + c.name.toUpperCase()} seed={c.count} rounded={false} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0) 40%, rgba(0,0,0,0.7))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, padding: `0 ${T.pad}px`, color: '#fff' }}>
          <Mono T={T} size={10} style={{ opacity: 0.85, display: 'block', marginBottom: 10 }}>{c.tag} · {c.count} pieces</Mono>
          <Disp T={T} size={46} style={{ color: '#fff' }}>{c.name}</Disp>
          <span style={{ fontFamily: T.bodyFam, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>{c.sub}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, columnGap: 12, padding: `20px ${T.pad}px 110px` }}>
        {items.map((p) => <ProductCard key={p.id} p={p} T={T} full onOpen={(x) => push('pdp', { id: x.id })} onFav={toggleFav} faved={fav.has(p.id)} />)}
      </div>
    </>
  );
}

// ── ABOUT ──────────────────────────────────────────────────────────
function AboutScreen({ ctx }) {
  const { T, pop } = ctx;
  return (
    <>
      <TopBar T={T} title="Our story" onBack={pop} border right={<span style={{ width: 40 }} />} />
      <div style={{ padding: `20px ${T.pad}px 110px` }}>
        <Disp T={T} size={40} style={{ marginBottom: 18 }}>Quietly,<br />loudly.</Disp>
        <Ph T={T} ratio="4 / 3" label="STUDIO · SEONGSU SEOUL" seed={5} />
        <p style={{ fontFamily: T.bodyFam, fontSize: 15, color: T.text, lineHeight: 1.7, marginTop: 22 }}>
          MUTE는 2024년 서울 성수동에서 시작된 모노크롬 스트릿웨어 레이블입니다.</p>
        <p style={{ fontFamily: T.bodyFam, fontSize: 14, color: T.textMut, lineHeight: 1.7, marginTop: 14 }}>
          We strip colour out so the cut, the weight and the way it moves do the talking. Every piece is designed in Seoul and made in small runs — sized to sell out, not to sit.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 26 }}>
          {[['28', 'Drops shipped'], ['9k+', 'Inner Circle'], ['100%', 'Designed in Seoul'], ['14d', 'Easy returns']].map(([n, l]) => (
            <div key={l} style={{ border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? T.r : 0, padding: 18 }}>
              <Disp T={T} size={30}>{n}</Disp>
              <Mono T={T} size={9} style={{ color: T.textMut, display: 'block', marginTop: 6 }}>{l}</Mono>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ORDERS list ────────────────────────────────────────────────────
function OrdersScreen({ ctx }) {
  const { T, pop, orders } = ctx;
  const D = window.DATA;
  return (
    <>
      <TopBar T={T} title="Orders" onBack={pop} border right={<span style={{ width: 40 }} />} />
      <div style={{ padding: `16px ${T.pad}px 110px` }}>
        {orders.length === 0 ? <EmptyState T={T} icon="bag" title="No orders yet" /> :
          orders.map((o, i) => (
            <div key={o.no} style={{ border: `1px solid ${T.line}`, borderRadius: T.corners === 'soft' ? T.r : 0, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Mono T={T} size={10} style={{ color: T.textMut }}>#MUTE-{o.no}</Mono>
                <Tag T={T} solid={i === 0}>{i === 0 ? 'In transit' : 'Delivered'}</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {Array.from({ length: Math.min(o.items, 3) }).map((_, k) => <div key={k} style={{ width: 52 }}><Ph T={T} ratio="4 / 5" label="" seed={o.seed + k} /></div>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <span style={{ fontFamily: T.bodyFam, fontSize: 13, color: T.textMut }}>{o.items} items · {D.won(o.total)}</span>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.text, fontFamily: T.bodyFam, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>Track <Icon name="arrowR" size={14} stroke={2} /></button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

Object.assign(window, { BagScreen, CheckoutScreen, ConfirmScreen, WishlistScreen, AccountScreen, CollectionScreen, AboutScreen, OrdersScreen });
