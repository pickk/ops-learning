(() => {
  const root = new URL(document.currentScript.dataset.root, location.href);
  const dialog = document.querySelector('.search-dialog');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('.search-results');
  let index;
  let searchVersion = 0;
  function openSearch() { if (!dialog.open) dialog.showModal(); input.focus(); }
  document.querySelector('.search-trigger').addEventListener('click', openSearch);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); openSearch(); }
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  input.addEventListener('input', async () => {
    const version = ++searchVersion;
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { results.textContent = '输入关键词，查找课程与配套源码。'; return; }
    try {
      if (!index) {
        const response = await fetch(new URL('assets/search.json', root));
        if (!response.ok) throw new Error('search');
        index = await response.json();
      }
      if (version !== searchVersion) return;
      const terms = query.split(/\s+/);
      const matches = index.map(item => ({...item, score:terms.reduce((score,term)=>score+(item.title.toLowerCase().includes(term)?10:0)+(item.text.toLowerCase().includes(term)?1:0),0)})).filter(item=>terms.every(term=>(item.title+' '+item.text).toLowerCase().includes(term))).sort((a,b)=>b.score-a.score).slice(0,20);
      if (!matches.length) { results.textContent = '没有找到匹配内容，试试 Python、HTTP、备份或函数。'; return; }
      for (const item of matches) {
        const a = document.createElement('a');
        a.href = new URL(item.url.split('/').map(encodeURIComponent).join('/'), root);
        const heading = document.createElement('strong'); heading.textContent = item.title;
        const snippet = document.createElement('span');
        const pos = item.text.toLowerCase().indexOf(terms[0]);
        snippet.textContent = (pos > 35 ? '…' : '') + item.text.slice(Math.max(0,pos-35),Math.max(0,pos-35)+135) + '…';
        a.append(heading,snippet); results.append(a);
      }
    } catch { results.textContent = '搜索暂时不可用，请从章节目录继续阅读。'; }
  });
  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.querySelector('#main').addEventListener('click', () => {
    document.body.classList.remove('menu-open'); menu.setAttribute('aria-expanded','false');
  });
  for (const pre of document.querySelectorAll('.prose pre')) {
    const button = document.createElement('button');
    button.className = 'copy-code'; button.type = 'button'; button.textContent = '复制'; button.setAttribute('aria-label','复制代码');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.querySelector('code').textContent); button.textContent = '已复制'; }
      catch { button.textContent = '请选择代码复制'; }
      setTimeout(() => { button.textContent = '复制'; },1800);
    });
    pre.append(button);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('current',decodeURIComponent(a.hash.slice(1)) === entry.target.id));
      }
    }, {rootMargin:'-80px 0px -65% 0px'});
    document.querySelectorAll('.prose h2,.prose h3').forEach(el => observer.observe(el));
  }
})();
