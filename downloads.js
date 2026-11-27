const repository = 'oneluiz/compas-studio-releases';
const status = document.querySelector('#release-status');
const assets = document.querySelector('#release-assets');
const platforms = [
  ['macOS', 'Apple Silicon', 'macos-arm64.dmg', 'Descargar DMG para Apple Silicon'],
  ['macOS', 'Intel', 'macos-x64.dmg', 'Descargar DMG para Intel'],
  ['Windows', '64 bits', 'windows-x64.exe', 'Descargar instalador para Windows'],
];

async function loadDownloads() {
  status.textContent = 'Consultando la última versión…';
  try {
    const response = await fetch('https://api.github.com/repos/' + repository + '/releases/latest', {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
    const release = await response.json();
    if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name)) throw new Error();
    const version = release.tag_name.slice(1);
    for (const [system, architecture, suffix, action] of platforms) {
      const name = 'Compas-Studio-' + version + '-' + suffix;
      const url = 'https://github.com/' + repository + '/releases/download/' + release.tag_name + '/' + name;
      if (!release.assets.some(asset => asset.name === name && asset.state === 'uploaded' && asset.browser_download_url === url)) continue;
      const row = document.createElement('li');
      const title = document.createElement('h3');
      const detail = document.createElement('p');
      const link = document.createElement('a');
      title.textContent = system;
      detail.textContent = architecture;
      link.href = url;
      link.textContent = action;
      row.append(title, detail, link);
      assets.append(row);
    }
    status.textContent = assets.children.length ? 'Versión ' + version : 'Consultá las versiones disponibles en GitHub.';
  } catch {
    status.textContent = 'Consultá las versiones disponibles en GitHub.';
  }
}

void loadDownloads();
