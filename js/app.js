/* Rotta SaaS — app statica vanilla, dati in localStorage */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="rotta_state_v1";
const S=window.__SEED__;
const fmt=n=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function save(){localStorage.setItem(KEY,JSON.stringify(DB))}
let DB=load();
if(!DB){
  const boats=S.seedBoats(), customers=S.seedCustomers();
  const leads=S.seedLeads(boats,customers), deals=S.seedDeals(boats,customers);
  const apps=S.seedAppointments(customers,boats), sales=S.seedSales(deals);
  DB={boats,customers,leads,deals,appointments:apps,sales,
    documents:[
      {id:"doc1",nome:"Perizia Aurora.pdf",barcaId:"b1",scadenza:"2026-11-01",tipo:"Perizia"},
      {id:"doc2",nome:"Assicurazione Nereide.pdf",barcaId:"b2",scadenza:"2026-10-15",tipo:"Assicurazione"},
      {id:"doc3",nome:"Libretto Libeccio.pdf",barcaId:"b3",scadenza:"2027-02-01",tipo:"Libretto"}],
    notifications:[
      {id:"n1",testo:"Nuovo lead dal sito: Marco Rossi",data:"2026-09-28",letta:false},
      {id:"n2",testo:"Visita domani ore 10:30 — Aurora",data:"2026-09-29",letta:false}],
    activities:[{t:"Lead l20 creato da sito web",d:"2026-09-28"},{t:"Offerta aggiornata su Libeccio",d:"2026-09-27"},{t:"Vendita registrata: X4.3",d:"2026-09-20"}],
    session:null};
  save();
}
/* ---------- toast / notifiche ---------- */
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;$("#toasts").appendChild(t);setTimeout(()=>t.remove(),3200)}
function notify(testo){DB.notifications.unshift({id:"n"+Date.now(),testo,data:new Date().toISOString().slice(0,10),letta:false});save();renderNotifs()}
/* ---------- router ---------- */
const routes=["home","catalogo","dettaglio","login","dashboard","barche","clienti","lead","trattative","appuntamenti","vendite","documenti","report","impostazioni","contatti"];
function go(r){location.hash="#/"+r}
function parseHash(){const h=(location.hash||"#/home").replace("#/","");const [path,qs]=h.split("?");return{path:path||"home",q:new URLSearchParams(qs||"")}}
function render(){
  const {path,q}=parseHash();
  const pub=["home","catalogo","dettaglio","login","contatti"].includes(path);
  $("#pub").style.display=pub?"":"none";
  $("#app").classList.toggle("on",!pub);
  $$("#pub .view").forEach(v=>v.classList.toggle("on",v.dataset.view===path));
  $$("#app .view").forEach(v=>v.classList.toggle("on",v.dataset.view===path));
  $$("[data-nav]").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#/"+path));
  if(!pub&&!DB.session){go("login");return}
  if(path==="home")renderHome(); if(path==="catalogo")renderCatalogo();
  if(path==="dettaglio")renderDettaglio(q.get("id"));
  if(path==="dashboard")renderDashboard(); if(path==="barche")renderBoatsAdmin();
  if(path==="clienti")renderCustomers(); if(path==="lead")renderKanban();
  if(path==="trattative")renderDeals(); if(path==="appuntamenti")renderCalendar();
  if(path==="vendite")renderSales(); if(path==="documenti")renderDocs();
  if(path==="report")renderReports(); if(path==="impostazioni")renderSettings();
  renderNotifs(); applyRole(); window.scrollTo(0,0);
}
window.addEventListener("hashchange",render);
/* ---------- pubblica ---------- */
function boatCard(b){return `<article class="card"><img class="cover" loading="lazy" src="${b.immagini[0]}" alt="${esc(b.nome)} — ${esc(b.cantiere)} ${esc(b.modello)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22500%22><rect fill=%22%23E8D3A8%22 width=%22800%22 height=%22500%22/><text x=%22400%22 y=%22260%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22%23073B4C%22>⛵ ${esc(b.nome)}</text></svg>'">
<div class="card-pad"><span class="badge ${esc(b.stato.toLowerCase().replace(/ /g,'-'))}">${esc(b.stato)}</span>
<h3 style="margin:.4rem 0;color:var(--oceano)">${esc(b.nome)} <span class="muted small">· ${esc(b.cantiere)} ${esc(b.modello)}</span></h3>
<p class="muted small">${esc(b.anno)} · ${esc(b.lunghezza)} m · ${esc(b.localita)}</p>
<p class="price">${fmt(b.prezzo)}</p>
<div style="display:flex;gap:.5rem;flex-wrap:wrap"><a class="btn small" href="#/dettaglio?id=${b.id}">Dettagli</a><button class="btn small ghost" onclick="askInfo('${b.id}')">Richiedi info</button></div></div></article>`}
function renderHome(){
  const ev=DB.boats.filter(b=>b.inEvidenza).slice(0,3), last=[...DB.boats].slice(-3).reverse();
  $("#home-ev").innerHTML=ev.map(boatCard).join("");
  $("#home-last").innerHTML=last.map(boatCard).join("");
  $("#kpi-boats").textContent=DB.boats.filter(b=>b.stato==="Disponibile").length;
  $("#kpi-sold").textContent=DB.boats.filter(b=>b.stato==="Venduta").length;
  $("#kpi-value").textContent=fmt(DB.boats.filter(b=>b.stato!=="Venduta").reduce((a,b)=>a+b.prezzo,0));
  $("#kpi-leads").textContent=DB.leads.filter(l=>!["Vinto","Perso"].includes(l.stato)).length;
}
function renderCatalogo(){
  const q=($("#f-q")?.value||"").toLowerCase(), cant=$("#f-cant")?.value||"", loc=$("#f-loc")?.value||"";
  const pmax=+($("#f-prezzo")?.value||0)||Infinity, anno=+($("#f-anno")?.value||0)||0;
  let list=DB.boats.filter(b=>(b.nome+b.cantiere+b.modello+b.localita).toLowerCase().includes(q));
  if(cant)list=list.filter(b=>b.cantiere===cant); if(loc)list=list.filter(b=>b.localita===loc);
  list=list.filter(b=>b.prezzo<=pmax&&b.anno>=anno);
  $("#cat-list").innerHTML=list.length?list.map(boatCard).join(""):`<div class="empty">Nessuna barca trovata. Prova a modificare i filtri.</div>`;
  $("#cat-count").textContent=list.length+" barche";
}
function renderDettaglio(id){
  const b=DB.boats.find(x=>x.id===id)||DB.boats[0]; if(!b)return;
  $("#det").innerHTML=`<div class="grid cols-2"><div>
    <div class="gallery">${b.immagini.map(u=>`<img loading="lazy" src="${u}" alt="${esc(b.nome)}" onclick="zoom(this.src)">`).join("")}</div>
    <div class="panel" style="margin-top:1rem"><h3>Descrizione</h3><p>${esc(b.descrizione)}</p>
    <h3>Dotazioni</h3>${Object.entries(b.dotazioni).map(([k,v])=>`<p><b>${esc(k)}:</b> ${esc(v.join(", "))}</p>`).join("")}</div></div>
  <div><span class="badge ${esc(b.stato.toLowerCase().replace(/ /g,'-'))}">${esc(b.stato)}</span>
    <h2 class="h2">${esc(b.nome)}</h2><p class="muted">${esc(b.cantiere)} ${esc(b.modello)} · ${esc(b.anno)} · ${esc(b.localita)}</p>
    <p class="price" style="font-size:1.8rem">${fmt(b.prezzo)}</p>
    <div class="table-wrap"><table><tbody>
    ${[["Lunghezza",b.lunghezza+" m"],["Baglio",b.baglio+" m"],["Pescaggio",b.pescaggio+" m"],["Cabine",b.cabine],["Posti letto",b.letti],["Bagni",b.bagni],["Motore",b.motore],["Ore motore",b.oreMotore],["Broker",b.broker]].map(r=>`<tr><th>${r[0]}</th><td>${esc(r[1])}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="toolbar"><button class="btn" onclick="askInfo('${b.id}')">Richiedi informazioni</button><button class="btn ghost" onclick="bookVisit('${b.id}')">Prenota una visita</button></div>
    <div class="panel"><h3>Storico prezzi</h3>${b.storicoPrezzi.map(s=>`<p class="small">${esc(s.data)} — <b>${fmt(s.prezzo)}</b></p>`).join("")}</div>
  </div></div>`;
}
window.zoom=s=>{const l=$("#lightbox");l.classList.add("on");l.querySelector("img").src=s};
window.askInfo=id=>{const b=DB.boats.find(x=>x.id===id);notify("Richiesta info per "+b.nome);DB.leads.push({id:"l"+Date.now(),clienteId:DB.customers[0].id,barcaId:id,stato:"Nuovo",valore:b.prezzo,ultimoContatto:new Date().toISOString().slice(0,10),prossimoApp:"—",responsabile:b.broker,note:"Richiesta dal sito pubblico"});save();toast("Richiesta inviata! Ti ricontatteremo presto.")};
window.bookVisit=id=>{notify("Visita prenotata dal sito");DB.appointments.push({id:"a"+Date.now(),titolo:"Visita — "+id,tipo:"Visita",data:new Date(Date.now()+864e5).toISOString().slice(0,10),ora:"10:30",clienteId:DB.customers[0].id,barcaId:id,broker:"M. Rossi",luogo:"Marina",note:"Prenotazione web"});save();toast("Visita prenotata! Controlla Appuntamenti.")};
/* ---------- auth & ruoli ---------- */
function doLogin(e){e.preventDefault();
  const em=$("#li-email").value.trim().toLowerCase(), pw=$("#li-pass").value;
  const u=S.DEMO_USERS.find(x=>x.email===em&&x.pass===pw);
  if(!u){$("#li-err").textContent="Credenziali non valide. Prova admin@rotta.it / admin123";return}
  DB.session={email:u.email,nome:u.nome,ruolo:u.ruolo};save();go("dashboard");toast("Benvenuto, "+u.nome)}
function logout(){DB.session=null;save();go("home")}
function applyRole(){const r=DB.session?.ruolo||"Admin";
  $$("[data-role-admin]").forEach(el=>el.style.display=r==="Admin"?"":"none");
  $$("[data-del]").forEach(el=>el.style.display=r==="Collaboratore"?"none":"");
}
/* ---------- dashboard ---------- */
function renderDashboard(){
  const disp=DB.boats.filter(b=>b.stato==="Disponibile").length, sold=DB.boats.filter(b=>b.stato==="Venduta").length;
  const val=DB.boats.filter(b=>b.stato!=="Venduta").reduce((a,b)=>a+b.prezzo,0);
  $("#d-kpi").innerHTML=[["Barche disponibili",disp],["Vendute",sold],["Valore inventario",fmt(val)],["Lead aperti",DB.leads.filter(l=>!["Vinto","Perso"].includes(l.stato)).length],["Trattative aperte",DB.deals.filter(d=>!["Accettata","Rifiutata"].includes(d.stato)).length],["Vendite mese",DB.sales.length],["Appuntamenti",DB.appointments.length],["Documenti",DB.documents.length]]
    .map(k=>`<div class="kpi"><span class="muted small">${k[0]}</span><b>${k[1]}</b></div>`).join("");
  barChart($("#ch-sales"),monthlySales()); donut($("#ch-inv"),invByState()); bars($("#ch-lead"),leadByState());
  $("#d-act").innerHTML=DB.activities.slice(0,6).map(a=>`<p class="small">• ${esc(a.t)} <span class="muted">(${esc(a.d)})</span></p>`).join("");
  $("#d-apps").innerHTML=[...DB.appointments].sort((a,b)=>a.data.localeCompare(b.data)).slice(0,5).map(a=>`<p class="small"><b>${esc(a.data)} ${esc(a.ora)}</b> — ${esc(a.titolo)} <span class="muted">${esc(a.broker)}</span></p>`).join("");
}
function monthlySales(){const m={};DB.sales.forEach(s=>{const k=(s.data||"").slice(0,7);m[k]=(m[k]||0)+s.prezzoFinale});return Object.entries(m).sort().slice(-8)}
function invByState(){const m={};DB.boats.forEach(b=>m[b.stato]=(m[b.stato]||0)+1);return Object.entries(m)}
function leadByState(){const m={};DB.leads.forEach(l=>m[l.stato]=(m[l.stato]||0)+1);return Object.entries(m)}
function barChart(cv,data){if(!cv)return;const c=cv.getContext("2d"),W=cv.width=cv.offsetWidth*2,H=cv.height=480;c.clearRect(0,0,W,H);
  const max=Math.max(1,...data.map(d=>d[1]));data.forEach((d,i)=>{const bw=W/Math.max(1,data.length)*0.55,x=i*(W/data.length)+(W/data.length-bw)/2,h=(d[1]/max)*(H-80);c.fillStyle="#0B6E8E";c.fillRect(x,H-40-h,bw,h);c.fillStyle="#17313B";c.font="20px sans-serif";c.fillText(d[0].slice(5),x,H-12)})}
function donut(cv,data){if(!cv)return;const c=cv.getContext("2d"),W=cv.width=cv.offsetWidth*2,H=cv.height=480;c.clearRect(0,0,W,H);
  const tot=data.reduce((a,d)=>a+d[1],0)||1;let a=-Math.PI/2;const cols=["#073B4C","#0B6E8E","#2A9DAD","#45C2C9","#E8D3A8","#b7791f"];
  data.forEach((d,i)=>{const ang=d[1]/tot*Math.PI*2;c.beginPath();c.moveTo(W/2,H/2-30);c.arc(W/2,H/2-30,120,a,a+ang);c.closePath();c.fillStyle=cols[i%cols.length];c.fill();a+=ang});
  c.fillStyle="#17313B";c.font="20px sans-serif";data.forEach((d,i)=>c.fillText(`${d[0]}: ${d[1]}`,20,H-120+i*26))}
function bars(cv,data){barChart(cv,data)}
/* ---------- admin barche ---------- */
function renderBoatsAdmin(){
  const q=($("#b-q")?.value||"").toLowerCase(), st=$("#b-stato")?.value||"";
  let list=DB.boats.filter(b=>(b.nome+b.cantiere+b.modello).toLowerCase().includes(q)); if(st)list=list.filter(b=>b.stato===st);
  $("#boats-t").innerHTML=list.map(b=>`<tr><td><b>${esc(b.nome)}</b><br><span class="muted">${esc(b.cantiere)} ${esc(b.modello)}</span></td><td>${b.anno}</td><td>${fmt(b.prezzo)}</td><td>${esc(b.localita)}</td><td><span class="badge ${esc(b.stato.toLowerCase().replace(/ /g,'-'))}">${esc(b.stato)}</span></td>
  <td><button class="btn small ghost" onclick="editBoat('${b.id}')">Modifica</button> <button class="btn small danger" data-del onclick="delBoat('${b.id}')">Elimina</button></td></tr>`).join("");
  $("#boats-n").textContent=list.length+" barche"; applyRole();
}
window.delBoat=id=>{if(!confirm("Eliminare la barca?"))return;DB.boats=DB.boats.filter(b=>b.id!==id);save();renderBoatsAdmin();toast("Barca eliminata")};
window.editBoat=id=>{const b=DB.boats.find(x=>x.id===id)||{id:"b"+Date.now(),nome:"",cantiere:"",modello:"",anno:2020,prezzo:100000,localita:"Genova",stato:"Disponibile",lunghezza:"12.00",baglio:"3.80",pescaggio:"1.95",cabine:3,letti:6,bagni:2,motore:"",oreMotore:0,broker:"M. Rossi",proprietario:"",descrizione:"",immagini:[IMGS[0]],dotazioni:{},storicoPrezzi:[],inEvidenza:false};
  openModal(`<h3>${id?"Modifica":"Nuova"} barca</h3><form onsubmit="saveBoat(event,'${b.id}')">
  <div class="row2"><div><label>Nome<input required name="nome" value="${esc(b.nome)}"></label></div><div><label>Cantiere<input required name="cantiere" value="${esc(b.cantiere)}"></label></div></div>
  <div class="row2"><div><label>Modello<input name="modello" value="${esc(b.modello)}"></label></div><div><label>Anno<input type="number" name="anno" value="${b.anno}"></label></div></div>
  <div class="row2"><div><label>Prezzo €<input type="number" name="prezzo" value="${b.prezzo}"></label></div><div><label>Località<input name="localita" value="${esc(b.localita)}"></label></div></div>
  <div class="row2"><div><label>Stato<select name="stato">${["Disponibile","In trattativa","Prenotata","Venduta","Sospesa"].map(s=>`<option ${s===b.stato?"selected":""}>${s}</option>`).join("")}</select></label></div><div><label>Lunghezza m<input name="lunghezza" value="${esc(b.lunghezza)}"></label></div></div>
  <label>Descrizione<textarea name="descrizione">${esc(b.descrizione)}</textarea></label>
  <label><input type="checkbox" name="inEvidenza" ${b.inEvidenza?"checked":""} style="width:auto"> In evidenza</label>
  <div class="toolbar"><button class="btn" type="submit">Salva</button><button type="button" class="btn ghost" onclick="closeModal()">Annulla</button></div></form>`)};
window.saveBoat=(e,id)=>{e.preventDefault();const f=new FormData(e.target);let b=DB.boats.find(x=>x.id===id);
  const obj={nome:f.get("nome"),cantiere:f.get("cantiere"),modello:f.get("modello"),anno:+f.get("anno"),prezzo:+f.get("prezzo"),localita:f.get("localita"),stato:f.get("stato"),lunghezza:f.get("lunghezza"),descrizione:f.get("descrizione"),inEvidenza:!!f.get("inEvidenza")};
  if(b){if(b.prezzo!==obj.prezzo)b.storicoPrezzi.push({data:new Date().toISOString().slice(0,10),prezzo:obj.prezzo});Object.assign(b,obj)}else DB.boats.unshift({id,...obj,baglio:"3.80",pescaggio:"1.95",cabine:3,letti:6,bagni:2,motore:"Yanmar",oreMotore:0,broker:DB.session.nome,proprietario:"",immagini:[IMGS[DB.boats.length%IMGS.length]],dotazioni:{},storicoPrezzi:[{data:new Date().toISOString().slice(0,10),prezzo:obj.prezzo}]});
  save();closeModal();renderBoatsAdmin();notify("Barca salvata: "+obj.nome);toast("Salvato")};
/* ---------- clienti ---------- */
function renderCustomers(){
  const q=($("#c-q")?.value||"").toLowerCase();
  const list=DB.customers.filter(c=>(c.nome+c.email+c.citta).toLowerCase().includes(q));
  $("#cust-t").innerHTML=list.map(c=>`<tr><td><b>${esc(c.nome)}</b><br><span class="muted">${esc(c.email)}</span></td><td>${esc(c.citta)}</td><td>${fmt(c.budget)}</td><td>${esc(c.responsabile)}</td>
  <td><button class="btn small ghost" onclick="editCust('${c.id}')">Apri</button> <button class="btn small danger" data-del onclick="delCust('${c.id}')">Elimina</button></td></tr>`).join("");applyRole();
}
window.delCust=id=>{if(!confirm("Eliminare?"))return;DB.customers=DB.customers.filter(c=>c.id!==id);save();renderCustomers()};
window.editCust=id=>{const c=DB.customers.find(x=>x.id===id);if(!c)return;
  const leads=DB.leads.filter(l=>l.clienteId===id),deals=DB.deals.filter(d=>d.clienteId===id);
  openModal(`<h3>${esc(c.nome)}</h3><p class="muted">${esc(c.email)} · ${esc(c.tel)} · ${esc(c.citta)}</p>
  <p><b>Budget:</b> ${fmt(c.budget)} · <b>Preferenze:</b> ${esc(c.preferenze)}</p><p>${esc(c.note)}</p>
  <h4>Lead (${leads.length})</h4>${leads.map(l=>`<p class="small">• ${l.stato} — ${fmt(l.valore)}</p>`).join("")||"<p class=muted>Nessuno</p>"}
  <h4>Trattative (${deals.length})</h4>${deals.map(d=>`<p class="small">• ${d.stato} — off. ${fmt(d.offerto)}</p>`).join("")||"<p class=muted>Nessuna</p>"}
  <div class="toolbar"><button class="btn ghost" onclick="closeModal()">Chiudi</button></div>`)};
/* ---------- kanban lead ---------- */
const LEAD_STATES=["Nuovo","Contattato","Qualificato","Visita","Offerta","Negoziazione","Vinto","Perso"];
function renderKanban(){
  $("#kanban").innerHTML=LEAD_STATES.map(s=>{const cards=DB.leads.filter(l=>l.stato===s);
    return `<div class="kcol" ondragover="event.preventDefault()" ondrop="dropLead(event,'${s}')"><h4>${s} (${cards.length})</h4>
    ${cards.map(l=>{const cu=DB.customers.find(c=>c.id===l.clienteId)||{},bo=DB.boats.find(b=>b.id===l.barcaId)||{};
      return `<div class="kcard" draggable="true" ondragstart="event.dataTransfer.setData('text','${l.id}')"><b>${esc(cu.nome||"?")}</b><br><span class="small muted">${esc(bo.nome||"")} · ${fmt(l.valore)}</span><br><span class="small">📞 ${esc(l.ultimoContatto)} · 👤 ${esc(l.responsabile)}</span></div>`}).join("")}
    <button class="btn small light" onclick="newLead('${s}')">+ Aggiungi</button></div>`}).join("");
}
window.dropLead=(e,s)=>{const id=e.dataTransfer.getData("text");const l=DB.leads.find(x=>x.id===id);if(l){l.stato=s;save();renderKanban();notify("Lead "+id+" → "+s)}};
window.newLead=(s="Nuovo")=>{openModal(`<h3>Nuovo lead (${s})</h3><form onsubmit="saveLead(event,'${s}')">
  <label>Cliente<select name="clienteId">${DB.customers.map(c=>`<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select></label>
  <label>Barca<select name="barcaId">${DB.boats.map(b=>`<option value="${b.id}">${esc(b.nome)}</option>`).join("")}</select></label>
  <label>Valore €<input type="number" name="valore" value="100000"></label>
  <div class="toolbar"><button class="btn" type="submit">Crea</button><button type="button" class="btn ghost" onclick="closeModal()">Annulla</button></div></form>`)};
window.saveLead=(e,s)=>{e.preventDefault();const f=new FormData(e.target);DB.leads.unshift({id:"l"+Date.now(),clienteId:f.get("clienteId"),barcaId:f.get("barcaId"),stato:s,valore:+f.get("valore"),ultimoContatto:new Date().toISOString().slice(0,10),prossimoApp:"—",responsabile:DB.session.nome,note:""});save();closeModal();renderKanban();notify("Nuovo lead creato")};
/* ---------- trattative / vendite ---------- */
function renderDeals(){
  $("#deals-t").innerHTML=DB.deals.map(d=>{const cu=DB.customers.find(c=>c.id===d.clienteId)||{},bo=DB.boats.find(b=>b.id===d.barcaId)||{};
    return `<tr><td><b>${esc(cu.nome)}</b><br><span class="muted">${esc(bo.nome)}</span></td><td>${fmt(d.richiesto)}</td><td>${fmt(d.offerto)}</td><td>${fmt(d.controproposta)}</td><td><span class="badge">${esc(d.stato)}</span></td>
    <td><button class="btn small ok" onclick="toSale('${d.id}')">→ Vendita</button></td></tr>`}).join("");
}
window.toSale=id=>{const d=DB.deals.find(x=>x.id===id);if(!d)return;
  DB.sales.unshift({id:"s"+Date.now(),dealId:id,barcaId:d.barcaId,clienteId:d.clienteId,prezzoFinale:d.controproposta,data:new Date().toISOString().slice(0,10),broker:d.broker,commissione:Math.round(d.controproposta*0.05),costi:1000,note:"Da trattativa"});
  const b=DB.boats.find(x=>x.id===d.barcaId);if(b)b.stato="Venduta";d.stato="Accettata";
  save();notify("Vendita completata: "+(b?.nome||""));toast("Trattativa convertita in vendita");renderDeals()};
function renderSales(){
  $("#sales-t").innerHTML=DB.sales.map(s=>{const cu=DB.customers.find(c=>c.id===s.clienteId)||{},bo=DB.boats.find(b=>b.id===s.barcaId)||{};
    return `<tr><td>${esc(s.data)}</td><td>${esc(bo.nome)}</td><td>${esc(cu.nome)}</td><td><b>${fmt(s.prezzoFinale)}</b></td><td>${fmt(s.commissione)}</td><td>${esc(s.broker)}</td></tr>`}).join("");
  const tot=DB.sales.reduce((a,s)=>a+s.prezzoFinale,0);
  $("#sales-tot").textContent="Totale fatturato: "+fmt(tot)+" · Commissioni: "+fmt(DB.sales.reduce((a,s)=>a+s.commissione,0));
}
window.exportCSV=()=>{const rows=[["id","data","barca","cliente","prezzo","commissione"],...DB.sales.map(s=>[s.id,s.data,s.barcaId,s.clienteId,s.prezzoFinale,s.commissione])];
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(";")).join("\n")],{type:"text/csv"}));a.download="vendite.csv";a.click();toast("CSV esportato")};
/* ---------- calendario ---------- */
let calMode="mese",calDate=new Date();
function renderCalendar(){
  const box=$("#cal");if(!box)return;const y=calDate.getFullYear(),m=calDate.getMonth();
  $("#cal-title").textContent=calDate.toLocaleDateString("it-IT",{month:"long",year:"numeric"});
  if(calMode!=="mese"){box.innerHTML=DB.appointments.filter(a=>a.data.startsWith(y+"-"+String(m+1).padStart(2,"0"))).map(a=>`<p class="small panel"><b>${esc(a.data)} ${esc(a.ora)}</b> — ${esc(a.titolo)} (${esc(a.tipo)})<br><span class="muted">${esc(a.luogo)} · ${esc(a.broker)}</span></p>`).join("")||`<div class="empty">Nessun appuntamento</div>`;return}
  const first=new Date(y,m,1).getDay()||7;let html=`<div class="cal-grid">`+["L","M","M","G","V","S","D"].map(d=>`<b class="small" style="text-align:center">${d}</b>`).join("");
  for(let i=1;i<first;i++)html+=`<div class="cal-cell out"></div>`;
  const days=new Date(y,m+1,0).getDate();
  for(let d=1;d<=days;d++){const ds=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const evs=DB.appointments.filter(a=>a.data===ds);
    html+=`<div class="cal-cell ${ds===new Date().toISOString().slice(0,10)?"today":""}"><b>${d}</b>${evs.map(e=>`<div class="cal-ev">${esc(e.ora)} ${esc(e.titolo)}</div>`).join("")}</div>`}
  box.innerHTML=html+"</div>";
}
window.calNav=n=>{calDate.setMonth(calDate.getMonth()+n);renderCalendar()};
window.calModeSet=v=>{calMode=v;renderCalendar()};
window.newApp=()=>{openModal(`<h3>Nuovo appuntamento</h3><form onsubmit="saveApp(event)"><label>Titolo<input name="titolo" required></label>
  <div class="row2"><div><label>Tipo<select name="tipo"><option>Visita</option><option>Videochiamata</option><option>Telefonata</option><option>Prova in mare</option><option>Perizia</option></select></label></div><div><label>Data<input type="date" name="data" required></label></div></div>
  <div class="row2"><div><label>Ora<input type="time" name="ora" value="10:30"></label></div><div><label>Barca<select name="barcaId">${DB.boats.map(b=>`<option value="${b.id}">${esc(b.nome)}</option>`).join("")}</select></label></div></div>
  <div class="toolbar"><button class="btn" type="submit">Salva</button><button type="button" class="btn ghost" onclick="closeModal()">Annulla</button></div></form>`)};
