const { escapeHtml, resolveAssetPath, ICONS } = require('./helpers');

/**
 * Renders the unified Ordering / Concierge section (supports optional 7-11 MyShip link + LINE 4-step guide).
 */
function renderOrderingSection({ siteConfig, myshipUrl = '', myshipLabel = '', myshipNote = '' }) {
  const { ordering } = siteConfig;
  const hasMyship = Boolean(myshipUrl && String(myshipUrl).trim());

  const myshipCard = hasMyship
    ? `
      <div class="bg-surface-lowest rounded-3xl p-7 sm:p-9 border border-outline-ghost shadow-ambient-sm flex flex-col justify-between text-left">
        <div>
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container/70 text-tertiary text-xs font-bold mb-4">
            ${ICONS.shoppingBag}
            <span>自助快速下單</span>
          </span>
          <h3 class="font-editorial text-2xl sm:text-3xl font-extrabold text-on-surface mb-3">
            7-11 賣貨便直接購買
          </h3>
          <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
            ${escapeHtml(myshipNote || '已於 7-11 賣貨便上架當期豆單，點擊即可前往賣場挑選規格並選擇店到店取貨付款。')}
          </p>
          <ol class="space-y-3 mb-8 text-sm sm:text-base text-on-surface">
            ${(ordering.myshipSteps || [])
              .map(
                (step, idx) => `
              <li class="flex items-start gap-3 bg-surface-low/80 p-3.5 rounded-2xl border border-outline-ghost">
                <span class="w-6 h-6 rounded-full bg-tertiary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                <div>
                  <span class="font-bold block">${escapeHtml(step.title)}</span>
                  <span class="text-sm text-on-surface-variant">${escapeHtml(step.detail)}</span>
                </div>
              </li>`
              )
              .join('')}
          </ol>
        </div>
        <a href="${escapeHtml(myshipUrl)}" target="_blank" rel="noopener noreferrer" class="w-full btn-primary-gradient py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
          ${ICONS.shoppingBag}
          <span>${escapeHtml(myshipLabel || '前往 7-11 賣貨便下單')}</span>
          ${ICONS.arrowRight}
        </a>
      </div>`
    : '';

  const serviceMetaParts = [
    ordering.serviceHours ? `服務時間：${escapeHtml(ordering.serviceHours)}` : '',
    ordering.roastDays ? `烘焙日：${escapeHtml(ordering.roastDays)}` : ''
  ].filter(Boolean);

  return `
  <section id="line-reservation" class="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
    <div class="bg-surface-low rounded-[2.25rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-14 border border-outline-ghost shadow-ambient">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="text-xs font-bold uppercase tracking-[0.28em] text-on-surface-variant mb-3 block">
          ATEMPO Coffee Concierge
        </span>
        <h2 class="font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface ${serviceMetaParts.length ? 'mb-4' : ''}">
          ${escapeHtml(ordering.stepsTitle || '訂購與取貨方式')}
        </h2>
        ${
          serviceMetaParts.length
            ? `<p class="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                ${serviceMetaParts.join(' ｜ ')}
              </p>`
            : ''
        }
      </div>

      <div class="grid ${hasMyship ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-6 sm:gap-8 items-stretch">
        ${myshipCard}

        <div class="bg-surface-lowest rounded-3xl p-7 sm:p-9 border border-outline-ghost shadow-ambient-sm flex flex-col justify-between text-left">
          <div>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/60 text-primary text-xs font-bold mb-4">
              ${ICONS.messageCircle}
              <span>專人客製・接單現烘</span>
            </span>
            <h3 class="font-editorial text-2xl sm:text-3xl font-extrabold text-on-surface mb-3">
              官方 LINE 專人預訂
            </h3>
            <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              若您想訂購「接單現烘」品項、多包混搭確認或有任何沖煮疑問，歡迎直接透過官方 LINE 聯繫咖啡師。
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div class="p-2.5 bg-white rounded-2xl border border-outline-ghost shadow-sm shrink-0">
                <img src="${escapeHtml(ordering.lineQrUrl)}" alt="ATEMPO 官方 LINE QR Code" width="144" height="144" loading="lazy" class="w-36 h-36 rounded-xl">
              </div>
              <ol class="space-y-2.5 text-sm text-on-surface flex-1 w-full">
                ${(ordering.lineSteps || [])
                  .map(
                    (step, idx) => `
                  <li class="flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                    <div>
                      <span class="font-bold">${escapeHtml(step.title)}：</span>
                      <span class="text-on-surface-variant">${escapeHtml(step.detail)}</span>
                    </div>
                  </li>`
                  )
                  .join('')}
              </ol>
            </div>
          </div>

          <a href="${escapeHtml(ordering.lineUrl)}" target="_blank" rel="noopener noreferrer" class="w-full btn-primary-gradient py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
            ${ICONS.messageCircle}
            <span>加入 LINE 預約訂購</span>
          </a>
        </div>
      </div>
    </div>
  </section>`;
}

