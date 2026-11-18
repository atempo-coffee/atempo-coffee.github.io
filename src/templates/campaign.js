const {
  escapeHtml,
  resolveBeanVariants,
  resolveAssetPath,
  renderCampaignTitleHtml,
  ICONS
} = require('./helpers');
const { renderPageShell } = require('./layout');

function renderPromotionBanner(promotion) {
  if (!promotion || promotion.enabled === false || !promotion.title) return '';

  return `
  <section aria-label="當期優惠活動" class="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
    <div class="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-primary-container/55 via-surface-low to-tertiary-container/55 border border-primary/15 shadow-ambient-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-3.5">
        <span class="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
          ${ICONS.sparkles}
        </span>
        <div>
          ${promotion.badge ? `<span class="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-0.5">${escapeHtml(promotion.badge)}</span>` : ''}
          <p class="font-editorial text-lg sm:text-xl font-extrabold text-on-surface">${escapeHtml(promotion.title)}</p>
          ${promotion.subtitle ? `<p class="text-xs sm:text-sm text-on-surface-variant mt-0.5">${escapeHtml(promotion.subtitle)}</p>` : ''}
        </div>
      </div>
      ${promotion.period ? `<span class="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-surface-lowest text-xs font-bold text-primary border border-outline-ghost shrink-0">${escapeHtml(promotion.period)}</span>` : ''}
    </div>
  </section>`;
}

function renderBeanTitleHtml(bean) {
  if (Array.isArray(bean.nameLines) && bean.nameLines.length > 0) {
    return bean.nameLines
      .map((line) => `<span class="block">${escapeHtml(line)}</span>`)
      .join('');
  }
  return escapeHtml(bean.name);
}

