var C = {
  bg:     '#0a0c10',
  bg2:    '#0f1117',
  bg3:    '#161b24',
  border: '#1e2535',
  green:  '#39d353',
  cyan:   '#58c8d9',
  yellow: '#e8c547',
  red:    '#e05c5c',
  purple: '#a78bfa',
  text:   '#c9d1d9',
  dim:    '#4a5568',
  mid:    '#718096',
  white:  '#f0f6fc',
  accent: '#336699',
  accentB:'#4a8fbf',
};

var FONT_SIZE = 13;
var LINE_H = 20;
var W = 900;

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pct2bar(p, total) {
  total = total || 22;
  var f = Math.round((Math.min(100, Math.max(0, p)) / 100) * total);
  return { fill: '█'.repeat(f), empty: '░'.repeat(total - f) };
}

function ts(fill, txt, bold) {
  return '<tspan fill="' + fill + '"' + (bold ? ' font-weight="bold"' : ' font-weight="normal"') + '>' + esc(txt) + '</tspan>';
}

function svgText(x, y, parts) {
  if (typeof parts === 'string') {
    return '<text x="' + x + '" y="' + y + '" fill="' + C.text + '" font-weight="normal">' + esc(parts) + '</text>';
  }
  if (!parts || !parts.length) {
    return '<text x="' + x + '" y="' + y + '" fill="' + C.text + '" font-weight="normal"></text>';
  }
  return '<text x="' + x + '" y="' + y + '" xml:space="preserve">' + parts.join('') + '</text>';
}

function buildDefs() {
  return '<defs><style>text { font-family: \'JetBrains Mono\', \'Courier New\', monospace; font-size: ' + FONT_SIZE + 'px; white-space: pre; stroke: rgba(0,0,0,0.9); stroke-width: 1.3px; paint-order: stroke fill; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.55)); }</style>' +
    '<filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.45"/></filter>' +
    '</defs>';
}

