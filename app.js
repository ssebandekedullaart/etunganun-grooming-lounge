/* ---------- Utilities ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const UGX = n => 'UGX ' + (n||0).toLocaleString('en-US');

const loadCart = () => JSON.parse(localStorage.getItem('egl_cart')||'{}');
const saveCart = cart => localStorage.setItem('egl_cart', JSON.stringify(cart));
const cartCount = cart => Object.values(cart).reduce((a,i)=>a+i.qty,0);
const cartSubtotal = cart => Object.values(cart).reduce((a,i)=>a+i.qty*i.price,0);

/* ---------- Products ---------- */
const PRODUCTS = [
  {
    sku:"MD100",
    name:"MAGNIFICENTLY DUBAI EDP 100 ML",
    short:"Magnificently Dubai",
    price:330000,
    img:"images/magnificently-dubai.jpg",
    tag:"Oud • Spicy • Opulent",
    desc:"Opulent oud accented by saffron and warm spice on an amber base.",
    notes:["Saffron","Oud","Amber"],
    wear:"Formal nights • Weddings • Cool weather",
    how:"2–4 sprays chest & collarbone; optional 1 on blazer/scarf.",
    longevity:"7–10 hours",
    projection:"Strong → Moderate",
    status:"in-stock"
  },
  {
    sku:"FHI90",
    name:"FOR HIM INTENSE PARFUM 90 ML",
    short:"For Him Intense",
    price:275000,
    img:"images/for-him-intense.jpg",
    tag:"Oriental • Parfum • Strong",
    desc:"Citrus spark of bergamot, cardamom spice and warm sandalwood base.",
    notes:["Bergamot","Cardamom","Sandalwood"],
    wear:"Evening events • Formal • Date night",
    how:"3–5 sprays chest (moisturized), neck sides, below the ears.",
    longevity:"6–9 hours",
    projection:"Strong (first 1–2h) → Moderate",
    status:"in-stock"
  },
  {
    sku:"B80090",
    name:"800 BLACK EDT 90 ML",
    short:"800 Black",
    price:195000,
    img:"images/800-black.jpg",
    tag:"Citrus-Woody • Night",
    desc:"Yuzu brightness meets saffron and tonka bean for sleek evening impact.",
    notes:["Yuzu","Saffron","Tonka Bean"],
    wear:"Night out • Clubs • Smart evenings",
    how:"2–4 sprays neck sides, collarbone, chest.",
    longevity:"2–8 hours (skin-dependent)",
    projection:"Weak–Moderate",
    status:"in-stock"
  },
  {
    sku:"TCIDE100",
    name:"#TOBACCO COLLECTION INTENSE DARK EXCLUSIVE EDT 100 ML",
    short:"Tobacco Intense Dark Exclusive",
    price:210000,
    img:"images/tobacco-collection-intense-dark-exclusive.jpg",
    tag:"Tobacco • Warm • Sweet",
    desc:"Rich tobacco over honeyed vanilla and ambered woods. Cozy and addictive.",
    notes:["Tobacco","Vanilla","Amber"],
    wear:"Evenings • Dates • Cool/Rainy weather",
    how:"3–4 sprays chest & neck; optional 1 on hoodie for trail.",
    longevity:"4–8 hours",
    projection:"Moderate (first 2–3h)",
    status:"in-stock"
  },
  {
    sku:"OVL60",
    name:"OUD VIBRANT LEATHER EDP 60 ML",
    short:"Oud Vibrant Leather",
    price:185000,
    img:"images/oud-vibrant-leather.jpg",
    tag:"Woody • Oud • Elegant",
    desc:"Bright citrus and incense over refined oud and oak; smooth and dressy.",
    notes:["Bergamot","Incense","Oud","Oak"],
    wear:"Dinners • Special occasions • Cool evenings",
    how:"2–4 sprays chest & collarbone; avoid over-spraying on light fabrics.",
    longevity:"4–6 hours",
    projection:"Strong (first hour) → Moderate",
    status:"in-stock"
  }
];

