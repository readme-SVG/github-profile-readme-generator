var skills = [
  { name: 'Python', pct: 85 },
  { name: 'JavaScript', pct: 80 },
  { name: 'GitHub Actions', pct: 90 },
  { name: 'HTML / CSS', pct: 75 },
];

var currentProfile = 'terminal';
var lastSVG = '';
var lastMarkdown = '';
var bannerText = '';
var figletRetryTimer = null;

function escAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
}

function renderSkillRows() {
  var el = document.getElementById('skills-list');
  el.innerHTML = '';
  skills.forEach(function(sk, i) {
    var row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML =
      '<input type="text" placeholder="skill name" value="' + escAttr(sk.name) + '" data-i="' + i + '" data-f="name">' +
      '<input type="number" min="0" max="100" placeholder="%" value="' + sk.pct + '" data-i="' + i + '" data-f="pct">' +
      '<button class="remove-skill" data-i="' + i + '">×</button>';
    el.appendChild(row);
  });

  el.querySelectorAll('input').forEach(function(inp) {
    inp.addEventListener('input', function(e) {
      var idx = +e.target.dataset.i;
      var field = e.target.dataset.f;
      skills[idx][field] = field === 'pct' ? +e.target.value : e.target.value;
    });
  });

  el.querySelectorAll('.remove-skill').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      skills.splice(+e.target.dataset.i, 1);
      renderSkillRows();
    });
  });
}

function g(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function chk(id) {
  var el = document.getElementById(id);
  return el ? el.checked : false;
}

function getData() {
  return {
    username: g('username'),
    fullname: g('fullname'),
    tagline: g('tagline'),
    university: g('university'),
    location: g('location'),
    club: g('club'),
    role: g('role'),
    skills: skills.filter(function(s) { return s.name; }),
    langs: g('langs'),
    os: g('os'),
    tools: g('tools'),
    github: g('github'),
    linkedin: g('linkedin'),
    platform_label: g('platform_label'),
    platform_url: g('platform_url'),
    email: g('email'),
    website: g('website'),
    twitter: g('twitter'),
    telegram: g('telegram'),
    collab: g('collab'),
    motto: g('motto'),
    banner: bannerText,
    opts: {
      banner: chk('opt-banner'),
      stats: chk('opt-stats'),
      streak: chk('opt-streak'),
      trophies: chk('opt-trophies'),
      snake: chk('opt-snake'),
    }
  };
}

function setFigletPreview(text) {
  var preview = document.getElementById('figlet-preview');
  if (!preview) return;
  var pre = preview.querySelector('pre');
  if (!pre) {
    pre = document.createElement('pre');
    preview.innerHTML = '';
    preview.appendChild(pre);
  }
  pre.textContent = text;
}

function updateBanner() {
  var fontName = g('figlet-font') || 'big';
  var text = g('banner-text');
  if (!text) {
    text = g('username') || 'README';
  }
  if (!text) text = 'README';

  if (figletRetryTimer) {
    clearTimeout(figletRetryTimer);
    figletRetryTimer = null;
  }

  if (!Figlet.isLoaded(fontName)) {
    bannerText = text;
    setFigletPreview('Loading font "' + fontName + '"...');
    figletRetryTimer = setTimeout(function() {
      updateBanner();
    }, 80);
    return;
  }

  try {
    bannerText = Figlet.renderText(text, fontName);
  } catch (e) {
    bannerText = text;
  }

  setFigletPreview(bannerText);
}

function generate() {
  updateBanner();
  var d = getData();
  var svgStr = '';

  if (currentProfile === 'terminal') svgStr = renderProfileTerminal(d);
  else if (currentProfile === 'minimal') svgStr = renderProfileMinimal(d);
  else if (currentProfile === 'hacker') svgStr = renderProfileHacker(d);
  else if (currentProfile === 'card') svgStr = renderProfileCard(d);

  lastSVG = svgStr;
  lastMarkdown = renderMarkdownOutput(d);

  document.getElementById('preview-output').innerHTML = svgStr;
}

function switchTab(name) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  var panel = document.getElementById('tab-' + name);
  if (panel) panel.classList.add('active');
  var btn = document.querySelector('.nav-btn[data-tab="' + name + '"]');
  if (btn) btn.classList.add('active');
  if (name === 'preview') generate();
}

function switchProfile(name) {
  currentProfile = name;
  document.querySelectorAll('.profile-tab').forEach(function(t) { t.classList.remove('active'); });
  var tab = document.querySelector('.profile-tab[data-profile="' + name + '"]');
  if (tab) tab.classList.add('active');
  generate();
}

document.addEventListener('DOMContentLoaded', function() {
  renderSkillRows();

  setFigletPreview('');
  updateBanner();

  document.getElementById('add-skill').addEventListener('click', function() {
    skills.push({ name: '', pct: 50 });
    renderSkillRows();
  });

  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
  });

  document.querySelectorAll('.profile-tab').forEach(function(tab) {
    tab.addEventListener('click', function() { switchProfile(tab.dataset.profile); });
  });

  document.getElementById('generate-btn').addEventListener('click', function() {
    generate();
    var activePanel = document.querySelector('.panel.active');
    if (activePanel && activePanel.id === 'tab-editor') switchTab('preview');
  });

  document.getElementById('preview-font-btn').addEventListener('click', function() {
    updateBanner();
    generate();
  });

  document.getElementById('figlet-font').addEventListener('change', function() {
    updateBanner();
    if (document.querySelector('.panel.active') && document.querySelector('.panel.active').id === 'tab-preview') {
      generate();
    }
  });

  document.getElementById('figlet-font').addEventListener('input', function() {
    updateBanner();
  });

  document.getElementById('username').addEventListener('input', function() {
    var bannerInput = document.getElementById('banner-text');
    if (!bannerInput.value.trim()) {
      updateBanner();
    }
  });

  document.getElementById('banner-text').addEventListener('input', function() {
    updateBanner();
  });

  document.getElementById('download-svg').addEventListener('click', function() {
    if (!lastSVG) { showToast('generate first'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lastSVG], { type: 'image/svg+xml' }));
    a.download = (g('username') || 'profile') + '-readme.svg';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('downloaded SVG');
  });

  document.getElementById('copy-md').addEventListener('click', function() {
    if (!lastMarkdown) generate();
    if (!lastMarkdown) { showToast('generate first'); return; }
    navigator.clipboard.writeText(lastMarkdown).then(function() { showToast('copied!'); });
  });

  document.getElementById('download-md').addEventListener('click', function() {
    if (!lastMarkdown) generate();
    if (!lastMarkdown) { showToast('generate first'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lastMarkdown], { type: 'text/markdown' }));
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('downloaded README.md');
  });
});