function resolveOgImageUrl(ogImage, siteUrl) {
  if (!ogImage) return '';
  const resolved = resolveAssetPath(ogImage, '');
  if (/^https?:\/\//i.test(resolved)) return resolved;
  const base = String(siteUrl || '').replace(/\/+$/, '');
  const rel = String(resolved).replace(/^\/+/, '');
  return base ? `${base}/${rel}` : rel;
}

/**
 * Shared layout wrapper when a page wants to pass its own Ordering section (so campaign pages can pass myshipUrl).
 */
function renderPageShell({
  siteConfig,
  title,
  description,
  ogImage,
  rootPrefix = '',
  navActionsHtml = '',
  mainHtml = '',
  myshipConfig = {},
  extraBodyEndHtml = '',
  extraScriptsHtml = ''
}) {
  const { site } = siteConfig;
  const resolvedOgImage = resolveOgImageUrl(ogImage, site.siteUrl);
  const stylesheetHref = `${rootPrefix}assets/styles.css`;

  return `<!DOCTYPE html>
<html lang="zh-Hant" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / LINE 分享預覽 -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${resolvedOgImage ? `<meta property="og:image" content="${escapeHtml(resolvedOgImage)}">` : ''}

  <!-- Google Fonts: Plus Jakarta Sans, Manrope, Noto Serif TC, Noto Sans TC -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;600;700;900&family=Noto+Serif+TC:wght@500;600;700;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">
</head>
<body class="min-h-screen ma-ambient-aura selection:bg-secondary-container selection:text-secondary-on-container">
  <a href="#main-content" class="visually-hidden focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-white">跳至主要內容</a>

  <header class="sticky top-0 z-40 glass-panel">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 min-h-20 py-3 flex flex-wrap items-center justify-between gap-3">
      <a href="${escapeHtml(rootPrefix)}index.html" class="flex items-center gap-3">
        <span class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
          ${ICONS.coffee}
        </span>
        <div>
          <span class="font-editorial font-bold text-lg sm:text-xl tracking-tight text-on-surface block leading-none">${escapeHtml(site.brand)}</span>
          <span class="text-[10px] tracking-[0.22em] uppercase text-on-surface-variant font-medium block mt-1">${escapeHtml(site.edition)}</span>
        </div>
      </a>

      <nav aria-label="主要導覽" class="flex items-center flex-wrap gap-2 sm:gap-3">
        ${navActionsHtml}
        <a href="#line-reservation" class="btn-primary-gradient px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-sm">
          ${ICONS.messageCircle}
          <span>LINE 訂購</span>
        </a>
      </nav>
    </div>
  </header>

  <main id="main-content" tabindex="-1">
    ${mainHtml}
  </main>

  ${renderOrderingSection({
    siteConfig,
    myshipUrl: myshipConfig.myshipUrl || '',
    myshipLabel: myshipConfig.myshipLabel || '',
    myshipNote: myshipConfig.myshipNote || ''
  })}

  <footer class="border-t border-outline-ghost py-14 text-center text-xs text-on-surface-variant">
    <div class="max-w-6xl mx-auto px-6 space-y-3">
      <div class="flex items-center justify-center gap-2 font-editorial font-bold text-lg text-on-surface">
        <span class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
          ${ICONS.coffee}
        </span>
        <span>${escapeHtml(site.brand)}</span>
      </div>
      <p class="tracking-wide">
        ${escapeHtml(site.tagline)} &copy; ${escapeHtml(site.copyrightYear)} ${escapeHtml(site.brand)}. All Rights Reserved.
      </p>
      <p class="text-[11px] text-on-surface-variant/75 font-mono">
        Curated Design System: The Digital Curator (Komorebi Edition)
      </p>
    </div>
  </footer>

  ${extraBodyEndHtml}
  ${extraScriptsHtml}
</body>
</html>`;
}

module.exports = {
  renderPageShell,
  renderOrderingSection
};