/* ---------- Grid Rendering ---------- */
function chipList(arr){ return (arr||[]).map(n=>`<span class="chip">${n}</span>`).join(''); }
function ribbon(p){
  if (p.status==='preorder'){
    const eta = new Date(); eta.setDate(eta.getDate()+ (p.leadDays||10));
    const txt = eta.toLocaleDateString('en-GB', {day:'2-digit',month:'short'});
    return `<div class="ribbon"><span class="badge pre">Pre-Order</span><span class="eta">ETA: ~${txt}</span></div>`;
  }
  return `<div class="ribbon"><span class="badge">In stock</span></div>`;
}
function card(p){
  return `
  <article class="card">
    <div class="media">
      ${ribbon(p)}
      <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
      <div class="price">${UGX(p.price)}</div>
    </div>
    <div class="content">
      <div class="meta">
        <h3>${p.short}</h3>
        <span class="tag">${p.tag}</span>
      </div>
      <p class="desc">${p.desc}</p>
      <div class="notes">${chipList(p.notes)}</div>
      <div class="rows">
        <div class="row"><b>When to wear:</b> ${p.wear}</div>
        <div class="row"><b>How to wear:</b> ${p.how}</div>
        <div class="row"><b>Longevity:</b> ${p.longevity}</div>
        <div class="row"><b>Projection:</b> ${p.projection}</div>
      </div>
      <div class="actions-row">
        <button class="btn block add" data-sku="${p.sku}">Add to cart</button>
        <a class="btn ghost block" href="https://wa.me/256393101757?text=${encodeURIComponent('Hi! I’m interested in: '+p.name+' ('+UGX(p.price)+')')}" target="_blank" rel="noopener">Quick WhatsApp</a>
      </div>
    </div>
  </article>`;
}

function renderGrid(){
  document.getElementById('grid').innerHTML = PRODUCTS.map(card).join('');
  document.querySelectorAll('.btn.add').forEach(b => b.addEventListener('click', e => addToCart(e.currentTarget.dataset.sku)));
}

/* ---------- Cart ---------- */
function renderCounts(){
  const c = loadCart();
  const count = cartCount(c);
  document.querySelectorAll('.js-cart-count').forEach(el => el.textContent = count);
}

function addToCart(sku){
  const cart = loadCart();
  const p = PRODUCTS.find(x=>x.sku===sku); if(!p) return;
  if (!cart[sku]) cart[sku] = { sku, name:p.name, short:p.short, price:p.price, qty:0, status:p.status||'in-stock' };
  cart[sku].qty += 1;
  saveCart(cart);
  renderCounts();
}

function openCart(){
  document.getElementById('drawer').classList.add('open');
  renderItems(); renderTotals(); bindItemButtons(); updatePayBox();
}
function closeCart(){ document.getElementById('drawer').classList.remove('open'); }

document.getElementById('openCartHeader').onclick = openCart;
document.getElementById('openCartSticky').onclick = openCart;
document.getElementById('closeCart').onclick = closeCart;
document.getElementById('overlay').onclick = closeCart;

function renderItems(){
  const cart = loadCart(), box = document.getElementById('cartItems'), keys = Object.keys(cart);
  if (!keys.length){ box.innerHTML = '<p style="opacity:.8">Your cart is empty.</p>'; return; }
  box.innerHTML = keys.map(sku=>{
    const it = cart[sku], p = PRODUCTS.find(x=>x.sku===sku);
    return `
      <div class="item" data-sku="${sku}">
        <img src="${p.img}" alt="${it.name}" onerror="this.style.display='none'">
        <div>
          <div class="item-name">${it.name}</div>
          <div class="item-price">${UGX(it.price)} × <span>${it.qty}</span></div>
          ${ (p.status==='preorder') ? '<small>Pre-order • ETA ~10 days</small>' : '' }
        </div>
        <div class="qty">
          <button class="dec" data-sku="${sku}" aria-label="Decrease">−</button>
          <button class="inc" data-sku="${sku}" aria-label="Increase">+</button>
          <button class="rm" data-sku="${sku}" aria-label="Remove">Remove</button>
        </div>
      </div>`;
  }).join('');
}

function changeQty(sku, delta){
  const cart = loadCart();
  if (!cart[sku]) return;
  cart[sku].qty += delta;
  if (cart[sku].qty <= 0) delete cart[sku];
  saveCart(cart); renderCounts(); renderItems(); renderTotals(); bindItemButtons();
}

