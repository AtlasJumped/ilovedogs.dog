/* City meters: two bars per city (owners, volunteers). Goals and notes are in /data/cities.json.
   Owners and volunteers add the live counts from the HMR Family database (dog_counts(), see js/site.js). */
(function () {
  var box = document.getElementById('city-meters'); if (!box || !window.fetch) return;
  function n(x) { return Number(x).toLocaleString('en-US'); }
  function pct(a, b) { return b ? Math.min(100, a / b * 100) : 0; }
  function bar(label, have, goal, fmt, note) {
    var p = pct(have, goal), shown = p > 0 && p < 1 ? '<1' : Math.round(p);
    return '<div class="cbar"><div class="cbar-h"><b>' + label + '</b><span>' + fmt(have) + ' of ' + fmt(goal) + ' (' + shown + '%)</span></div>' +
      '<div class="meter" role="img" aria-label="' + label + ': ' + fmt(have) + ' of ' + fmt(goal) + '"><i style="width:' + Math.max(p, p > 0 ? 1 : 0) + '%"></i></div>' +
      (note ? '<p class="note">' + note + '</p>' : '') + '</div>';
  }
  var DB = 'https://tudawxduevejltgmyrqm.supabase.co/rest/v1/rpc/dog_counts', DBKEY = 'sb_publishable_B1u0-Wf5UbWPX6QstfVbGQ_VpmEDpkn';
  function live() { return fetch(DB, { method: 'POST', headers: { 'apikey': DBKEY, 'Content-Type': 'application/json' }, body: '{}' }).then(function (r) { return r.ok ? r.json() : null; }, function () { return null; }); }
  function load() { Promise.all([fetch('/data/cities.json?v=' + Date.now()).then(function (r) { return r.json(); }), live()]).then(function (res) {
    var d = res[0], L = {}, ok = Array.isArray(res[1]); if (ok) res[1].forEach(function (x) { L[x.city] = x; });
    d.cities.forEach(function (c) { var x = L[c.id]; if (x) { c.owners += +x.owners || 0; c.volunteers += +x.volunteers || 0; } });
    var html = '';
    d.cities.forEach(function (c) {
      var ready = c.owners >= c.owners_goal && c.volunteers >= c.volunteers_goal;
      html += '<div class="card city"><div class="city-h"><h3>' + c.name + '</h3><span class="st ' + (ready ? 'lead' : 'maybe') + '">' + (ready ? 'Ready to drop' : 'Filling up') + '</span></div>' +
        '<p class="note" style="margin-top:0">Hand-out spot: ' + c.drop + '</p>' +
        bar('Dog owners signed up', c.owners, c.owners_goal, n, c.owners_note) +
        bar('Volunteers ready', c.volunteers, c.volunteers_goal, n, 'Hand-out, crowd care, entertainment and setup.') + '</div>';
    });
    box.innerHTML = html;
    var u = document.getElementById('city-updated'); if (u) u.textContent = ok ? 'Sign-ups and volunteers count live. Goals updated ' + d.updated + '.' : 'Updated ' + d.updated + '.';
  }).catch(function () { }); }
  load(); window.addEventListener('ild-counts', load);
})();
/* Voice sign-up: speak into a text box where the browser supports it. */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var btns = document.querySelectorAll('[data-mic]');
  for (var i = 0; i < btns.length; i++) (function (b) {
    var t = document.getElementById(b.getAttribute('data-mic')), st = document.getElementById(b.getAttribute('data-mic') + '-st');
    if (!SR || !t) { b.hidden = true; if (st) st.textContent = 'Your browser can’t take voice here, so please type it.'; return; }
    var rec = null, on = false, base = '';
    b.addEventListener('click', function () {
      if (on) { rec.stop(); return; }
      rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      base = t.value ? t.value.replace(/\s*$/, ' ') : '';
      rec.onresult = function (e) { var s = ''; for (var k = 0; k < e.results.length; k++) s += e.results[k][0].transcript; t.value = base + s; };
      rec.onend = function () { on = false; b.textContent = '🎙 Talk instead of typing'; if (st) st.textContent = 'Got it. Edit anything, then send.'; };
      rec.onerror = function () { if (st) st.textContent = 'The microphone didn’t work, so please type it.'; };
      rec.start(); on = true; b.textContent = '■ Stop'; if (st) st.textContent = 'Listening. Tell us what you’d like to do and how to reach you.';
    });
  })(btns[i]);
})();
