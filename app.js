
const DEF={trm:3460.8,tax:7,rate:15000},KEY='kirahvi.v1';
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{set:{...DEF},q:[]},tab='form',draft={},editId=null;
const $=s=>document.querySelector(s),save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const st=()=>({trm:+S.set.trm,tax:+S.set.tax/100,rate:+S.set.rate});
const C=q=>KCalc.calc(q,st());
const m=n=>n==null?'—':(n<0?'-':'')+'$ '+Math.abs(Math.round(n)).toLocaleString('es-CO');
const pc=n=>n==null?'—':(n*100).toFixed(1).replace('.',',')+'%';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cls=n=>n==null?'':n>=0?'pos':'neg';
const MK=[];for(let p=15;p<=120;p+=5)MK.push(p/100);
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)}
function go(t){tab=t;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));render()}
function render(){$('#v').innerHTML={form:vForm,list:vList,cli:vCli,cfg:vCfg}[tab]();({form:bindForm,list:bindList,cli:bindCli,cfg:bindCfg}[tab])()}
function results(q){
  const r=C(q),col=+q.col>0;
  return `<div class="card res"><div class="row"><span>Costo en COP (USD + sales tax × TRM)</span><b class="cost">${m(r.cop)}</b></div>
  <div class="row"><span>Envío (${q.kg||0} kg)</span><b class="cost">${m(r.ship)}</b></div>
  <div class="row"><span>Costo total</span><b class="cost">${m(r.total)}</b></div>
  <div class="row big"><span>Precio de venta sugerido</span><span>${m(r.sug)}</span></div>
  <div class="row"><span>Ganancia sugerida</span><b class="${cls(r.sugProfit)}">${m(r.sugProfit)}</b></div>
  ${r.margin==null?'<div class="note">Ingresa el precio final para ver el margen y la ganancia reales.</div>':
  `<div class="row big"><span>Margen real</span><span class="${cls(r.margin)}">${pc(r.margin)}</span></div>
   <div class="row"><span>Ganancia real</span><b class="${cls(r.profit)}">${m(r.profit)}</b></div>`}
  <div class="row big"><span>50% del precio final</span><span>${m(r.price*0.5)}</span></div>
  ${!col?'<div class="note">No aplica, el producto no se encuentra en Colombia.</div>':
   r.diff==null?'<div class="note">Ingresa el precio final para comparar con Colombia.</div>':
   `<div class="row"><span>Diferencia con Colombia</span><b class="${cls(r.diff)}">${m(r.diff)}</b></div><div class="note">${r.diff>=0?'Tu precio está por debajo del de Colombia.':'Tu precio está por encima del de Colombia.'}</div>`}</div>`;
}
function vForm(){const d=draft,cl=[...new Set(S.q.map(x=>x.client))];
  const f=(k,l,t='text',x='')=>`<label>${l}<input id="f_${k}" type="${t}" ${t==='number'?'inputmode="decimal" step="any" min="0"':''} value="${esc(d[k]??'')}" ${x}></label>`;
  return `<h2>${editId?'Editar cotización':'Nueva cotización'}</h2><div class="card">
  ${f('client','Cliente','text','list="cl" autocomplete="off"')}<datalist id="cl">${cl.map(c=>`<option value="${esc(c)}">`).join('')}</datalist>
  ${f('name','Producto')}${f('link','Link del producto','url')}
  <div class="g2">${f('usd','Costo (USD)','number')}${f('kg','Peso (kg)','number')}</div>
  <label>Markup<select id="f_markup">${MK.map(x=>`<option value="${x}" ${+d.markup===x?'selected':''}>${Math.round(x*100)}%</option>`).join('')}</select></label>
  <div class="g2">${f('final','Precio final (COP)','number')}${f('col','Valor en Colombia (COP)','number')}</div></div>
  <div id="res">${results(d)}</div>
  <button class="btn" id="next">${editId?'Guardar cambios':'Guardar y siguiente'}</button>
  ${editId?'<button class="btn alt" id="cancel">Cancelar</button>':''}`}
function bindForm(){
  if(draft.markup==null)draft.markup=0.7,$('#f_markup').value=0.7;
  document.querySelectorAll('[id^=f_]').forEach(e=>e.addEventListener('input',()=>{draft[e.id.slice(2)]=e.value;$('#res').innerHTML=results(draft)}));
  $('#next').onclick=()=>{
    if(!(draft.name||'').trim())return toast('Escribe el nombre del producto');
    if(!(+draft.usd>0))return toast('Ingresa el costo en USD');
    const q={...draft,client:(draft.client||'').trim()||'Sin cliente',markup:+draft.markup,id:editId||Date.now()};
    if(editId)S.q=S.q.map(x=>x.id===editId?q:x);else S.q.push(q);
    save();toast('Cotización guardada');const keep=q.client,mk=q.markup;editId=null;draft={client:keep,markup:mk};render()};
  const c=$('#cancel');if(c)c.onclick=()=>{editId=null;draft={markup:0.7};render()}}
