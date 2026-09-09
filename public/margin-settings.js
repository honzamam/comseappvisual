export const categoryNames = { shirts: 'Trička', hoodies: 'Mikiny', shoes: 'Boty' };
export const sampleProducts = [
  { id:'A101', priceCents:49000, name:'Tričko Basic', manufacturer:'X', category:'shirts', shop:'store' },
  { id:'A102', priceCents:79000, name:'Tričko Premium', manufacturer:'X', category:'shirts', shop:'store' },
  { id:'A103', priceCents:149000, name:'Mikina Everyday', manufacturer:'X', category:'hoodies', shop:'store' },
  { id:'B201', priceCents:59000, name:'Tričko Urban', manufacturer:'X', category:'shirts', shop:'outlet' },
  { id:'B202', priceCents:45000, name:'Tričko Relax', manufacturer:'Y', category:'shirts', shop:'outlet' },
  { id:'B203', priceCents:189000, name:'Tenisky City', manufacturer:'Y', category:'shoes', shop:'outlet' }
];
export function initialMargins() { return { categories: {store:{shirts:40,hoodies:50,shoes:35},outlet:{shirts:38,hoodies:45,shoes:32}}, individual:{A102:45}, prices:{}, rules:[] }; }
export function validateMargin(value) {
  if (value === '' || value == null || !Number.isFinite(Number(value)) || Number(value)<0 || Number(value)>100) throw new Error('Marže musí být číslo od 0 do 100 %.');
  return Math.round(Number(value)*100)/100;
}
export function effectiveMargin(product,state) {
  if (Object.hasOwn(state.individual,product.id)) return {value:state.individual[product.id],source:'Vlastní marže'};
  const rule=state.rules.find(r=>r.shop===product.shop&&r.category===product.category&&r.manufacturer===product.manufacturer);
  return rule?{value:rule.value,source:'Výrobce + kategorie'}:{value:state.categories[product.shop][product.category],source:'Podle kategorie'};
}
const fold = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterMarginProducts(state,{scope='all',query='',category='all',manufacturer='all',source='all'}={}) {
  return sampleProducts.filter(p=>(scope==='all'||p.shop===scope)&&(category==='all'||p.category===category)&&(manufacturer==='all'||p.manufacturer===manufacturer)&&(source==='all'||(source==='own')===Object.hasOwn(state.individual,p.id))&&fold(`${p.name} ${p.id} vyrobce ${p.manufacturer}`).includes(fold(query.trim())));
}
export function productPrice(product,state) { return state.prices?.[product.id] ?? product.priceCents; }
export function saveProductValues(state,id,price,margin) {
  if(!sampleProducts.some(p=>p.id===id))throw new Error('Neznámý produkt.');
  if(String(price).trim()===''||!Number.isFinite(Number(price))||Number(price)<0||Number(price)>10000000)throw new Error('Zadejte prodejní cenu od 0 do 10 000 000 Kč.');
  const next=structuredClone(state);
  next.prices[id]=Math.round(Number(price)*100);
  if(String(margin).trim()==='')delete next.individual[id];
  else next.individual[id]=validateMargin(margin);
  return next;
}
export function applyBulkMargins(state,ids,value,allowedIds=sampleProducts.map(p=>p.id)) {
  if(!ids.length||ids.some(id=>!allowedIds.includes(id)||!sampleProducts.some(p=>p.id===id)))throw new Error('Označte produkty z aktuálního výběru.');
  const margin=validateMargin(value),next=structuredClone(state);
  for(const id of new Set(ids))next.individual[id]=margin;
  return next;
}
export function parseMarginRequest(text) {
  const normalized=fold(text);
  const percentages=[...normalized.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)];
  const makers=[...normalized.matchAll(/vyrobce\s+([a-z0-9]+)\b/g)];
  const cats=Object.entries({shirts:/\btric(?:ka|ek|ko)\b/,hoodies:/\bmikin(?:y|a)?\b/,shoes:/\bbot(?:y)?\b/}).filter(([,pattern])=>pattern.test(normalized));
  if(percentages.length!==1||makers.length!==1||!['x','y'].includes(makers[0][1])||cats.length!==1) throw new Error('Upřesněte jednoho výrobce (X nebo Y), jednu kategorii (Trička, Mikiny nebo Boty) a jednu marži v %. Například: Výrobce X, Trička, 49 %.');
  return {manufacturer:makers[0][1].toUpperCase(),category:cats[0][0],value:validateMargin(percentages[0][1].replace(',','.'))};
}
export function previewMargins(state,request,scope,overwrite=false) {
  return sampleProducts.filter(p=>(scope==='all'||p.shop===scope)&&p.category===request.category&&p.manufacturer===request.manufacturer).map(product=>({product,before:effectiveMargin(product,state).value,after:!overwrite&&Object.hasOwn(state.individual,product.id)?state.individual[product.id]:request.value,preserved:!overwrite&&Object.hasOwn(state.individual,product.id)}));
}
export function applyMarginRule(state,request,scope,overwrite=false) {
  const next=structuredClone(state);
  const preview=previewMargins(state,request,scope,overwrite);
  if(!preview.length) throw new Error('Ve vybraném rozsahu nejsou odpovídající produkty.');
  const value=validateMargin(request.value);
  for(const shop of [...new Set(preview.map(row=>row.product.shop))]) {
    next.rules=next.rules.filter(r=>!(r.shop===shop&&r.manufacturer===request.manufacturer&&r.category===request.category));
    next.rules.push({...request,value,shop});
  }
  if(overwrite) for(const row of preview) delete next.individual[row.product.id];
  return next;
}
function initMargins() {
  const $=id=>document.getElementById(id);
  if(!$('margin-products'))return;
  let state=initialMargins(),revision=0,draft=null,selected=new Set(),bulkDraft=null;
  const rowDrafts=new Map();
  const shop=$('eshop-select');
  const fmt=value=>new Intl.NumberFormat('cs-CZ',{maximumFractionDigits:2}).format(value)+' %';
  const shopName=key=>key==='store'?'E-shop 1':key==='outlet'?'E-shop 2':'Všechny e-shopy';
  const scopeShops=()=>shop.value==='all'?['store','outlet']:[shop.value];
  const filters=()=>({scope:shop.value,query:$('margin-search').value,category:$('margin-filter-category').value,manufacturer:$('margin-filter-maker').value,source:$('margin-filter-source').value});
  const visibleProducts=()=>filterMarginProducts(state,filters());
  const escaped=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  function syncSelection() {
    const visible=visibleProducts();
    selected=new Set([...selected].filter(id=>visible.some(p=>p.id===id)));
    $('margin-results-count').textContent=`Vyfiltrováno: ${visible.length} produktů`;
    $('margin-selection-count').textContent=`Označeno: ${selected.size}`;
    $('margin-select-filtered').disabled=!visible.length;
    $('margin-clear-selection').disabled=!selected.size;
    $('margin-bulk-open').disabled=!selected.size;
    document.querySelectorAll('[data-product-select]').forEach(input=>{input.checked=selected.has(input.dataset.productSelect);input.closest('tr').classList.toggle('is-selected',input.checked);});
  }
  function invalidate() { draft=null;$('margin-ai-preview').hidden=true; }
  function changed(message) { revision++;invalidate();render();$('margin-feedback').textContent=message; }
  function render() {
    const scope=scopeShops();
    $('margin-categories').innerHTML=Object.entries(categoryNames).map(([key,label])=>{
      const values=scope.map(s=>state.categories[s][key]);
      const mixed=!values.every(v=>v===values[0]);
      const count=sampleProducts.filter(p=>scope.includes(p.shop)&&p.category===key).length;
      return `<article class="margin-category-card"><h3>${label}</h3><p>${count} produktů · ${mixed?'různé marže e-shopů':fmt(values[0])}</p><form class="margin-category-form" data-category="${key}"><label class="margin-field" for="category-${key}">Marže v %<input id="category-${key}" type="number" name="value" min="0" max="100" step="0.01" required value="${mixed?'':values[0]}" placeholder="${mixed?'Různé':''}" /></label><button class="margin-secondary" type="submit">Použít</button></form></article>`;
    }).join('');
    const products=visibleProducts();
    $('margin-empty').hidden=products.length>0;
    $('margin-products').innerHTML=products.map(p=>{
      const current=effectiveMargin(p,state),own=Object.hasOwn(state.individual,p.id),row=rowDrafts.get(p.id)||{};
      const price=row.price??productPrice(p,state)/100,margin=row.margin??(own?state.individual[p.id]:'');
      return `<tr><td><input type="checkbox" data-product-select="${p.id}" aria-label="Označit ${p.name} ${shopName(p.shop)}" /></td><td><strong>${p.name}</strong><small>${p.id} · ${shopName(p.shop)}</small></td><td>${categoryNames[p.category]}<small>Výrobce ${p.manufacturer}</small></td><td><input class="margin-product-input margin-price-input" id="product-price-${p.id}" data-row-id="${p.id}" data-row-field="price" type="number" min="0" max="10000000" step="0.01" required value="${escaped(price)}" aria-label="Prodejní cena produktu ${p.name} v Kč" /></td><td><span class="margin-value">${fmt(current.value)}</span><small>${current.source}</small></td><td><input class="margin-product-input" id="product-margin-${p.id}" data-row-id="${p.id}" data-row-field="margin" type="number" min="0" max="100" step="0.01" value="${escaped(margin)}" placeholder="${current.value}" aria-label="Vlastní marže produktu ${p.name} v procentech" /><small>Prázdné = podle pravidla</small></td><td><button class="margin-secondary" type="button" data-product-save="${p.id}">Uložit řádek</button>${own?`<button class="margin-link-button" type="button" data-product-inherit="${p.id}">Použít pravidlo</button>`:''}</td></tr>`;
    }).join('');
    syncSelection();
    const rules=state.rules.filter(r=>scope.includes(r.shop));
    $('margin-rules').innerHTML=rules.length?rules.map(r=>`<div class="margin-rule-row"><div>Výrobce ${r.manufacturer} · ${categoryNames[r.category]}<small>${shopName(r.shop)}</small></div><strong>${fmt(r.value)}</strong><button class="margin-link-button" type="button" data-rule-remove="${r.shop}:${r.manufacturer}:${r.category}" aria-label="Odebrat pravidlo ${shopName(r.shop)} výrobce ${r.manufacturer} ${categoryNames[r.category]}">Odebrat</button></div>`).join(''):'<p class="margin-muted">Zatím žádné pravidlo. Zkuste zadání přes Honzu AI.</p>';
  }
  $('margin-categories').addEventListener('submit',event=>{
    event.preventDefault();const form=event.target;if(!form.reportValidity())return;
    const value=validateMargin(form.elements.value.value);
    for(const key of scopeShops())state.categories[key][form.dataset.category]=value;
    changed(`${categoryNames[form.dataset.category]}: marže ${fmt(value)} pro ${shopName(shop.value)}. Vlastní marže a pravidla výrobce mají dál přednost.`);
  });
  $('margin-products').addEventListener('input',event=>{
    const input=event.target;
    if(!input.dataset.rowId)return;
    rowDrafts.set(input.dataset.rowId,{...rowDrafts.get(input.dataset.rowId),[input.dataset.rowField]:input.value});
  });
  $('margin-products').addEventListener('change',event=>{
    const input=event.target.closest('[data-product-select]');if(!input)return;
    if(input.checked)selected.add(input.dataset.productSelect);else selected.delete(input.dataset.productSelect);
    syncSelection();
  });
  $('margin-products').addEventListener('click',event=>{
    const save=event.target.closest('[data-product-save]'),inherit=event.target.closest('[data-product-inherit]');
    if(save){
      const id=save.dataset.productSave,margin=$('product-margin-'+id),price=$('product-price-'+id);
      if(!price.reportValidity()||!margin.reportValidity())return;
      state=saveProductValues(state,id,price.value,margin.value);rowDrafts.delete(id);
      changed('Prodejní cena a marže produktu uložené v ukázce.');
    }
    if(inherit){const id=inherit.dataset.productInherit;delete state.individual[id];const row=rowDrafts.get(id);if(row)delete row.margin;changed('Produkt znovu používá pravidlo výrobce nebo kategorie.');}
  });
  $('margin-rules').addEventListener('click',event=>{const button=event.target.closest('[data-rule-remove]');if(!button)return;state.rules=state.rules.filter(r=>`${r.shop}:${r.manufacturer}:${r.category}`!==button.dataset.ruleRemove);changed('Pravidlo odebráno. Individuální marže zůstaly zachované.');});
  function filtersChanged() {
    selected.clear();bulkDraft=null;invalidate();
    if($('margin-bulk-dialog').open)$('margin-bulk-dialog').close();
    render();$('margin-ai-scope').textContent=shopName(shop.value);
    $('margin-feedback').textContent='Výběr produktů byl při změně filtru zrušen.';
  }
  $('margin-search').addEventListener('input',filtersChanged);
  for(const id of ['margin-filter-category','margin-filter-maker','margin-filter-source'])$(id).addEventListener('change',filtersChanged);
  shop.addEventListener('change',filtersChanged);
  $('margin-clear-filters').addEventListener('click',()=>{$('margin-search').value='';for(const id of ['margin-filter-category','margin-filter-maker','margin-filter-source'])$(id).value='all';filtersChanged();});
  $('margin-select-filtered').addEventListener('click',()=>{selected=new Set(visibleProducts().map(p=>p.id));syncSelection();});
  $('margin-clear-selection').addEventListener('click',()=>{selected.clear();syncSelection();});
  function renderBulkPreview() {
    if(!bulkDraft)return;
    const input=$('margin-bulk-value'),valid=input.value!==''&&input.checkValidity();
    $('margin-bulk-preview').innerHTML=bulkDraft.ids.map(id=>{const p=sampleProducts.find(p=>p.id===id);return `<tr><td>${p.name}<small>${shopName(p.shop)}</small></td><td>${fmt(effectiveMargin(p,state).value)}</td><td><strong>${valid?fmt(Number(input.value)):'—'}</strong></td></tr>`;}).join('');
  }
  $('margin-bulk-open').addEventListener('click',()=>{
    syncSelection();if(!selected.size)return;
    bulkDraft={ids:[...selected],revision,scope:shop.value};
    $('margin-bulk-scope').textContent=`${shopName(shop.value)} · označeno ${selected.size} produktů`;
    $('margin-bulk-error').textContent='';renderBulkPreview();$('margin-bulk-dialog').showModal();$('margin-bulk-value').focus();
  });
  $('margin-bulk-value').addEventListener('input',renderBulkPreview);
  for(const id of ['margin-bulk-close','margin-bulk-cancel'])$(id).addEventListener('click',()=>$('margin-bulk-dialog').close());
  $('margin-bulk-dialog').addEventListener('close',()=>{bulkDraft=null;});
  $('margin-bulk-form').addEventListener('submit',event=>{
    event.preventDefault();if(!$('margin-bulk-form').reportValidity())return;
    try{
      if(!bulkDraft||bulkDraft.revision!==revision||bulkDraft.scope!==shop.value)throw new Error('Výběr se změnil. Připravte změnu znovu.');
      state=applyBulkMargins(state,bulkDraft.ids,$('margin-bulk-value').value,visibleProducts().map(p=>p.id));
      for(const id of bulkDraft.ids){const row=rowDrafts.get(id);if(row)delete row.margin;}
      const count=bulkDraft.ids.length;selected.clear();
      changed(`Marže ${fmt(Number($('margin-bulk-value').value))} nastavena u ${count} označených produktů. Prodejní ceny se nezměnily.`);
      $('margin-bulk-dialog').close();
    }catch(error){$('margin-bulk-error').textContent=error.message;}
  });
  const open=()=>{invalidate();$('margin-ai-error').textContent='';$('margin-ai-scope').textContent=shopName(shop.value);$('margin-ai-dialog').showModal();$('margin-ai-prompt').focus();};
  for(const id of ['margin-ai-open','margin-ai-example'])$(id).addEventListener('click',open);
  for(const id of ['margin-ai-close','margin-ai-cancel'])$(id).addEventListener('click',()=>$('margin-ai-dialog').close());
  $('margin-ai-prompt').addEventListener('input',invalidate);
  $('margin-ai-overwrite').addEventListener('change',invalidate);
  $('margin-ai-form').addEventListener('submit',event=>{
    event.preventDefault();invalidate();$('margin-ai-error').textContent='';
    try {
      const request=parseMarginRequest($('margin-ai-prompt').value),overwrite=$('margin-ai-overwrite').checked;
      const rows=previewMargins(state,request,shop.value,overwrite);
      if(!rows.length)throw new Error('V tomto výběru nejsou odpovídající produkty. Změňte výrobce, kategorii nebo e-shop.');
      draft={request,scope:shop.value,overwrite,revision};
      $('margin-ai-summary').textContent=`Výrobce ${request.manufacturer} · ${categoryNames[request.category]} → ${fmt(request.value)}. Rozsah: ${shopName(shop.value)}.`;
      $('margin-ai-preview-rows').innerHTML=rows.map(r=>`<tr><td>${r.product.name}<small>${shopName(r.product.shop)}</small></td><td>${fmt(r.before)}</td><td><strong>${fmt(r.after)}</strong>${r.preserved?'<small>Vlastní marže zachována</small>':''}</td></tr>`).join('');
      $('margin-ai-preserved').textContent=`Nalezeno produktů: ${rows.length}. Zachované individuální výjimky: ${rows.filter(r=>r.preserved).length}. Pravidlo se použije až potvrzením.`;
      $('margin-ai-preview').hidden=false;
      $('margin-ai-apply').focus();
    }catch(error){$('margin-ai-error').textContent=error.message;}
  });
  $('margin-ai-apply').addEventListener('click',()=>{
    if(!draft||draft.revision!==revision||draft.scope!==shop.value)return;
    state=applyMarginRule(state,draft.request,draft.scope,draft.overwrite);
    changed('Pravidlo z návrhu Honzy AI použito v ukázce.');
    $('margin-ai-dialog').close();
  });
  render();
}
if(typeof document!=='undefined') {
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMargins,{once:true});else initMargins();
}
