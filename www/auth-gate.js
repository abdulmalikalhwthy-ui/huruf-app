/* ============================================================
   auth-gate.js — شاشة الدخول + إدارة كلمة المرور
   الإصدار 2.0 — مع تخزين دائم في localStorage
   ============================================================ */
(function() {
  'use strict';

  /* ═══════════════ ⚙️ الإعدادات ═══════════════ */
  var DEFAULT_PASSWORD = '313';              // كلمة المرور الافتراضية
  var REMEMBER_HOURS   = 0;                  // 0 = كل مرة | 24 = يوم كامل
  var APP_TITLE        = 'أسرار وخصائص علم الحروف';
  var APP_SUBTITLE     = 'تحليل الأسماء • علم الجفر • تفسير الأحلام • الكاشف القرآني';
  var AUTHOR_NAME      = 'عبد الملك علي الحوثي';
  var FOUNDATION       = 'مؤسسة القائم الحجة';
  var COPYRIGHT        = '© 2026 — جميع الحقوق محفوظة';
  /* ═══════════════════════════════════════════ */

  var STORAGE_KEY     = 'auth_ts_v1';
  var PASSWORD_KEY    = 'app_password_v1';

  /* ═══ دوال كلمة المرور العامة (يمكن استخدامها من أي مكان) ═══ */
  window.getAppPassword = function() {
    try {
      var saved = localStorage.getItem(PASSWORD_KEY);
      return saved || DEFAULT_PASSWORD;
    } catch(e) { return DEFAULT_PASSWORD; }
  };

  window.setAppPassword = function(newPass) {
    try {
      localStorage.setItem(PASSWORD_KEY, newPass);
      return true;
    } catch(e) { return false; }
  };

  window.resetAppPassword = function() {
    try {
      localStorage.removeItem(PASSWORD_KEY);
      return true;
    } catch(e) { return false; }
  };

  window.hasCustomPassword = function() {
    try {
      var saved = localStorage.getItem(PASSWORD_KEY);
      return !!saved && saved !== DEFAULT_PASSWORD;
    } catch(e) { return false; }
  };

  /* ═══ التحقق من الجلسة ═══ */
  function isAuthenticated() {
    if (REMEMBER_HOURS <= 0) return false;
    try {
      var ts = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (!ts) return false;
      return (Date.now() - ts) < REMEMBER_HOURS * 3600 * 1000;
    } catch(e) { return false; }
  }

  /* ═══ بناء الشاشة ═══ */
  function buildHTML() {
    return '<style id="auth-gate-styles">' +
      '#auth-gate-overlay{position:fixed;inset:0;z-index:999999;background:radial-gradient(circle at 50% 30%, #3949AB 0%, #283593 40%, #0D1B5E 70%, #000 100%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Tajawal","Segoe UI",Tahoma,sans-serif;direction:rtl;transition:opacity .5s ease}' +
      '#auth-gate-overlay::before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 20% 30%, rgba(255,215,0,.08) 0%, transparent 40%),radial-gradient(circle at 80% 70%, rgba(255,215,0,.06) 0%, transparent 40%);pointer-events:none}' +
      '.auth-gate-card{position:relative;z-index:1;background:rgba(255,255,255,.04);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:2px solid rgba(255,215,0,.3);border-radius:24px;padding:32px 24px 24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 40px rgba(255,215,0,.15);text-align:center}' +
      '.auth-gate-logo{width:90px;height:90px;margin:0 auto 18px;border-radius:50%;background:linear-gradient(135deg,#FFE082,#FFD54F 50%,#FFB300);display:flex;align-items:center;justify-content:center;font-size:50px;font-weight:bold;color:#1A237E;font-family:"Amiri",serif;box-shadow:0 0 30px rgba(255,213,79,.5),0 8px 20px rgba(0,0,0,.4);animation:authPulse 2.5s ease-in-out infinite}' +
      '@keyframes authPulse{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(255,213,79,.5),0 8px 20px rgba(0,0,0,.4)}50%{transform:scale(1.05);box-shadow:0 0 50px rgba(255,213,79,.7),0 12px 25px rgba(0,0,0,.5)}}' +
      '.auth-gate-title{color:#fff;font-size:22px;font-weight:800;margin-bottom:6px;text-shadow:0 0 20px rgba(255,215,0,.4);letter-spacing:.5px}' +
      '.auth-gate-subtitle{color:rgba(255,215,0,.85);font-size:12.5px;margin-bottom:24px;line-height:1.7}' +
      '.auth-gate-info{background:rgba(255,255,255,.06);border:1px dashed rgba(255,215,0,.4);border-radius:14px;padding:14px 16px;margin-bottom:22px}' +
      '.auth-gate-info-label{color:rgba(255,255,255,.6);font-size:11.5px;margin-bottom:6px;letter-spacing:1px}' +
      '.auth-gate-author{color:#FFD54F;font-size:18px;font-weight:800;margin-bottom:4px;text-shadow:0 0 15px rgba(255,213,79,.5)}' +
      '.auth-gate-foundation{color:rgba(255,255,255,.9);font-size:13.5px;font-weight:600}' +
      '.auth-gate-input-wrap{position:relative;margin-bottom:14px}' +
      '#auth-password-input{width:100%;padding:16px 50px 16px 18px;background:rgba(255,255,255,.95);border:2px solid rgba(255,215,0,.5);border-radius:14px;font-size:17px;text-align:center;letter-spacing:4px;color:#1A237E;outline:none;font-family:inherit;font-weight:600;transition:border-color .2s,box-shadow .2s}' +
      '#auth-password-input:focus{border-color:#FFD54F;box-shadow:0 0 0 4px rgba(255,213,79,.25)}' +
      '#auth-password-input::placeholder{letter-spacing:1px;color:#999;font-weight:400}' +
      '.auth-gate-lock-icon{position:absolute;top:50%;right:16px;transform:translateY(-50%);font-size:20px;pointer-events:none}' +
      '#auth-submit-btn{width:100%;padding:16px;background:linear-gradient(135deg,#FFB300,#FFC107 50%,#FFD54F);color:#1A237E;border:none;border-radius:14px;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit;letter-spacing:.5px;box-shadow:0 6px 20px rgba(255,179,0,.4);transition:all .2s}' +
      '#auth-submit-btn:active{transform:scale(.97);box-shadow:0 3px 10px rgba(255,179,0,.3)}' +
      '#auth-error{color:#FF5252;font-size:13px;font-weight:700;margin-top:10px;min-height:18px;opacity:0;transition:opacity .3s}' +
      '.auth-gate-footer{color:rgba(255,255,255,.5);font-size:11px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1)}' +
      '@media (max-width:480px){.auth-gate-card{padding:26px 18px 18px;border-radius:20px}.auth-gate-logo{width:76px;height:76px;font-size:42px}.auth-gate-title{font-size:19px}.auth-gate-author{font-size:16px}}' +
      '</style>' +
      '<div id="auth-gate-overlay">' +
      '<div class="auth-gate-card">' +
      '<div class="auth-gate-logo">ع</div>' +
      '<div class="auth-gate-title">' + APP_TITLE + '</div>' +
      '<div class="auth-gate-subtitle">' + APP_SUBTITLE + '</div>' +
      '<div class="auth-gate-info">' +
      '<div class="auth-gate-info-label">إعداد وتطوير</div>' +
      '<div class="auth-gate-author">' + AUTHOR_NAME + '</div>' +
      '<div class="auth-gate-foundation">' + FOUNDATION + '</div>' +
      '</div>' +
      '<div class="auth-gate-input-wrap">' +
      '<input type="password" id="auth-password-input" placeholder="أدخل كلمة المرور" autocomplete="off">' +
      '<span class="auth-gate-lock-icon">🔒</span>' +
      '</div>' +
      '<button id="auth-submit-btn">دخول ←</button>' +
      '<div id="auth-error"></div>' +
      '<div class="auth-gate-footer">' + COPYRIGHT + '</div>' +
      '</div>' +
      '</div>';
  }

  /* ═══ التحقق من كلمة المرور ═══ */
  function submitPassword() {
    var input = document.getElementById('auth-password-input');
    var err = document.getElementById('auth-error');
    if (!input) return;

    var val = input.value.trim();
    var correctPass = window.getAppPassword();

    if (val === correctPass) {
      try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch(e) {}
      var overlay = document.getElementById('auth-gate-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(function() {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 500);
      }
    } else {
      if (err) {
        err.textContent = '❌ كلمة المرور غير صحيحة';
        err.style.opacity = '1';
        input.value = '';
        input.focus();
        setTimeout(function() { err.style.opacity = '0'; }, 2500);
      }
    }
  }

  /* ═══ حقن الشاشة ═══ */
  function inject() {
    if (isAuthenticated()) return;
    if (document.getElementById('auth-gate-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', buildHTML());
    setTimeout(function() {
      var input = document.getElementById('auth-password-input');
      var btn = document.getElementById('auth-submit-btn');
      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            submitPassword();
          }
        });
        try { input.focus(); } catch(e) {}
      }
      if (btn) btn.addEventListener('click', submitPassword);
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
