/* Seed demo realistico — barche a vela */
const IMGS = [
  "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520383278046-5d3c1682994b?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=900&q=70&auto=format&fit=crop"
];
const CANTIERI = ["Beneteau","Jeanneau","Dufour","Bavaria","Hanse","Oceanis","Lagoon","X-Yachts","Grand Soleil","Elan"];
const LOCALITA = ["Genova","La Spezia","Livorno","Napoli","Olbia","Cagliari","Palermo","Bari","Venezia","Trieste"];

function seedBoats(){
  const modelli = ["Oceanis 46.1","Sun Odyssey 410","Dufour 390","Bavaria C42","Hanse 418","First 36","Grand Soleil 42","X4.3","Elan E4","Lagoon 42"];
  return modelli.map((m,i)=>({
    id:"b"+(i+1),
    nome:["Aurora","Nereide","Libeccio","Maestrale","Scirocco","Aliseo","Ondina","Vela d'Oro","Azzurra","Tersicore"][i],
    cantiere:CANTIERI[i], modello:m, anno:2015+(i%10),
    prezzo:69000+i*23000, localita:LOCALITA[i],
    stato:["Disponibile","Disponibile","In trattativa","Disponibile","Prenotata","Disponibile","Venduta","Disponibile","Sospesa","Disponibile"][i],
    lunghezza:(11.5+i*0.7).toFixed(2), baglio:(3.6+(i%4)*0.2).toFixed(2),
    pescaggio:(1.9+(i%3)*0.15).toFixed(2), cabine:3+(i%3), letti:6+(i%3)*2, bagni:2+(i%2),
    motore:"Yanmar 40CV", oreMotore:400+i*120, carburante:200, acqua:300,
    rigging:"Sloop", vela:80+i*4, broker:["M. Rossi","L. Bianchi","S. Verdi"][i%3], proprietario:"Prop. "+(i+1),
    descrizione:"Barca a vela in ottimo stato, tagliandi regolari, pronta a navigare. Ideale per crociera e charter.",
    immagini:[IMGS[i%IMGS.length],IMGS[(i+3)%IMGS.length]],
    dotazioni:{Elettronica:["GPS plotter","Autopilota"],Vele:["Randa steccata","Genoa"],Sicurezza:["Zattera","EPIRB"],Comfort:["Aria condizionata","Elica di prua"]},
    storicoPrezzi:[{data:"2025-06-01",prezzo:75000+i*23000},{data:"2026-01-10",prezzo:69000+i*23000}],
    inEvidenza:i<3, createdAt:"2026-01-0"+(i+1)
  }));
}
function seedCustomers(){
  const nomi=[["Marco","Rossi"],["Laura","Bianchi"],["Giuseppe","Verdi"],["Anna","Neri"],["Paolo","Gialli"],["Sara","Conti"],["Luca","Ferrari"],["Elena","Ricci"],["Davide","Moretti"],["Chiara","Lombardi"],["Alessandro","Fontana"],["Federica","Santoro"],["Matteo","Rizzo"],["Valentina","Greco"],["Stefano","Colombo"]];
  return nomi.map((n,i)=>({id:"c"+(i+1),nome:n[0]+" "+n[1],email:n[0].toLowerCase()+"."+n[1].toLowerCase()+"@mail.it",tel:"+39 33"+(1000000+i*137913),citta:LOCALITA[i%10],paese:"Italia",budget:60000+(i*15000),preferenze:["Crociera","Regata","Charter"][i%3],barcheDesiderate:["b"+((i%10)+1)],note:"Cliente interessato a barca 38-46 piedi.",responsabile:["M. Rossi","L. Bianchi"][i%2]}));
}
function seedLeads(boats,customers){
  const stati=["Nuovo","Contattato","Qualificato","Visita","Offerta","Negoziazione","Vinto","Perso"];
  return Array.from({length:20},(_,i)=>({id:"l"+(i+1),
    clienteId:customers[i%customers.length].id, barcaId:boats[i%boats.length].id,
    stato:stati[i%stati.length], valore:60000+(i*12000),
    ultimoContatto:"2026-09-"+String(1+(i%27)).padStart(2,"0"),
    prossimoApp:"2026-10-"+String(1+(i%20)).padStart(2,"0"),
    responsabile:["M. Rossi","L. Bianchi","S. Verdi"][i%3], note:"Lead da sito web / salone nautico."}));
}
function seedDeals(boats,customers){
  return Array.from({length:10},(_,i)=>({id:"d"+(i+1),
    clienteId:customers[i%customers.length].id, barcaId:boats[i%boats.length].id,
    richiesto:90000+i*15000, offerto:80000+i*14000, controproposta:85000+i*14000,
    stato:["Aperta","Offerta","Controproposta","Accettata","Rifiutata"][i%5],
    broker:["M. Rossi","L. Bianchi"][i%2], note:"Trattativa in corso.", updatedAt:"2026-09-2"+(i%8), storico:[{data:"2026-08-15",evento:"Apertura"},{data:"2026-09-10",evento:"Offerta ricevuta"}]}));
}
function seedAppointments(customers,boats){
  const tipi=["Visita","Videochiamata","Telefonata","Prova in mare","Perizia"];
  return Array.from({length:10},(_,i)=>({id:"a"+(i+1),
    titolo:tipi[i%tipi.length]+" — "+boats[i%boats.length].nome,
    tipo:tipi[i%tipi.length], data:"2026-10-"+String(2+(i%20)).padStart(2,"0"), ora:(9+(i%9))+":30",
    clienteId:customers[i%customers.length].id, barcaId:boats[i%boats.length].id,
    broker:["M. Rossi","L. Bianchi"][i%2], luogo:LOCALITA[i%10]+" — Marina", note:"Portare documenti barca."}));
}
function seedSales(deals){
  return deals.slice(0,5).map((d,i)=>({id:"s"+(i+1),dealId:d.id,barcaId:d.barcaId,clienteId:d.clienteId,
    prezzoFinale:d.controproposta, data:"2026-0"+(3+i)+"-15", broker:d.broker,
    commissione:Math.round(d.controproposta*0.05), costi:1200+i*200, note:"Vendita completata."}));
}
const DEMO_USERS=[
  {email:"admin@rotta.it",pass:"admin123",nome:"Admin",ruolo:"Admin"},
  {email:"broker@rotta.it",pass:"broker123",nome:"M. Rossi",ruolo:"Broker"},
  {email:"collab@rotta.it",pass:"collab123",nome:"S. Verdi",ruolo:"Collaboratore"}
];
window.__SEED__={seedBoats,seedCustomers,seedLeads,seedDeals,seedAppointments,seedSales,DEMO_USERS};
