const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { renderHomePage } = require('./templates/home');
const { renderCampaignPage } = require('./templates/campaign');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CAMPAIGNS_DIR = path.join(DATA_DIR, 'campaigns');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'src', 'scripts');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function readYamlFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildSite() {
  const siteConfig = readYamlFile(path.join(DATA_DIR, 'site.yaml'));

  if (!fs.existsSync(CAMPAIGNS_DIR)) {
    throw new Error(`找不到活動資料夾: ${CAMPAIGNS_DIR}`);
  }

  const campaignFiles = fs
    .readdirSync(CAMPAIGNS_DIR)
    .filter((file) => /\.ya?ml$/i.test(file))
    .sort();

  const campaigns = campaignFiles
    .map((file) => {
      const data = readYamlFile(path.join(CAMPAIGNS_DIR, file));
      const fallbackSlug = file.replace(/\.ya?ml$/i, '');
      return {
        ...data,
        slug: data.slug || fallbackSlug
      };
    })
    .filter((c) => !c.archived)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const featuredSlug = siteConfig.featuredCampaign;
  const featuredCampaign =
    campaigns.find((c) => c.slug === featuredSlug) || campaigns[0] || null;
  const otherCampaigns = featuredCampaign
    ? campaigns.filter((c) => c.slug !== featuredCampaign.slug)
    : [];

  // Clean output html directories while keeping assets dir for tailwind build
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');

  // Copy images and client script
  copyDirRecursive(path.join(ASSETS_DIR, 'images'), path.join(DIST_DIR, 'assets', 'images'));
  fs.copyFileSync(path.join(SCRIPTS_DIR, 'app.js'), path.join(DIST_DIR, 'assets', 'app.js'));

  // Build Homepage
  const homeHtml = renderHomePage({
    siteConfig,
    featuredCampaign,
    otherCampaigns
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml, 'utf8');

  // Build Campaign Pages
  const campaignsOutDir = path.join(DIST_DIR, 'campaigns');
  fs.rmSync(campaignsOutDir, { recursive: true, force: true });

  for (const campaign of campaigns) {
    const outDir = path.join(campaignsOutDir, campaign.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const html = renderCampaignPage({ siteConfig, campaign });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  }

  console.log(
    `[build] Built index.html + ${campaigns.length} campaign(s): ${campaigns.map((c) => c.slug).join(', ')}`
  );
}

buildSite();
