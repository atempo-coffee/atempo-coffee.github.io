const { escapeHtml, ICONS, resolveHeroMedia, renderCampaignTitleHtml } = require('./helpers');
const { renderPageShell } = require('./layout');

function renderFeaturedCampaignCard(campaign) {
  const href = `campaigns/${encodeURIComponent(campaign.slug)}/index.html`;
  const heroMedia = resolveHeroMedia(campaign.heroImage, '');
  const beanCount = Array.isArray(campaign.beans) ? campaign.beans.length : 0;
  const hasPromo = campaign.promotion && campaign.promotion.enabled !== false && campaign.promotion.title;
  const isPortraitPoster = Boolean(heroMedia && heroMedia.isPortrait);
  const campaignTitleHtml = renderCampaignTitleHtml(campaign.title, { breakAfterPipe: isPortraitPoster });

  const detailsMetaHtml = `
    <div class="space-y-4 ${isPortraitPoster ? '' : 'flex-1'}">
      <div class="flex flex-wrap items-center gap-2">
        <span class="pill-tag bg-surface-low text-primary text-xs">${beanCount} 款策展選豆</span>
        ${
          hasPromo
            ? `<span class="pill-tag bg-tertiary-container/75 text-tertiary text-xs">${ICONS.sparkles}<span>${escapeHtml(campaign.promotion.title)}</span></span>`
            : ''
        }
      </div>

      <h3 class="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug title-keep-cjk">
        ${campaignTitleHtml}
      </h3>
      <p class="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl">
        ${escapeHtml(campaign.subtitle || '')}
      </p>
    </div>

    <div class="shrink-0">
      <span class="btn-primary-gradient px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-sm">
        <span>進入活動選豆</span>
        ${ICONS.arrowRight}
      </span>
    </div>
  `;

  const cardBodyHtml = isPortraitPoster
    ? `
      <div class="grid md:grid-cols-[minmax(0,300px)_1fr] lg:grid-cols-[minmax(0,360px)_1fr] items-stretch">
        <div class="w-full bg-surface-low overflow-hidden border-b md:border-b-0 md:border-r border-outline-ghost">
          <img
            src="${escapeHtml(heroMedia.src)}"
            alt="${escapeHtml(campaign.heroImageAlt || campaign.title)}"
            width="${heroMedia.width}"
            height="${heroMedia.height}"
            fetchpriority="high"
            class="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
          >
        </div>
        <div class="p-6 sm:p-8 md:p-9 lg:p-12 flex flex-col justify-between gap-8">
          ${detailsMetaHtml}
        </div>
      </div>`
    : `
      ${
        heroMedia
          ? `
        <div class="w-full bg-surface-low overflow-hidden border-b border-outline-ghost" style="aspect-ratio: ${heroMedia.width} / ${heroMedia.height};">
          <img
            src="${escapeHtml(heroMedia.src)}"
            alt="${escapeHtml(campaign.heroImageAlt || campaign.title)}"
            width="${heroMedia.width}"
            height="${heroMedia.height}"
            fetchpriority="high"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          >
        </div>`
          : `
        <div class="bg-gradient-to-br from-surface-low via-surface to-primary-container/35 p-8 sm:p-12 border-b border-outline-ghost">
          <span class="inline-block text-xs font-bold tracking-[0.2em] uppercase text-tertiary mb-3">${escapeHtml(campaign.badge || 'Curated Selection')}</span>
          <p class="font-editorial text-3xl sm:text-5xl font-extrabold text-on-surface leading-tight title-keep-cjk">${campaignTitleHtml}</p>
        </div>`
      }

      <div class="p-6 sm:p-10 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        ${detailsMetaHtml}
      </div>`;

  return `
  <section aria-labelledby="featured-heading" class="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
    <div class="flex items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
        <h2 id="featured-heading" class="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-on-surface-variant">
          最新主打活動・Featured Campaign
        </h2>
      </div>
      ${campaign.period ? `<span class="text-xs font-semibold text-primary bg-surface-low px-3 py-1 rounded-full border border-outline-ghost">${escapeHtml(campaign.period)}</span>` : ''}
    </div>

    <a href="${escapeHtml(href)}" class="block curator-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      ${cardBodyHtml}
    </a>
  </section>`;
}

function renderOtherCampaigns(campaigns) {
  if (!campaigns.length) return '';

  return `
  <section aria-labelledby="more-campaigns-heading" class="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
    <h2 id="more-campaigns-heading" class="font-editorial text-2xl sm:text-3xl font-extrabold text-on-surface mb-6">
      更多當期選豆企劃
    </h2>
    <div class="grid sm:grid-cols-2 gap-6">
      ${campaigns
        .map((c) => {
          const href = `campaigns/${encodeURIComponent(c.slug)}/index.html`;
          const count = Array.isArray(c.beans) ? c.beans.length : 0;
          return `
        <a href="${escapeHtml(href)}" class="curator-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-5 group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-xs font-bold uppercase tracking-[0.18em] text-tertiary">${escapeHtml(c.period || '當期企劃')}</span>
              <span class="text-xs font-semibold text-on-surface-variant">${count} 款熟豆</span>
            </div>
            <h3 class="font-editorial text-xl sm:text-2xl font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
              ${escapeHtml(c.title)}
            </h3>
            <p class="text-sm text-on-surface-variant leading-relaxed">${escapeHtml(c.subtitle || '')}</p>
          </div>
          <span class="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            <span>前往查看豆單</span>
            ${ICONS.arrowRight}
          </span>
        </a>`;
        })
        .join('')}
    </div>
  </section>`;
}

function renderHomePage({ siteConfig, featuredCampaign, otherCampaigns }) {
  const { site, hero } = siteConfig;

  const navActionsHtml = featuredCampaign
    ? `<a href="campaigns/${encodeURIComponent(featuredCampaign.slug)}/index.html" class="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
        <span>當期主打活動</span>
      </a>`
    : '';

  const mainHtml = `
  <section class="pt-14 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-low border border-outline-ghost mb-6 text-xs font-semibold tracking-[0.16em] text-on-surface-variant uppercase">
      <span class="w-2 h-2 rounded-full bg-tertiary"></span>
      <span>${escapeHtml(hero.badge || 'ATEMPO COFFEE')}</span>
    </div>

    <h1 class="font-editorial text-3xl sm:text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.18] mb-6">
      ${escapeHtml(hero.titleLine1)}${hero.titleLine2 ? `<br><span class="text-primary font-normal italic font-serif">${escapeHtml(hero.titleLine2)}</span>` : ''}
    </h1>

    <p class="text-on-surface-variant text-base sm:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
      ${escapeHtml(hero.subtitle)}
    </p>
  </section>

  ${featuredCampaign ? renderFeaturedCampaignCard(featuredCampaign) : ''}
  ${renderOtherCampaigns(otherCampaigns)}
  `;

  return renderPageShell({
    siteConfig,
    title: `${site.brand} | ${site.tagline}`,
    description: site.description,
    ogImage: featuredCampaign ? featuredCampaign.heroImage : '',
    rootPrefix: '',
    navActionsHtml,
    mainHtml,
    myshipConfig: featuredCampaign
      ? {
          myshipUrl: featuredCampaign.myshipUrl || '',
          myshipLabel: featuredCampaign.myshipLabel || '',
          myshipNote: featuredCampaign.myshipNote || ''
        }
      : {}
  });
}

module.exports = {
  renderHomePage
};
