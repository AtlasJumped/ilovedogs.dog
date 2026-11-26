/* ilovedogs.dog: entry pop-up (gateway) and forms. Sends through Web3Forms to the team inbox, same key as the HMR dock. */
(function () {
  'use strict';
  var KEY = '436d16c6-bfff-4931-aace-95f12a6726ad';
  var SEEN = 'ild-gate-v1';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  function send(subject, fields) {
    var body = { access_key: KEY, subject: subject, from_name: 'ilovedogs.dog', botcheck: '', page: location.href };
    for (var k in fields) if (Object.prototype.hasOwnProperty.call(fields, k)) body[k] = fields[k];
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) { return r.ok; }, function () { return false; });
  }
  window.ILD = { send: send };

  function formData(form) {
    var out = {}, els = form.elements;
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (!el.name || el.name === 'botcheck') continue;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
      var v = (el.value || '').trim(); if (!v) continue;
      out[el.name] = out[el.name] ? out[el.name] + ', ' + v : v;
    }
    return out;
  }

  /* ---- gateway pop-up ---- */
  var gate = document.getElementById('gate');
  var lastFocus = null;
  function openGate() {
    if (!gate) return;
    lastFocus = document.activeElement;
    gate.hidden = false; document.body.style.overflow = 'hidden';
    var f = gate.querySelector('input,button'); if (f) f.focus();
  }
  function closeGate() {
    if (!gate) return;
    gate.hidden = true; document.body.style.overflow = ''; set(SEEN, '1');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (gate) {
    gate.addEventListener('click', function (e) { if (e.target === gate || e.target.hasAttribute('data-close')) closeGate(); });
    document.addEventListener('keydown', function (e) {
      if (gate.hidden) return;
      if (e.key === 'Escape') closeGate();
      if (e.key === 'Tab') {
        var f = gate.querySelectorAll('button,input,textarea,select,a[href]'); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    var gf = gate.querySelector('form');
    gf.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = formData(gf);
      if (gf.botcheck && gf.botcheck.checked) { closeGate(); return; }
      if (Object.keys(d).length) send('ilovedogs.dog: welcome answers', d);
      closeGate();
    });
    var again = document.querySelectorAll('[data-open-gate]');
    for (var i = 0; i < again.length; i++) again[i].addEventListener('click', function (e) { e.preventDefault(); openGate(); });
    if (!get(SEEN) && !/[?&]nogate\b/.test(location.search)) setTimeout(openGate, 600);
  }

  /* ---- other forms: data-send="subject" ---- */
  var forms = document.querySelectorAll('form[data-send]');
  for (var j = 0; j < forms.length; j++) (function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = form.querySelector('.status'), btn = form.querySelector('button[type=submit]');
      if (form.botcheck && form.botcheck.checked) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (btn) btn.disabled = true;
      if (st) { st.className = 'status'; st.textContent = 'Sending...'; }
      send(form.getAttribute('data-send'), formData(form)).then(function (ok) {
        if (btn) btn.disabled = false;
        if (!st) return;
        if (ok) { st.className = 'status ok'; st.textContent = form.getAttribute('data-ok') || 'Sent. Thank you!'; form.reset(); }
        else { st.className = 'status err'; st.textContent = 'That did not send. Your answers are still here, so please try again in a minute.'; }
      });
    });
  })(forms[j]);
})();
(function () {
  var b = document.getElementById('share-btn'), st = document.getElementById('share-st'); if (!b) return;
  var data = { title: 'ilovedogs.dog', text: 'Free matching collar and sleeve sets that tell everyone if a dog is friendly. Get one for your dog:', url: 'https://ilovedogs.dog/' };
  b.addEventListener('click', function () {
    if (navigator.share) { navigator.share(data).catch(function () { }); return; }
    var done = function () { if (st) { st.className = 'status ok'; st.textContent = 'Link copied. Paste it anywhere.'; } };
    if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(done, function () { if (st) st.textContent = data.url; });
    else if (st) st.textContent = data.url;
  });
})();
(function () {
  var b = document.getElementById('share-btn2'), st = document.getElementById('share-st2'); if (!b) return;
  var text = 'The dog collar colour code. Green: come say hi, friendly with people and dogs. Yellow: ask first, maybe not good with dogs but loves people. Red: keep away, people and other dogs. Any brand, any collar, same colours.';
  var url = 'https://ilovedogs.dog/#signals';
  function say(m) { if (st) { st.className = 'status ok'; st.textContent = m; } }
  b.addEventListener('click', function () {
    var plain = { title: 'The dog collar colour code', text: text, url: url };
    if (navigator.share && window.fetch && window.File) {
      fetch('/img/colour-code.png').then(function (r) { return r.blob(); }).then(function (blob) {
        var f = new File([blob], 'dog-collar-colour-code.png', { type: 'image/png' });
        var withImg = { title: plain.title, text: text + ' ' + url, files: [f] };
        if (navigator.canShare && navigator.canShare(withImg)) return navigator.share(withImg);
        return navigator.share(plain);
      }).catch(function () { });
      return;
    }
    if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(function () { say('Copied. Paste it anywhere, and add the card if you can.'); }, function () { say(text + ' ' + url); });
    else say(text + ' ' + url);
  });
})();
