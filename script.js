var ENDPOINT = "https://paymegpt.com/api/public/landing-pages/5441/sheet-data";
var DATA = [];
function num(v){ if(!v) return 0; if(/^\d+$/.test(String(v).trim())) return parseInt(v,10); if(String(v).toLowerCase().indexOf('just')>-1) return 1; if(String(v).indexOf('+')>-1) return parseInt(v,10)||4; return 1; }
function normalize(rows){
  return rows.map(function(r){
    function g(){ for(var i=0;i<arguments.length;i++){ var k=arguments[i]; for(var key in r){ if(key.toLowerCase().replace(/[^a-z]/g,'')===k){ return r[key]; } } } return ""; }
    return { name:g('fullname','name'), email:g('email'), phone:g('phone'), guests:g('numberofguests','guests'), agent:g('workingwithanagent','agent'), msg:g('message'), when:g('submittedat','registered'), status:g('status') };
  }).filter(function(r){ return (r.name||r.email||r.phone); });
}
function load(){
  document.getElementById('rows').innerHTML = '<tr><td colspan="6" class="loading">Loading…</td></tr>';
  fetch(ENDPOINT).then(function(r){ return r.json(); }).then(function(j){
    var rows = Array.isArray(j) ? j : (j.rows || j.data || j.records || []);
    DATA = normalize(rows); stats(); render();
    document.getElementById('updated').textContent = 'Last updated ' + new Date().toLocaleString();
  }).catch(function(e){
    document.getElementById('rows').innerHTML = '<tr><td colspan="6" class="empty">Could not load live data yet. Click Refresh in a moment, or open the Google Sheet directly.</td></tr>';
  });
}
function stats(){
  var total=DATA.length, guests=0, agent=0, noagent=0;
  DATA.forEach(function(r){ guests+=num(r.guests); var a=String(r.agent).toLowerCase(); if(a.indexOf('yes')>-1) agent++; else noagent++; });
  document.getElementById('s-total').textContent=total;
  document.getElementById('s-guests').textContent=guests;
  document.getElementById('s-agent').textContent=agent;
  document.getElementById('s-noagent').textContent=noagent;
}
function render(){
  var q=(document.getElementById('search').value||'').toLowerCase();
  var list=DATA.filter(function(r){ return !q || (r.name+r.email+r.phone).toLowerCase().indexOf(q)>-1; });
  if(!list.length){ document.getElementById('rows').innerHTML='<tr><td colspan="6" class="empty">No registrations yet. They\'ll appear here the moment someone signs up.</td></tr>'; return; }
  document.getElementById('rows').innerHTML = list.map(function(r){
    var agentYes=String(r.agent).toLowerCase().indexOf('yes')>-1;
    var tel=String(r.phone).replace(/[^0-9+]/g,'');
    return '<tr><td><strong>'+esc(r.name||'—')+'</strong></td><td><a class="tel" href="tel:'+tel+'">'+esc(r.phone||'—')+'</a></td><td class="hide-sm">'+esc(r.email||'—')+'</td><td>'+esc(r.guests||'—')+'</td><td><span class="pill '+(agentYes?'yes':'')+'">'+(agentYes?'Yes':'No')+'</span></td><td class="hide-sm">'+esc(r.when||'—')+'</td></tr>';
  }).join('');
}
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function exportCsv(){
  var head=['Name','Phone','Email','Guests','Agent','Message','Registered'];
  var lines=[head.join(',')].concat(DATA.map(function(r){ return [r.name,r.phone,r.email,r.guests,r.agent,r.msg,r.when].map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(','); }));
  var blob=new Blob([lines.join('\n')],{type:'text/csv'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='open-house-registrations.csv'; a.click();
}
load();
setInterval(load, 30000);