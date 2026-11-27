const repository = 'oneluiz/compas-studio-releases';
const releaseStatus = document.querySelector('#release-status');
const assets = document.querySelector('#release-assets');
const template = document.querySelector('#platform-template');
const platforms = [
  { system: 'macOS', architecture: 'Apple Silicon', suffix: 'macos-arm64.dmg', format: 'DMG' },
  { system: 'macOS', architecture: 'Intel', suffix: 'macos-x64.dmg', format: 'DMG' },
  { system: 'Windows', architecture: '64 bits', suffix: 'windows-x64.exe', format: 'EXE' },
];
const fileSize = new Intl.NumberFormat('es', { maximumFractionDigits: 0 });

async function loadDownloads() {
  releaseStatus.textContent = 'Consultando la última versión…';
  try {
    const response = await fetch('https://api.github.com/repos/' + repository + '/releases/latest', {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
    const release = await response.json();
    if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name)) throw new Error();
    const version = release.tag_name.slice(1);

    for (const { system, architecture, suffix, format } of platforms) {
      const name = 'Compas-Studio-' + version + '-' + suffix;
      const url = 'https://github.com/' + repository + '/releases/download/' + release.tag_name + '/' + name;
      const asset = release.assets.find(entry =>
        entry.name === name && entry.state === 'uploaded' && entry.browser_download_url === url);
      if (!asset) continue;

      const card = template.content.cloneNode(true);
      const detail = card.querySelector('.platform-detail');
      const link = card.querySelector('a');
      card.querySelector('h3').textContent = system;
      detail.textContent = [architecture, format, Number.isSafeInteger(asset.size) && asset.size > 0
        ? fileSize.format(asset.size / 1_000_000) + ' MB' : ''].filter(Boolean).join(' · ');
      link.href = url;
      link.setAttribute('aria-label', 'Descargar ' + format + ' para ' + system + ' ' + architecture);
      link.querySelector('.download-label').textContent = 'Descargar ' + format;
      assets.append(card);
    }

    if (!assets.children.length) throw new Error();
    releaseStatus.textContent = 'Versión ' + version;
    releaseStatus.classList.add('release-ready');
  } catch {
    releaseStatus.textContent = 'Consultá las descargas en GitHub.';
  }
}

void loadDownloads();