function renderProfileTerminal(d) {
  var X0 = 32;
  var out = [];
  var y = 52;

  function line(parts, x) {
    var el = svgText(x || X0, y, parts);
    y += LINE_H;
    return el;
  }
  function blank() { y += LINE_H; }
  function sep() { return line([ts(C.dim, '─'.repeat(72))]); }

  function prompt(path) {
    return [
      ts(C.cyan, '┌─['),
      ts(C.green, d.username || 'user', true),
      ts(C.cyan, '@'),
      ts(C.accentB, 'local'),
      ts(C.cyan, ']─['),
      ts(C.yellow, path || '~'),
      ts(C.cyan, ']'),
    ];
  }

  if (d.opts.banner && d.banner) {
    var bannerLines = d.banner.split('\n');
    bannerLines.forEach(function(bl) {
      out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.green + '" font-weight="bold">' + esc(bl) + '</text>');
      y += LINE_H;
    });
    blank();
  }

  out.push(line(prompt()));
  out.push(line([ts(C.cyan, '└──╼ '), ts(C.white, 'whoami')]));
  blank();

  var nameParts = [ts(C.text, '  '), ts(C.purple, d.fullname || d.username || 'username', true)];
  if (d.tagline) { nameParts.push(ts(C.dim, '  │  ')); nameParts.push(ts(C.white, d.tagline)); }
  out.push(line(nameParts));
  out.push(line([ts(C.dim, '  ──────────────┼─────────────────────────────────────────────────')]));

  if (d.university) out.push(line([ts(C.dim, '                │  '), ts(C.cyan, '🎓 '), ts(C.text, d.university + (d.location ? ' · ' + d.location : ''))]));
  if (d.role) out.push(line([ts(C.dim, '                │  '), ts(C.cyan, '⚡ '), ts(C.text, d.role)]));
  if (d.club) out.push(line([ts(C.dim, '                │  '), ts(C.cyan, '⚑  '), ts(C.text, d.club)]));

  blank();
  out.push(sep());
  blank();

  if (d.skills && d.skills.length) {
    out.push(line(prompt('~/skills')));
    out.push(line([ts(C.cyan, '└──╼ '), ts(C.white, 'cat skill_matrix.conf')]));
    blank();
    d.skills.forEach(function(sk) {
      var nm = '  ' + (sk.name || '').padEnd(18);
      var p = Math.min(100, Math.max(0, parseInt(sk.pct) || 0));
      var bar = pct2bar(p);
      out.push(line([ts(C.text, nm), ts(C.green, bar.fill), ts(C.dim, bar.empty), ts(C.dim, '  ' + p + '%')]));
    });
    blank();
    out.push(sep());
    blank();
  }

  if (d.langs || d.os || d.tools) {
    out.push(line(prompt('~/stack')));
    out.push(line([ts(C.cyan, '└──╼ '), ts(C.white, 'ls tools/')]));
    blank();
    if (d.langs) {
      var ltags = d.langs.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join('');
      out.push(line([ts(C.red, '  LANG    '), ts(C.cyan, ltags)]));
    }
    if (d.os) {
      var otags = d.os.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join('');
      out.push(line([ts(C.red, '  OS      '), ts(C.purple, otags)]));
    }
    if (d.tools) {
      var ttags = d.tools.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join('');
      out.push(line([ts(C.red, '  TOOLS   '), ts(C.cyan, ttags)]));
    }
    blank();
    out.push(sep());
    blank();
  }

  var cts = [];
  if (d.github) cts.push(['github', d.github]);
  if (d.linkedin) cts.push(['linkedin', d.linkedin]);
  if (d.platform_label || d.platform_url) cts.push([d.platform_label || 'platform', d.platform_url || '']);
  if (d.email) cts.push(['mail', d.email]);
  if (d.website) cts.push(['site', d.website]);
  if (d.twitter) cts.push(['twitter', d.twitter]);
  if (d.telegram) cts.push(['telegram', d.telegram]);
  if (d.location) cts.push(['locale', d.location]);

  if (cts.length) {
    out.push(line(prompt()));
    out.push(line([ts(C.cyan, '└──╼ '), ts(C.white, 'echo $CONTACT')]));
    blank();
    var bw = 52;
    out.push(line([ts(C.dim, '  ┌' + '─'.repeat(bw) + '┐')]));
    cts.forEach(function(c) {
      var k = c[0].padEnd(10);
      var v = (c[1] || '').padEnd(36);
      out.push(line([ts(C.dim, '  │'), ts(C.cyan, '  ❯  ' + k + '·  ' + v), ts(C.dim, '│')]));
    });
    out.push(line([ts(C.dim, '  └' + '─'.repeat(bw) + '┘')]));
    blank();
  }

  if (d.collab) {
    out.push(line([ts(C.dim, '  // always down to collab on:')]));
    var items = d.collab.split(',').map(function(s) { return s.trim(); }).filter(Boolean).join('  ·  ');
    out.push(line([ts(C.text, '  '), ts(C.green, items)]));
    blank();
  }

  var cx = W / 2;
  out.push('<text x="' + cx + '" y="' + y + '" text-anchor="middle" fill="' + C.dim + '" font-weight="normal">' + '─'.repeat(72) + '</text>');
  y += LINE_H;
  blank();

  if (d.motto) {
    out.push('<text x="' + cx + '" y="' + y + '" text-anchor="middle" fill="' + C.dim + '" font-style="italic">' + esc('[ ' + d.motto + ' ]') + '</text>');
    y += LINE_H;
  }

  blank();
  var H = y + 12;
  var headerY = 22;
  var title = (d.username || 'username') + '@local — bash — 120×40';

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    buildDefs() +
    '<rect width="' + W + '" height="' + H + '" rx="10" fill="none" stroke="' + C.border + '" stroke-width="1.5" filter="url(#shadow)"/>' +
    '<rect width="' + W + '" height="36" rx="10" fill="none"/>' +
    '<rect y="26" width="' + W + '" height="10" fill="none"/>' +
    '<line x1="0" y1="36" x2="' + W + '" y2="36" stroke="' + C.border + '" stroke-width="1"/>' +
    '<circle cx="22" cy="18" r="5.5" fill="#e05c5c"/>' +
    '<circle cx="40" cy="18" r="5.5" fill="#e8c547"/>' +
    '<circle cx="58" cy="18" r="5.5" fill="#39d353"/>' +
    '<text x="' + cx + '" y="23" text-anchor="middle" fill="' + C.mid + '" font-size="11">' + esc(title) + '</text>' +
    out.join('\n') +
    '</svg>';
}

