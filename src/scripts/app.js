/**
 * Client-side progressive enhancement for ATEMPO COFFEE campaign pages:
 * - Spec selector switching (price, unit, variant stock override; marketPrice stays fixed)
 * - Inventory filter bar
 * - Copy-to-LINE order helper with accessible Popover toast + aria-live announcement
 * - Native <dialog> Story Drawer & Lightbox with closedby fallback and top-layer exit fallback
 */
(function () {
  'use strict';

  const dataEl = document.getElementById('campaign-beans-data');
  if (!dataEl) return;

  let beansData = {};
  try {
    beansData = JSON.parse(dataEl.textContent || '{}');
  } catch {
    return;
  }

  const selectedVariantByBean = {};
  for (const [beanId, bean] of Object.entries(beansData)) {
    selectedVariantByBean[beanId] = bean.defaultKey;
  }

  // -------------------- Spec Switcher --------------------
  function updateBeanCardVariant(beanId, variantKey) {
    const bean = beansData[beanId];
    if (!bean || !bean.variants[variantKey]) return;

    selectedVariantByBean[beanId] = variantKey;
    const variant = bean.variants[variantKey];
    const card = document.getElementById(beanId);
    if (!card) return;

    // Update spec button aria-pressed states
    const buttons = card.querySelectorAll('[data-spec-btn]');
    buttons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-variant-key') === variantKey;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Update price & unit (marketPrice stays permanently visible!)
    const priceEl = card.querySelector('[data-bean-price]');
    const unitEl = card.querySelector('[data-bean-unit]');
    if (priceEl) priceEl.textContent = String(variant.price);
    if (unitEl) {
      const unitLabel = variant.unit ? `${variant.label}（${variant.unit}）` : variant.label;
      unitEl.textContent = `/ ${unitLabel}`;
    }

    // Update stock badges (in header & price box)
    const stock = variant.stock;
    const headerPill = card.querySelector('[data-header-stock-pill]');
    const boxPill = card.querySelector('[data-box-stock-pill]');
    [headerPill, boxPill].forEach((pill, index) => {
      if (!pill) return;
      const baseClass =
        index === 0
          ? `pill-tag text-xs ${stock.badgeClass}`
          : `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stock.badgeClass}`;
      pill.className = baseClass;
      const dot = pill.querySelector('span:first-child');
      const text = pill.querySelector('[data-stock-text]');
      if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${stock.dotClass}`;
      if (text) text.textContent = stock.label;
    });

    // Update copy button state
    const copyBtn = card.querySelector('[data-copy-bean]');
    const copyLabel = card.querySelector('[data-copy-label]');
    if (copyBtn && copyLabel) {
      if (stock.isSoldOut) {
        copyBtn.disabled = true;
        copyBtn.setAttribute('aria-disabled', 'true');
        copyBtn.className =
          'mt-4 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors bg-stone-200 text-stone-500 cursor-not-allowed';
        copyLabel.textContent = '本品項已完售';
      } else {
        copyBtn.disabled = false;
        copyBtn.removeAttribute('aria-disabled');
        copyBtn.className =
          'mt-4 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors btn-secondary-ghost cursor-pointer';
        copyLabel.textContent = '複製豆名規格（貼至 LINE 訂購）';
      }
    }
  }

  document.addEventListener('click', (event) => {
    const specBtn = event.target.closest('[data-spec-btn]');
    if (specBtn) {
      const beanId = specBtn.getAttribute('data-bean-id');
      const variantKey = specBtn.getAttribute('data-variant-key');
      if (beanId && variantKey) {
        updateBeanCardVariant(beanId, variantKey);
      }
      return;
    }

    const copyBtn = event.target.closest('[data-copy-bean]');
    if (copyBtn && !copyBtn.disabled) {
      const beanId = copyBtn.getAttribute('data-copy-bean');
      handleCopyBeanOrder(beanId);
      return;
    }

    const filterBtn = event.target.closest('[data-filter-btn]');
    if (filterBtn) {
      applyBeanFilter(filterBtn.getAttribute('data-filter-btn'));
      return;
    }

    const storyBtn = event.target.closest('[data-open-story]');
    if (storyBtn) {
      openStoryDialog(storyBtn.getAttribute('data-open-story'));
      return;
    }

    const zoomBtn = event.target.closest('[data-open-lightbox]');
    if (zoomBtn) {
      openLightbox(
        zoomBtn.getAttribute('data-img-src'),
        zoomBtn.getAttribute('data-img-caption') || ''
      );
    }
  });

  // -------------------- Inventory Filter --------------------
  function applyBeanFilter(filter) {
    const filterButtons = document.querySelectorAll('[data-filter-btn]');
    filterButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-filter-btn') === filter ? 'true' : 'false');
    });

    const cards = document.querySelectorAll('[data-bean-card]');
    let visibleCount = 0;

    cards.forEach((card) => {
      const kind = card.getAttribute('data-stock-kind');
      let show = true;
      if (filter === 'available') {
        show = kind !== 'sold_out' && kind !== 'zero';
      } else if (filter === 'in_stock') {
        show = kind === 'in_stock';
      } else if (filter === 'roast_to_order') {
        show = kind === 'roast_to_order';
      }
      card.hidden = !show;
      if (show) visibleCount += 1;
    });

    const countEl = document.querySelector('[data-filter-count]');
    if (countEl) {
      countEl.textContent = `顯示 ${visibleCount} 款豆子`;
    }
  }

  // -------------------- Copy to LINE & Popover Toast --------------------
  const toastEl = document.getElementById('copy-toast');
  const toastTextEl = document.getElementById('copy-toast-text');
  const announcerEl = document.getElementById('sr-announcer');
  let toastTimer = null;

  // Feature-detect native popover support (modern-web-guidance: persistent-toast-notifications)
  if (toastEl && !Object.hasOwn(HTMLElement.prototype, 'popover')) {
    const polyfill = document.createElement('script');
    polyfill.src = 'https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js';
    document.head.appendChild(polyfill);
  }

  function announce(message) {
    if (typeof window.ariaNotify === 'function') {
      window.ariaNotify(message);
    } else if (announcerEl) {
      announcerEl.textContent = '';
      requestAnimationFrame(() => {
        announcerEl.textContent = message;
      });
    }
  }

  function showCopyToast(message) {
    announce(message);
    if (!toastEl || !toastTextEl) return;
    toastTextEl.textContent = message;

    // Avoid surfacing toast while modal dialog is open
    if (storyDialog && storyDialog.open) return;

    if (typeof toastEl.showPopover === 'function') {
      try {
        toastEl.showPopover();
      } catch {
        toastEl.setAttribute('open', '');
      }
    } else {
      toastEl.classList.add(':popover-open');
    }

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastEl.matches(':focus-within')) return;
      hideCopyToast();
    }, 4500);
  }

  function hideCopyToast() {
    if (!toastEl) return;
    if (typeof toastEl.hidePopover === 'function') {
      try {
        toastEl.hidePopover();
      } catch {
        // ignore if already hidden
      }
    } else {
      toastEl.classList.remove(':popover-open');
    }
  }

  async function handleCopyBeanOrder(beanId) {
    const bean = beansData[beanId];
    if (!bean) return;
    const key = selectedVariantByBean[beanId] || bean.defaultKey;
    const variant = bean.variants[key];
    if (!variant) return;

    const unitText = variant.unit ? `${variant.label}（${variant.unit}）` : variant.label;
    const orderText = `我想訂購：#${bean.number} ${bean.name}｜${unitText}｜NT$ ${variant.price}`;

    try {
      await navigator.clipboard.writeText(orderText);
      showCopyToast(`已複製「#${bean.number} ${unitText}」，可直接貼至官方 LINE 傳送！`);
    } catch {
      window.prompt('請複製以下品項資訊並貼至官方 LINE：', orderText);
    }
  }

  // -------------------- Top-layer <dialog> helpers (modern-web-guidance: dialog, light-dismiss-a-dialog, animate-to-from-top-layer) --------------------
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS && window.CSS.supports && window.CSS.supports('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(dialogEl) {
    if (!dialogEl || !dialogEl.open) return;
    if (!supportsTopLayerExit()) {
      dialogEl.setAttribute('data-closing', '');
      const animations = typeof dialogEl.getAnimations === 'function' ? dialogEl.getAnimations({ subtree: true }) : [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 400))
        ]);
      }
      if (!dialogEl.hasAttribute('data-closing')) return;
      dialogEl.removeAttribute('data-closing');
    }
    dialogEl.close();
  }

  function installDialogEnhancements(dialogEl) {
    if (!dialogEl) return;

    // Route Esc cancel through animated exit
    dialogEl.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialogEl);
    });

    // Fallback light-dismiss for browsers without <dialog closedby="any"> (e.g. Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e) => {
        const r = dialogEl.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      dialogEl.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e);
      });
      dialogEl.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e)) {
          closeTopLayer(dialogEl);
        }
      });
    }
  }

  // -------------------- Story Drawer <dialog> --------------------
  const storyDialog = document.getElementById('story-dialog');
  const storyMetaEl = document.getElementById('story-dialog-meta');
  const storyTitleEl = document.getElementById('story-dialog-title');
  const storyBodyEl = document.getElementById('story-dialog-body');
  const closeStoryBtn = document.querySelector('[data-close-story]');

  installDialogEnhancements(storyDialog);
  if (closeStoryBtn) {
    closeStoryBtn.addEventListener('click', () => closeTopLayer(storyDialog));
  }

  function openStoryDialog(beanId) {
    const bean = beansData[beanId];
    if (!bean || !storyDialog || !storyBodyEl) return;

    storyMetaEl.textContent = `#${bean.number} ・ ${bean.country}${bean.processBadge ? ` ・ ${bean.processBadge}` : ''}`;
    storyTitleEl.textContent = bean.name;

    storyBodyEl.textContent = '';

    if (bean.quote) {
      const bq = document.createElement('blockquote');
      bq.className = 'text-lg sm:text-xl font-serif font-bold text-primary pl-4 border-l-2 border-primary/45 leading-snug';
      bq.textContent = bean.quote;
      storyBodyEl.appendChild(bq);
    }

    if (bean.story) {
      const paragraphs = String(bean.story)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const storyWrap = document.createElement('div');
      storyWrap.className = 'space-y-4 text-sm sm:text-base text-on-surface leading-relaxed';
      paragraphs.forEach((pText) => {
        const p = document.createElement('p');
        p.textContent = pText;
        storyWrap.appendChild(p);
      });
      storyBodyEl.appendChild(storyWrap);
    }

    if (Array.isArray(bean.storyImages) && bean.storyImages.length > 0) {
      const gallerySection = document.createElement('div');
      gallerySection.className = 'pt-4 border-t border-outline-ghost';

      const heading = document.createElement('h3');
      heading.className = 'text-sm font-bold tracking-wider uppercase text-on-surface-variant mb-4';
      heading.textContent = `產地與處理過程影像（${bean.storyImages.length} 張，點擊可放大）`;
      gallerySection.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = bean.storyImages.length === 1 ? 'grid grid-cols-1 gap-4' : 'grid sm:grid-cols-2 gap-4';

      bean.storyImages.forEach((imgItem) => {
        const figure = document.createElement('figure');
        figure.className = 'bg-surface-low rounded-2xl overflow-hidden border border-outline-ghost';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'block w-full text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-primary';
        btn.setAttribute('data-open-lightbox', 'true');
        btn.setAttribute('data-img-src', imgItem.src);
        btn.setAttribute('data-img-caption', imgItem.caption || bean.name);

        const imgWrap = document.createElement('div');
        imgWrap.className = 'aspect-[3/2] bg-surface-container overflow-hidden';

        const img = document.createElement('img');
        img.src = imgItem.src;
        img.alt = imgItem.caption || bean.name;
        img.loading = 'lazy';
        img.className = 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]';
        imgWrap.appendChild(img);
        btn.appendChild(imgWrap);

        if (imgItem.caption) {
          const cap = document.createElement('figcaption');
          cap.className = 'px-4 py-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed';
          cap.textContent = imgItem.caption;
          btn.appendChild(cap);
        }

        figure.appendChild(btn);
        grid.appendChild(figure);
      });

      gallerySection.appendChild(grid);
      storyBodyEl.appendChild(gallerySection);
    }

    storyDialog.removeAttribute('data-closing');
    storyDialog.showModal();
  }

  // -------------------- Lightbox <dialog> --------------------
  const lightboxDialog = document.getElementById('lightbox-dialog');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.querySelector('[data-close-lightbox]');

  installDialogEnhancements(lightboxDialog);
  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener('click', () => closeTopLayer(lightboxDialog));
  }

  function openLightbox(src, caption) {
    if (!lightboxDialog || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
      lightboxCaption.hidden = !caption;
    }
    lightboxDialog.removeAttribute('data-closing');
    lightboxDialog.showModal();
  }
})();
