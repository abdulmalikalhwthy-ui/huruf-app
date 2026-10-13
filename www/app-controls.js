/* ============================================================
   app-controls.js — التحكم بأزرار الرجوع والخروج
   ============================================================ */
(function() {
  'use strict';

  /* ═══ دالة الخروج المُحسّنة ═══ */
  window.confirmExit = function() {
    var confirmed = confirm("هل تريد الخروج من التطبيق؟");
    if (!confirmed) return;

    /* ① Cordova Standard API */
    try {
      if (navigator.app && typeof navigator.app.exitApp === 'function') {
        navigator.app.exitApp();
        return;
      }
    } catch (e) { console.warn('exitApp #1:', e); }

    /* ② Android JS Bridge */
    try {
      if (window.Android && typeof window.Android.exitApp === 'function') {
        window.Android.exitApp();
        return;
      }
    } catch (e) { }

    /* ③ Capacitor */
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (e) { }

    /* ④ فشل الكل */
    if (typeof window.showToast === 'function') {
      window.showToast("لإغلاق التطبيق، اضغط زر الخروج في الهاتف");
    }
  };

  /* ═══ معالج زر الرجوع في الأندرويد ═══ */
  function onBackButton(e) {
    if (e && e.preventDefault) e.preventDefault();

    /* ① إذا كان هناك شاشة فرعية مفتوحة → ارجع للرئيسية */
    var active = document.querySelector('.screen.active');
    if (active && active.id !== 'screen-home') {
      if (typeof window.goHome === 'function') {
        window.goHome();
      } else {
        document.querySelectorAll('.screen').forEach(function(s) {
          s.classList.remove('active');
        });
        var home = document.getElementById('screen-home');
        if (home) home.classList.add('active');
      }
      return;
    }

    /* ② نحن في الرئيسية → اسأل عن الخروج */
    window.confirmExit();
  }

  /* ═══ تسجيل المعالج بعد deviceready ═══ */
  function onDeviceReady() {
    document.addEventListener('backbutton', onBackButton, false);
    console.log('[app-controls] ✅ backbutton مسجّل');
  }

  if (window.cordova) {
    document.addEventListener('deviceready', onDeviceReady, false);
  } else {
    /* fallback: سجّل بعد 500ms */
    setTimeout(function() {
      document.addEventListener('backbutton', onBackButton, false);
    }, 500);
  }

  console.log('[app-controls] ✅ تم تحميل الملف');
})();