function renderProfileMinimal(d) {
  var X0 = 40;
  var out = [];
  var y = 60;

  function line(parts, x) {
    var el = svgText(x || X0, y, parts);
    y += LINE_H;
    return el;
  }
  function blank() { y += LINE_H; }

  if (d.opts.banner && d.banner) {
    var bannerLines = d.banner.split('\n');
    bannerLines.forEach(function(bl) {
      out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.accentB + '" font-weight="normal">' + esc(bl) + '</text>');
      y += LINE_H;
    });
    blank();
  }

  var nameY = y;
  out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.white + '" font-weight="bold" font-size="16">' + esc(d.fullname || d.username || 'username') + '</text>');
  y += 24;
  if (d.tagline) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.mid + '" font-size="12">' + esc(d.tagline) + '</text>');
    y += 20;
  }
  blank();

  out.push('<line x1="' + X0 + '" y1="' + y + '" x2="' + (W - X0) + '" y2="' + y + '" stroke="' + C.border + '" stroke-width="1"/>');
  y += 16;

  var metaItems = [];
  if (d.location) metaItems.push(['📍', d.location]);
  if (d.role) metaItems.push(['⚡', d.role]);
  if (d.university) metaItems.push(['🎓', d.university]);
  if (d.club) metaItems.push(['⚑', d.club]);

  if (metaItems.length) {
    var mx = X0;
    metaItems.forEach(function(m) {
      out.push('<text x="' + mx + '" y="' + y + '" fill="' + C.mid + '" font-size="12">' + esc(m[0] + '  ' + m[1]) + '</text>');
      y += 18;
    });
    blank();
  }

  if (d.skills && d.skills.length) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-weight="bold" font-size="11" letter-spacing="2">' + esc('SKILLS') + '</text>');
    y += 20;
    d.skills.forEach(function(sk) {
      var nm = (sk.name || '').padEnd(16);
      var p = Math.min(100, Math.max(0, parseInt(sk.pct) || 0));
      var total = 24;
      var bar = pct2bar(p, total);
      out.push(line([ts(C.text, nm), ts(C.accentB, bar.fill), ts(C.dim, bar.empty), ts(C.dim, ' ' + p + '%')]));
    });
    blank();
  }

  if (d.langs || d.os || d.tools) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-weight="bold" font-size="11" letter-spacing="2">' + esc('STACK') + '</text>');
    y += 20;
    if (d.langs) out.push(line([ts(C.mid, 'LANG  '), ts(C.text, d.langs)]));
    if (d.os) out.push(line([ts(C.mid, 'OS    '), ts(C.text, d.os)]));
    if (d.tools) out.push(line([ts(C.mid, 'TOOLS '), ts(C.text, d.tools)]));
    blank();
  }

  var cts = [];
  if (d.github) cts.push(['github', d.github]);
  if (d.email) cts.push(['email', d.email]);
  if (d.website) cts.push(['web', d.website]);
  if (d.twitter) cts.push(['twitter', d.twitter]);
  if (d.telegram) cts.push(['telegram', d.telegram]);
  if (d.linkedin) cts.push(['linkedin', d.linkedin]);

  if (cts.length) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-weight="bold" font-size="11" letter-spacing="2">' + esc('CONTACT') + '</text>');
    y += 20;
    var cx2 = X0;
    var cy2 = y;
    var col = 0;
    cts.forEach(function(c) {
      var xpos = X0 + (col % 2) * 380;
      var ypos = cy2 + Math.floor(col / 2) * LINE_H;
      out.push('<text x="' + xpos + '" y="' + ypos + '" fill="' + C.text + '" font-weight="normal">' +
        ts(C.mid, (c[0] + '  ').padEnd(12)) + ts(C.accentB, c[1]) + '</text>');
      col++;
    });
    y = cy2 + Math.ceil(cts.length / 2) * LINE_H;
    blank();
  }

  if (d.motto) {
    out.push('<line x1="' + X0 + '" y1="' + y + '" x2="' + (W - X0) + '" y2="' + y + '" stroke="' + C.border + '" stroke-width="1"/>');
    y += 16;
    out.push('<text x="' + (W / 2) + '" y="' + y + '" text-anchor="middle" fill="' + C.dim + '" font-style="italic">' + esc(d.motto) + '</text>');
    y += LINE_H;
  }

  blank();
  var H = y + 12;

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    buildDefs() +
    '<rect width="' + W + '" height="' + H + '" rx="8" fill="none" stroke="' + C.border + '" stroke-width="1.5"/>' +
    '<rect width="6" height="' + H + '" rx="3" fill="' + C.accentB + '" opacity="0.6"/>' +
    out.join('\n') +
    '</svg>';
}