function bindItemButtons(){
  document.querySelectorAll('.inc').forEach(b=>b.onclick = e=>changeQty(e.target.dataset.sku, +1));
  document.querySelectorAll('.dec').forEach(b=>b.onclick = e=>changeQty(e.target.dataset.sku, -1));
  document.querySelectorAll('.rm').forEach(b=>b.onclick = e=>changeQty(e.target.dataset.sku, -999));
}

function computeDelivery(sub){
  const area = document.getElementById('area').value;
  if (area === 'Kira Town') return sub >= 500000 ? 0 : 5000;
  return null; // TBD for other areas
}

function renderTotals(){
  const cart = loadCart(); const sub = cartSubtotal(cart); const d = computeDelivery(sub);
  document.getElementById('subTotal').textContent = UGX(sub);
  document.getElementById('deliveryFee').textContent = (d===null) ? 'TBD' : UGX(d);
  document.getElementById('grandTotal').textContent = (d===null) ? (UGX(sub)+' + delivery') : UGX(sub+d);
  const payAmt = document.getElementById('payAmount'); if (payAmt) payAmt.textContent = (d===null) ? (UGX(sub)+' + delivery') : UGX(sub+d);
}
document.getElementById('area').onchange = renderTotals;
document.getElementById('clearCart').onclick = ()=>{ localStorage.removeItem('egl_cart'); renderCounts(); renderItems(); renderTotals(); };

/* Payment visibility + copy */
function updatePayBox(){
  const paySel = document.getElementById('pay').value;
  const box = document.getElementById('paybox');
  const mtnRow = document.getElementById('mtnRow');
  const airtelRow = document.getElementById('airtelRow');
  if (paySel === 'MTN MoMo Pay' || paySel === 'Airtel Money Pay'){
    box.style.display = 'grid';
    mtnRow.style.display = (paySel==='MTN MoMo Pay') ? 'flex' : 'none';
    airtelRow.style.display = (paySel==='Airtel Money Pay') ? 'flex' : 'none';
  } else {
    box.style.display = 'none';
  }
  renderTotals();
}
function copyToClipboard(txt){
  try{ navigator.clipboard.writeText(txt); alert('Copied: ' + txt); }
  catch{ alert('Copy failed. Merchant ID: ' + txt); }
}
document.addEventListener('click', e=>{
  if (e.target.classList.contains('copy')) copyToClipboard(e.target.dataset.copy);
});

document.getElementById('checkoutWA').onclick = ()=>{
  const cart = loadCart(); const items = Object.values(cart);
  if (!items.length){ alert('Your cart is empty.'); return; }

  const name = (document.getElementById('custName').value||'').trim();
  const area = document.getElementById('area').value;
  const pay  = document.getElementById('pay').value;
  const note = (document.getElementById('note').value||'').trim();
  const sub = cartSubtotal(cart);
  const d = computeDelivery(sub);

  let txid = '';
  if (pay === 'MTN MoMo Pay' || pay === 'Airtel Money Pay'){
    txid = (document.getElementById('txid').value||'').trim();
    const paid = document.getElementById('paidChk').checked;
    if (!paid || !txid){ alert('Please complete payment and enter your Transaction ID, then tick “I’ve paid”.'); return; }
  }

  const lines = items.map(i => `• ${i.name} × ${i.qty} — ${UGX(i.qty*i.price)}${ i.status==='preorder' ? ' (PRE-ORDER)' : '' }`).join('%0A');
  const deliveryLine = (d===null) ? 'Delivery: TBD (outside Kira)' : (d===0 ? 'Delivery: FREE (Kira, order ≥ 500,000)' : 'Delivery: UGX 5,000 (Kira)');
  const grand = (d===null) ? UGX(sub) + ' + delivery' : UGX(sub + d);

  const header = `Etunganun catalogue order`;
  const details = `Name: ${name||'(not provided)'}%0AArea: ${area}%0APayment: ${pay}%0A${ txid ? ('TxID: ' + txid) : '' }%0ANotes: ${note||'-'}`;
  const totals = `Subtotal: ${UGX(sub)}%0A${deliveryLine}%0ATotal: ${grand}`;
  const msg = `${header}%0A%0A${lines}%0A%0A${totals}%0A%0A${details}`;
  window.location.href = "https://wa.me/256393101757?text=" + msg;
};

