(function () {
    'use strict';

    var FAV_KEY = 'sade.favs';
    var hasTizen = typeof window.tizen !== 'undefined';
    var favs = loadFavs();
    var apps = [];
    var main = document.getElementById('main');
    var toastTimer;

    function loadFavs() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
    }
    function saveFavs() {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) { /* yok say */ }
    }

    function toast(msg) {
        var t = document.getElementById('toast');
        t.textContent = msg;
        t.className = 'on';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.className = ''; }, 2500);
    }

    // ---- saat ----
    function tick() {
        var d = new Date();
        document.getElementById('clock').textContent =
            ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
        var s;
        try { s = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }); }
        catch (e) { s = d.toDateString(); }
        document.getElementById('date').textContent = s;
    }

    // ---- uygulamalar ----
    function fetchApps(done) {
        if (!hasTizen) { // tarayıcıda önizleme
            return done(['Netflix', 'YouTube', 'Prime Video', 'Disney+', 'Spotify', 'Internet', 'Apple TV',
                'Plex', 'Twitch', 'Galeri', 'Ayarlar', 'e-Kılavuz'].map(function (n) { return { id: n, name: n }; }));
        }
        var self = '';
        try { self = tizen.application.getCurrentApplication().appInfo.id; } catch (e) { /* yok say */ }
        tizen.application.getAppsInfo(function (list) {
            done(list.filter(function (a) { return a.show && a.id !== self && a.name; })
                .map(function (a) { return { id: a.id, name: a.name, icon: a.iconPath }; }));
        }, function () { done([]); });
    }

    function tile(app) {
        var b = document.createElement('button');
        b.className = 'tile' + (favs.indexOf(app.id) >= 0 ? ' fav' : '');
        b.setAttribute('data-id', app.id);
        var letter = document.createElement('div');
        letter.className = 'letter';
        letter.textContent = app.name.charAt(0).toUpperCase();
        if (app.icon) {
            var img = new Image();
            img.onerror = function () { b.replaceChild(letter, img); };
            img.src = app.icon.indexOf('/') === 0 ? 'file://' + app.icon : app.icon;
            b.appendChild(img);
        } else {
            b.appendChild(letter);
        }
        var n = document.createElement('div');
        n.className = 'name';
        n.textContent = app.name;
        b.appendChild(n);
        return b;
    }

    function section(title, list) {
        if (!list.length) { return; }
        var h = document.createElement('h2');
        h.textContent = title;
        var g = document.createElement('div');
        g.className = 'grid';
        list.forEach(function (a) { g.appendChild(tile(a)); });
        main.appendChild(h);
        main.appendChild(g);
    }

    function render(focusId) {
        var byName = function (a, b) { return a.name.localeCompare(b.name, 'tr'); };
        var fav = favs.map(function (id) {
            return apps.filter(function (a) { return a.id === id; })[0];
        }).filter(Boolean);
        var rest = apps.filter(function (a) { return favs.indexOf(a.id) < 0; }).sort(byName);
        main.innerHTML = '';
        section('Favoriler', fav);
        section(fav.length ? 'Tüm uygulamalar' : 'Uygulamalar', rest);
        var tiles = main.querySelectorAll('.tile');
        var target = tiles[0];
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].getAttribute('data-id') === focusId) { target = tiles[i]; }
        }
        focus(target);
    }

    function focus(el) {
        if (!el) { return; }
        el.focus();
        // odaktaki kutuyu görünür alanda tut
        var top = el.offsetTop - main.offsetTop, pad = main.clientHeight * 0.25;
        if (top < main.scrollTop + pad) { main.scrollTop = Math.max(0, top - pad); }
        else if (top + el.offsetHeight > main.scrollTop + main.clientHeight - pad) {
            main.scrollTop = top + el.offsetHeight - main.clientHeight + pad;
        }
    }

    function current() {
        var el = document.activeElement;
        return el && el.className.indexOf('tile') >= 0 ? el : null;
    }

    function move(dx, dy) {
        var cur = current();
        var tiles = main.querySelectorAll('.tile');
        if (!cur) { return focus(tiles[0]); }
        var r = cur.getBoundingClientRect(), best = null, bestScore = Infinity;
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i] === cur) { continue; }
            var q = tiles[i].getBoundingClientRect();
            var x = q.left - r.left, y = q.top - r.top, score;
            if (dx) { // yatay: yalnızca aynı satır
                if (Math.abs(y) > r.height / 2 || x * dx <= 0) { continue; }
                score = Math.abs(x);
            } else { // dikey: önce en yakın satır, sonra en yakın sütun
                if (y * dy <= r.height / 2) { continue; }
                score = Math.abs(y) * 10 + Math.abs(x);
            }
            if (score < bestScore) { bestScore = score; best = tiles[i]; }
        }
        focus(best);
    }

    function launch() {
        var cur = current();
        if (!cur) { return; }
        var id = cur.getAttribute('data-id');
        if (!hasTizen) { return toast('Aç: ' + id); }
        tizen.application.launch(id, null, function (e) {
            toast('Açılamadı: ' + (e && e.name || 'hata'));
        });
    }

    function toggleFav() {
        var cur = current();
        if (!cur) { return; }
        var id = cur.getAttribute('data-id'), i = favs.indexOf(id);
        if (i >= 0) { favs.splice(i, 1); } else { favs.push(id); }
        saveFavs();
        render(id);
        toast(i >= 0 ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
    }

    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
        case 37: move(-1, 0); break;
        case 39: move(1, 0); break;
        case 38: move(0, -1); break;
        case 40: move(0, 1); break;
        case 13: launch(); break;
        case 404: case 70: toggleFav(); break; // Yeşil tuş (PC'de F)
        case 10009: focus(main.querySelector('.tile')); break; // Geri: başa dön
        default: return;
        }
        e.preventDefault();
    });

    if (hasTizen) {
        try { tizen.tvinputdevice.registerKey('ColorF1Green'); } catch (e) { /* yok say */ }
        // uygulamaya geri dönüldüğünde listeyi tazele
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                var cur = current();
                fetchApps(function (l) { apps = l; render(cur && cur.getAttribute('data-id')); });
                tick();
            }
        });
    }

    tick();
    setInterval(tick, 10000);
    fetchApps(function (l) { apps = l; render(); });
}());
