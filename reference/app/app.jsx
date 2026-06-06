// app.jsx — MUTE app shell: navigation stack, state, tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "editorial",
  "dark": false,
  "tone": "warm",
  "density": "regular",
  "corners": "sharp",
  "display": "auto"
}/*EDITMODE-END*/;

const DIR_PRESETS = {
  editorial: { direction: 'editorial', corners: 'sharp', tone: 'warm' },
  street:    { direction: 'street',    corners: 'sharp', tone: 'neutral' },
  soft:      { direction: 'soft',      corners: 'soft',  tone: 'warm' },
};
const DIR_LABEL = { editorial: 'Editorial', street: 'Street', soft: 'Soft' };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const T = window.buildTheme(t);

  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]);
  const [fav, setFav] = React.useState(() => new Set());
  const [bag, setBag] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const scrollRef = React.useRef(null);

  const top = stack[stack.length - 1];
  const current = top || { screen: tab };

  React.useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab, stack.length, current.screen]);

  const push = (screen, params) => setStack((s) => [...s, { screen, params: params || {} }]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const switchTab = (k) => { setStack([]); setTab(k); };
  const goHome = () => { setStack([]); setTab('home'); };

  const toggleFav = (id) => setFav((f) => { const n = new Set(f); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addToBag = (p, size, color) => setBag((b) => {
    const key = p.id + '|' + size + '|' + color;
    const ex = b.find((x) => x.key === key);
    if (ex) return b.map((x) => x.key === key ? { ...x, qty: x.qty + 1 } : x);
    return [...b, { key, id: p.id, name: p.name, price: p.price, size, color, qty: 1, seed: p.seed }];
  });
  const setBagQty = (key, qty) => setBag((b) => b.map((x) => x.key === key ? { ...x, qty } : x));
  const removeBag = (key) => setBag((b) => b.filter((x) => x.key !== key));
  const placeOrder = (total) => {
    const no = String(Math.floor(1000 + Math.random() * 8999));
    const items = bag.reduce((s, x) => s + x.qty, 0);
    setOrders((o) => [{ no, total, items, seed: bag[0] ? bag[0].seed : 3 }, ...o]);
    setBag([]);
    setStack([{ screen: 'confirm', params: { no, total } }]);
  };

  const ctx = {
    T, push, pop, setTab: switchTab, goHome,
    fav, toggleFav, bag, addToBag, setBagQty, removeBag,
    orders, search, setSearch,
    openOrders: () => setStack([{ screen: 'orders', params: {} }]),
  };

  React.useEffect(() => {
    window.__app = {
      push, pop, switchTab, goHome, openOrders: () => setStack([{ screen: 'orders', params: {} }]),
      seedBag: () => { const D = window.DATA; addToBag(D.byId('out-01'), 'M', 0); addToBag(D.byId('top-01'), 'L', 1); addToBag(D.byId('acc-01'), 'OS', 0); },
      scrollTo: (y) => { if (scrollRef.current) scrollRef.current.scrollTop = y; },
      shift: (y) => { if (scrollRef.current) scrollRef.current.style.transform = y ? `translateY(${-y}px)` : ''; },
    };
  });

  const SCREENS = {
    home: HomeScreen, shop: ShopScreen, search: SearchScreen, saved: WishlistScreen, account: AccountScreen,
    pdp: PdpScreen, bag: BagScreen, checkout: CheckoutScreen, confirm: ConfirmScreen,
    collection: CollectionScreen, about: AboutScreen, orders: OrdersScreen,
  };
  const Comp = SCREENS[current.screen] || HomeScreen;
  const heroScreen = ['home', 'pdp', 'collection'].includes(current.screen);
  const showNav = stack.length === 0;
  const statusDark = T.dark;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: T.dark ? '#0a0908' : '#e7e5e1', padding: 20, gap: 18 }}>
      <IOSDevice dark={statusDark}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text,
          fontFamily: T.bodyFam, WebkitFontSmoothing: 'antialiased' }}>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', WebkitOverflowScrolling: 'touch' }}>
            <Comp ctx={ctx} params={current.params || {}} key={tab + '/' + stack.map((s) => s.screen).join('/')} />
          </div>
          {showNav && <BottomNav T={T} tab={tab} onTab={switchTab} bagCount={bag.length} savedCount={fav.size} />}
        </div>
      </IOSDevice>

      <TweaksPanel>
        <TweakSection label="Direction" />
        <TweakRadio label="Style" value={t.direction}
          options={[{ value: 'editorial', label: 'Editorial' }, { value: 'street', label: 'Street' }, { value: 'soft', label: 'Soft' }]}
          onChange={(v) => setTweak(DIR_PRESETS[v])} />
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakRadio label="Mono tone" value={t.tone} options={['warm', 'neutral', 'cool']} onChange={(v) => setTweak('tone', v)} />
        <TweakRadio label="Corners" value={t.corners} options={['sharp', 'soft']} onChange={(v) => setTweak('corners', v)} />
        <TweakSection label="Layout & type" />
        <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'comfy']} onChange={(v) => setTweak('density', v)} />
        <TweakSelect label="Display font" value={t.display}
          options={['auto', 'serif', 'grotesk', 'sans']} onChange={(v) => setTweak('display', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