/* ---------- Advisor ---------- */
function scoreProduct(prefs, p){
  let s=0;
  if (['Night out','Date','Party'].includes(prefs.occ)){
    if (/Warm|Night|Gourmand|Oud|Strong|Opulent/.test(p.tag) || /Addictive|Leather|Intense/.test(p.desc)) s+=2;
  } else if (['Office','Everyday'].includes(prefs.occ)){
    if (/Fresh|Everyday|Day|Elegant/.test(p.tag)) s+=2;
  }
  if (['Hot','Warm'].includes(prefs.weather)){ if (/Fresh|Everyday|Citrus/.test(p.tag)) s+=2; if (/Gourmand|Warm|Oud|Intense|Opulent/.test(p.tag)) s-=1; }
  if (['Cool','Rainy'].includes(prefs.weather)){ if (/Warm|Night|Gourmand|Oud|Strong|Opulent|Tobacco/.test(p.tag)) s+=2; }
  if (prefs.sweet>=7 && /Gourmand|Warm|Sweet/.test(p.tag)) s+=2;
  if (prefs.sweet<=3 && /Fresh|Day|Elegant/.test(p.tag)) s+=2;
  if (prefs.proj>=7 && (/Intense|Oud|Opulent|Black/.test(p.desc+p.tag))) s+=2;
  if (prefs.proj<=3 && /Fresh|Day/.test(p.desc+p.tag)) s+=1;
  if (prefs.note==='Vanilla/Gourmand' && /Vanilla|Sweet|Warm/.test(p.desc+p.tag)) s+=2;
  if (prefs.note==='Woody/Spicy' && /Woody|Spicy|Oud|Sandalwood|Amber|Cardamom/.test(p.desc+p.tag)) s+=2;
  if (prefs.note==='Fresh/Citrus' && /Citrus|Bergamot|Yuzu|Fresh/.test(p.desc+p.tag)) s+=2;
  if (prefs.note==='Smoky/Tobacco' && /Tobacco|Oud|Incense|Amber/.test(p.desc+p.tag)) s+=3;
  if (p.status==='in-stock') s+=0.5;
  return s;
}
function runAdvisor(){
  const prefs = {
    occ: document.getElementById('fOcc').value,
    weather: document.getElementById('fWeather').value,
    sweet: parseInt(document.getElementById('rSweet').value,10),
    proj: parseInt(document.getElementById('rProj').value,10),
    note: document.getElementById('fNote').value,
    sens: document.getElementById('fSens').value
  };
  const ranked = [...PRODUCTS].map(p => ({...p, score: scoreProduct(prefs,p)}))
    .sort((a,b)=>b.score-a.score).slice(0,3);
  const box = document.getElementById('recos');
  box.innerHTML = ranked.map(r => `
    <div class="reco">
      <div class="meta">
        <span class="name">${r.short||r.name}</span>
        <span class="note-inline">${r.tag||''} ${ r.status==='preorder' ? ' • PRE-ORDER' : '' }</span>
        <small>${r.desc||''}</small>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <b>${UGX(r.price)}</b>
        <button class="btn small" data-add="${r.sku}">Add</button>
      </div>
    </div>`).join('');
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=e=>{ addToCart(e.target.dataset.add); alert('Added to cart!'); });
}
document.getElementById('runAdvisor').onclick = runAdvisor;
document.getElementById('clearRecos').onclick = ()=>{ document.getElementById('recos').innerHTML=''; };
document.getElementById('rSweet').oninput = e=>document.getElementById('rSweetVal').textContent = e.target.value;
document.getElementById('rProj').oninput = e=>document.getElementById('rProjVal').textContent = e.target.value;

/* WhatsApp CTA in header */
document.getElementById('btnWhatsApp').addEventListener('click', e=>{
  e.preventDefault();
  window.location.href = "https://wa.me/256393101757?text=" + encodeURIComponent("Hello Etunganun! I’d like to order from your catalogue.");
});