const rows=()=>S.q.map(q=>({q,r:C(q)}));
function wMarkup(){const a=rows();const T=a.reduce((s,x)=>s+x.r.total,0);return T?a.reduce((s,x)=>s+x.q.markup*x.r.total,0)/T:null}
function vList(){const a=rows();
  return `<h2>Cotizaciones por producto</h2><div class="card kpi"><b>${pc(wMarkup())}</b>Markup promedio ponderado por costo total (${a.length} cotizaciones)</div>
  <div class="bar"><span></span><button class="btn sm" id="exp">Exportar</button></div>
  ${a.length?`<div class="tw"><table><thead><tr><th>Cliente</th><th>Producto</th><th class="n">USD</th><th class="n">Kg</th><th class="n">Costo total</th><th class="n">Markup</th><th class="n">Venta sugerida</th><th class="n">Precio final</th><th class="n">Margen</th><th class="n">Ganancia</th><th>Vs. Colombia</th><th></th></tr></thead><tbody>
  ${a.map(({q,r})=>`<tr data-id="${q.id}"><td>${esc(q.client)}</td><td>${esc(q.name)}</td><td class="n">${q.usd}</td><td class="n">${q.kg||0}</td><td class="n">${m(r.total)}</td><td class="n">${Math.round(q.markup*100)}%</td><td class="n">${m(r.sug)}</td><td class="n">${m(+q.final||null)}</td><td class="n ${cls(r.margin)}">${pc(r.margin)}</td><td class="n ${cls(r.profit)}">${m(r.profit)}</td><td>${+q.col>0?(r.diff==null?'Falta precio final':m(r.diff)):'No aplica, no está en Colombia'}</td><td><button data-del="${q.id}" aria-label="Eliminar">✕</button></td></tr>`).join('')}</tbody></table></div><p class="note">Toca una fila para editarla.</p>`
  :'<div class="card empty">Aún no hay cotizaciones. Ve a Cotizar para crear la primera.</div>'}`}
function bindList(){
  $('#exp').onclick=()=>exportCSV('cotizaciones',[['Cliente','Producto','Link','USD','Kg','Costo COP','Envío COP','Costo total COP','Markup','Venta sugerida COP','Precio final COP','Margen %','Ganancia COP','Valor en Colombia COP','Diferencia con Colombia COP'],
   ...rows().map(({q,r})=>[q.client,q.name,q.link||'',q.usd,q.kg||0,r.cop,r.ship,r.total,q.markup*100,Math.round(r.sug),+q.final||'',r.margin==null?'':r.margin*100,r.profit==null?'':Math.round(r.profit),+q.col||'',+q.col>0?(r.diff==null?'Falta precio final':Math.round(r.diff)):'No aplica, el producto no se encuentra en Colombia'])]);
  document.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=e=>{const id=+tr.dataset.id;
    if(e.target.dataset.del){if(confirm('¿Eliminar esta cotización?')){S.q=S.q.filter(x=>x.id!==id);save();render()}return}
    editId=id;draft={...S.q.find(x=>x.id===id)};go('form')})}
function groups(){const g={};rows().forEach(x=>(g[x.q.client]??=[]).push(x));return g}
function vCli(){const g=groups(),ks=Object.keys(g);
  return `<h2>Acumulado por cliente</h2><div class="bar"><span>${ks.length} clientes</span><button class="btn sm" id="exp">Exportar</button></div>
  ${ks.length?`<div class="tw"><table><thead><tr><th>Cliente / producto</th><th class="n">Precio a pagar</th></tr></thead><tbody>
  ${ks.map(k=>`<tr class="h"><td colspan="2">${esc(k)}</td></tr>${g[k].map(x=>`<tr><td>${esc(x.q.name)}</td><td class="n">${m(x.r.price)}</td></tr>`).join('')}<tr class="t"><td>Total a pagar</td><td class="n">${m(g[k].reduce((s,x)=>s+x.r.price,0))}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">El precio a pagar es el precio final; si aún no lo has ingresado, se usa el precio de venta sugerido.</p>`:'<div class="card empty">Aquí verás lo que debe pagar cada cliente cuando guardes cotizaciones.</div>'}`}
function bindCli(){$('#exp').onclick=()=>{const g=groups(),o=[['Cliente','Producto','Precio a pagar COP']];
  Object.keys(g).forEach(k=>{g[k].forEach(x=>o.push([k,x.q.name,Math.round(x.r.price)]));o.push([k,'TOTAL A PAGAR',Math.round(g[k].reduce((s,x)=>s+x.r.price,0))])});exportCSV('clientes',o)}}
function vCfg(){const f=(k,l)=>`<label>${l}<input id="s_${k}" type="number" inputmode="decimal" step="any" value="${S.set[k]}"></label>`;
  return `<h2>Ajustes</h2><div class="card">${f('trm','TRM del día ajustada (COP por USD)')}${f('tax','Sales tax (%)')}${f('rate','Tarifa de envío (COP por kg)')}
  <p class="note">Los cambios aplican a todas las cotizaciones, guardadas y nuevas.</p><button class="btn alt" id="rst">Restaurar valores originales</button></div>
  <div class="card"><b>Respaldo</b><button class="btn alt" id="bk">Descargar respaldo</button><label>Restaurar respaldo<input type="file" id="rs" accept=".json"></label></div>
  <button class="btn" id="back">Listo</button>`}
function bindCfg(){document.querySelectorAll('[id^=s_]').forEach(e=>e.oninput=()=>{S.set[e.id.slice(2)]=e.value;save()});
  $('#rst').onclick=()=>{S.set={...DEF};save();render();toast('Valores restaurados')};$('#back').onclick=()=>go('form');
  $('#bk').onclick=()=>out('kirahvi-respaldo.json',JSON.stringify(S),'application/json');
  $('#rs').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!d.q||!d.set)throw 0;S=d;save();toast('Respaldo restaurado');go('list')}catch{toast('Archivo no válido')}}}
async function out(name,txt,type){const f=new File([txt],name,{type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;a.click()}
function exportCSV(n,rows){const t='\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\r\n');out(`kirahvi-${n}.csv`,t,'text/csv')}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.t));$('#cfgBtn').onclick=()=>{tab='cfg';document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));render()};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
go('form');
