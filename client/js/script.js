const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fmt=n=>'$'+n.toLocaleString('es-MX')+' MXN',FREE=800;
const img=n=>(window.IMGMAP||{})[n]||`assets/img/${n}.jpg`;
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ====== BACKEND: conecta aquí tu API ======
   Pon MOCK en false y completa BASE y las rutas. */
const Lunnea={MOCK:true,BASE:'https://api.tu-dominio.com',
 async _post(path,body){const r=await fetch(this.BASE+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.message||'Ocurrió un error');return j},
 async register({name,email,password}){if(!this.MOCK)return this._post('/auth/register',{name,email,password}); /* → {user:{name,email},token} */
  return{user:{name:name||email.split('@')[0],email},token:'demo'}},
 async login({email,password}){if(!this.MOCK)return this._post('/auth/login',{email,password});
  return{user:{name:email.split('@')[0],email},token:'demo'}},
 async checkout(items){if(!this.MOCK)return this._post('/orders',{items}); /* → {paymentUrl} */
  return{ok:true}}};

/* ====== Catálogo (reemplaza por tu API) ====== */
const CATS=[{k:'jar',n:'Velas en frasco',i:'sc1'},{k:'tea',n:'Té de luz',i:'sc2'},{k:'pillar',n:'Velas pilar',i:'sc3'},{k:'party',n:'Velas de fiesta',i:'sc4'}];
const P=[
{id:1,n:'Ámbar & Humo',c:'party',p:620,i:'n1',t:['Fiesta','Pilar']},
{id:2,n:'Cítrico & Neroli',c:'jar',p:480,i:'n2',t:['Frasco','Aromática']},
{id:3,n:'Rosa & Peonía',c:'tea',p:360,i:'n3',t:['Té de luz','Regalo']},
{id:4,n:'Lavanda & Salvia',c:'tea',p:540,i:'n4',t:['Té de luz','Set']},
{id:5,n:'Lino & Sal Marina',c:'tea',p:420,i:'n5',t:['Té de luz']},
{id:6,n:'Cedro & Vainilla',c:'jar',p:690,i:'n6',t:['Frasco']},
{id:7,n:'Sándalo Ámbar',c:'pillar',p:520,i:'t1',t:['Pilar','Madera'],bs:1},
{id:8,n:'Menta & Eucalipto',c:'party',p:650,i:'t2',t:['Fiesta','Fresca'],bs:1},
{id:9,n:'Yuzu & Chai',c:'jar',p:490,i:'t3',t:['Frasco','Especiada'],bs:1}];
const NEW=P.filter(p=>!p.bs);let cat=null,qry='';
const card=p=>`<article class="p rv"><div class="ph"><img loading="lazy" src="${img(p.i)}" alt="${p.n}"></div><div class="row"><h3>${p.n}</h3><span class="chips">${p.t.map(t=>`<i>${t}</i>`).join('')}</span></div><div class="row b"><span class="price">${fmt(p.p)}</span><button class="add" data-id="${p.id}">Añadir al carrito</button></div></article>`;
function render(){let l=cat||qry?P:NEW;if(cat)l=l.filter(p=>p.c===cat);if(qry)l=l.filter(p=>p.n.toLowerCase().includes(qry));
 $('#grid').innerHTML=l.length?l.map(card).join(''):'<p class="empty">No encontramos velas con ese criterio.</p>';
 $$('.sc-t').forEach(s=>s.classList.toggle('act',s.dataset.k===cat));io()}
$('#scents').innerHTML=CATS.map((c,i)=>`<button class="sc-t rv" style="--i:${i}" data-k="${c.k}"><div class="ph"><img src="${img(c.i)}" alt="${c.n}"></div><span>${c.n}</span></button>`).join('');
$('#car').innerHTML=P.filter(p=>p.bs).map(card).join('');
$('#scents').onclick=e=>{const s=e.target.closest('.sc-t');if(!s)return;cat=cat===s.dataset.k?null:s.dataset.k;render();$('#grid').scrollIntoView({behavior:'smooth',block:'center'})};
$('#all').onclick=$('#all2').onclick=()=>{cat=null;qry='';$('#q').value='';render();$('#grid').scrollIntoView({behavior:'smooth',block:'center'})};
$('#q').oninput=e=>{qry=e.target.value.trim().toLowerCase();render();if(qry)$('#grid').scrollIntoView({behavior:'smooth',block:'center'})};
$('#pv').onclick=()=>$('#car').scrollBy({left:-$('#car').clientWidth/2,behavior:'smooth'});$('#nx').onclick=()=>$('#car').scrollBy({left:$('#car').clientWidth/2,behavior:'smooth'});
const T=['Aromatiza tu cuarto','Encuentra tu brillo','Enciende el momento','Calienta la noche'];
$('#stripTxt').innerHTML=Array(4).fill(T.map(t=>`<span>${t}</span><em>☾</em>`).join('')).join('');
const S=[['Mezcla de cera natural','Cera de soya y coco para una combustión más limpia y un aroma suave y constante.'],['Pabilos sin plomo','Pabilos de algodón centrados a mano para una llama pareja y de bajo humo.'],['Fragancia equilibrada','Esencias y aceites esenciales sin ftalatos, mezclados en pequeñas tandas.']];
$('#steps').innerHTML=S.map((s,i)=>`<div class="st rv${i==1?' on':''}" style="--i:${i}"><h3><i>0${i+1}</i>${s[0]}</h3><p>${s[1]}</p></div>`).join('');
$('#steps').onclick=e=>{const s=e.target.closest('.st');if(s)$$('.st').forEach(x=>x.classList.toggle('on',x===s))};

