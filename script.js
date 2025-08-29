// Theme toggle & year
const root = document.documentElement;
const modeBtn = document.getElementById('mode');
const y = document.getElementById('y'); y.textContent = new Date().getFullYear();
const saved = localStorage.getItem('mode'); if (saved === 'dark') { root.classList.add('dark'); modeBtn.textContent = '☾'; }
modeBtn.addEventListener('click', ()=>{
  root.classList.toggle('dark');
  localStorage.setItem('mode', root.classList.contains('dark') ? 'dark' : 'light');
  modeBtn.textContent = root.classList.contains('dark') ? '☾' : '☀︎';
});

// Elements
const grid = document.getElementById('grid');
const search = document.getElementById('search');
const select = document.getElementById('category');
const tpl = document.getElementById('card-tpl');

let data = [];

function renderOptions(categories){
  const opts = ['all', ...categories];
  select.innerHTML = opts.map(o => `<option value="${o}">${o[0].toUpperCase()+o.slice(1)}</option>`).join('');
}

function cardFor(p){
  const node = tpl.content.cloneNode(true);
  const art = node.querySelector('article');
  const img = node.querySelector('.thumb');
  const title = node.querySelector('.title');
  const desc = node.querySelector('.desc');
  const tags = node.querySelector('.tags');
  const repo = node.querySelector('.repo');
  const demo = node.querySelector('.demo');
  const more = node.querySelector('.more');

  art.dataset.cat = p.category || 'other';
  img.src = p.image || 'https://picsum.photos/seed/placeholder/1200/630';
  img.alt = `${p.title} cover`;
  title.textContent = p.title;
  desc.textContent = p.description;
  tags.innerHTML = (p.tech || []).map(t=>`<span class="tag">${t}</span>`).join('');
  repo.href = p.repo || '#';
  if (p.demo){ demo.href = p.demo; } else { demo.style.visibility = 'hidden'; }
  more.addEventListener('click', ()=>openModal(p));
  return node;
}

function render(list){
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(p => frag.appendChild(cardFor(p)));
  grid.appendChild(frag);
}

function filter(){
  const q = (search.value || '').toLowerCase();
  const cat = select.value;
  const out = data.filter(p => {
    const inCat = (cat === 'all' || p.category === cat);
    const inText = [p.title, p.description, ...(p.tech||[])].join(' ').toLowerCase().includes(q);
    return inCat && inText;
  });
  render(out);
}

async function init(){
  try {
    const res = await fetch('projects.json');
    data = await res.json();
    const cats = Array.from(new Set(data.map(p=>p.category).filter(Boolean))).sort();
    renderOptions(cats);
    render(data);
  } catch (e) {
    grid.innerHTML = '<p>Failed to load projects.json</p>';
  }
}
init();
search.addEventListener('input', filter);
select.addEventListener('change', filter);

// Modal
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
function openModal(p){
  document.getElementById('m-img').src = p.image || 'https://picsum.photos/seed/placeholder/1200/630';
  document.getElementById('m-title').textContent = p.title;
  document.getElementById('m-desc').textContent = p.description;
  document.getElementById('m-notes').textContent = p.notes || '';
  document.getElementById('m-tags').innerHTML = (p.tech||[]).map(t=>`<span>${t}</span>`).join('');
  const mr = document.getElementById('m-repo'); mr.href = p.repo || '#'; mr.style.visibility = p.repo ? 'visible':'hidden';
  const md = document.getElementById('m-demo'); md.href = p.demo || '#'; md.style.visibility = p.demo ? 'visible':'hidden';
  modal.showModal();
}
closeBtn.addEventListener('click', ()=>modal.close());
modal.addEventListener('click', (e)=>{ if (e.target === modal) modal.close(); });
