const appEl = document.getElementById('app');
const cache = new Map();
const routes = {
  '/': () => loadPage('login'),
  '/dashboard': () => loadPage('dashboard'),
  '/settings': () => loadPage('settings'),
};

function setPageCss(file) {
  document.querySelectorAll('link[data-page-style]')
    .forEach(el => el.remove());

  if (!file) 
    return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `./styles/${file}.css`;
  link.dataset.pageStyle = 'true';
  document.head.appendChild(link);
}

async function loadPartial(file) {
  const url = `./pages/${file}.html`;
  if (cache.has(url))
    return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to load ${url}`, res);
    throw new Error(`Failed to load ${url}`);
  }

  const html = await res.text();
  cache.set(url, html);

  return html;
}

async function loadPage(file) {
  setPageCss(file);
  return await loadPartial(file);
}

function normalizePath() {
  const h = location.hash || '#/';
  const [path] = h.slice(1).split('?');
  return path || '/';
}

function notFound() {
  console.warn('Route not found, redirecting to login');
  location.hash = '#/';
}

function renderError(e) {
  return `
    <section>
      <h1>Oops</h1>
      <pre>${e.message}</pre>
    </section>
  `;
}

async function render() {
  const path = normalizePath();
  const loader = routes[path];

  try {
    const html = loader ? await loader() : notFound();
    appEl.innerHTML = html;
    scrollTo(0, 0);
  } catch (e) {
    console.error(e);
    appEl.innerHTML = renderError(e);
  }
}

// Initial render + subscribe
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

render();