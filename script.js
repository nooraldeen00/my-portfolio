// Theme toggle & year
const root = document.documentElement;
const modeBtn = document.getElementById('mode');
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();
const saved = localStorage.getItem('mode');
if (saved === 'dark') { root.classList.add('dark'); if (modeBtn) modeBtn.textContent = '☾'; }
modeBtn?.addEventListener('click', ()=>{
  root.classList.toggle('dark');
  localStorage.setItem('mode', root.classList.contains('dark') ? 'dark' : 'light');
  if (modeBtn) modeBtn.textContent = root.classList.contains('dark') ? '☾' : '☀︎';
});

// Elements
const grid = document.getElementById('grid');
const search = document.getElementById('search');
const select = document.getElementById('category');
const tpl = document.getElementById('card-tpl');

let data = [];

function renderOptions(categories){
  if (!select) return;
  const opts = ['all', ...categories];
  select.innerHTML = opts.map(o => `<option value="${o}">${o[0].toUpperCase()+o.slice(1)}</option>`).join('');
}

function cardFor(p){
  const node  = tpl.content.cloneNode(true);
  const art   = node.querySelector('article');
  const img   = node.querySelector('.thumb');
  const title = node.querySelector('.title');
  const desc  = node.querySelector('.desc');
  const tags  = node.querySelector('.tags');
  const repo  = node.querySelector('.repo');
  const demo  = node.querySelector('.demo');
  const more  = node.querySelector('.more');

  art.dataset.cat = p.category || 'other';
  img.src = p.image || 'https://picsum.photos/seed/placeholder/1200/630';
  img.alt = `${p.title || 'Project'} cover`;
  title.textContent = p.title || 'Untitled';
  desc.textContent  = p.description || '';
  tags.innerHTML    = (p.tech || []).map(t=>`<span class="tag">${t}</span>`).join('');
  if (p.repo) repo.href = p.repo; else repo.style.visibility = 'hidden';
  if (p.demo) demo.href = p.demo; else demo.style.visibility = 'hidden';
  more.addEventListener('click', ()=>openModal(p));
  return node;
}

function render(list){
  if (!grid || !tpl) return;
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(p => frag.appendChild(cardFor(p)));
  grid.appendChild(frag);
}

function filter(){
  const q = (search?.value || '').toLowerCase();
  const cat = select?.value || 'all';
  const out = data.filter(p => {
    const inCat = (cat === 'all' || p.category === cat);
    const inText = [p.title, p.description, ...(p.tech||[])].join(' ').toLowerCase().includes(q);
    return inCat && inText;
  });
  render(out);
}

async function init(){
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('projects.json not found');
    data = await res.json();
  } catch (e) {
    console.warn('Using empty project list:', e);
    data = []; // keep site functional
    if (grid) grid.innerHTML = `<p style="opacity:.7">No projects yet. Add some to <code>projects.json</code>.</p>`;
  }
  const cats = Array.from(new Set(data.map(p=>p.category).filter(Boolean))).sort();
  renderOptions(cats);
  if (data.length) render(data);

  search?.addEventListener('input', filter);
  select?.addEventListener('change', filter);
}

// Modal
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
function openModal(p){
  document.getElementById('m-img').src = p.image || 'https://picsum.photos/seed/placeholder/1200/630';
  document.getElementById('m-title').textContent = p.title || '';
  document.getElementById('m-desc').textContent  = p.description || '';
  document.getElementById('m-notes').textContent = p.notes || '';
  document.getElementById('m-tags').innerHTML    = (p.tech || []).map(t=>`<span>${t}</span>`).join('');
  const mr = document.getElementById('m-repo'); mr.href = p.repo || '#'; mr.style.visibility = p.repo ? 'visible':'hidden';
  const md = document.getElementById('m-demo'); md.href = p.demo || '#'; md.style.visibility = p.demo ? 'visible':'hidden';
  modal.showModal();
}
closeBtn?.addEventListener('click', ()=>modal.close());
modal?.addEventListener('click', (e)=>{ if (e.target === modal) modal.close(); });

init();
