// OMI 산출물 — 라이트/다크 토글. 기본 라이트(리뷰 기준), 선택은 유지된다.
(function () {
  var KEY = 'omi-doc-theme';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* 저장 불가 환경 무시 */ }
  var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
  document.documentElement.setAttribute('data-theme', theme);

  function paint() {
    document.querySelectorAll('.doc-theme button').forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.theme === document.documentElement.getAttribute('data-theme'));
    });
  }

  function mount() {
    document.querySelectorAll('.doc-nav').forEach(function (nav) {
      if (nav.querySelector('.doc-theme')) return;
      var wrap = document.createElement('div');
      wrap.className = 'doc-theme';
      wrap.innerHTML = '<button type="button" data-theme="light">라이트</button><button type="button" data-theme="dark">다크</button>';
      nav.appendChild(wrap);
    });
    document.querySelectorAll('.doc-theme button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.documentElement.setAttribute('data-theme', b.dataset.theme);
        try { localStorage.setItem(KEY, b.dataset.theme); } catch (e) { /* 무시 */ }
        paint();
      });
    });
    paint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  // 프로덕션 포(1180px)에서 레이아웃한 프레임을 미리보기 포에 맞게 축소한다.
  // zoom 은 DOM 래스토라이저가 재현하지 못하고 상태 문자 지줌을 오역해 쓰지 않는다.
  // transform: scale 은 바르게 래스텀리되지만 부모 높이를 차지하지 않으므로 보정한다.
  var DESIGN_W = 1180;
  function fitTrue() {
    document.querySelectorAll('.pv-true').forEach(function (box) {
      var frame = box.querySelector('.pv-frame');
      if (!frame) return;
      var s = Math.min(1, box.clientWidth / DESIGN_W);
      frame.style.setProperty('--pv-s', s);
      box.style.height = Math.round(frame.offsetHeight * s) + 'px';
    });
  }
  window.__fitTrue = fitTrue;
  window.addEventListener('load', fitTrue);
  window.addEventListener('resize', fitTrue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTrue);
  if (document.readyState !== 'loading') fitTrue();
})();