function renderProfileHacker(d) {
  var X0 = 32;
  var out = [];
  var y = 52;

  function line(parts, x) {
    var el = svgText(x || X0, y, parts);
    y += LINE_H;
    return el;
  }
  function blank() { y += LINE_H; }
  var HACK = {
    primary: '#8eaecb',
    bright: '#dfe7ef',
    soft: '#c7d3df',
    muted: '#90a2b4',
    dim: '#627285'
  };
  function sep(char) { char = char || '═'; return line([ts(HACK.primary, char.repeat(70))]); }

  out.push('<rect width="' + W + '" height="36" rx="8" fill="rgba(92,122,152,0.08)"/>');
  out.push('<rect y="26" width="' + W + '" height="10" fill="rgba(92,122,152,0.08)"/>');
  out.push('<line x1="0" y1="36" x2="' + W + '" y2="36" stroke="rgba(133,161,190,0.45)" stroke-width="1"/>');

  var cx = W / 2;
  var titleStr = '[ ' + (d.username || 'username') + '.sh — v1.0 — ACTIVE ]';
  out.push('<text x="' + cx + '" y="23" text-anchor="middle" fill="' + HACK.primary + '" font-size="11" letter-spacing="2">' + esc(titleStr) + '</text>');

  if (d.opts.banner && d.banner) {
    var bannerLines = d.banner.split('\n');
    bannerLines.forEach(function(bl) {
      out.push('<text x="' + cx + '" y="' + y + '" text-anchor="middle" fill="' + HACK.primary + '" font-weight="bold">' + esc(bl) + '</text>');
      y += LINE_H;
    });
    blank();
  }

  out.push(sep());

  if (d.fullname || d.tagline) {
    out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'ID: '), ts(HACK.primary, d.fullname || d.username || '', true)]));
    if (d.tagline) out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'ROLE: '), ts(HACK.soft, d.tagline)]));
  }
  if (d.location) out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'LOC: '), ts(HACK.soft, d.location)]));
  if (d.university) out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'ORG: '), ts(HACK.soft, d.university)]));
  if (d.club) out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'GROUP: '), ts(HACK.soft, d.club)]));
  if (d.role) out.push(line([ts(HACK.primary, '> '), ts(HACK.bright, 'TITLE: '), ts(HACK.soft, d.role)]));

  out.push(sep('─'));
  blank();

  if (d.skills && d.skills.length) {
    out.push(line([ts(HACK.primary, '// SKILL MATRIX')]));
    blank();
    d.skills.forEach(function(sk) {
      var nm = ('[' + (sk.name || '') + ']').padEnd(22);
      var p = Math.min(100, Math.max(0, parseInt(sk.pct) || 0));
      var bar = pct2bar(p);
      out.push(line([ts(HACK.bright, nm), ts(HACK.primary, bar.fill), ts(HACK.dim, bar.empty), ts(HACK.muted, ' ' + p + '%')]));
    });
    blank();
    out.push(sep('─'));
    blank();
  }

  if (d.langs || d.os || d.tools) {
    out.push(line([ts(HACK.primary, '// ARSENAL')]));
    blank();
    if (d.langs) out.push(line([ts(HACK.bright, 'LANG    '), ts(HACK.soft, d.langs)]));
    if (d.os) out.push(line([ts(HACK.bright, 'OS      '), ts(HACK.soft, d.os)]));
    if (d.tools) out.push(line([ts(HACK.bright, 'TOOLS   '), ts(HACK.soft, d.tools)]));
    blank();
    out.push(sep('─'));
    blank();
  }

  var cts = [];
  if (d.github) cts.push(['GITHUB', d.github]);
  if (d.linkedin) cts.push(['LINKEDIN', d.linkedin]);
  if (d.email) cts.push(['MAIL', d.email]);
  if (d.website) cts.push(['WEB', d.website]);
  if (d.twitter) cts.push(['TWITTER', d.twitter]);
  if (d.telegram) cts.push(['TELEGRAM', d.telegram]);
  if (d.platform_label || d.platform_url) cts.push([(d.platform_label || 'PLATFORM').toUpperCase(), d.platform_url || '']);

  if (cts.length) {
    out.push(line([ts(HACK.primary, '// CONTACT CHANNELS')]));
    blank();
    cts.forEach(function(c) {
      out.push(line([ts(HACK.bright, c[0].padEnd(12)), ts(HACK.primary, '>> '), ts(HACK.soft, c[1])]));
    });
    blank();
  }

  if (d.collab) {
    out.push(sep('─'));
    out.push(line([ts(HACK.primary, '> '), ts(HACK.muted, 'OPEN TO: '), ts(HACK.soft, d.collab)]));
    blank();
  }

  out.push(sep());

  if (d.motto) {
    out.push('<text x="' + cx + '" y="' + y + '" text-anchor="middle" fill="' + HACK.primary + '" font-style="italic">' + esc('>> ' + d.motto + ' <<') + '</text>');
    y += LINE_H;
  }

  blank();
  var H = y + 12;

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    buildDefs() +
    '<rect width="' + W + '" height="' + H + '" rx="8" fill="none" stroke="rgba(133,161,190,0.6)" stroke-width="1.5"/>' +
    out.join('\n') +
    '</svg>';
}

