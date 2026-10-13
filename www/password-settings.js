/* ============================================================
   password-settings.js — واجهة تغيير كلمة المرور
   الإصدار 1.0
   ============================================================ */
(function() {
  'use strict';

  /* ═══ شاشة تغيير كلمة المرور ═══ */
  window.showPasswordSettings = function() {
    var titleEl = document.getElementById('listTitle');
    var c = document.getElementById('listContent');
    if (!c) return;

    if (titleEl) titleEl.textContent = "🔒 كلمة المرور";

    var hasCustom = window.hasCustomPassword && window.hasCustomPassword();

    c.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#1A237E,#3949AB);color:#fff">
        <div class="card-title" style="color:#FFD54F;border-color:#FFD54F">🔒 إدارة كلمة المرور</div>
        <p style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.9;margin:0">
          كلمة المرور تُطلب عند فتح التطبيق.<br>
          الحالة: <strong style="color:#FFD54F">${hasCustom ? 'مخصّصة ✨' : 'افتراضية (313)'}</strong>
        </p>
      </div>

      <div class="card">
        <div class="card-title">🔄 تغيير كلمة المرور</div>

        <label style="display:block;font-size:13px;font-weight:700;color:#1A237E;margin:8px 0 4px">كلمة المرور الحالية:</label>
        <input type="password" id="ps-current" placeholder="أدخل الحالية"
          style="width:100%;padding:12px;border:2px solid #C5CAE9;border-radius:10px;font-size:15px;outline:none;font-family:inherit;text-align:center;letter-spacing:2px">

        <label style="display:block;font-size:13px;font-weight:700;color:#1A237E;margin:14px 0 4px">كلمة المرور الجديدة:</label>
        <input type="password" id="ps-new" placeholder="3 أحرف على الأقل"
          style="width:100%;padding:12px;border:2px solid #C5CAE9;border-radius:10px;font-size:15px;outline:none;font-family:inherit;text-align:center;letter-spacing:2px">

        <label style="display:block;font-size:13px;font-weight:700;color:#1A237E;margin:14px 0 4px">تأكيد الجديدة:</label>
        <input type="password" id="ps-confirm" placeholder="أعد كتابتها"
          style="width:100%;padding:12px;border:2px solid #C5CAE9;border-radius:10px;font-size:15px;outline:none;font-family:inherit;text-align:center;letter-spacing:2px">

        <button class="btn-primary" style="width:100%;margin-top:18px;padding:14px"
          onclick="window.saveNewPassword()">💾 حفظ كلمة المرور الجديدة</button>

        <div id="ps-msg" style="margin-top:12px;text-align:center;font-size:13px;font-weight:700;min-height:18px;opacity:0;transition:opacity .3s"></div>
      </div>

      <div class="card" style="border-right:4px solid #E65100;background:#FFF3E0">
        <div class="card-title" style="color:#E65100;border-color:#E65100">⚠️ استعادة الافتراضية</div>
        <p style="font-size:13px;color:#555;line-height:1.8;margin:0 0 12px 0">
          إن نسيت كلمة المرور، يمكنك استعادتها إلى القيمة الافتراضية <strong>313</strong>.
        </p>
        <button class="btn-outline" style="width:100%;padding:12px;border-color:#E65100;color:#E65100;font-weight:700"
          onclick="window.confirmResetPassword()">🔄 استعادة 313</button>
      </div>

      <button class="btn-outline" style="width:100%;margin-top:10px" onclick="window.showSettings()">← رجوع للإعدادات</button>
    `;

    if (typeof window.showScreen === 'function') window.showScreen('screen-list');
    window.scrollTo(0, 0);

    /* تفعيل زر Enter */
    setTimeout(function() {
      ['ps-current','ps-new','ps-confirm'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            window.saveNewPassword();
          }
        });
      });
    }, 100);
  };

  /* ═══ حفظ كلمة المرور الجديدة ═══ */
  window.saveNewPassword = function() {
    var curEl = document.getElementById('ps-current');
    var newEl = document.getElementById('ps-new');
    var confEl = document.getElementById('ps-confirm');
    var msgEl = document.getElementById('ps-msg');
    if (!curEl || !newEl || !confEl || !msgEl) return;

    var current = curEl.value.trim();
    var newPass = newEl.value.trim();
    var confirm = confEl.value.trim();

    function showMsg(text, color) {
      msgEl.textContent = text;
      msgEl.style.color = color;
      msgEl.style.opacity = '1';
      setTimeout(function() { msgEl.style.opacity = '0'; }, 3500);
    }

    if (!current) { showMsg('⚠️ أدخل كلمة المرور الحالية', '#E65100'); return; }
    if (!newPass) { showMsg('⚠️ أدخل كلمة المرور الجديدة', '#E65100'); return; }
    if (newPass.length < 3) { showMsg('⚠️ كلمة المرور الجديدة قصيرة جدًا (3 أحرف على الأقل)', '#E65100'); return; }
    if (newPass !== confirm) { showMsg('❌ كلمتا المرور غير متطابقتين', '#C62828'); return; }

    var correctPass = window.getAppPassword ? window.getAppPassword() : '313';
    if (current !== correctPass) {
      showMsg('❌ كلمة المرور الحالية غير صحيحة', '#C62828');
      curEl.value = '';
      curEl.focus();
      return;
    }

    if (window.setAppPassword && window.setAppPassword(newPass)) {
      showMsg('✅ تم تغيير كلمة المرور بنجاح', '#2E7D32');
      curEl.value = '';
      newEl.value = '';
      confEl.value = '';
      setTimeout(function() {
        if (typeof window.showToast === 'function') {
          window.showToast('✅ كلمة المرور الجديدة فعّالة');
        }
      }, 300);
    } else {
      showMsg('❌ فشل الحفظ — أعد المحاولة', '#C62828');
    }
  };

  /* ═══ تأكيد استعادة الافتراضية ═══ */
  window.confirmResetPassword = function() {
    var hasCustom = window.hasCustomPassword && window.hasCustomPassword();
    var msg = hasCustom
      ? 'سيتم استعادة كلمة المرور إلى القيمة الافتراضية 313.\n\nهل أنت متأكد؟'
      : 'كلمة المرور الحالية هي الافتراضية 313 بالفعل.';
    if (!confirm(msg)) return;

    if (window.resetAppPassword && window.resetAppPassword()) {
      if (typeof window.showToast === 'function') {
        window.showToast('✅ تمت استعادة كلمة المرور الافتراضية (313)');
      }
      setTimeout(function() { window.showPasswordSettings(); }, 400);
    } else {
      alert('❌ فشلت العملية');
    }
  };

  /* ═══ حقن زر في شاشة الإعدادات ═══ */
  function hookSettings() {
    if (typeof window.showSettings !== 'function') {
      setTimeout(hookSettings, 500);
      return;
    }
    if (window.showSettings._psHooked) return;

    var orig = window.showSettings;
    window.showSettings = function() {
      orig.apply(this, arguments);
      setTimeout(function() {
        var c = document.getElementById('listContent');
        if (!c) return;
        var firstRow = c.querySelector('.settings-row');
        if (!firstRow) return;
        if (c.querySelector('.ps-settings-btn')) return;

        var row = document.createElement('div');
        row.className = 'settings-row ps-settings-btn';
        row.style.cursor = 'pointer';
        row.innerHTML = '<span>🔒 كلمة المرور</span><div style="color:#C5CAE9;font-size:18px">‹</div>';
        row.onclick = window.showPasswordSettings;
        firstRow.parentNode.insertBefore(row, firstRow);
      }, 60);
    };
    window.showSettings._psHooked = true;
  }
  hookSettings();

  console.log('[password-settings] ✅ تم التحميل');
})();
