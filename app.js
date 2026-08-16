/* ==========================================================================
   DEVIN'S BADGE STUDIO - APPLICATION LOGIC
   ========================================================================== */

// Application State
const state = {
  style: 'cozy', // 'cozy' | 'compact' | 'cozy-minimal' | 'compact-minimal'
  topText: 'Available on',
  bottomText: 'GitHub',
  iconMode: 'preset', // 'preset' | 'upload' | 'raw'
  presetKey: 'github',
  uploadedDataUrl: '', // base64 DataURL for PNG/JPG/SVG
  isUploadedSvg: false,
  customSvgContent: '',
  showDisk: false, // Default to FALSE for pure standalone logos!
  diskColor: '#ffffff',
  logoColor: '#0f141c',
  bgColorTop: '#181f29',
  bgColorBottom: '#0f131a',
  textColor: '#ffffff',
  radius: 8,
  paddingRight: 16,
  codeTab: 'md' // 'md' | 'html' | 'svg'
};

// Official Brand Icons with Authentic SimpleIcons & Devin Badges Geometry
const OFFICIAL_BRAND_ICONS = {
  github: {
    isCustomSvg: true,
    svg: `<path fill="#ffffff" d="M32.001 8.716C20.951 8.716 12 17.573 12 28.488c0 8.741 5.73 16.15 13.672 18.763 1.004.187 1.366-.425 1.366-.954 0-.47-.01-1.711-.018-3.36-5.567 1.192-6.74-2.658-6.74-2.658-.91-2.279-2.226-2.89-2.226-2.89-1.81-1.223.144-1.197.144-1.197 2.005.135 3.06 2.033 3.06 2.033 1.784 3.025 4.68 2.15 5.827 1.641.175-1.274.696-2.15 1.264-2.638-4.44-.496-9.11-2.195-9.11-9.772 0-2.163.775-3.926 2.057-5.31-.222-.495-.9-2.51.176-5.233 0 0 1.674-.528 5.5 2.027a19.5 19.5 0 0 1 5-.668c1.7.011 3.4.231 5 .669 3.805-2.556 5.477-2.028 5.477-2.028 1.074 2.723.397 4.736.202 5.233 1.268 1.384 2.044 3.148 2.044 5.31 0 7.594-4.676 9.269-9.121 9.752.695.592 1.346 1.81 1.346 3.657 0 2.644-.025 4.775-.025 5.419 0 .514.35 1.132 1.38.933C46.275 44.63 52 37.216 52 28.487c0-10.916-8.952-19.773-20.001-19.773z"/>`,
    textX: 62,
    color: '#ffffff',
    bgTop: '#181f29',
    bgBot: '#0f131a'
  },
  python: {
    isCustomSvg: true,
    svg: `
      <path fill="#306998" d="M31.762 8a28 28 0 0 0-4.61.39c-4.083.713-4.825 2.206-4.825 4.96v3.637h9.648v1.212H18.708c-2.805 0-5.26 1.667-6.028 4.838-.886 3.635-.925 5.904 0 9.699.686 2.825 2.324 4.838 5.128 4.838h3.317v-4.36c0-3.15 2.756-5.928 6.028-5.928h9.636c2.683 0 4.824-2.185 4.824-4.85V13.35c0-2.586-2.205-4.529-4.824-4.96A30.4 30.4 0 0 0 31.762 8m-5.218 2.925c.997 0 1.81.818 1.81 1.824a1.81 1.81 0 1 1-3.62 0c0-1.005.81-1.824 1.81-1.824"/>
      <path fill="#FFE873" d="M42.816 18.2v4.237c0 3.285-2.816 6.05-6.028 6.05h-9.636c-2.64 0-4.825 2.235-4.825 4.85v9.086c0 2.586 2.274 4.107 4.824 4.85 3.055.887 5.983 1.048 9.637 0 2.43-.696 4.824-2.096 4.824-4.85v-3.637h-9.637v-1.212h14.462c2.803 0 3.848-1.935 4.824-4.838 1.007-2.99.964-5.864 0-9.699-.693-2.76-2.017-4.838-4.824-4.838zm-5.42 23.01c1 0 1.81.811 1.81 1.814 0 1.006-.81 1.824-1.81 1.824a1.82 1.82 0 0 1-1.81-1.824c0-1.003.813-1.813 1.81-1.813"/>
    `,
    textX: 54,
    color: '#FFE873',
    bgTop: '#152b3e',
    bgBot: '#282208'
  },
  vscode: {
    path: "M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z",
    color: "#007ACC",
    bgTop: "#17202e",
    bgBot: "#0d131c"
  },
  discord: {
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
    color: "#5865F2",
    bgTop: "#1a1c29",
    bgBot: "#11121d"
  },
  react: {
    path: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-7c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.86 0-7-1.34-7-2s3.14-2 7-2 7 1.34 7 2-3.14 2-7 2zm-5.7 7.78c-3.79-3.21-5.8-6.49-4.49-7.3 1.31-.81 5.4 1.13 9.19 4.34 3.79 3.21 5.8 6.49 4.49 7.3-1.31.81-5.4-1.13-9.19-4.34zm.9-1.56c2.89 2.45 6.02 3.86 7 3.25.98-.61-.31-3.27-3.2-5.72-2.89-2.45-6.02-3.86-7-3.25-.98.61.31 3.27 3.2 5.72zm9.6 1.56c-3.79 3.21-7.88 5.15-9.19 4.34-1.31-.81.7-4.09 4.49-7.3 3.79-3.21 7.88-5.15 9.19-4.34 1.31.81-.7 4.09-4.49 7.3zm-.9-1.56c-2.89-2.45-5.91-6.33-6.89-6.94-.98-.61-3.89.8-1 3.25 2.89 2.45 5.91 6.33 6.89 6.94.98.61 3.89-.8 1-3.25z",
    color: "#61DAFB",
    bgTop: "#132230",
    bgBot: "#0b1620"
  },
  docker: {
    path: "M13.98 11.08h2.12v2.12h-2.12zm-3.18 0h2.12v2.12h-2.12zm-3.18 0h2.12v2.12H7.62zm-3.18 0h2.12v2.12H4.44zm6.36-3.18h2.12v2.12h-2.12zm-3.18 0h2.12v2.12H7.62zm-3.18 0h2.12v2.12H4.44zm6.36-3.18h2.12v2.12h-2.12zm9.22 8.78c-.46-.32-1.36-.45-2.22-.24-.26-.84-.96-1.57-1.89-1.84l-.38-.11v2.96c0 .32.26.58.58.58h1.16c.38 0 .66.3.66.68 0 .42-.3.72-.72.72H1.5c.08.62.38 3.5 3.02 5.06 2.06 1.22 4.78 1.38 7.46.46 3.12-1.07 5.02-3.85 5.04-7.01.99.1 1.76-.23 2.04-.64.12-.17.18-.38.16-.62z",
    color: "#2496ED",
    bgTop: "#122536",
    bgBot: "#0b1622"
  },
  deno: {
    path: "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 3c4.97 0 9 4.03 9 9 0 1.28-.27 2.49-.75 3.59L16 11.5c-.83-.83-2.17-.83-3 0l-1 1-1-1c-.83-.83-2.17-.83-3 0l-4.25 4.25C3.27 14.65 3 13.36 3 12c0-4.97 4.03-9 9-9z",
    color: "#FFFFFF",
    bgTop: "#1c1e24",
    bgBot: "#0e1014"
  },
  rust: {
    path: "M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-3 4v8h6v-2h-4v-2h3v-2h-3V10h4V8H9z",
    color: "#DEA584",
    bgTop: "#2b211a",
    bgBot: "#17120e"
  },
  git: {
    path: "M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187",
    color: "#F05032",
    bgTop: "#2b1c19",
    bgBot: "#170f0d"
  },
  gitlab: {
    path: "m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z",
    color: "#FC6D26",
    bgTop: "#2b1e19",
    bgBot: "#17100d"
  },
  npm: {
    path: "M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z",
    color: "#CB3837",
    bgTop: "#2b1919",
    bgBot: "#170e0e"
  },
  pypi: {
    path: "M23.922 13.58v3.912L20.55 18.72l-.078.055.052.037 3.45-1.256.026-.036v-3.997l-.053-.036-.025.092z M23.621 5.618l-3.04 1.107v3.912l3.339-1.215V5.509zM23.92 13.457V9.544l-3.336 1.215v3.913zM20.47 14.71V10.8L17.17 12v3.913zM17.034 19.996v-3.912l-3.313 1.206v3.912zM17.17 16.057v3.868l3.314-1.206V14.85l-3.314 1.206zm2.093 1.882c-.367.134-.663-.074-.663-.463s.296-.814.663-.947c.365-.133.662.075.662.464s-.297.814-.662.946z M13.225 9.315l.365-.132-3.285-1.197-3.323 1.21.102.037 3.184 1.16zM20.507 10.664V6.751L17.17 7.965v3.913zM17.058 11.918V8.005l-3.302 1.202v3.912zM13.643 9.246l-3.336 1.215v3.913l3.336-1.215zM6.907 13.165l3.322 1.209v-3.913L6.907 9.252z M10.34 7.873l3.281 1.193V5.198l-3.28-1.193zM20.507 2.715L17.19 3.922v3.913l3.317-1.207zM16.95 3.903L13.724 2.73l-3.269 1.19 3.225 1.174zM15.365 4.606l-1.624.592v3.868l3.317-1.207V3.991l-1.693.615zm-.391 2.778c-.367.134-.662-.074-.662-.464s.295-.813.662-.946c.366-.133.663.074.663.464s-.297.813-.663.946z M10.229 18.41v-3.914l-3.322-1.209V17.2zM13.678 17.182v-3.913l-3.371 1.227v3.913z M13.756 17.154l3.3-1.2V12.04l-3.3 1.2zM13.678 21.217l-3.371 1.227v-3.912h-.078v3.912l-3.322-1.209v-3.913l-.053-.058-.025-.06-3.336-1.21v-3.948l.034.013 3.287 1.196.015-.078-3.261-1.187 3.26-1.187v-.109L3.876 9.62l-.307-.112 3.26-1.188v.877l.079-.055V6.769l3.257 1.185.058-.061L7.084 6.75l-.102-.037 3.24-1.179v-.083L6.854 6.677v.018l-.025.018v1.523L3.44 9.47v.02l-.025.017v4.007l-3.39 1.233v.019L0 14.784v3.995l.025.037 3.4 1.237.008-.006.007.01 3.4 1.238.008-.006.006.01 3.4 1.237.014-.009.012.01 3.45-1.256.026-.037-.078-.027zM3.493 9.563l3.257 1.185-3.257 1.187V9.562zM3.4 19.96L.078 18.752v-3.913l2.361.86.96.349v3.913zm.015-3.99L.335 14.85l-.182-.066 3.262-1.187v2.374zm3.399 5.231l-3.321-1.209v-3.912l3.321 1.209v3.912zM23.791 5.434l-3.21-1.17v2.338zM20.387 2.643l-3.24-1.18-3.27 1.19 3.247 1.182z",
    color: "#3775A9",
    bgTop: "#261b2e",
    bgBot: "#160e1c"
  },
  spotify: {
    path: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    color: "#1DB954",
    bgTop: "#172b1d",
    bgBot: "#0d1710"
  },
  steam: {
    path: "M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z",
    color: "#66C0F4",
    bgTop: "#171A21",
    bgBot: "#0b0c10"
  },
  youtube: {
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    color: "#FF0000",
    bgTop: "#2b1919",
    bgBot: "#170e0e"
  },
  twitter: {
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    color: "#FFFFFF",
    bgTop: "#1a1a1a",
    bgBot: "#0a0a0a"
  },
  star: {
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    color: "#FFD700",
    bgTop: "#2b2819",
    bgBot: "#17160e"
  },
  terminal: {
    path: "M4 17l6-5-6-5v10zm8 0h8v-2h-8v2zM2 3h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    color: "#4AF626",
    bgTop: "#152417",
    bgBot: "#0b140c"
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderBadge();
});

