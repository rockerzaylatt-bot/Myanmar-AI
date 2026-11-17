document.addEventListener("DOMContentLoaded", function() {
  setInterval(function() {
    var t = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Yangon', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('ygnTime').textContent = "🇲🇲 ရန်ကုန် - " + t;
  }, 1000);

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });

  document.querySelectorAll('.pills').forEach(function(g) {
    g.querySelectorAll('.pill').forEach(function(p) {
      p.addEventListener('click', function() {
        g.querySelectorAll('.pill').forEach(function(x) { x.classList.remove('selected'); });
        p.classList.add('selected');
      });
    });
  });

  document.getElementById('btnApi').onclick = function() {
    document.getElementById('keyInput').value = localStorage.getItem('g_key') || '';
    document.getElementById('apiModal').style.display = 'flex';
  };
  document.getElementById('btnCloseModal').onclick = function() { document.getElementById('apiModal').style.display = 'none'; };
  document.getElementById('btnSaveKey').onclick = function() {
    var cleanKey = document.getElementById('keyInput').value.replace(/[^a-zA-Z0-9._-]/g, '');
    localStorage.setItem('g_key', cleanKey);
    document.getElementById('apiModal').style.display = 'none';
    alert("သိမ်းဆည်းပြီးပါပြီ ✅");
  };

  var cy = document.getElementById('cYear'), cd = document.getElementById('cDay'), cm = document.getElementById('cMonth');
  for (var y = 2026; y >= 1926; y--) { var o = document.createElement('option'); o.value = y; o.textContent = y + " ခု"; cy.appendChild(o); }
  for (var d = 1; d <= 31; d++) { var o = document.createElement('option'); o.value = d; o.textContent = d + " ရက်"; cd.appendChild(o); }
  var now = new Date(); cy.value = now.getFullYear(); cm.value = now.getMonth() + 1; cd.value = now.getDate();

  function runCal() {
    var y = parseInt(cy.value), m = parseInt(cm.value), d = parseInt(cd.value);
    var dt = new Date(y, m - 1, d);
    var days = ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"];
    var me = (m < 4 || (m === 4 && d < 17)) ? y - 639 : y - 638;
    var mahas = ["ဘင်္ဂ", "ပုတိ", "သိုက်", "မရဏ", "အဓိပတိ", "ရာဇ", "အထွန်း"];
    var maha = mahas[((dt.getDay() + 1) - (me % 7) + 7) % 7];
    document.getElementById('calOut').innerHTML = "မွေးနေ့: " + days[dt.getDay()] + "သား/သမီး<br>မြန်မာသက္ကရာဇ်: " + me + " ခုနှစ်<br>မဟာဘုတ်: " + maha + "ဖွား";
  }
  cy.onchange = runCal; cm.onchange = runCal; cd.onchange = runCal; runCal();

  function sendXHR(url, key, payload) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("x-goog-api-key", key);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error("Status " + xhr.status)); }
        }
      };
      xhr.onerror = function() { reject(new Error("Network Error")); };
      xhr.send(JSON.stringify(payload));
    });
  }

  async function askAI(prompt, outEl, btnEl, copyEl) {
    var rawKey = localStorage.getItem('g_key') || '';
    var key = rawKey.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!key) { alert("ညာဘက်အပေါ်က ⚙️ API Key အရင်ထည့်ပါ!"); return; }
    var oldText = btnEl.textContent;
    btnEl.textContent = "စဉ်းစားနေပါသည်... ✨";
    outEl.style.display = 'none';
    if (copyEl) copyEl.style.display = 'none';

    var models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    var lastErr = "Connection Failed";
    for (var i = 0; i < models.length; i++) {
      try {
        var base = "https://googleapis.com";
        var endpoint = base + models.at(i) + ":generateContent";
        var j = await sendXHR(endpoint, key, { contents: [{ parts: [{ text: prompt }] }] });
        if (j.candidates && j.candidates.at(0)) {
          outEl.textContent = j.candidates.at(0).content.parts.at(0).text;
          outEl.style.display = 'block';
          if (copyEl) copyEl.style.display = 'block';
          btnEl.textContent = oldText;
          return;
        } else if (j.error) {
          lastErr = j.error.message;
        }
      } catch (e) { lastErr = e.message; }
    }
    btnEl.textContent = oldText;
    alert("Error: " + lastErr);
  }

  document.getElementById('btnGenTT').onclick = function() {
    var cat = document.querySelector('#catPills .selected').textContent;
    var top = document.getElementById('ttTopic').value.trim();
    if (!top) return alert("အကြောင်းအရာ ရေးပါ!");
    askAI("Myanmar TikTok viral expert. Spoken Burmese slang. Category: " + cat + ". Topic: " + top + ". Give 3 viral captions with hashtags and a 30s speaking script.", document.getElementById('resTT'), this, document.getElementById('copyTT'));
  };
  document.getElementById('copyTT').onclick = function() {
    navigator.clipboard.writeText(document.getElementById('resTT').textContent);
    alert("Copy ကူးပြီးပါပြီ ✅");
  };
  document.getElementById('btnGenAd').onclick = function() {
    var top = document.getElementById('adTopic').value.trim();
    if (!top) return alert("လုပ်ငန်းအမျိုးအစား ရေးပါ!");
    askAI("Myanmar TikTok marketing expert. Spoken Burmese advice for: " + top + ". Give 3 video ideas and 3 ad tips.", document.getElementById('resAd'), this, null);
  };
  document.getElementById('btnGenVd').onclick = function() {
    var day = document.querySelector('#dayPills .selected').textContent;
    var q = document.getElementById('vdTopic').value.trim() || "ယနေ့ ကံကြမ္မာ";
    askAI("Warm Myanmar astrologer. Spoken Burmese daily horoscope for " + day + " regarding " + q + ". Include fortune, lucky color/number, and easy yadayar.", document.getElementById('resVd'), this, null);
  };
});
