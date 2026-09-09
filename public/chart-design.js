import { readDemoCosts } from './company-costs.js';
import { financeChart } from './chart-finance-model.js';
const svg = document.getElementById('comse-revenue-chart');
if (svg) {
  const $ = id => document.getElementById(id);
  const names = ['Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota','Neděle'];
  const short = ['Po','Út','St','Čt','Pá','So','Ne'];
  const money = value => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
  let mode = document.querySelector('[data-overview-tab].is-active')?.dataset.overviewTab || 'marketing';
  let view = 'revenue', selected = 6, values = [], labels = [], points = [], elapsed = 15;
  const tabs = [...document.querySelectorAll('[data-chart-view]')];
  const set = (id,value) => { $(id).textContent = value; };
  const path = pts => pts.map((p,i)=>i ? `L${p.x},${p.y}` : `M${p.x},${p.y}`).join(' ');
  function select(index) {
    if (!points.length) return;
    selected = Math.min(index, points.length-1);
    const p = points[selected];
    for (const id of ['chart-selected-point','chart-halo']) { $(id).setAttribute('cx',p.x); $(id).setAttribute('cy',p.y); }
    for (const key of ['x1','x2']) $('chart-guide').setAttribute(key,p.x);
    set('chart-selected-day', `${labels[selected]}${view === 'cash' && selected >= elapsed ? ' · plán' : ''}`);
    set('chart-selected-value',money(values[selected]));
    document.querySelectorAll('#chart-days [data-chart-day]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.chartDay)===selected)));
    document.querySelectorAll('#chart-order-bars [data-chart-day]').forEach(b=>b.setAttribute('aria-pressed',String(view==='revenue' && Number(b.dataset.chartDay)===selected)));
  }
  function render(reset=false) {
    const scope = $('eshop-select').value;
    const data = window.ComseDemo.overview(scope,mode);
    const asOf = $('finance-asof').value;
    const validDate = $('finance-asof').checkValidity();
    const period = validDate ? asOf.slice(0,7) : '2026-09';
    elapsed = validDate ? Number(asOf.slice(8,10)) : 15;
    const finance = financeChart(readDemoCosts(), period, elapsed, scope, window.ComseDemo.overview(scope,'finance'));
    const month = new Intl.DateTimeFormat('cs-CZ',{month:'long',year:'numeric'}).format(new Date(`${period}-01T12:00:00`));
    const title = {revenue:'Tržby',profit:'Zisk po nákladech',cash:'Cashflow'}[view];
    tabs.forEach(b=>{ const active=b.dataset.chartView===view; b.setAttribute('aria-selected',String(active)); b.tabIndex=active?0:-1; });
    $('chart-view-panel').setAttribute('aria-labelledby',`chart-tab-${view}`);
    $('chart-view-panel').dataset.view=view;
    $('chart-cost-link').hidden=view==='revenue';
    $('chart-cash-breakdown').hidden=view!=='cash'||!finance;
    set('chart-headline-label',view==='cash'?'Pohyb peněz k vybranému dni':title);
    set('chart-view-title',{revenue:'Vývoj tržeb',profit:'Jak roste zisk po nákladech',cash:'Plán pohybu peněz v měsíci'}[view]);
    if (view==='revenue') {
      values=data.dailyRevenue; labels=names;
      set('chart-headline-value',money(data.revenue));
      set('chart-headline-note','Ukázka 7 dní · '+(mode==='finance'?'zaplacené a vyřízené objednávky':'všechny objednávky'));
      set('chart-equation',scope==='all'?`${money(window.ComseDemo.overview('store',mode).revenue)} + ${money(window.ComseDemo.overview('outlet',mode).revenue)} = ${money(data.revenue)}`:'Tržby vybraného e-shopu');
      set('chart-view-legend','Tržby za den · ukázka 7 dní');
      set('chart-view-hint','Přejeďte po grafu nebo vyberte den pro detail.');
    } else {
      values=finance?(view==='profit'?finance.profit:finance.cash).map(v=>v/100):[];
      labels=values.map((_,i)=>`${i+1}. ${Number(period.slice(5))}.`);
      const headline = finance?(view==='profit'?finance.profit.at(-1):finance.cash[elapsed-1])/100:null;
      set('chart-headline-value',headline===null?'Zatím bez dat':money(headline));
      set('chart-headline-note',`${month} · od 1. do ${elapsed}. dne · syntetická ukázka`);
      set('chart-equation',!finance?'Pro tento měsíc nejsou ukázkové příjmy.':view==='profit'?`Měsíční náklady ${money(finance.monthly/100)} · započítáváme ${elapsed} / ${finance.days} dní`:'Ukázkové inkaso − nákup zboží, reklama a platby nákladů');
      set('chart-view-legend',view==='profit'?'Kumulativní zisk po nákladech':'Kumulativní pohyb od 0 Kč · přerušovaně další dny');
      set('chart-view-hint',view==='profit'?'Stejné náklady a výpočet jako v kartě Zisk po nákladech.':'Plán předpokládá úhradu nezaplacených nákladů ve splatnosti. Ukázkové inkaso i nákup zboží a reklama probíhají v tentýž den; nejde o bankovní zůstatek.');
      if(finance && view==='cash') {
        set('chart-cash-income',money(finance.receipts[elapsed-1]/100));
        set('chart-cash-expense',money(finance.expenses[elapsed-1]/100));
        set('chart-cash-end',money(finance.cash.at(-1)/100));
        if(finance.later) $('chart-view-hint').textContent+=` Náklady tohoto měsíce splatné později: ${money(finance.later/100)}.`;
        if(finance.overdue) $('chart-view-hint').textContent+=` Pozor: ${money(finance.overdue/100)} je stále neuhrazených po splatnosti; křivka je plán, nikoli potvrzení úhrady.`;
      }
    }
    // Rounded axis covering both negative and positive results.
    const rawMin=Math.min(0,...values), rawMax=Math.max(1,...values);
    const step=Math.max(1,Math.ceil((rawMax-rawMin)/4/1000)*1000);
    const min=Math.floor(rawMin/step)*step;
    const max=Math.max(min+step*4,Math.ceil(rawMax/step)*step);
    const y=v=>204-(v-min)/(max-min)*192;
    document.querySelector('.comse-chart-axis').innerHTML=Array.from({length:5},(_,i)=>`<span>${new Intl.NumberFormat('cs-CZ',{notation:'compact',maximumFractionDigits:1}).format(max-(max-min)*i/4)}</span>`).join('');
    const x=i=>values.length===1?350:50+i*600/(values.length-1);
    points=values.map((v,i)=>({x:x(i),y:y(v)}));
    const split=view==='cash'?Math.min(elapsed,points.length):points.length;
    $('chart-line').setAttribute('d',path(points.slice(0,split)));
    $('chart-forecast').setAttribute('d',view==='cash'?path(points.slice(Math.max(0,split-1))):'');
    $('chart-area').setAttribute('d',points.length?`${path(points)} L${points.at(-1).x},${y(0)} L${points[0].x},${y(0)} Z`:'');
    $('chart-zero').setAttribute('y1',y(0));$('chart-zero').setAttribute('y2',y(0));
    $('chart-points').innerHTML=points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${points.length>15?2:3.5}" class="comse-chart-dot"/>`).join('');
    for(const id of ['chart-halo','chart-selected-point','chart-guide']) $(id).style.display=points.length?'':'none';
    $('chart-days').style.gridTemplateColumns=`repeat(${Math.max(1,values.length)}, minmax(${values.length>7?'30':'0'}px,1fr))`;
    $('chart-days').innerHTML=values.map((v,i)=>`<button type="button" data-chart-day="${i}" aria-label="${labels[i]}, ${title} ${money(v)}" aria-pressed="false">${view==='revenue'?short[i]:i+1}</button>`).join('');
    $('chart-order-bars').innerHTML=data.dailyOrders.map((v,i)=>`<button type="button" class="comse-order-day" data-chart-day="${i}" aria-label="${names[i]}, počet objednávek: ${v}" aria-pressed="false"><span class="comse-order-track"><span class="comse-order-bar" style="height:${v/30*100}%"><strong>${v}</strong></span></span><span class="comse-order-label">${short[i]}</span></button>`).join('');
    set('chart-orders-total',`${data.orders} objednávek`);
    set('revenue-chart-title',title+' v Kč');
    set('revenue-chart-description',values.length?labels.map((label,i)=>`${label}: ${money(values[i])}`).join('. '):'Pro tento měsíc nejsou data.');
    if(reset) selected=view==='revenue'?6:elapsed-1;
    if(points.length) select(Math.max(0,Math.min(selected,points.length-1)));
    else {set('chart-selected-day','');set('chart-selected-value','—');}
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>{view=tab.dataset.chartView;render(true);});
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;
      tabs[next].click();tabs[next].focus();
    });
  });
  for(const id of ['chart-days','chart-order-bars']){
    $(id).addEventListener('click',event=>{const b=event.target.closest('[data-chart-day]');if(!b)return;if(id==='chart-order-bars'&&view!=='revenue'){view='revenue';render(true);}select(Number(b.dataset.chartDay));});
    $(id).addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();if(id==='chart-order-bars'&&view!=='revenue'){view='revenue';render(true);}
      const current=Number(event.target.closest('[data-chart-day]')?.dataset.chartDay??selected),last=id==='chart-order-bars'?6:points.length-1;
      const next=event.key==='Home'?0:event.key==='End'?last:Math.max(0,Math.min(last,current+(event.key==='ArrowRight'?1:-1)));
      if(next>=0){select(next);$(id).querySelector(`[data-chart-day="${next}"]`)?.focus();}
    });
  }
  svg.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||!points.length)return;const rect=svg.getBoundingClientRect();const i=Math.max(0,Math.min(points.length-1,Math.round(((event.clientX-rect.left)/rect.width*700-50)/600*(points.length-1))));if(i!==selected)select(i);});
  document.addEventListener('comse:overview',event=>{mode=event.detail.mode;render();});
  document.addEventListener('comse:costs',()=>render());
  $('finance-asof').addEventListener('change',()=>{if($('finance-asof').checkValidity())render(true);});
  window.addEventListener('pageshow',event=>{if(event.persisted)render();});
  render();
}