function renderBeanCard(bean, rootPrefix) {
  const { variants, defaultVariant } = resolveBeanVariants(bean);
  const currentStock = defaultVariant.stock;
  const isSoldOutBean = currentStock.kind === 'sold_out';
  const storyImages = Array.isArray(bean.storyImages) ? bean.storyImages : [];
  const summaryText =
    bean.storySummary ||
    (bean.story ? String(bean.story).replace(/\s+/g, ' ').trim().slice(0, 120) + '…' : '');
  const storyButtonLabel =
    storyImages.length > 0
      ? `閱讀完整產區故事・含 ${storyImages.length} 張產地影像`
      : '閱讀完整產區故事';

  const variantButtonsHtml = variants
    .map((v) => {
      const isSelected = v.key === defaultVariant.key;
      return `<button
        type="button"
        class="spec-btn px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer"
        aria-pressed="${isSelected ? 'true' : 'false'}"
        data-spec-btn
        data-bean-id="${escapeHtml(bean.id)}"
        data-variant-key="${escapeHtml(v.key)}"
      >${escapeHtml(v.label)}</button>`;
    })
    .join('');

  const unitLabel = defaultVariant.unit
    ? `${defaultVariant.label}（${defaultVariant.unit}）`
    : defaultVariant.label;

  return `
  <article
    class="curator-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 relative overflow-hidden ${isSoldOutBean ? 'opacity-90' : ''}"
    id="${escapeHtml(bean.id)}"
    data-bean-card
    data-stock-kind="${escapeHtml(currentStock.kind)}"
  >
    <!-- 豆款標頭與價格規格區 -->
    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-7 mb-8 pb-8 border-b border-outline-ghost">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2.5 mb-3.5 flex-wrap">
          <span class="w-8 h-8 rounded-full bg-surface-low text-on-surface font-mono font-bold text-sm flex items-center justify-center border border-outline-ghost">${escapeHtml(bean.number)}</span>
          ${bean.flag ? `<span class="text-xl" aria-hidden="true">${escapeHtml(bean.flag)}</span>` : ''}
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">${escapeHtml(bean.country)}</span>
          ${bean.processBadge ? `<span class="pill-tag bg-surface-low text-tertiary text-xs">${escapeHtml(bean.processBadge)}</span>` : ''}
          <span
            data-header-stock-pill
            class="pill-tag text-xs ${escapeHtml(currentStock.badgeClass)}"
          >
            <span class="w-1.5 h-1.5 rounded-full ${escapeHtml(currentStock.dotClass)}" aria-hidden="true"></span>
            <span data-stock-text>${escapeHtml(currentStock.label)}</span>
          </span>
        </div>

        <h3 class="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface mb-2 leading-snug title-keep-cjk">
          ${renderBeanTitleHtml(bean)}
        </h3>
        ${bean.nameEn ? `<p class="font-mono text-xs sm:text-sm text-on-surface-variant font-medium tracking-wide mb-5">${escapeHtml(bean.nameEn)}</p>` : ''}

        ${
          Array.isArray(bean.tags) && bean.tags.length
            ? `<div class="flex flex-wrap gap-2">
                ${bean.tags.map((tag) => `<span class="pill-tag bg-surface-low text-primary text-xs sm:text-sm">${escapeHtml(tag)}</span>`).join('')}
              </div>`
            : ''
        }
      </div>

      <!-- 規格選擇 + 固定行情價 + 動態售價與庫存卡片 -->
      <div class="bg-surface-low p-5 sm:p-6 rounded-2xl border border-outline-ghost lg:w-[340px] shrink-0">
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-xs font-bold tracking-wider uppercase text-on-surface-variant">選擇規格</span>
          ${
            bean.marketPrice
              ? `<span class="text-xs font-medium text-on-surface-variant line-through">半磅行情價 NT$ ${escapeHtml(bean.marketPrice)}</span>`
              : ''
          }
        </div>

        <div class="flex flex-wrap gap-2 mb-5" role="group" aria-label="${escapeHtml(bean.name)} 販售規格">
          ${variantButtonsHtml}
        </div>

        <div class="flex items-end justify-between gap-3 pt-4 border-t border-outline-ghost">
          <div>
            <span class="text-[11px] font-bold text-primary block mb-0.5">特惠價</span>
            <div class="flex items-baseline gap-1 text-primary">
              <span class="text-xs font-bold">NT$</span>
              <span class="font-mono text-3xl sm:text-4xl font-extrabold number-display" data-bean-price>${escapeHtml(defaultVariant.price)}</span>
            </div>
            <span class="text-xs text-on-surface-variant font-medium block mt-0.5" data-bean-unit>/ ${escapeHtml(unitLabel)}</span>
          </div>

          <div class="text-right">
            <span class="text-[11px] text-on-surface-variant block mb-1">庫存狀態</span>
            <span
              data-box-stock-pill
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${escapeHtml(currentStock.badgeClass)}"
            >
              <span class="w-1.5 h-1.5 rounded-full ${escapeHtml(currentStock.dotClass)}" aria-hidden="true"></span>
              <span data-stock-text>${escapeHtml(currentStock.label)}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          data-copy-bean="${escapeHtml(bean.id)}"
          ${currentStock.isSoldOut ? 'disabled aria-disabled="true"' : ''}
          class="mt-4 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors ${
            currentStock.isSoldOut
              ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
              : 'btn-secondary-ghost cursor-pointer'
          }"
        >
          ${ICONS.copy}
          <span data-copy-label>${currentStock.isSoldOut ? '本品項已完售' : '複製豆名規格（貼至 LINE 訂購）'}</span>
        </button>
      </div>
    </div>

    <!-- 策展引言與故事摘要 + 閱讀抽屜按鈕 -->
    <div class="mb-9">
      ${
        bean.quote
          ? `<blockquote class="text-lg sm:text-2xl font-serif font-bold text-primary mb-4 pl-4 border-l-2 border-primary/45 leading-snug">
              ${escapeHtml(bean.quote)}
            </blockquote>`
          : ''
      }
      ${
        summaryText
          ? `<p class="text-sm sm:text-base text-on-surface leading-relaxed mb-4">
              ${escapeHtml(summaryText)}
            </p>`
          : ''
      }
      <button
        type="button"
        data-open-story="${escapeHtml(bean.id)}"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-low hover:bg-surface-container text-primary text-xs sm:text-sm font-bold border border-outline-ghost transition-colors cursor-pointer"
      >
        ${storyImages.length > 0 ? ICONS.camera : ICONS.bookOpen}
        <span>${escapeHtml(storyButtonLabel)}</span>
        ${ICONS.arrowRight}
      </button>
    </div>

    <!-- 適合這樣的你（手機緊湊排版） -->
    ${
      Array.isArray(bean.suitable) && bean.suitable.length
        ? `<div class="bg-surface-low rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-9 border border-outline-ghost">
            <h4 class="text-sm sm:text-base font-bold tracking-wider text-on-surface mb-4 sm:mb-5 flex items-center gap-2.5">
              <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-lowest text-primary flex items-center justify-center shadow-ambient-sm">
                ${ICONS.userCheck}
              </span>
              <span>適合這樣的你</span>
            </h4>
            <div class="grid md:grid-cols-3 gap-4 sm:gap-6">
              ${bean.suitable
                .map(
                  (text, idx) => `
                <div class="flex gap-3 items-start bg-surface-lowest/80 p-4 rounded-2xl border border-outline-ghost">
                  <span class="font-mono font-extrabold text-primary text-lg leading-none pt-0.5">0${idx + 1}</span>
                  <p class="text-sm sm:text-base text-on-surface leading-relaxed">${escapeHtml(text)}</p>
                </div>`
                )
                .join('')}
            </div>
          </div>`
        : ''
    }

    <!-- 產區深度履歷與感官風味筆記 -->
    <div class="grid md:grid-cols-2 gap-8 pt-8 border-t border-outline-ghost">
      <div>
        <h4 class="text-sm sm:text-base font-bold tracking-wider text-on-surface mb-4 flex items-center gap-2.5">
          <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-low text-primary flex items-center justify-center border border-outline-ghost">
            ${ICONS.compass}
          </span>
          <span>產區深度履歷</span>
        </h4>
        <ul class="space-y-2 text-sm sm:text-base">
          ${(bean.details || [])
            .map(
              (d, idx, arr) => `
            <li class="flex justify-between items-center gap-4 py-2 ${idx < arr.length - 1 ? 'border-b border-outline-ghost' : ''}">
              <span class="text-on-surface-variant font-medium shrink-0">${escapeHtml(d.label)}</span>
              <span class="font-semibold text-on-surface text-right">${escapeHtml(d.value)}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>

      <div>
        <h4 class="text-sm sm:text-base font-bold tracking-wider text-on-surface mb-4 flex items-center gap-2.5">
          <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-low text-primary flex items-center justify-center border border-outline-ghost">
            ${ICONS.cup}
          </span>
          <span>感官風味筆記</span>
        </h4>
        ${
          Array.isArray(bean.flavorChips) && bean.flavorChips.length
            ? `<div class="flex flex-wrap gap-2 mb-4">
                ${bean.flavorChips.map((chip) => `<span class="px-3.5 py-1.5 bg-surface-low rounded-xl text-xs sm:text-sm font-semibold text-on-surface border border-outline-ghost">${escapeHtml(chip)}</span>`).join('')}
              </div>`
            : ''
        }
        ${
          bean.flavorSummary
            ? `<p class="text-on-surface text-sm sm:text-base leading-relaxed bg-surface-low/60 p-4 rounded-2xl border border-outline-ghost">
                ${escapeHtml(bean.flavorSummary)}
              </p>`
            : ''
        }
      </div>
    </div>
  </article>`;
}

function renderCampaignPage({ siteConfig, campaign }) {
  const { site } = siteConfig;
  const rootPrefix = '../../';
  const beans = Array.isArray(campaign.beans) ? campaign.beans : [];
  const hasMyship = Boolean(campaign.myshipUrl && String(campaign.myshipUrl).trim());

  // Build normalized client payload for spec switcher, copy-to-LINE, and Story Drawer
  const clientBeansPayload = {};
  for (const bean of beans) {
    const { variants, defaultKey } = resolveBeanVariants(bean);
    const variantsMap = {};
    for (const v of variants) {
      variantsMap[v.key] = v;
    }
    clientBeansPayload[bean.id] = {
      id: bean.id,
      number: bean.number,
      flag: bean.flag || '',
      country: bean.country || '',
      processBadge: bean.processBadge || '',
      name: bean.name,
      nameEn: bean.nameEn || '',
      quote: bean.quote || '',
      story: bean.story || '',
      storyImages: (bean.storyImages || []).map((img) => ({
        src: resolveAssetPath(img.src, rootPrefix),
        caption: img.caption || ''
      })),
      details: bean.details || [],
      defaultKey,
      variants: variantsMap
    };
  }

  const navActionsHtml = `
    <a href="${rootPrefix}index.html" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
      ${ICONS.arrowLeft}
      <span>回首頁</span>
    </a>
    ${
      hasMyship
        ? `<a href="${escapeHtml(campaign.myshipUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary-ghost px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5">
            ${ICONS.shoppingBag}
            <span>7-11 賣貨便</span>
          </a>`
        : ''
    }
  `;

  const anchorPillsHtml = beans
    .map((bean) => {
      const { defaultVariant } = resolveBeanVariants(bean);
      const stock = defaultVariant.stock;
      const isSoldOut = stock.kind === 'sold_out';
      const shortName = bean.shortName || `${bean.country} ${bean.processBadge || ''}`.trim();
      return `<a href="#${escapeHtml(bean.id)}" class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        isSoldOut
          ? 'bg-stone-100 text-stone-500 border-stone-200'
          : 'bg-surface-low hover:bg-surface-container text-on-surface border-outline-ghost'
      }">#${escapeHtml(bean.number)} ${escapeHtml(shortName)} <span class="opacity-75">(${escapeHtml(stock.label)})</span></a>`;
    })
    .join('');

  const introBannerHtml = campaign.introBanner
    ? `<div class="bg-surface-low rounded-3xl p-5 sm:p-7 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-ghost">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-2xl bg-surface-lowest flex items-center justify-center text-primary shadow-ambient-sm shrink-0">
            ${ICONS.sparkles}
          </div>
          <div>
            <h2 class="font-editorial text-lg sm:text-xl font-bold text-on-surface">${escapeHtml(campaign.introBanner.title)}</h2>
            <p class="text-xs sm:text-sm text-on-surface-variant mt-0.5">${escapeHtml(campaign.introBanner.subtitle)}</p>
          </div>
        </div>
        ${
          campaign.introBanner.tag
            ? `<span class="self-start md:self-center px-4 py-2 rounded-xl bg-surface-lowest text-xs font-bold text-primary tracking-wider uppercase border border-outline-ghost shadow-ambient-sm shrink-0">
                ${escapeHtml(campaign.introBanner.tag)}
              </span>`
            : ''
        }
      </div>`
    : '';

  const mainHtml = `
  <section class="pt-12 pb-10 sm:pt-20 sm:pb-14 px-4 sm:px-6 max-w-5xl mx-auto text-center">
    ${
      campaign.badge
        ? `<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-low border border-outline-ghost mb-6 text-xs font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
            <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span>${escapeHtml(campaign.badge)}</span>
          </div>`
        : ''
    }

    <h1 class="font-editorial text-3xl sm:text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.16] mb-5 title-keep-cjk">
      ${renderCampaignTitleHtml(campaign.title)}
    </h1>

    ${
      campaign.subtitle
        ? `<p class="text-on-surface-variant text-base sm:text-xl font-normal leading-relaxed max-w-3xl mx-auto mb-8">
            ${escapeHtml(campaign.subtitle)}
          </p>`
        : ''
    }

    <div class="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
      ${anchorPillsHtml}
    </div>
  </section>

  ${renderPromotionBanner(campaign.promotion)}

  <section aria-label="選豆列表" class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
    ${introBannerHtml}

    <!-- 快速篩選列 -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-10">
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="依庫存狀態篩選豆款">
        <button type="button" class="filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-outline-ghost bg-surface-low cursor-pointer" aria-pressed="true" data-filter-btn="all">
          全部豆款 (${beans.length})
        </button>
        <button type="button" class="filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-outline-ghost bg-surface-low cursor-pointer" aria-pressed="false" data-filter-btn="available">
          可訂購
        </button>
        <button type="button" class="filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-outline-ghost bg-surface-low cursor-pointer" aria-pressed="false" data-filter-btn="in_stock">
          現貨供應
        </button>
        <button type="button" class="filter-btn px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-outline-ghost bg-surface-low cursor-pointer" aria-pressed="false" data-filter-btn="roast_to_order">
          接單現烘
        </button>
      </div>
      <span class="text-xs text-on-surface-variant" data-filter-count>顯示 ${beans.length} 款豆子</span>
    </div>

    <div class="space-y-12 sm:space-y-20" id="beans-container">
      ${beans.map((bean) => renderBeanCard(bean, rootPrefix)).join('\n')}
    </div>
  </section>
  `;

  // Native <dialog> Story Drawer + Lightbox + Popover Toast + Live Region
  const extraBodyEndHtml = `
  <dialog id="story-dialog" class="story-dialog" closedby="any" aria-labelledby="story-dialog-title">
    <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-outline-ghost bg-surface-lowest/90 sticky top-0 z-10">
      <div>
        <span id="story-dialog-meta" class="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant block mb-1"></span>
        <h2 id="story-dialog-title" class="font-editorial text-xl sm:text-2xl font-extrabold text-on-surface title-keep-cjk"></h2>
      </div>
      <button type="button" data-close-story aria-label="關閉故事視窗" class="p-2 rounded-xl bg-surface-low hover:bg-surface-container text-on-surface border border-outline-ghost cursor-pointer shrink-0">
        ${ICONS.close}
      </button>
    </div>

    <div id="story-dialog-body" class="p-6 sm:p-8 overflow-y-auto space-y-6"></div>
  </dialog>

  <dialog id="lightbox-dialog" class="lightbox-dialog" closedby="any" aria-label="產地照片放大檢視">
    <div class="relative bg-surface-lowest rounded-3xl overflow-hidden shadow-ambient-lg border border-outline-ghost">
      <button type="button" data-close-lightbox aria-label="關閉大圖" class="absolute top-3 right-3 z-10 p-2 rounded-full bg-on-surface/80 text-white hover:bg-on-surface cursor-pointer">
        ${ICONS.close}
      </button>
      <img id="lightbox-img" src="" alt="" class="max-h-[75dvh] w-auto max-w-full mx-auto object-contain bg-surface-low">
      <p id="lightbox-caption" class="px-5 py-3.5 text-sm text-on-surface bg-surface-lowest border-t border-outline-ghost text-center"></p>
    </div>
  </dialog>

  <div role="region" aria-label="通知訊息">
    <div id="copy-toast" popover="manual" class="items-center gap-3 px-4 py-3 text-sm font-medium">
      <span class="text-tertiary-container shrink-0">${ICONS.check}</span>
      <span id="copy-toast-text" class="flex-1"></span>
      <button type="button" popovertarget="copy-toast" popovertargetaction="hide" aria-label="關閉提示" class="p-1 rounded-lg hover:bg-white/15 cursor-pointer shrink-0">
        ${ICONS.close}
      </button>
    </div>
  </div>
  <div id="sr-announcer" class="visually-hidden" aria-live="polite"></div>
  `;

  // Safe JSON script injection (escape closing </script> just in case)
  const safeJson = JSON.stringify(clientBeansPayload).replace(/</g, '\\u003c');
  const extraScriptsHtml = `
  <script type="application/json" id="campaign-beans-data">${safeJson}</script>
  <script src="${rootPrefix}assets/app.js" defer></script>
  `;

  return renderPageShell({
    siteConfig,
    title: `${campaign.title} | ${site.brand}`,
    description: campaign.subtitle || site.description,
    ogImage: campaign.heroImage || '',
    rootPrefix,
    navActionsHtml,
    mainHtml,
    myshipConfig: {
      myshipUrl: campaign.myshipUrl || '',
      myshipLabel: campaign.myshipLabel || '',
      myshipNote: campaign.myshipNote || ''
    },
    extraBodyEndHtml,
    extraScriptsHtml
  });
}

module.exports = {
  renderCampaignPage
};