// Set Active Style Variant
function setStyle(styleName) {
  state.style = styleName;
  document.querySelectorAll('.style-option').forEach(card => {
    card.classList.toggle('active', card.dataset.style === styleName);
  });
  renderBadge();
}

// Icon Input Mode Switcher
function setIconMode(mode) {
  state.iconMode = mode;
  document.getElementById('seg-preset').classList.toggle('active', mode === 'preset');
  document.getElementById('seg-upload').classList.toggle('active', mode === 'upload');
  document.getElementById('seg-raw').classList.toggle('active', mode === 'raw');

  document.getElementById('icon-mode-preset').style.display = mode === 'preset' ? 'block' : 'none';
  document.getElementById('icon-mode-upload').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('icon-mode-raw').style.display = mode === 'raw' ? 'block' : 'none';

  renderBadge();
}

// Handle File Upload (PNG, JPG, SVG)
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    state.isUploadedSvg = true;
    reader.onload = (evt) => {
      const textContent = evt.target.result;
      state.customSvgContent = parseSvgPathContent(textContent);
      
      // Convert SVG text content into Base64 DataURL for <image> and <img> preview compatibility
      const svgBlob = new Blob([textContent], { type: 'image/svg+xml;charset=utf-8' });
      const blobReader = new FileReader();
      blobReader.onload = (e2) => {
        state.uploadedDataUrl = e2.target.result;
        showUploadPreview(file.name, e2.target.result);
        renderBadge();
      };
      blobReader.readAsDataURL(svgBlob);
    };
    reader.readAsText(file);
  } else {
    // Raster image (PNG, JPG, WebP)
    state.isUploadedSvg = false;
    reader.onload = (evt) => {
      state.uploadedDataUrl = evt.target.result; // DataURL
      showUploadPreview(file.name, evt.target.result);
      renderBadge();
    };
    reader.readAsDataURL(file);
  }
}

