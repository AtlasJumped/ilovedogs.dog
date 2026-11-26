/* Size slider: grows the dog silhouette next to a person and shows a rough size guide. */
(function () {
  'use strict';
  var SIZES = [
    { k: 'XS', max: 10, like: 'Chihuahua', neck: '8 to 12 in', cw: '5/8 in', leg: '3 to 4.5 in', sw: '2 in' },
    { k: 'S', max: 15, like: 'Dachshund', neck: '11 to 15 in', cw: '3/4 in', leg: '4 to 5.5 in', sw: '2.5 in' },
    { k: 'M', max: 20, like: 'Beagle', neck: '14 to 18 in', cw: '1 in', leg: '5 to 7 in', sw: '3 in' },
    { k: 'L', max: 25, like: 'Labrador', neck: '17 to 22 in', cw: '1.25 in', leg: '6.5 to 8.5 in', sw: '3.5 in' },
    { k: 'XL', max: 30, like: 'Rottweiler', neck: '21 to 26 in', cw: '1.5 in', leg: '8 to 10.5 in', sw: '4 in' },
    { k: 'XXL', max: 36, like: 'Great Dane', neck: '25 to 32 in', cw: '2 in', leg: '10 to 13 in', sw: '4.5 in' }
  ];
  var lo = [0, 10, 15, 20, 25, 30];
  var tb = document.getElementById('sz-table');
  if (tb) tb.innerHTML = SIZES.map(function (s, i) {
    return '<tr><td><b>' + s.k + '</b></td><td>' + (i ? lo[i] + ' to ' : 'under ') + s.max + ' in</td><td>' + s.neck + '</td><td>' + s.cw + '</td><td>' + s.leg + '</td><td>' + s.sw + '</td></tr>';
  }).join('');
  var r = document.getElementById('sz'); if (!r) return;
  var dog = document.getElementById('dog'), out = document.getElementById('sz-out'), wolf = document.getElementById('wolf'), lbl = document.getElementById('dog-lbl');
  var PX = 200 / 68; /* person is about 68 in tall, drawn 200 px */
  function $(id) { return document.getElementById(id); }
  function upd() {
    var h = +r.value, isWolf = h > 36, s = SIZES[SIZES.length - 1];
    for (var i = 0; i < SIZES.length; i++) if (h <= SIZES[i].max) { s = SIZES[i]; break; }
    var sc = (h * PX) / 100;
    dog.setAttribute('transform', 'translate(' + (isWolf ? 100 : 110) + ',240) scale(' + sc.toFixed(3) + ')');
    out.textContent = isWolf ? h + ' in (dire wolf territory)' : h + ' in';
    wolf.hidden = !isWolf;
    lbl.textContent = isWolf ? 'Dire wolf?' : 'Your dog';
    $('r-size').textContent = isWolf ? 'Custom' : s.k;
    $('r-like').textContent = isWolf ? 'Dire wolf' : s.like;
    $('r-collar').textContent = isWolf ? 'We will make one' : s.neck + ' / ' + s.cw;
    $('r-sleeve').textContent = isWolf ? 'We will make one' : s.leg + ' / ' + s.sw;
    var f = $('r-h'); if (f && (!f.value || f.dataset.auto === '1')) { f.value = h + ' in, size ' + (isWolf ? 'custom' : s.k); f.dataset.auto = '1'; }
  }
  var f0 = $('r-h'); if (f0) f0.addEventListener('input', function () { f0.dataset.auto = '0'; });
  r.addEventListener('input', upd); upd();
})();