window.saveApp=e=>{e.preventDefault();const f=new FormData(e.target);DB.appointments.push({id:"a"+Date.now(),titolo:f.get("titolo"),tipo:f.get("tipo"),data:f.get("data"),ora:f.get("ora"),clienteId:DB.customers[0].id,barcaId:f.get("barcaId"),broker:DB.session.nome,luogo:"Marina",note:""});save();closeModal();renderCalendar();notify("Nuovo appuntamento: "+f.get("titolo"))};
/* ---------- documenti / report / settings ---------- */
function renderDocs(){
  $("#docs-t").innerHTML=DB.documents.map(d=>{const bo=DB.boats.find(b=>b.id===d.barcaId)||{};const sc=new Date(d.scadenza)<new Date(Date.now()+30*864e5);
    return `<tr><td>${esc(d.nome)}</td><td>${esc(bo.nome||"—")}</td><td>${esc(d.tipo)}</td><td>${esc(d.scadenza)} ${sc?"⚠️":""}</td></tr>`}).join("");
}
function renderReports(){
  const tot=DB.sales.reduce((a,s)=>a+s.prezzoFinale,0), avg=DB.sales.length?tot/DB.sales.length:0;
  $("#rep-kpi").innerHTML=[["Fatturato totale",fmt(tot)],["Valore medio",fmt(avg)],["N. vendite",DB.sales.length],["Conversione lead",Math.round(DB.leads.filter(l=>l.stato==="Vinto").length/Math.max(1,DB.leads.length)*100)+"%"]].map(k=>`<div class="kpi"><span class="muted small">${k[0]}</span><b>${k[1]}</b></div>`).join("");
  barChart($("#ch-rep"),monthlySales());
}
function renderSettings(){
  $("#set-box").innerHTML=`<p><b>Utente:</b> ${esc(DB.session.nome)} (${esc(DB.session.ruolo)}) — ${esc(DB.session.email)}</p>
  <p class="muted">Ruoli demo: Admin accesso completo · Broker senza Impostazioni · Collaboratore sola lettura (no elimina).</p>
  <div class="toolbar"><button class="btn ghost" onclick="if(confirm('Resettare i dati demo?')){localStorage.removeItem('${KEY}');location.reload()}">Ripristina dati demo</button>
  <button class="btn danger" onclick="logout()">Esci</button></div>`;
}
/* ---------- ricerca globale + notifiche ---------- */
function globalSearch(q){q=q.toLowerCase();if(!q||q.length<2){$("#gs-res").style.display="none";return}
  const r=[...DB.boats.filter(b=>(b.nome+b.modello).toLowerCase().includes(q)).map(b=>["⛵ Barca",b.nome,"#/dashboard"]),
    ...DB.customers.filter(c=>c.nome.toLowerCase().includes(q)).map(c=>["👤 Cliente",c.nome,"#/clienti"]),
    ...DB.leads.filter(l=>l.id.toLowerCase()===q).map(l=>["📈 Lead",l.id,"#/lead"])];
  $("#gs-res").innerHTML=r.slice(0,8).map(x=>`<div class="notif-item">${x[0]} — <b>${esc(x[1])}</b></div>`).join("")||`<div class="notif-item">Nessun risultato</div>`;
  $("#gs-res").style.display="block"}
function renderNotifs(){
  const un=DB.notifications.filter(n=>!n.letta).length;
  $("#notif-n").textContent=un||"";$("#notif-n").style.display=un?"grid":"none";
  $("#notif-list").innerHTML=DB.notifications.slice(0,15).map(n=>`<div class="notif-item">${esc(n.testo)}<br><span class="muted small">${esc(n.data)}</span></div>`).join("");
}
/* ---------- modal ---------- */
function openModal(h){$("#modal-box").innerHTML=h;$("#modal").classList.add("on")}
function closeModal(){$("#modal").classList.remove("on")}
document.addEventListener("click",e=>{if(e.target.id==="modal")closeModal();if(!e.target.closest(".notif-wrap"))$("#notif-list")?.classList.remove("on")});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();$("#lightbox").classList.remove("on")}});
document.addEventListener("DOMContentLoaded",()=>{render();$("#year").textContent=new Date().getFullYear()});
