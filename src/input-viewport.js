// Remember the view before the keyboard opens, rather than forcing every user
// back to 100% (they may already have zoomed in deliberately).
export function restoreInputViewport(input) {
  const viewport = document.querySelector('meta[name="viewport"]');
  let before;
  let restoreTimer;
  let originalViewport;
  const release = () => {
    clearTimeout(restoreTimer);
    if (originalViewport !== undefined) {
      viewport.setAttribute('content', originalViewport);
      originalViewport = undefined;
    }
  };
  const remember = () => {
    release();
    before = window.visualViewport && {
      scale: window.visualViewport.scale,
      width: window.innerWidth,
      x: window.scrollX,
      y: window.scrollY,
      pinched: false,
    };
  };
  input.addEventListener('pointerdown', () => {
    if (document.activeElement !== input) remember();
  });
  input.addEventListener('focus', () => { if (!before) remember(); });
  // A new interaction takes precedence over the pending return to the old view.
  document.addEventListener('pointerdown', release, {passive: true});
  document.addEventListener('touchstart', event => {
    if (event.touches.length > 1) {
      if (before) before.pinched = true;
      release();
    }
  }, {passive: true});
  input.addEventListener('blur', () => {
    const saved = before;
    before = undefined;
    if (!viewport || !saved || saved.pinched || window.innerWidth !== saved.width ||
        window.visualViewport.scale <= saved.scale + 0.05) return;
    // Safari can retain its automatic focus zoom after blur. Briefly request
    // the previous scale, then remove the cap so manual zoom remains available.
    originalViewport = viewport.getAttribute('content');
    const settings = originalViewport.split(',').filter(part =>
      !/^\s*(initial-scale|maximum-scale)\s*=/i.test(part));
    viewport.setAttribute('content', [...settings,
      `initial-scale=${saved.scale}`, `maximum-scale=${saved.scale}`].join(','));
    restoreTimer = setTimeout(() => {
      release();
      if (!document.activeElement?.matches('input,select,textarea')) {
        window.scrollTo({left: saved.x, top: saved.y, behavior: 'instant'});
      }
    }, 300);
  });
}
