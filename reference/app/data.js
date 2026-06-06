// data.js — MUTE catalog. Korean streetwear. window.DATA
(function () {
  const won = (n) => '₩' + n.toLocaleString('en-US');
  // seed → placeholder variety (stripe angle + label)
  const P = (id, name, ko, price, cat, sub, tags, opts) => Object.assign({
    id, name, ko, price, priceLabel: won(price), cat, sub,
    tags: tags || [], colors: ['#0b0a09', '#f5f4f1', '#84817a'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], gallery: 4, seed: id.charCodeAt(id.length - 1),
  }, opts || {});

  const products = [
    P('out-01','Washed Hooded Parka','워시드 후디드 파카',189000,'Outerwear','Jackets',['NEW'],{sold:0.42, gallery:5, fit:'Oversized'}),
    P('out-02','Cropped Moto Jacket','크롭 모토 자켓',164000,'Outerwear','Jackets',['HOT'],{sold:0.78, fit:'Regular'}),
    P('top-01','Boxy Logo Tee','박시 로고 티셔츠',39000,'Tops','T-Shirts',['NEW','UNISEX'],{sold:0.61, fit:'Boxy'}),
    P('top-02','Heavyweight Long Sleeve','헤비웨이트 롱슬리브',54000,'Tops','T-Shirts',[],{sold:0.30, fit:'Relaxed'}),
    P('top-03','Mesh Layer Top','메쉬 레이어 탑',47000,'Tops','T-Shirts',['UNISEX'],{sold:0.55, fit:'Slim'}),
    P('knt-01','Distressed Mohair Knit','디스트로이드 모헤어 니트',128000,'Knitwear','Sweaters',['NEW'],{sold:0.22, fit:'Oversized'}),
    P('knt-02','Half-Zip Wool Sweater','하프집 울 스웨터',112000,'Knitwear','Sweaters',[],{sold:0.66, fit:'Regular'}),
    P('bot-01','Wide Cargo Pants','와이드 카고 팬츠',98000,'Bottoms','Pants',['HOT'],{sold:0.84, fit:'Wide'}),
    P('bot-02','Washed Denim — Loose','워시드 데님 루즈',119000,'Bottoms','Denim',['NEW'],{sold:0.40, fit:'Loose'}),
    P('bot-03','Nylon Track Pants','나일론 트랙 팬츠',76000,'Bottoms','Pants',['UNISEX'],{sold:0.51, fit:'Tapered'}),
    P('acc-01','Logo Trucker Cap','로고 트럭커 캡',42000,'Accessories','Headwear',['UNISEX'],{sizes:['OS'], sold:0.69, fit:'One size'}),
    P('acc-02','Leather Card Holder','레더 카드 홀더',58000,'Accessories','Small Goods',[],{sizes:['OS'], sold:0.33, fit:'One size'}),
    P('acc-03','Chunky Silver Chain','청키 실버 체인',64000,'Accessories','Jewelry',['NEW','UNISEX'],{sizes:['OS'], sold:0.47, fit:'One size'}),
    P('bag-01','Tactical Sling Bag','택티컬 슬링백',88000,'Bags','Bags',['HOT'],{sizes:['OS'], sold:0.81, fit:'One size'}),
    P('sho-01','Suede Lo Sneaker','스웨이드 로우 스니커',149000,'Footwear','Shoes',['NEW'],{sizes:['250','260','270','280'], sold:0.58, fit:'True to size'}),
    P('sho-02','Padded Slide','패디드 슬라이드',52000,'Footwear','Shoes',['UNISEX'],{sizes:['S','M','L'], sold:0.44, fit:'True to size'}),
  ];

  const categories = ['All', 'Outerwear', 'Tops', 'Knitwear', 'Bottoms', 'Footwear', 'Accessories', 'Bags'];

  const collections = [
    { id:'drop04', name:'Drop 04', ko:'드롭 04', tag:'F/W 2026', sub:'Night Shift', count:24 },
    { id:'essentials', name:'Mute Essentials', ko:'뮤트 에센셜', tag:'Core', sub:'Everyday monochrome', count:18 },
    { id:'archive', name:'Archive Sale', ko:'아카이브 세일', tag:'Up to 40%', sub:'Last sizes', count:31 },
  ];

  const trending = ['cargo pants', 'mohair knit', 'sling bag', 'trucker cap', 'moto jacket', 'wide denim'];

  window.DATA = {
    products, categories, collections, trending, won,
    byId: (id) => products.find((p) => p.id === id),
    inCat: (c) => c === 'All' ? products : products.filter((p) => p.cat === c),
  };
})();