/* ====== Carrito ====== */
let cart=store.get('lunnea_cart',[]);
const total=()=>cart.reduce((a,i)=>a+i.p*i.q,0),count=()=>cart.reduce((a,i)=>a+i.q,0);
function drawCart(){const t=total();$('#cnt').textContent=count();
 $('#wb').innerHTML=(t>=FREE?'Tu envío es <b>gratis</b> ✦':`Te faltan <b>${fmt(FREE-t)}</b> para envío gratis`)+`<div class="tr"><i style="width:${Math.min(100,t/FREE*100)}%"></i></div>`;
 $('#items').innerHTML=cart.length?cart.map(i=>{const p=P.find(x=>x.id===i.id);return `<div class="it"><img src="${img(p.i)}" alt=""><div><h4>${p.n}</h4><div class="qty"><button data-m="${p.id}">−</button><span>${i.q}</span><button data-a="${p.id}">+</button></div></div><span>${fmt(i.p*i.q)}</span></div>`}).join(''):'<p class="empty">Tu carrito está en penumbra.<br>Añade una vela para encenderlo.</p>';
 $('#tot').textContent=fmt(t);store.set('lunnea_cart',cart)}
function add(id,from){const p=P.find(x=>x.id==id),l=cart.find(i=>i.id==id);l?l.q++:cart.push({id:p.id,p:p.p,q:1});drawCart();
 const b=$('#cnt');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');
 if(from){const a=from.getBoundingClientRect(),z=$('#cartBtn').getBoundingClientRect(),f=document.createElement('div');f.className='fly';f.style.left=a.left+a.width/2+'px';f.style.top=a.top+'px';document.body.append(f);
  requestAnimationFrame(()=>{f.style.transform=`translate(${z.left-a.left}px,${z.top-a.top}px) scale(.4)`;f.style.opacity='.2'});setTimeout(()=>f.remove(),950)}
 toast(p.n+' añadida')}
document.addEventListener('click',e=>{const a=e.target.closest('[data-id]');if(a)add(a.dataset.id,a);
 const m=e.target.closest('[data-m]'),pl=e.target.closest('[data-a]');
 if(m){const l=cart.find(i=>i.id==m.dataset.m);l.q--;if(l.q<1)cart=cart.filter(i=>i!==l);drawCart()}
 if(pl){cart.find(i=>i.id==pl.dataset.a).q++;drawCart()}
 if(e.target.closest('[data-close]')||e.target.id==='veil')closeAll()});
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
function open(el){closeAll();el.classList.add('on');$('#veil').classList.add('on')}
function closeAll(){['#drawer','#modal','#veil'].forEach(s=>$(s).classList.remove('on'))}
$('#cartBtn').onclick=()=>open($('#drawer'));
$('#co').onclick=async()=>{if(!cart.length)return toast('Tu carrito está vacío');if(!user){open($('#modal'));return toast('Inicia sesión para finalizar')}
 try{const r=await Lunnea.checkout(cart);if(r.paymentUrl)location.href=r.paymentUrl;else toast('Pedido listo para conectar con el pago')}catch(x){toast(x.message)}};
document.addEventListener('keydown',e=>e.key==='Escape'&&closeAll());

/* ====== Cuenta ====== */
let user=store.get('lunnea_user',null),mode='login';
function drawUser(){$('#af').hidden=!!user;$('#tabs').hidden=!!user;$('#sess').hidden=!user;if(user)$('#who').textContent='Sesión iniciada como '+user.email;$('#acc').title=user?user.name:'Ingresar'}
$$('#tabs button').forEach(b=>b.onclick=()=>{mode=b.dataset.t;$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));$('#nameF').hidden=mode==='login';$('#sub').textContent=mode==='login'?'Entrar':'Crear cuenta';$('#msg').textContent=''});
$('#acc').onclick=()=>open($('#modal'));
$('#af').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),m=$('#msg');
 if(!/^\S+@\S+\.\S+$/.test(d.email))return m.textContent='Escribe un correo válido.';
 if((d.password||'').length<8)return m.textContent='La contraseña necesita al menos 8 caracteres.';
 try{const r=await Lunnea[mode](d);user=r.user;store.set('lunnea_user',user);try{sessionStorage.setItem('lunnea_token',r.token)}catch(x){}drawUser();e.target.reset();closeAll();toast('Bienvenida/o, '+user.name)}catch(x){m.textContent=x.message}};
$('#out').onclick=()=>{user=null;store.set('lunnea_user',null);drawUser();closeAll();toast('Sesión cerrada')};

/* ====== Movimiento ====== */
let ro;function io(){ro=ro||new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');ro.unobserve(e.target)}}),{threshold:.1});$$('.rv:not(.on)').forEach(e=>ro.observe(e))}
const hero=$('.hero');hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--x',e.clientX-r.left+'px');hero.style.setProperty('--y',e.clientY-r.top+'px')});
addEventListener('scroll',()=>$('#nav').classList.toggle('fix',scrollY>hero.offsetHeight-90),{passive:true});
$('#bg').onclick=()=>$('#nav').classList.toggle('open');$$('.nav nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
render();drawCart();drawUser();