function renderProfileCard(d) {
  var out = [];
  var y = 0;
  var cardW = W;

  var headerH = 120;
  out.push('<defs>' +
    '<linearGradient id="hgrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:' + C.accent + ';stop-opacity:1"/>' +
    '<stop offset="100%" style="stop-color:#1a3a5c;stop-opacity:1"/>' +
    '</linearGradient>' +
    '<style>text { font-family: \'JetBrains Mono\', monospace; font-size: ' + FONT_SIZE + 'px; stroke: rgba(0,0,0,0.9); stroke-width: 1.3px; paint-order: stroke fill; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.55)); }</style>' +
    '</defs>');

  out.push('<rect width="' + cardW + '" height="' + headerH + '" fill="url(#hgrad)" opacity="0.35"/>');

  if (d.opts.banner && d.banner) {
    var bannerLines = d.banner.split('\n').slice(0, 5);
    var by = 24;
    bannerLines.forEach(function(bl) {
      out.push('<text x="' + (cardW / 2) + '" y="' + by + '" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-size="10">' + esc(bl) + '</text>');
      by += 14;
    });
  }

  var avatarX = 48;
  var avatarY = headerH - 40;
  out.push('<circle cx="' + avatarX + '" cy="' + avatarY + '" r="36" fill="' + C.bg3 + '" stroke="' + C.accentB + '" stroke-width="2.5"/>');
  var initials = ((d.fullname || d.username || 'U').split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2)).toUpperCase();
  out.push('<text x="' + avatarX + '" y="' + (avatarY + 6) + '" text-anchor="middle" fill="' + C.accentB + '" font-size="18" font-weight="bold">' + esc(initials) + '</text>');

  y = headerH + 56;
  var nameX = 100;

  out.push('<text x="' + nameX + '" y="' + (headerH + 32) + '" fill="' + C.white + '" font-size="18" font-weight="bold">' + esc(d.fullname || d.username || 'username') + '</text>');
  if (d.tagline) {
    out.push('<text x="' + nameX + '" y="' + (headerH + 50) + '" fill="' + C.mid + '" font-size="12">' + esc(d.tagline) + '</text>');
  }

  var X0 = 32;
  out.push('<line x1="' + X0 + '" y1="' + y + '" x2="' + (cardW - X0) + '" y2="' + y + '" stroke="' + C.border + '" stroke-width="1"/>');
  y += 20;

  var metaItems = [];
  if (d.location) metaItems.push(['📍', d.location]);
  if (d.role) metaItems.push(['⚡', d.role]);
  if (d.university) metaItems.push(['🎓', d.university]);

  if (metaItems.length) {
    var mx = X0;
    metaItems.forEach(function(m) {
      out.push('<text x="' + mx + '" y="' + y + '" fill="' + C.text + '" font-size="12">' + esc(m[0] + '  ' + m[1]) + '</text>');
      y += 20;
    });
    y += 8;
  }

  if (d.skills && d.skills.length) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-size="10" letter-spacing="3" font-weight="bold">' + esc('SKILLS') + '</text>');
    y += 18;
    d.skills.forEach(function(sk) {
      var nm = (sk.name || '').padEnd(18);
      var p = Math.min(100, Math.max(0, parseInt(sk.pct) || 0));
      var bar = pct2bar(p, 20);
      out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.text + '" xml:space="preserve">' +
        ts(C.text, nm) + ts(C.accentB, bar.fill) + ts(C.dim, bar.empty) + ts(C.mid, '  ' + p + '%') +
        '</text>');
      y += LINE_H;
    });
    y += 8;
  }

  if (d.langs || d.os || d.tools) {
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-size="10" letter-spacing="3" font-weight="bold">' + esc('STACK') + '</text>');
    y += 18;
    if (d.langs) { out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.text + '" xml:space="preserve">' + ts(C.mid, 'LANG  ') + ts(C.text, d.langs) + '</text>'); y += LINE_H; }
    if (d.os) { out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.text + '" xml:space="preserve">' + ts(C.mid, 'OS    ') + ts(C.text, d.os) + '</text>'); y += LINE_H; }
    if (d.tools) { out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.text + '" xml:space="preserve">' + ts(C.mid, 'TOOLS ') + ts(C.text, d.tools) + '</text>'); y += LINE_H; }
    y += 8;
  }

  var cts = [];
  if (d.github) cts.push(['github', d.github]);
  if (d.email) cts.push(['email', d.email]);
  if (d.website) cts.push(['web', d.website]);
  if (d.twitter) cts.push(['twitter', d.twitter]);
  if (d.telegram) cts.push(['telegram', d.telegram]);

  if (cts.length) {
    out.push('<line x1="' + X0 + '" y1="' + y + '" x2="' + (cardW - X0) + '" y2="' + y + '" stroke="' + C.border + '" stroke-width="1"/>');
    y += 20;
    out.push('<text x="' + X0 + '" y="' + y + '" fill="' + C.cyan + '" font-size="10" letter-spacing="3" font-weight="bold">' + esc('CONTACT') + '</text>');
    y += 18;
    var col = 0;
    var startY = y;
    cts.forEach(function(c) {
      var xpos = X0 + (col % 2) * 390;
      var ypos = startY + Math.floor(col / 2) * LINE_H;
      out.push('<text x="' + xpos + '" y="' + ypos + '" fill="' + C.text + '" xml:space="preserve">' +
        ts(C.mid, (c[0] + '  ').padEnd(10)) + ts(C.accentB, c[1]) + '</text>');
      col++;
    });
    y = startY + Math.ceil(cts.length / 2) * LINE_H + 8;
  }

  if (d.motto) {
    out.push('<rect x="' + X0 + '" y="' + (y + 4) + '" width="' + (cardW - X0 * 2) + '" height="32" rx="4" fill="rgba(51,102,153,0.15)" stroke="rgba(51,102,153,0.3)" stroke-width="1"/>');
    out.push('<text x="' + (cardW / 2) + '" y="' + (y + 24) + '" text-anchor="middle" fill="' + C.accentB + '" font-style="italic" font-size="12">' + esc(d.motto) + '</text>');
    y += 48;
  }

  var H = y + 20;

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + cardW + '" height="' + H + '" viewBox="0 0 ' + cardW + ' ' + H + '">' +
    '<rect width="' + cardW + '" height="' + H + '" rx="10" fill="none" stroke="' + C.border + '" stroke-width="1.5"/>' +
    out.join('\n') +
    '</svg>';
}