function showUploadPreview(filename, dataUrl) {
  document.getElementById('upload-preview-bar').style.display = 'flex';
  document.getElementById('upload-filename').innerText = filename;
  document.getElementById('upload-thumb').src = dataUrl;
  document.getElementById('upload-status-text').innerText = `Uploaded: ${filename}`;
}

function clearUpload() {
  state.uploadedDataUrl = '';
  state.rawSvgDataUrl = '';
  state.customSvgContent = '';
  document.getElementById('upload-preview-bar').style.display = 'none';
  document.getElementById('upload-status-text').innerText = 'Click to upload PNG, JPG, or SVG logo';
  document.getElementById('file-input').value = '';
  renderBadge();
}

// Parse SVG content to extract inner paths
function parseSvgPathContent(svgStr) {
  if (!svgStr) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return '';
  return svg.innerHTML;
}

function handleRawSvgChange() {
  const val = document.getElementById('raw-svg-code').value.trim();
  state.customSvgContent = parseSvgPathContent(val);
  if (val) {
    state.rawSvgDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(val);
  } else {
    state.rawSvgDataUrl = '';
  }
  renderBadge();
}

// Quick Preset Applier with Authentic Dual-Color Palettes
function applyPreset(type) {
  const presets = {
    github: { top: 'Available on', bottom: 'GitHub', icon: 'github' },
    discord: { top: 'Join our', bottom: 'Discord', icon: 'discord' },
    python: { top: 'Built with', bottom: 'Python', icon: 'python' },
    react: { top: 'Powered by', bottom: 'React', icon: 'react' },
    vscode: { top: 'Get for', bottom: 'VS Code', icon: 'vscode' },
    pypi: { top: 'Package on', bottom: 'PyPI', icon: 'pypi' }
  };

  const p = presets[type];
  if (!p) return;

  const brandInfo = OFFICIAL_BRAND_ICONS[p.icon];
  document.getElementById('top-text').value = p.top;
  document.getElementById('bottom-text').value = p.bottom;
  document.getElementById('preset-select').value = p.icon;
  if (brandInfo) {
    document.getElementById('bg-color-top').value = brandInfo.bgTop;
    document.getElementById('bg-color-bottom').value = brandInfo.bgBot;
  }

  state.iconMode = 'preset';
  setIconMode('preset');
  renderBadge();
}

