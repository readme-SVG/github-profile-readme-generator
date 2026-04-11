var Figlet = (function () {

  var fonts = {};

  function loadFont(name, data) {
    fonts[name] = data;
  }

  function parseFont(raw) {
    var lines = raw.split('\n');
    var header = lines[0].split(' ');
    var hardblank = header[0].slice(-1);
    var height = parseInt(header[1]);
    var commentLines = parseInt(header[5]);
    var charLines = lines.slice(commentLines + 1);
    var chars = {};
    var ascii = 32;
    var i = 0;
    while (i < charLines.length && ascii < 127) {
      var block = [];
      for (var r = 0; r < height; r++) {
        var line = charLines[i + r] || '';
        line = line.replace(/@+\r?$/, '').replace(new RegExp('\\' + hardblank, 'g'), ' ');
        block.push(line);
      }
      chars[ascii] = block;
      ascii++;
      i += height;
    }
    return { height: height, chars: chars };
  }

  function renderText(text, fontName) {
    fontName = fontName || 'big';
    var raw = fonts[fontName];
    if (!raw) return text;
    var font = parseFont(raw);
    if (!font) return text;
    var height = font.height;
    var rows = [];
    for (var r = 0; r < height; r++) rows.push('');
    for (var ci = 0; ci < text.length; ci++) {
      var code = text.charCodeAt(ci);
      var glyph = font.chars[code];
      if (!glyph) glyph = font.chars[32];
      if (!glyph) continue;
      for (var r = 0; r < height; r++) {
        rows[r] += glyph[r] || '';
      }
    }
    return rows.join('\n');
  }

  return {
    loadFont: loadFont,
    renderText: renderText,
    isLoaded: function(name) { return !!fonts[name]; }
  };

})();