function renderMarkdownOutput(d) {
  var u = d.username || 'username';
  var lines = [];

  if (d.opts.banner && d.banner) {
    lines.push('```');
    lines.push(d.banner);
    lines.push('```');
    lines.push('');
  }

  lines.push('```bash');
  lines.push('[' + u + '@local]-[~]');
  lines.push('└── whoami');
  lines.push('');
  if (d.fullname) lines.push(d.fullname + (d.tagline ? '  |  ' + d.tagline : ''));
  if (d.location) lines.push('📍 ' + d.location);
  if (d.role) lines.push('⚡ ' + d.role);
  if (d.university) lines.push('🎓 ' + d.university);
  lines.push('```');
  lines.push('');

  if (d.skills && d.skills.length) {
    lines.push('```bash');
    lines.push('[' + u + '@local]-[~/skills]');
    lines.push('└── cat skill_matrix.conf');
    lines.push('');
    d.skills.forEach(function(sk) {
      var nm = (sk.name || '').padEnd(18);
      var p = Math.min(100, Math.max(0, parseInt(sk.pct) || 0));
      var total = 22;
      var f = Math.round((p / 100) * total);
      var bar = '█'.repeat(f) + '░'.repeat(total - f);
      lines.push(nm + bar + '  ' + p + '%');
    });
    lines.push('```');
    lines.push('');
  }

  if (d.langs || d.os || d.tools) {
    lines.push('```bash');
    if (d.langs) lines.push('LANG    ' + d.langs.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join(''));
    if (d.os) lines.push('OS      ' + d.os.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join(''));
    if (d.tools) lines.push('TOOLS   ' + d.tools.split(',').map(function(t) { return '[' + t.trim() + ']'; }).join(''));
    lines.push('```');
    lines.push('');
  }

  var cts = [];
  if (d.github) cts.push(['github', d.github]);
  if (d.linkedin) cts.push(['linkedin', d.linkedin]);
  if (d.platform_label || d.platform_url) cts.push([d.platform_label || 'platform', d.platform_url || '']);
  if (d.email) cts.push(['mail', d.email]);
  if (d.website) cts.push(['site', d.website]);
  if (d.twitter) cts.push(['twitter', d.twitter]);
  if (d.telegram) cts.push(['telegram', d.telegram]);

  if (cts.length) {
    lines.push('```bash');
    lines.push('┌──────────────────────────────────────────┐');
    cts.forEach(function(c) {
      lines.push('│  ❯  ' + c[0].padEnd(10) + '·  ' + c[1]);
    });
    lines.push('└──────────────────────────────────────────┘');
    lines.push('```');
    lines.push('');
  }

  if (d.opts.stats) {
    lines.push('![GitHub Stats](https://github-readme-stats.vercel.app/api?username=' + encodeURIComponent(u) + '&show_icons=true&theme=dark&hide_border=true&bg_color=0a0c10&title_color=39d353&text_color=c9d1d9&icon_color=336699)');
    lines.push('![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=' + encodeURIComponent(u) + '&layout=compact&theme=dark&hide_border=true&bg_color=0a0c10&title_color=39d353&text_color=c9d1d9)');
    lines.push('');
  }
  if (d.opts.streak) {
    lines.push('[![GitHub Streak](https://streak-stats.demolab.com?user=' + encodeURIComponent(u) + '&theme=dark&hide_border=true&background=0a0c10&stroke=336699&ring=39d353&fire=e8c547&currStreakLabel=39d353)](https://git.io/streak-stats)');
    lines.push('');
  }
  if (d.opts.trophies) {
    lines.push('[![trophy](https://github-profile-trophy.vercel.app/?username=' + encodeURIComponent(u) + '&theme=darkhub&no-frame=true&column=7)](https://github.com/ryo-ma/github-profile-trophy)');
    lines.push('');
  }
  if (d.opts.snake) {
    lines.push('![snake](https://github.com/' + encodeURIComponent(u) + '/' + encodeURIComponent(u) + '/blob/output/github-contribution-grid-snake-dark.svg)');
    lines.push('');
  }

  if (d.collab) {
    lines.push('> 💬 Always open to collaborate on: ' + d.collab);
    lines.push('');
  }

  if (d.motto) {
    lines.push('---');
    lines.push('');
    lines.push('<div align="center">');
    lines.push('');
    lines.push('*[ ' + d.motto + ' ]*');
    lines.push('');
    lines.push('</div>');
  }

  return lines.join('\n');
}