// Accurately measure text width using Canvas API
function measureText(text, fontSpec) {
  if (!text) return 0;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = fontSpec;
  return ctx.measureText(text).width;
}

// Main Render Logic
function renderBadge() {
  // Read form inputs
  const topText = document.getElementById('top-text').value;
  const bottomText = document.getElementById('bottom-text').value;
  const showDisk = document.getElementById('show-disk-toggle').checked;
  const diskColor = document.getElementById('disk-color').value;
  const logoColor = document.getElementById('logo-color').value;
  const bgColorTop = document.getElementById('bg-color-top').value;
  const bgColorBottom = document.getElementById('bg-color-bottom').value;
  const textColor = document.getElementById('text-color').value;
  const radius = parseInt(document.getElementById('corner-radius').value);
  const paddingRight = parseInt(document.getElementById('padding-horizontal').value);
  
  // Size Sliders
  const diskDiameter = parseInt(document.getElementById('disk-size-slider').value) || 40;
  const userLogoScale = parseInt(document.getElementById('icon-scale-slider').value) || 34;

  // Dynamic Specs per Style Variant (matches official intergrav/devins-badges)
  let height = 56;
  let topFont = '500 12px Inter, -apple-system, sans-serif';
  let bottomFont = '800 19px Inter, -apple-system, sans-serif';
  let topY = 22;
  let bottomY = 43;
  let isMinimal = false;
  let isSingleLine = false;

  if (state.style === 'compact') {
    // Official "compact" = 40px tall, single-line text
    height = 40;
    bottomFont = '700 13px Inter, -apple-system, sans-serif';
    isSingleLine = true;
  } else if (state.style === 'cozy-minimal') {
    // Official "cozy-minimal" = 56×56 icon-only square
    height = 56;
    isMinimal = true;
  } else if (state.style === 'compact-minimal') {
    // Official "compact-minimal" = 40×40 icon-only square
    height = 40;
    isMinimal = true;
  }

  // Scale factor based on badge height relative to 56px Cozy baseline
  const heightScale = height / 56;

  // Update slider displays & hex swatches safely
  state.showDisk = showDisk;
  if (document.getElementById('disk-size-num')) document.getElementById('disk-size-num').innerText = `${diskDiameter}px`;
  if (document.getElementById('icon-scale-num')) document.getElementById('icon-scale-num').innerText = `${userLogoScale}px`;
  if (document.getElementById('disk-color-hex')) document.getElementById('disk-color-hex').innerText = diskColor;
  if (document.getElementById('logo-color-hex')) document.getElementById('logo-color-hex').innerText = logoColor;
  if (document.getElementById('bg-top-hex')) document.getElementById('bg-top-hex').innerText = bgColorTop;
  if (document.getElementById('bg-bot-hex')) document.getElementById('bg-bot-hex').innerText = bgColorBottom;
  if (document.getElementById('text-hex')) document.getElementById('text-hex').innerText = textColor;
  if (document.getElementById('radius-val')) document.getElementById('radius-val').innerText = `${radius}px`;
  if (document.getElementById('padding-val')) document.getElementById('padding-val').innerText = `${paddingRight}px`;

  const presetKey = document.getElementById('preset-select').value;
  const brandInfo = OFFICIAL_BRAND_ICONS[presetKey] || OFFICIAL_BRAND_ICONS.github;

  // Scaled logo size & Text X calculation:
  const effectiveLogoSize = Math.round(userLogoScale * heightScale);

  let textX = 62;
  if (brandInfo && brandInfo.textX && state.iconMode === 'preset') {
    textX = Math.round(brandInfo.textX * heightScale);
  } else {
    textX = Math.round((12 + userLogoScale + 12) * heightScale);
  }

  let width = height;
  if (!isMinimal) {
    // Canvas measureText can slightly overestimate vs SVG — apply correction
    const textCorrectionFactor = 0.92;
    let maxTextW;
    if (isSingleLine) {
      // Compact: only bottomText is rendered, so only measure that
      maxTextW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
    } else {
      // Cozy: both lines rendered, use the wider one
      const topW = topText ? measureText(topText, topFont) * textCorrectionFactor : 0;
      const bottomW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
      maxTextW = Math.max(topW, bottomW);
    }
    width = Math.ceil(textX + maxTextW + paddingRight);
  }

  // Text FX Controls
  const useTextGrad = document.getElementById('text-grad-toggle')?.checked || false;
  const textGradTop = document.getElementById('text-grad-top')?.value || '#61DAFB';
  const textGradBot = document.getElementById('text-grad-bot')?.value || '#FFFFFF';
  const useTextStroke = document.getElementById('text-stroke-toggle')?.checked || false;
  const textStrokeColor = document.getElementById('text-stroke-color')?.value || '#000000';
  const textStrokeWidth = document.getElementById('text-stroke-width')?.value || '1.5';

  if (document.getElementById('text-stroke-val')) {
    document.getElementById('text-stroke-val').innerText = `${textStrokeWidth}px`;
  }

  // Logo FX Controls
  const useCustomLogoColor = document.getElementById('custom-logo-color-toggle')?.checked || false;
  const customLogoColor = document.getElementById('logo-color')?.value || '#ffffff';
  const useLogoStroke = document.getElementById('logo-stroke-toggle')?.checked || false;
  const logoStrokeColor = document.getElementById('logo-stroke-color')?.value || '#ffffff';
  const logoStrokeWidth = document.getElementById('logo-stroke-width')?.value || '2';

  if (document.getElementById('logo-stroke-val')) {
    document.getElementById('logo-stroke-val').innerText = `${logoStrokeWidth}px`;
  }

  // SVG Header & Defs
  let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" fill="none" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="badge-bg" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${bgColorTop}"/>
      <stop offset="1" stop-color="${bgColorBottom}"/>
    </linearGradient>
`;

  // Text Gradient Def
  if (useTextGrad) {
    svgMarkup += `    <linearGradient id="badge-text-grad" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
      <stop stop-color="${textGradTop}"/>
      <stop offset="1" stop-color="${textGradBot}"/>
    </linearGradient>\n`;
  }

  // Combined Logo Filter (Universal Tinting for all Uploads/Images/SVGs + Logo Outline Stroke)
  const useLogoFxFilter = (useCustomLogoColor || useLogoStroke) && !showDisk;
  if (useLogoFxFilter) {
    svgMarkup += `    <filter id="badge-logo-fx" x="-50%" y="-50%" width="200%" height="200%">\n`;
    if (useLogoStroke) {
      svgMarkup += `      <feMorphology operator="dilate" radius="${logoStrokeWidth}" in="SourceAlpha" result="expanded"/>\n`;
      svgMarkup += `      <feFlood flood-color="${logoStrokeColor}" result="strokeColor"/>\n`;
      svgMarkup += `      <feComposite in="strokeColor" in2="expanded" operator="in" result="stroke"/>\n`;
    }
    if (useCustomLogoColor) {
      svgMarkup += `      <feFlood flood-color="${customLogoColor}" result="tintColor"/>\n`;
      svgMarkup += `      <feComposite in="tintColor" in2="SourceAlpha" operator="in" result="tintedGraphic"/>\n`;
    }
    svgMarkup += `      <feMerge>\n`;
    if (useLogoStroke) svgMarkup += `        <feMergeNode in="stroke"/>\n`;
    svgMarkup += `        <feMergeNode in="${useCustomLogoColor ? 'tintedGraphic' : 'SourceGraphic'}"/>\n`;
    svgMarkup += `      </feMerge>\n`;
    svgMarkup += `    </filter>\n`;
  }

  svgMarkup += `  </defs>\n\n  <!-- Background Card Base -->\n  <rect width="${width}" height="${height}" fill="url(#badge-bg)" rx="${radius}"/>\n  <rect width="${width - 2}" height="${height - 2}" x="1" y="1" stroke="#ffffff" stroke-opacity=".15" stroke-width="1.5" rx="${Math.max(0, radius - 1)}"/>\n`;

  // Optional White / Custom Circle Disk Background
  if (showDisk) {
    const diskR = Math.round((diskDiameter * heightScale) / 2);
    const diskCx = isMinimal ? Math.round(height / 2) : Math.round((12 + userLogoScale / 2) * heightScale);
    const diskCy = Math.round(height / 2);
    svgMarkup += `  <!-- Background Disk Circle -->\n  <circle cx="${diskCx}" cy="${diskCy}" r="${diskR}" fill="${diskColor}"/>\n`;
  }

  const logoFilterAttr = useLogoFxFilter ? ' filter="url(#badge-logo-fx)"' : '';

  // Render Icon / Logo with proportional height scaling
  if (state.iconMode === 'preset') {
    if (brandInfo.isCustomSvg) {
      let svgContent = brandInfo.svg;
      svgContent = svgContent.replace(/fill="currentColor"/gi, `fill="${brandInfo.color || '#ffffff'}"`);

      if (showDisk) {
        svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${logoColor}"`);
      } else if (useCustomLogoColor) {
        svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${customLogoColor}"`);
      }

      if (isMinimal) {
        const minimalScale = height / 56;
        const centerOffsetX = height * (0.5 - 32 / 56);
        svgMarkup += `  <!-- Official Custom Vector (Minimal Centered) -->\n  <g transform="translate(${centerOffsetX.toFixed(2)}, 0) scale(${minimalScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      } else {
        svgMarkup += `  <!-- Official Custom Vector (Scaled) -->\n  <g transform="translate(0, 0) scale(${heightScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      }
    } else {
      const scaleFactor = effectiveLogoSize / 24;
      const iconX = isMinimal ? Math.round((height - effectiveLogoSize) / 2) : Math.round(12 * heightScale);
      const iconY = Math.round((height - effectiveLogoSize) / 2);
      const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : brandInfo.color);

      svgMarkup += `  <!-- Official Brand Vector Path -->\n  <g transform="translate(${iconX}, ${iconY}) scale(${scaleFactor})" fill="${fillColor}"${logoFilterAttr}>\n    <path d="${brandInfo.path}"/>\n  </g>\n`;
    }
  } else if (state.iconMode === 'upload' && state.uploadedDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgX = isMinimal ? Math.round((height - imgSize) / 2) : Math.round(12 * heightScale);
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <!-- Uploaded Image/SVG Logo -->\n  <image href="${state.uploadedDataUrl}" xlink:href="${state.uploadedDataUrl}" x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else if (state.iconMode === 'raw' && state.rawSvgDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgX = isMinimal ? Math.round((height - imgSize) / 2) : Math.round(12 * heightScale);
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <!-- Raw Pasted SVG Logo -->\n  <image href="${state.rawSvgDataUrl}" xlink:href="${state.rawSvgDataUrl}" x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else {
    const qX = isMinimal ? Math.round(height / 2) : Math.round(12 * heightScale + effectiveLogoSize / 2);
    const qY = Math.round(height / 2 + effectiveLogoSize * 0.35);
    svgMarkup += `  <!-- Placeholder ? Icon -->\n  <text x="${qX}" y="${qY}" fill="${textColor}" font-family="Inter, -apple-system, sans-serif" font-size="${effectiveLogoSize}" font-weight="700" text-anchor="middle" opacity="0.5">?</text>\n`;
  }

  // Render Typography with Gradients & Stroke Outlines
  const textFillAttr = useTextGrad ? 'fill="url(#badge-text-grad)"' : `fill="${textColor}"`;
  const textStrokeAttr = useTextStroke ? `stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"` : '';

  if (!isMinimal) {
    if (isSingleLine) {
      svgMarkup += `  <!-- 1-Line Text -->\n  <text x="${textX}" y="${height/2 + 5}" ${textFillAttr} ${textStrokeAttr} font-family="Inter, -apple-system, sans-serif" font-size="13" font-weight="700">${escapeHtml(bottomText)}</text>\n`;
    } else {
      if (topText) {
        svgMarkup += `  <text x="${textX}" y="${topY}" fill="#e0e0e0" ${textStrokeAttr} font-family="Inter, -apple-system, sans-serif" font-size="12" font-weight="500">${escapeHtml(topText)}</text>\n`;
      }
      if (bottomText) {
        svgMarkup += `  <text x="${textX}" y="${bottomY}" ${textFillAttr} ${textStrokeAttr} font-family="Inter, -apple-system, sans-serif" font-size="19" font-weight="800">${escapeHtml(bottomText)}</text>\n`;
      }
    }
  }

  svgMarkup += `</svg>`;

  // Update Preview Stage & Dimensions Display
  document.getElementById('badge-stage').innerHTML = svgMarkup;
  document.getElementById('badge-size-display').innerText = `${width} × ${height} px`;

  // Update Code Snippet Output
  updateSnippetOutput(svgMarkup, bottomText || 'Badge');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setCodeTab(tab) {
  state.codeTab = tab;
  document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`codetab-${tab}`).classList.add('active');

  const svgMarkup = document.getElementById('badge-stage').innerHTML;
  const title = document.getElementById('bottom-text').value || 'Badge';
  updateSnippetOutput(svgMarkup, title);
}

function updateSnippetOutput(svgMarkup, title) {
  const output = document.getElementById('snippet-output');
  if (!output) return;

  if (state.codeTab === 'md') {
    output.innerText = `![${title}](devin_badge.svg)`;
  } else if (state.codeTab === 'html') {
    output.innerText = `<img src="devin_badge.svg" alt="${title}" />`;
  } else if (state.codeTab === 'svg') {
    output.innerText = svgMarkup;
  }
}

function copyCode() {
  const code = document.getElementById('snippet-output').innerText;
  navigator.clipboard.writeText(code);
  showToast('Copied code snippet to clipboard!');
}

function downloadSVG() {
  const svgMarkup = document.getElementById('badge-stage').innerHTML;
  const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `devin_${title}_badge.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Downloaded SVG vector badge!');
}

function downloadPNG() {
  const svgElement = document.querySelector('#badge-stage svg');
  if (!svgElement) return;

  const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');
  const width = parseInt(svgElement.getAttribute('width'));
  const height = parseInt(svgElement.getAttribute('height'));

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const scale = 3;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `devin_${title}_badge.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded high-res PNG badge!');
  };

  img.src = url;
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

// Save & Load Configuration Functions
function getBadgeConfig() {
  return {
    version: '3.0',
    style: state.style,
    topText: document.getElementById('top-text')?.value || '',
    bottomText: document.getElementById('bottom-text')?.value || '',
    iconMode: state.iconMode,
    presetKey: document.getElementById('preset-select')?.value || 'github',
    uploadedDataUrl: state.uploadedDataUrl || '',
    rawSvgDataUrl: state.rawSvgDataUrl || '',
    customSvgContent: state.customSvgContent || '',
    isUploadedSvg: state.isUploadedSvg,
    showDisk: document.getElementById('show-disk-toggle')?.checked || false,
    diskColor: document.getElementById('disk-color')?.value || '#ffffff',
    logoColor: document.getElementById('logo-color')?.value || '#ffffff',
    bgColorTop: document.getElementById('bg-color-top')?.value || '#181f29',
    bgColorBottom: document.getElementById('bg-color-bottom')?.value || '#0f131a',
    textColor: document.getElementById('text-color')?.value || '#ffffff',
    radius: parseInt(document.getElementById('corner-radius')?.value || '8'),
    paddingRight: parseInt(document.getElementById('padding-horizontal')?.value || '16'),
    diskDiameter: parseInt(document.getElementById('disk-size-slider')?.value || '40'),
    userLogoScale: parseInt(document.getElementById('icon-scale-slider')?.value || '34'),
    useCustomLogoColor: document.getElementById('custom-logo-color-toggle')?.checked || false,
    useLogoStroke: document.getElementById('logo-stroke-toggle')?.checked || false,
    logoStrokeColor: document.getElementById('logo-stroke-color')?.value || '#ffffff',
    logoStrokeWidth: parseFloat(document.getElementById('logo-stroke-width')?.value || '2'),
    useTextGrad: document.getElementById('text-grad-toggle')?.checked || false,
    textGradTop: document.getElementById('text-grad-top')?.value || '#61DAFB',
    textGradBot: document.getElementById('text-grad-bot')?.value || '#FFFFFF',
    useTextStroke: document.getElementById('text-stroke-toggle')?.checked || false,
    textStrokeColor: document.getElementById('text-stroke-color')?.value || '#000000',
    textStrokeWidth: parseFloat(document.getElementById('text-stroke-width')?.value || '1.5')
  };
}

function applyBadgeConfig(cfg) {
  if (!cfg) return;

  if (cfg.style) setStyle(cfg.style);
  if (cfg.topText !== undefined && document.getElementById('top-text')) document.getElementById('top-text').value = cfg.topText;
  if (cfg.bottomText !== undefined && document.getElementById('bottom-text')) document.getElementById('bottom-text').value = cfg.bottomText;
  if (cfg.iconMode) setIconMode(cfg.iconMode);
  if (cfg.presetKey && document.getElementById('preset-select')) document.getElementById('preset-select').value = cfg.presetKey;
  
  if (cfg.uploadedDataUrl !== undefined) state.uploadedDataUrl = cfg.uploadedDataUrl;
  if (cfg.rawSvgDataUrl !== undefined) state.rawSvgDataUrl = cfg.rawSvgDataUrl;
  if (cfg.customSvgContent !== undefined) state.customSvgContent = cfg.customSvgContent;
  if (cfg.isUploadedSvg !== undefined) state.isUploadedSvg = cfg.isUploadedSvg;

  if (cfg.showDisk !== undefined && document.getElementById('show-disk-toggle')) document.getElementById('show-disk-toggle').checked = cfg.showDisk;
  if (cfg.diskColor && document.getElementById('disk-color')) document.getElementById('disk-color').value = cfg.diskColor;
  if (cfg.logoColor && document.getElementById('logo-color')) document.getElementById('logo-color').value = cfg.logoColor;
  if (cfg.bgColorTop && document.getElementById('bg-color-top')) document.getElementById('bg-color-top').value = cfg.bgColorTop;
  if (cfg.bgColorBottom && document.getElementById('bg-color-bottom')) document.getElementById('bg-color-bottom').value = cfg.bgColorBottom;
  if (cfg.textColor && document.getElementById('text-color')) document.getElementById('text-color').value = cfg.textColor;
  if (cfg.radius !== undefined && document.getElementById('corner-radius')) document.getElementById('corner-radius').value = cfg.radius;
  if (cfg.paddingRight !== undefined && document.getElementById('padding-horizontal')) document.getElementById('padding-horizontal').value = cfg.paddingRight;
  if (cfg.diskDiameter !== undefined && document.getElementById('disk-size-slider')) document.getElementById('disk-size-slider').value = cfg.diskDiameter;
  if (cfg.userLogoScale !== undefined && document.getElementById('icon-scale-slider')) document.getElementById('icon-scale-slider').value = cfg.userLogoScale;

  if (cfg.useCustomLogoColor !== undefined && document.getElementById('custom-logo-color-toggle')) document.getElementById('custom-logo-color-toggle').checked = cfg.useCustomLogoColor;
  if (cfg.useLogoStroke !== undefined && document.getElementById('logo-stroke-toggle')) document.getElementById('logo-stroke-toggle').checked = cfg.useLogoStroke;
  if (cfg.logoStrokeColor && document.getElementById('logo-stroke-color')) document.getElementById('logo-stroke-color').value = cfg.logoStrokeColor;
  if (cfg.logoStrokeWidth !== undefined && document.getElementById('logo-stroke-width')) document.getElementById('logo-stroke-width').value = cfg.logoStrokeWidth;

  if (cfg.useTextGrad !== undefined && document.getElementById('text-grad-toggle')) document.getElementById('text-grad-toggle').checked = cfg.useTextGrad;
  if (cfg.textGradTop && document.getElementById('text-grad-top')) document.getElementById('text-grad-top').value = cfg.textGradTop;
  if (cfg.textGradBot && document.getElementById('text-grad-bot')) document.getElementById('text-grad-bot').value = cfg.textGradBot;
  if (cfg.useTextStroke !== undefined && document.getElementById('text-stroke-toggle')) document.getElementById('text-stroke-toggle').checked = cfg.useTextStroke;
  if (cfg.textStrokeColor && document.getElementById('text-stroke-color')) document.getElementById('text-stroke-color').value = cfg.textStrokeColor;
  if (cfg.textStrokeWidth !== undefined && document.getElementById('text-stroke-width')) document.getElementById('text-stroke-width').value = cfg.textStrokeWidth;

  renderBadge();
}

function saveConfigToLocalStorage() {
  try {
    const config = getBadgeConfig();
    localStorage.setItem('devin_badge_config', JSON.stringify(config));
    showToast('Saved preset to browser memory!');
  } catch (err) {
    showToast('Failed to save config!');
  }
}

function loadConfigFromLocalStorage() {
  try {
    const raw = localStorage.getItem('devin_badge_config');
    if (!raw) {
      showToast('No saved preset found in browser memory!');
      return;
    }
    const config = JSON.parse(raw);
    applyBadgeConfig(config);
    showToast('Loaded preset from browser memory!');
  } catch (err) {
    showToast('Failed to load saved config!');
  }
}

function exportConfigJSON() {
  try {
    const config = getBadgeConfig();
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devin_badge_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported config JSON file!');
  } catch (err) {
    showToast('Failed to export JSON!');
  }
}

function importConfigJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const config = JSON.parse(evt.target.result);
      applyBadgeConfig(config);
      showToast('Imported config JSON file!');
    } catch (err) {
      showToast('Invalid JSON config file!');
    }
  };
  reader.readAsText(file);
}
