/* ==========================================================================
   BADGEWORKS - APPLICATION LOGIC
   ========================================================================== */

// Application State
const state = {
  style: 'cozy', // 'cozy' | 'compact' | 'cozy-minimal' | 'compact-minimal'
  topText: 'Available on',
  bottomText: 'GitHub',
  iconMode: 'preset', // 'preset' | 'fontawesome' | 'upload' | 'raw'
  logoPosition: 'left', // 'left' | 'right' | 'none'
  presetKey: 'github',
  uploadedDataUrl: '', // base64 DataURL for PNG/JPG/SVG
  isUploadedSvg: false,
  uploadFilename: '',
  customSvgContent: '',
  showDisk: false, // Default to FALSE for pure standalone logos!
  diskColor: '#ffffff',
  logoColor: '#0f141c',
  bgStops: ['#181f29', '#0f131a'], // background gradient stops (2–7)
  bgGradPreset: 'custom', // name of the currently-applied gradient preset ('custom' = manual)
  textColor: '#ffffff',
  radius: 8,
  paddingRight: 8,
  codeTab: 'md' // 'md' | 'html' | 'svg'
};

// Official Brand Icons with Authentic SimpleIcons & Devin Badges Geometry
const OFFICIAL_BRAND_ICONS = {
  github: {
    isCustomSvg: true,
    scalable: true, // honor the icon-size slider (scaled from the 64px artboard like vector paths)
    scalableBox: { x: 12, y: 12, w: 40, h: 40 }, // crop glyph whitespace so the mark fills the slider size
    defaultScale: 41, // slider default: matches the glyph's pre-crop size
    svg: `<path fill="#ffffff" d="M32.001 12.716C20.951 12.716 12 21.573 12 32.488c0 8.741 5.73 16.15 13.672 18.763 1.004.187 1.366-.425 1.366-.954 0-.47-.01-1.711-.018-3.36-5.567 1.192-6.74-2.658-6.74-2.658-.91-2.279-2.226-2.89-2.226-2.89-1.81-1.223.144-1.197.144-1.197 2.005.135 3.06 2.033 3.06 2.033 1.784 3.025 4.68 2.15 5.827 1.641.175-1.274.696-2.15 1.264-2.638-4.44-.496-9.11-2.195-9.11-9.772 0-2.163.775-3.926 2.057-5.31-.222-.495-.9-2.51.176-5.233 0 0 1.674-.528 5.5 2.027a19.5 19.5 0 0 1 5-.668c1.7.011 3.4.231 5 .669 3.805-2.556 5.477-2.028 5.477-2.028 1.074 2.723.397 4.736.202 5.233 1.268 1.384 2.044 3.148 2.044 5.31 0 7.594-4.676 9.269-9.121 9.752.695.592 1.346 1.81 1.346 3.657 0 2.644-.025 4.775-.025 5.419 0 .514.35 1.132 1.38.933C46.275 48.63 52 41.216 52 32.487c0-10.916-8.952-19.773-20.001-19.773z"/>`,
    color: '#ffffff',
    bgTop: '#181f29',
    bgBot: '#0f131a'
  },
  python: {
    isCustomSvg: true,
    scalable: true, // honor the icon-size slider (scaled from the 64px artboard like vector paths)
    scalableBox: { x: 12, y: 12, w: 40, h: 39 }, // crop glyph whitespace so the mark fills the slider size
    defaultScale: 41, // slider default: matches the glyph's pre-crop size
    svg: `
      <path fill="#306998" d="M31.762 12a28 28 0 0 0-4.61.39c-4.083.713-4.825 2.206-4.825 4.96v3.637h9.648v1.212H18.708c-2.805 0-5.26 1.667-6.028 4.838-.886 3.635-.925 5.904 0 9.699.686 2.825 2.324 4.838 5.128 4.838h3.317v-4.36c0-3.15 2.756-5.928 6.028-5.928h9.636c2.683 0 4.824-2.185 4.824-4.85V17.35c0-2.586-2.205-4.529-4.824-4.96A30.4 30.4 0 0 0 31.762 12m-5.218 2.925c.997 0 1.81.818 1.81 1.824a1.81 1.81 0 1 1-3.62 0c0-1.005.81-1.824 1.81-1.824"/>
      <path fill="#FFE873" d="M42.816 22.2v4.237c0 3.285-2.816 6.05-6.028 6.05h-9.636c-2.64 0-4.825 2.235-4.825 4.85v9.086c0 2.586 2.274 4.107 4.824 4.85 3.055.887 5.983 1.048 9.637 0 2.43-.696 4.824-2.096 4.824-4.85v-3.637h-9.637v-1.212h14.462c2.803 0 3.848-1.935 4.824-4.838 1.007-2.99.964-5.864 0-9.699-.693-2.76-2.017-4.838-4.824-4.838zm-5.42 23.01c1 0 1.81.811 1.81 1.814 0 1.006-.81 1.824-1.81 1.824a1.82 1.82 0 0 1-1.81-1.824c0-1.003.813-1.813 1.81-1.813"/>
    `,
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
    isCustomSvg: true,
    scalable: true, // honor the icon-size slider (scaled from the 64px artboard like vector paths)
    scalableBox: { x: 15.5, y: 15.5, w: 33, h: 33 }, // crop glyph whitespace so the mark fills the slider size
    defaultScale: 41, // slider default: matches the glyph's pre-crop size
    svg: `
      <g transform="translate(32, 32) scale(1.5)">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" stroke-width="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </g>
    `,
    color: '#61DAFB',
    bgTop: '#132230',
    bgBot: '#0b1620'
  },
  docker: {
    path: "M6.94221099,14.9002344 C6.9980621,14.9002344 7.05128211,14.9107588 7.10043586,14.9297745 C7.04721586,14.9606302 7.01109801,15.018335 7.01109801,15.0842919 C7.01109801,15.1828984 7.09098782,15.2626686 7.18959432,15.2626686 C7.25710599,15.2626686 7.31570779,15.2251754 7.34608506,15.1698027 C7.36743286,15.2214082 7.37939241,15.2780367 7.37939241,15.3374756 C7.37939241,15.578939 7.18361455,15.774657 6.94221099,15.774657 C6.70080744,15.774657 6.50496978,15.578939 6.50496978,15.3374756 C6.50496978,15.0959525 6.70080744,14.9002344 6.94221099,14.9002344 L6.94221099,14.9002344 Z M6.94221099,16.0853662 C6.52978585,16.0853662 6.19420083,15.7499008 6.19420083,15.3374756 C6.19420083,14.9250505 6.52978585,14.5895253 6.94221099,14.5895253 C7.35457634,14.5895253 7.69010156,14.9250505 7.69010156,15.3374756 C7.69010156,15.7499008 7.35457634,16.0853662 6.94221099,16.0853662 L6.94221099,16.0853662 Z M20.3859431,11.1838037 C18.2619865,16.8117894 13.4653093,19.318631 7.81023526,19.318631 C5.13823222,19.318631 3.00656172,18.3995992 1.64323262,16.8672219 L1.65327865,16.8605843 C2.04609012,16.880497 2.39758135,16.8872541 2.75439457,16.8872541 C3.08065114,16.8872541 3.39979178,16.8838457 3.6953721,16.8672219 C3.72108514,16.8657867 3.75325633,16.8621989 3.77878997,16.8605843 C3.77902916,16.8605245 3.86998155,16.8546046 3.82549202,16.853887 C4.57667146,16.8075437 5.15892224,16.7031368 5.70188589,16.5482008 C5.70200548,16.548141 5.70212508,16.548141 5.70224467,16.5480812 C5.80091098,16.5198567 5.89658739,16.4901372 5.98825735,16.4583846 C6.09081051,16.4228049 6.14510687,16.3108635 6.109587,16.2083104 C6.07406714,16.1056974 5.96218553,16.0512815 5.85957258,16.0869807 C5.16992503,16.3259326 4.26010213,16.4574876 3.14505333,16.4821841 L3.14475434,16.4821841 C2.57739321,16.4947416 1.95717085,16.4797922 1.28450587,16.4365584 L1.28444607,16.4365584 C1.14529669,16.2507668 1.01649231,16.0576798 0.89869073,15.8577161 L0.71248051,15.5172277 C0.149903198,14.4112083 -0.0964037696,13.1191582 0.0343141305,11.7160038 L16.3965356,11.7160038 C17.7407294,11.7160038 19.0534696,11.2143604 19.6764427,10.6609919 C18.5601381,9.75332174 18.670764,7.59731356 19.3822377,6.774616 C19.9997093,7.270758 20.9954018,8.31584342 20.824141,9.64622396 C21.6011531,9.255625 22.9506091,9.06259783 24,9.66816973 C23.3411483,10.9541803 21.8929064,11.3383809 20.3859431,11.1838037 L20.3859431,11.1838037 Z M2.25508329,11.3188869 L4.46771995,11.3188869 L4.46771995,9.1061306 L2.25508329,9.1061306 L2.25508329,11.3188869 Z M4.80808879,11.3188869 L7.02096464,11.3188869 L7.02096464,9.1061306 L4.80808879,9.1061306 L4.80808879,11.3188869 Z M4.80808879,8.76576176 L7.02096464,8.76576176 L7.02096464,6.5530653 L4.80808879,6.5530653 L4.80808879,8.76576176 Z M7.36127369,11.3188869 L9.57402994,11.3188869 L9.57402994,9.1061306 L7.36127369,9.1061306 L7.36127369,11.3188869 Z M7.36127369,8.76576176 L9.57402994,8.76576176 L9.57402994,6.5530653 L7.36127369,6.5530653 L7.36127369,8.76576176 Z M9.91433899,11.3188869 L12.1270952,11.3188869 L12.1270952,9.1061306 L9.91433899,9.1061306 L9.91433899,11.3188869 Z M9.91433899,8.76576176 L12.1270952,8.76576176 L12.1270952,6.5530653 L9.91433899,6.5530653 L9.91433899,8.76576176 Z M9.91433899,6.21275626 L12.1270952,6.21275626 L12.1270952,4 L9.91433899,4 L9.91433899,6.21275626 Z M12.4674043,11.3188869 L14.6801605,11.3188869 L14.6801605,9.1061306 L12.4674043,9.1061306 L12.4674043,11.3188869 Z",
    color: "#0DB7ED",
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
    isCustomSvg: true,
    scalable: true, // honor the icon-size slider (scaled from the 64px artboard like vector paths)
    noTint: true, // stroke/mask-based artwork; tinting via the alpha filter only
    svg: `<g transform="translate(32, 32) scale(0.6)"><path transform="translate(0.5, 0.5)" stroke="#ffffff" stroke-width="1" stroke-linejoin="round" d="M -9,-15 H 4 C 12,-15 12,-7 4,-7 H -9 Z M -40,22 H 0 V 11 H -9 V 3 H 1 C 12,3 6,22 15,22 H 40 V 3 H 34 V 5 C 34,13 25,12 24,7 C 23,2 19,-2 18,-2 C 33,-10 24,-26 12,-26 H -35 V -15 H -25 V 11 H -40 Z"/><g mask="url(#rust-holes)"><circle r="43" fill="none" stroke="#ffffff" stroke-width="9"/><g id="cogs"><polygon id="rust-cog" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" points="46,3 51,0 46,-3"/><use xlink:href="#rust-cog" transform="rotate(11.25)"/><use xlink:href="#rust-cog" transform="rotate(22.50)"/><use xlink:href="#rust-cog" transform="rotate(33.75)"/><use xlink:href="#rust-cog" transform="rotate(45.00)"/><use xlink:href="#rust-cog" transform="rotate(56.25)"/><use xlink:href="#rust-cog" transform="rotate(67.50)"/><use xlink:href="#rust-cog" transform="rotate(78.75)"/><use xlink:href="#rust-cog" transform="rotate(90.00)"/><use xlink:href="#rust-cog" transform="rotate(101.25)"/><use xlink:href="#rust-cog" transform="rotate(112.50)"/><use xlink:href="#rust-cog" transform="rotate(123.75)"/><use xlink:href="#rust-cog" transform="rotate(135.00)"/><use xlink:href="#rust-cog" transform="rotate(146.25)"/><use xlink:href="#rust-cog" transform="rotate(157.50)"/><use xlink:href="#rust-cog" transform="rotate(168.75)"/><use xlink:href="#rust-cog" transform="rotate(180.00)"/><use xlink:href="#rust-cog" transform="rotate(191.25)"/><use xlink:href="#rust-cog" transform="rotate(202.50)"/><use xlink:href="#rust-cog" transform="rotate(213.75)"/><use xlink:href="#rust-cog" transform="rotate(225.00)"/><use xlink:href="#rust-cog" transform="rotate(236.25)"/><use xlink:href="#rust-cog" transform="rotate(247.50)"/><use xlink:href="#rust-cog" transform="rotate(258.75)"/><use xlink:href="#rust-cog" transform="rotate(270.00)"/><use xlink:href="#rust-cog" transform="rotate(281.25)"/><use xlink:href="#rust-cog" transform="rotate(292.50)"/><use xlink:href="#rust-cog" transform="rotate(303.75)"/><use xlink:href="#rust-cog" transform="rotate(315.00)"/><use xlink:href="#rust-cog" transform="rotate(326.25)"/><use xlink:href="#rust-cog" transform="rotate(337.50)"/><use xlink:href="#rust-cog" transform="rotate(348.75)"/></g><g id="mounts"><polygon id="rust-mount" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" points="-7,-42 0,-35 7,-42"/><use xlink:href="#rust-mount" transform="rotate(72)"/><use xlink:href="#rust-mount" transform="rotate(144)"/><use xlink:href="#rust-mount" transform="rotate(216)"/><use xlink:href="#rust-mount" transform="rotate(288)"/></g></g><mask id="rust-holes"><rect x="-60" y="-60" width="120" height="120" fill="#ffffff"/><circle id="rust-hole" cy="-40" r="3"/><use xlink:href="#rust-hole" transform="rotate(72)"/><use xlink:href="#rust-hole" transform="rotate(144)"/><use xlink:href="#rust-hole" transform="rotate(216)"/><use xlink:href="#rust-hole" transform="rotate(288)"/></mask></g>`,
    color: '#ffffff',
    bgTop: '#2b211a',
    bgBot: '#17120e'
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
  // Apply the default preset's preferred icon-size slider before the first render
  applyIconScaleDefault(document.getElementById('preset-select').value);

  // Build the background gradient stop editor
  renderBgStopEditor();

  // Wire up drag & drop on the upload dropzone
  const dropzone = document.getElementById('image-dropzone');
  if (dropzone) {
    ['dragover', 'dragenter'].forEach((evtName) => dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragging');
    }));
    ['dragleave', 'dragend'].forEach((evtName) => dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
    }));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) processUploadedFile(file);
    });
  }

  // Prevent the browser from navigating away when a file is dropped elsewhere on the page
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  // Wait for fonts to load before initial render
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderBadge();
    });
  } else {
    // Fallback if Font Loading API is not available
    setTimeout(renderBadge, 100);
  }
});

// Apply a preset's preferred icon-size slider default (github/python/react default to 41 so the
// cropped glyph matches its pre-crop size). Presets without `defaultScale` leave the slider alone.
function applyIconScaleDefault(presetKey) {
  const info = OFFICIAL_BRAND_ICONS[presetKey];
  if (info && info.defaultScale) {
    const slider = document.getElementById('icon-scale-slider');
    if (slider) slider.value = String(info.defaultScale);
    const label = document.getElementById('icon-scale-num');
    if (label) label.innerText = `${info.defaultScale}px`;
  }
}

// Preset dropdown change handler
function onPresetSelect() {
  applyIconScaleDefault(document.getElementById('preset-select').value);
  renderBadge();
}

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
  document.getElementById('seg-fontawesome').classList.toggle('active', mode === 'fontawesome');
  document.getElementById('seg-upload').classList.toggle('active', mode === 'upload');
  document.getElementById('seg-raw').classList.toggle('active', mode === 'raw');

  document.getElementById('icon-mode-preset').style.display = mode === 'preset' ? 'block' : 'none';
  document.getElementById('icon-mode-fontawesome').style.display = mode === 'fontawesome' ? 'block' : 'none';
  document.getElementById('icon-mode-upload').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('icon-mode-raw').style.display = mode === 'raw' ? 'block' : 'none';

  // Update FontAwesome preview
  if (mode === 'fontawesome') {
    updateFontAwesomePreview();
  }

  renderBadge();
}

// Logo Position Switcher (left / right / none)
function setLogoPosition(pos) {
  state.logoPosition = pos;
  document.getElementById('seg-pos-left').classList.toggle('active', pos === 'left');
  document.getElementById('seg-pos-right').classList.toggle('active', pos === 'right');
  document.getElementById('seg-pos-none').classList.toggle('active', pos === 'none');
  renderBadge();
}

// Parse FA input from pack dropdown + name input, or from explicit raw string / pasted HTML
function parseFontAwesomeInput(raw) {
  const packSelect = document.getElementById('fa-pack-select');
  const nameInput = document.getElementById('fa-icon-name');
  
  let rawStr = typeof raw === 'string' ? raw : (nameInput ? nameInput.value : 'github');
  if (!rawStr) rawStr = '';

  const tagMatch = rawStr.match(/<i[^>]+class=["']([^"']+)["']/i);
  const classStr = tagMatch ? tagMatch[1].trim() : rawStr.trim();

  if (classStr.includes(' ')) {
    const { style, name } = parseFaClass(classStr);
    const packVal = style === 'brands' ? 'fa-brands' : style === 'regular' ? 'fa-regular' : 'fa-solid';
    const cleanName = name || 'github';
    if (packSelect) packSelect.value = packVal;
    if (nameInput && nameInput.value !== cleanName) nameInput.value = cleanName;
    return `${packVal} fa-${cleanName}`;
  }

  const pack = packSelect ? packSelect.value : 'fa-brands';
  let cleanName = classStr.replace(/^fa-/, '').trim();
  if (nameInput && nameInput.value !== cleanName && cleanName !== '') {
    nameInput.value = cleanName;
  }
  if (!cleanName) cleanName = 'github';
  return `${pack} fa-${cleanName}`;
}

function updateFontAwesomePreview() {
  const iconClass = parseFontAwesomeInput();
  const faPreview = document.getElementById('fa-preview');
  if (!faPreview) return;

  const iconElement = faPreview.querySelector('i');
  if (iconElement) iconElement.className = iconClass;
}

// FA CDN fetch cache
const faIconCache = new Map();

// Parse "fa-brands fa-github" or "fa-solid fa-image" into { style, name }
// style: solid → s, regular → r, brands → brands, light → l, thin → t, duotone → d
function parseFaClass(iconClass) {
  const parts = iconClass.trim().split(/\s+/).filter(p => p.startsWith('fa-'));
  let style = 'solid';
  let name = null;
  for (const p of parts) {
    const token = p.replace('fa-', '');
    if (['solid','regular','light','thin','duotone','brands','brand','slab'].includes(token)) {
      if (token === 'brands' || token === 'brand') style = 'brands';
      else if (token === 'regular') style = 'regular';
      else if (token === 'light') style = 'light';
      else style = 'solid';
    } else if (token !== 'fa' && token !== '') {
      name = token;
    }
  }
  return { style, name };
}

// Fetch the real SVG from the FontAwesome free CDN and extract path + viewBox
function extractFontAwesomeSvg(iconClass) {
  const { style, name } = parseFaClass(iconClass);
  if (!name) return Promise.resolve(null);

  const cacheKey = `${style}:${name}`;
  if (faIconCache.has(cacheKey)) return Promise.resolve(faIconCache.get(cacheKey));

  // Map style to CDN folder
  const folder = style === 'brands' ? 'brands' : style === 'regular' ? 'regular' : 'solid';
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/${folder}/${name}.svg`;

  return fetch(url)
    .then(r => r.ok ? r.text() : null)
    .then(svgText => {
      if (!svgText) { faIconCache.set(cacheKey, null); return null; }
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) { faIconCache.set(cacheKey, null); return null; }
      const viewBox = svgEl.getAttribute('viewBox') || '0 0 512 512';
      const pathData = Array.from(svgEl.querySelectorAll('path'))
        .map(p => p.getAttribute('d')).filter(Boolean).join(' ');
      const result = pathData ? { viewBox, pathData } : null;
      faIconCache.set(cacheKey, result);
      return result;
    })
    .catch(() => { faIconCache.set(cacheKey, null); return null; });
}

// Listen for FontAwesome input changes to update preview
document.addEventListener('DOMContentLoaded', () => {
  const faNameInput = document.getElementById('fa-icon-name');
  const faPackSelect = document.getElementById('fa-pack-select');
  const onFaChange = () => {
    updateFontAwesomePreview();
    renderBadge();
  };
  if (faNameInput) faNameInput.addEventListener('input', onFaChange);
  if (faPackSelect) faPackSelect.addEventListener('change', onFaChange);
});

// Handle File Upload (PNG, JPG, SVG)
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  processUploadedFile(file);
}

function processUploadedFile(file) {
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
  state.uploadFilename = filename;
  document.getElementById('upload-preview-bar').style.display = 'flex';
  document.getElementById('upload-filename').innerText = filename;
  document.getElementById('upload-thumb').src = dataUrl;
  document.getElementById('upload-status-text').innerText = `Uploaded: ${filename}`;
}

function clearUpload() {
  state.uploadedDataUrl = '';
  state.rawSvgDataUrl = '';
  state.customSvgContent = '';
  state.uploadFilename = '';
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
  applyIconScaleDefault(p.icon);
  if (brandInfo) {
    state.bgStops = [brandInfo.bgTop || '#181f29', brandInfo.bgBot || '#0f131a'];
    setBgGradPresetSelect('custom');
    renderBgStopEditor();
  }

  state.iconMode = 'preset';
  setIconMode('preset');
  renderBadge();
}

// Text measurement cache to prevent flickering
const textMeasurementCache = new Map();

// Accurately measure text width using Canvas API
function measureText(text, fontSpec) {
  if (!text) return 0;
  
  // Check cache first
  const cacheKey = `${text}|${fontSpec}`;
  if (textMeasurementCache.has(cacheKey)) {
    return textMeasurementCache.get(cacheKey);
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = fontSpec;
  const width = ctx.measureText(text).width;
  // Always round up to prevent flickering
  const roundedWidth = Math.ceil(width);
  
  // Cache the measurement
  textMeasurementCache.set(cacheKey, roundedWidth);
  
  return roundedWidth;
}

// Incremented on every render; lets async FontAwesome swaps detect (and skip) stale renders
let renderToken = 0;

// Background gradient presets (2–7 stops each)
const BG_GRADIENT_PRESETS = {
  rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#007fff', '#0000ff', '#8b00ff'],
  'rainbow-pastel': ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff', '#ffb3e6'],
  ocean: ['#0f2027', '#203a43', '#2c5364'],
  sunset: ['#ff512f', '#f09819', '#dd2476', '#6a11cb'],
  fire: ['#ff0000', '#ff4d00', '#ff9900', '#ffcc00', '#ffe066'],
  forest: ['#134e5e', '#56ab2f', '#71b280'],
  synthwave: ['#8e2de2', '#4a00e0', '#ff00cc', '#00e5ff'],
  grayscale: ['#2b2b2b', '#4a4a4a', '#6f6f6f', '#999999', '#c2c2c2'],
  candy: ['#fdfbfb', '#f6d365', '#fda085', '#fbc2eb']
};
const BG_GRADIENT_MAX_STOPS = 7;

// Rebuild the background gradient stop editor rows from state.bgStops
function renderBgStopEditor() {
  const list = document.getElementById('bg-stop-list');
  if (!list) return;
  const sel = document.getElementById('bg-grad-preset');
  if (sel) sel.value = state.bgGradPreset || 'custom';
  list.innerHTML = '';

  state.bgStops.forEach((hex, i) => {
    const row = document.createElement('div');
    row.className = 'bg-stop-row';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'bg-stop-color';
    colorInput.value = hex;

    const hexLabel = document.createElement('span');
    hexLabel.className = 'bg-stop-hex';
    hexLabel.innerText = hex;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'bg-stop-remove';
    removeBtn.title = 'Remove stop';
    removeBtn.innerHTML = '&times;';
    removeBtn.disabled = state.bgStops.length <= 2;

    colorInput.addEventListener('input', () => {
      const val = colorInput.value;
      state.bgStops[i] = val;
      hexLabel.innerText = val;
      setBgGradPresetSelect('custom');
      renderBadge();
    });

    removeBtn.addEventListener('click', () => {
      if (state.bgStops.length <= 2) return;
      state.bgStops.splice(i, 1);
      setBgGradPresetSelect('custom');
      renderBgStopEditor();
      renderBadge();
    });

    row.appendChild(colorInput);
    row.appendChild(hexLabel);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });

  const addBtn = document.getElementById('bg-add-stop');
  if (addBtn) addBtn.disabled = state.bgStops.length >= BG_GRADIENT_MAX_STOPS;
}

// Sync the preset dropdown + state with a given preset name
function setBgGradPresetSelect(name) {
  state.bgGradPreset = name;
  const sel = document.getElementById('bg-grad-preset');
  if (sel) sel.value = name;
}

// Preset dropdown change: apply the preset's stops (or leave stops untouched for 'custom')
function onBgGradPresetSelect() {
  const sel = document.getElementById('bg-grad-preset');
  const name = sel ? sel.value : 'custom';
  if (name !== 'custom' && BG_GRADIENT_PRESETS[name]) {
    state.bgStops = BG_GRADIENT_PRESETS[name].slice();
    renderBgStopEditor();
  }
  setBgGradPresetSelect(name);
  renderBadge();
}

// Add another gradient stop (max 7)
function addBgStop() {
  if (state.bgStops.length >= BG_GRADIENT_MAX_STOPS) return;
  state.bgStops.push('#ffffff');
  setBgGradPresetSelect('custom');
  renderBgStopEditor();
  renderBadge();
}

// Live-sync the hex text next to every color picker (uppercased).
function updateColorHexes() {
  document.querySelectorAll('.color-val').forEach(span => {
    const wrap = span.closest ? span.closest('.color-picker-wrap') : null;
    const input = wrap && wrap.querySelector('input[type="color"]');
    if (input) span.textContent = input.value.toUpperCase();
  });
}

// Disable controls that only matter when their parent toggle is on, so the UI reads clearly.
function syncDependentControls() {
  const dep = (enabled, ids) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.disabled = !enabled;
      el.classList.toggle('fx-dim', !enabled);
    });
  };
  dep(document.getElementById('text-grad-toggle')?.checked || false, ['text-grad-top', 'text-grad-bot']);
  dep(document.getElementById('text-stroke-toggle')?.checked || false, ['text-stroke-color', 'text-stroke-width']);
  dep(document.getElementById('text-shadow-toggle')?.checked || false, ['text-shadow-color', 'text-shadow-blur']);
  dep(document.getElementById('show-disk-toggle')?.checked || false, ['disk-color', 'disk-size-slider']);
  dep(document.getElementById('custom-logo-color-toggle')?.checked || false, ['logo-color']);
  dep(document.getElementById('logo-stroke-toggle')?.checked || false, ['logo-stroke-color', 'logo-stroke-width']);
  dep(document.getElementById('logo-shadow-toggle')?.checked || false, ['logo-shadow-color', 'logo-shadow-blur']);
  // The icon-size slider only drives scalable preset icons (e.g. github/python/react/rust).
  const scalablePreset = state.iconMode === 'preset'
    && (OFFICIAL_BRAND_ICONS[document.getElementById('preset-select')?.value]?.scalable === true);
  const slider = document.getElementById('icon-scale-slider');
  if (slider) {
    slider.disabled = !scalablePreset;
    slider.classList.toggle('fx-dim', !scalablePreset);
  }
}

// Build the combined logo FX filter (drop shadow + outline stroke + custom tint), or '' if unused.
function buildLogoFxFilter(id, opts) {
  const { useTint, tintColor, useStroke, strokeColor, strokeWidth, useShadow, shadowColor, shadowBlur } = opts;
  if (!useTint && !useStroke && !useShadow) return '';

  let m = `    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">\n`;
  if (useShadow) {
    m += `      <feOffset in="SourceAlpha" dx="0" dy="2" result="shadowOffset"/>\n`;
    m += `      <feGaussianBlur in="shadowOffset" stdDeviation="${shadowBlur}" result="shadowBlur"/>\n`;
    m += `      <feFlood flood-color="${shadowColor}" flood-opacity="0.85" result="shadowColor"/>\n`;
    m += `      <feComposite in="shadowColor" in2="shadowBlur" operator="in" result="shadow"/>\n`;
  }
  if (useStroke) {
    m += `      <feMorphology operator="dilate" radius="${strokeWidth}" in="SourceAlpha" result="expanded"/>\n`;
    m += `      <feFlood flood-color="${strokeColor}" result="strokeColor"/>\n`;
    m += `      <feComposite in="strokeColor" in2="expanded" operator="in" result="stroke"/>\n`;
  }
  if (useTint) {
    m += `      <feFlood flood-color="${tintColor}" result="tintColor"/>\n`;
    m += `      <feComposite in="tintColor" in2="SourceAlpha" operator="in" result="tintedGraphic"/>\n`;
  }
  m += `      <feMerge>\n`;
  if (useShadow) m += `        <feMergeNode in="shadow"/>\n`;
  if (useStroke) m += `        <feMergeNode in="stroke"/>\n`;
  m += `        <feMergeNode in="${useTint ? 'tintedGraphic' : 'SourceGraphic'}"/>\n`;
  m += `      </feMerge>\n`;
  m += `    </filter>\n`;
  return m;
}

// Main Render Logic
function renderBadge() {
  const token = ++renderToken;
  updateColorHexes();
  syncDependentControls();
  // Read form inputs
  const topText = document.getElementById('top-text').value;
  const bottomText = document.getElementById('bottom-text').value;
  const showDisk = document.getElementById('show-disk-toggle').checked;
  const diskColor = document.getElementById('disk-color').value;
  const logoColor = document.getElementById('logo-color').value;
  const bgStops = state.bgStops && state.bgStops.length >= 2 ? state.bgStops : ['#181f29', '#0f131a'];
  const textColor = document.getElementById('text-color').value;
  const radius = parseInt(document.getElementById('corner-radius').value);
  const paddingRight = parseInt(document.getElementById('padding-horizontal').value);
  
  // Size Sliders
  const diskDiameter = parseInt(document.getElementById('disk-size-slider').value) || 40;
  const userLogoScale = parseInt(document.getElementById('icon-scale-slider').value) || 34;

  // Dynamic Specs per Style Variant (matches official intergrav/devins-badges)
  let height = 64;
  let topFont = '500 13px Inter, -apple-system, sans-serif';
  let bottomFont = '700 21px Inter, -apple-system, sans-serif';
  let topY = 25;
  let bottomY = 48;
  let isMinimal = false;
  let isSingleLine = false;

  if (state.style === 'compact') {
    // Official "compact" = 40px tall, single-line text
    height = 40;
    bottomFont = '700 13px Inter, -apple-system, sans-serif';
    isSingleLine = true;
  } else if (state.style === 'cozy-minimal') {
    // Official "cozy-minimal" = 64×64 icon-only square
    height = 64;
    isMinimal = true;
  } else if (state.style === 'compact-minimal') {
    // Official "compact-minimal" = 40×40 icon-only square
    height = 40;
    isMinimal = true;
  }

  // Scale factor based on badge height relative to 64px Cozy baseline
  const heightScale = height / 64;

  // Logo position: 'left' | 'right' | 'none'
  const noLogo = state.logoPosition === 'none';
  const logoOnRight = state.logoPosition === 'right';
  const leftPad = Math.round(12 * heightScale);

  // No-logo mode: bigger, centered text
  if (noLogo) {
    if (isSingleLine) {
      bottomFont = '700 16px Inter, -apple-system, sans-serif';
    } else {
      topFont = '500 15px Inter, -apple-system, sans-serif';
      bottomFont = '700 26px Inter, -apple-system, sans-serif';
    }
  }

  // Update slider displays & hex swatches safely
  state.showDisk = showDisk;
  if (document.getElementById('disk-size-num')) document.getElementById('disk-size-num').innerText = `${diskDiameter}px`;
  if (document.getElementById('icon-scale-num')) document.getElementById('icon-scale-num').innerText = `${userLogoScale}px`;
  if (document.getElementById('text-hex')) document.getElementById('text-hex').innerText = textColor;
  if (document.getElementById('radius-val')) document.getElementById('radius-val').innerText = `${radius}px`;
  if (document.getElementById('padding-val')) document.getElementById('padding-val').innerText = `${paddingRight}px`;

  const presetKey = document.getElementById('preset-select').value;
  const brandInfo = OFFICIAL_BRAND_ICONS[presetKey] || OFFICIAL_BRAND_ICONS.github;

  // Scaled logo size & Text X calculation:
  const effectiveLogoSize = Math.round(userLogoScale * heightScale);

  // Custom-SVG presets normally draw on a full 64px artboard (the size slider is ignored),
  // so reserve the full artboard width for spacing math. Icons marked `scalable` (e.g. rust)
  // behave like vector paths: they honor the icon-size slider and only reserve effectiveLogoSize.
  const isCustomArtboard = state.iconMode === 'preset' && brandInfo.isCustomSvg && !brandInfo.scalable;
  const logoReserve = isCustomArtboard ? 64 * heightScale : effectiveLogoSize;
  // Mirror spacing for right mode: artboard icons draw flush to the logo-side edge (just like
  // left mode, where the artboard starts at x=0). Vector/upload/FA logos get leftPad padding.
  const logoBoxPad = isCustomArtboard ? 0 : leftPad;
  // Right mode: where the logo box should start so the text↔logo and logo↔edge gaps mirror left mode.
  let logoBoxStart = null;

  let textX = 0;
  const textCentered = noLogo;
  if (!noLogo) {
    if (logoOnRight) {
      textX = leftPad;
    } else if (brandInfo && brandInfo.textX && state.iconMode === 'preset') {
      textX = Math.round(brandInfo.textX * heightScale);
    } else {
      textX = Math.round(leftPad + effectiveLogoSize + leftPad);
    }
  }

  // Max badge width — beyond this, text compresses instead of growing the badge
  const MAX_BADGE_WIDTH = 420;

  let width = height;
  let maxTextW = 0;
  if (!isMinimal) {
    const textCorrectionFactor = 0.98;
    if (isSingleLine) {
      maxTextW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
    } else {
      const topW = topText ? measureText(topText, topFont) * textCorrectionFactor : 0;
      const bottomW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
      maxTextW = Math.max(topW, bottomW);
    }
    if (noLogo) {
      width = Math.min(Math.ceil(maxTextW + leftPad * 2 + 4), MAX_BADGE_WIDTH);
    } else if (logoOnRight) {
      // Mirrored left-mode spacing: capture the left-mode layout (where the text would start if
      // the logo were on the left) and flip it. This keeps the text↔logo and logo↔outer-edge gaps
      // identical on both sides instead of stacking two full pads on top of the logo width.
      let textXLeft;
      if (brandInfo && brandInfo.textX && state.iconMode === 'preset') {
        textXLeft = Math.round(brandInfo.textX * heightScale);
      } else {
        textXLeft = Math.round(leftPad + effectiveLogoSize + leftPad);
      }
      logoBoxStart = Math.round(leftPad + maxTextW + (textXLeft - (logoBoxPad + logoReserve)));
      width = Math.min(Math.ceil(logoBoxStart + logoReserve + logoBoxPad), MAX_BADGE_WIDTH);
    } else {
      width = Math.min(Math.ceil(textX + maxTextW + paddingRight + 4), MAX_BADGE_WIDTH);
    }
  }

  // How many px are actually available for text (used for textLength compression)
  let availableTextWidth;
  if (noLogo) {
    availableTextWidth = width - leftPad * 2 - 4;
  } else if (logoOnRight) {
    availableTextWidth = Math.max(maxTextW, width - textX - logoBoxPad - 4);
  } else {
    availableTextWidth = width - textX - paddingRight - 4;
  }

  // Text FX Controls
  const useTextGrad = document.getElementById('text-grad-toggle')?.checked || false;
  const textGradTop = document.getElementById('text-grad-top')?.value || '#61DAFB';
  const textGradBot = document.getElementById('text-grad-bot')?.value || '#FFFFFF';
  const useTextStroke = document.getElementById('text-stroke-toggle')?.checked || false;
  const textStrokeColor = document.getElementById('text-stroke-color')?.value || '#000000';
  const textStrokeWidth = document.getElementById('text-stroke-width')?.value || '1.5';
  const subtitleColor = document.getElementById('subtitle-color')?.value || '#e0e0e0';
  const useTextShadow = document.getElementById('text-shadow-toggle')?.checked || false;
  const textShadowColor = document.getElementById('text-shadow-color')?.value || '#000000';
  const textShadowBlur = parseFloat(document.getElementById('text-shadow-blur')?.value || '2');

  if (document.getElementById('text-stroke-val')) {
    document.getElementById('text-stroke-val').innerText = `${textStrokeWidth}px`;
  }
  if (document.getElementById('text-shadow-val')) {
    document.getElementById('text-shadow-val').innerText = `${textShadowBlur}px`;
  }

  // Logo FX Controls
  const useCustomLogoColor = document.getElementById('custom-logo-color-toggle')?.checked || false;
  const customLogoColor = document.getElementById('logo-color')?.value || '#ffffff';
  const useLogoStroke = document.getElementById('logo-stroke-toggle')?.checked || false;
  const logoStrokeColor = document.getElementById('logo-stroke-color')?.value || '#ffffff';
  const logoStrokeWidth = document.getElementById('logo-stroke-width')?.value || '2';
  const useLogoShadow = document.getElementById('logo-shadow-toggle')?.checked || false;
  const logoShadowColor = document.getElementById('logo-shadow-color')?.value || '#000000';
  const logoShadowBlur = parseFloat(document.getElementById('logo-shadow-blur')?.value || '2');

  if (document.getElementById('logo-stroke-val')) {
    document.getElementById('logo-stroke-val').innerText = `${logoStrokeWidth}px`;
  }
  if (document.getElementById('logo-shadow-val')) {
    document.getElementById('logo-shadow-val').innerText = `${logoShadowBlur}px`;
  }

  // SVG Header & Defs
  let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" fill="none" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="badge-bg" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
${bgStops.map((hex, i) => `      <stop offset="${(i / (bgStops.length - 1)).toFixed(3)}" stop-color="${hex}"/>`).join('\n')}
    </linearGradient>
`;

  // Text Gradient Def
  if (useTextGrad) {
    svgMarkup += `    <linearGradient id="badge-text-grad" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
      <stop stop-color="${textGradTop}"/>
      <stop offset="1" stop-color="${textGradBot}"/>
    </linearGradient>\n`;
  }

  // Combined Logo Filter (Universal Tinting for all Uploads/Images/SVGs + Logo Outline Stroke + Drop Shadow)
  svgMarkup += buildLogoFxFilter('badge-logo-fx', {
    useTint: useCustomLogoColor && !showDisk,
    tintColor: customLogoColor,
    useStroke: useLogoStroke && !showDisk,
    strokeColor: logoStrokeColor,
    strokeWidth: logoStrokeWidth,
    useShadow: useLogoShadow,
    shadowColor: logoShadowColor,
    shadowBlur: logoShadowBlur
  });

  // Text drop shadow filter (title + subtitle)
  svgMarkup += buildLogoFxFilter('badge-text-fx', {
    useTint: false,
    useStroke: false,
    useShadow: useTextShadow,
    shadowColor: textShadowColor,
    shadowBlur: textShadowBlur
  });

  svgMarkup += `  </defs>\n\n  <!-- Background Card Base -->\n  <rect width="${width}" height="${height}" fill="url(#badge-bg)" rx="${radius}"/>\n  <rect width="${width - 2}" height="${height - 2}" x="1" y="1" stroke="#ffffff" stroke-opacity=".15" stroke-width="2" rx="${Math.max(0, radius - 1)}"/>\n`;

  const useLogoFxFilter = useCustomLogoColor || useLogoStroke || useLogoShadow;
  const logoFilterAttr = useLogoFxFilter ? ' filter="url(#badge-logo-fx)"' : '';
  const textShadowAttr = useTextShadow ? ' filter="url(#badge-text-fx)"' : '';

  // Logo X placement: left (default), right (text on the left), or centered (minimal).
  // Right mode mirrors left mode, so the logo box sits at logoBoxStart (or stays flush to the
  // right edge if the badge hit MAX_BADGE_WIDTH).
  const boxRightEdge = width - logoReserve - logoBoxPad;
  const iconX = isMinimal
    ? Math.round((height - effectiveLogoSize) / 2)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : leftPad);

  // Custom-SVG artboards are 64px wide, so right-align the full artboard (same as iconX when right)
  const iconXFull = isMinimal
    ? height * (0.5 - 32 / 64)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : 0);

  // Optional White / Custom Circle Disk Background (behind the logo)
  if (showDisk && !noLogo) {
    const diskR = Math.round((diskDiameter * heightScale) / 2);
    const diskCx = isMinimal
      ? Math.round(height / 2)
      : (logoOnRight
        ? Math.round(iconX + logoReserve / 2)
        : Math.round((12 + userLogoScale / 2) * heightScale));
    const diskCy = Math.round(height / 2);
    svgMarkup += `  <!-- Background Disk Circle -->\n  <circle cx="${diskCx}" cy="${diskCy}" r="${diskR}" fill="${diskColor}"/>\n`;
  }

  // Render Icon / Logo with proportional height scaling
  if (!noLogo) {
  if (state.iconMode === 'preset') {
    if (brandInfo.isCustomSvg) {
      let svgContent = brandInfo.svg;
      // noTint icons (e.g. mask/stroke-based artwork) skip internal recolor so masks stay intact;
      // tinting still works through the alpha-based logo-fx filter.
      if (!brandInfo.noTint) {
        svgContent = svgContent.replace(/fill="currentColor"/gi, `fill="${brandInfo.color || '#ffffff'}"`);

        if (showDisk) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${logoColor}"`);
        } else if (useCustomLogoColor) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${customLogoColor}"`);
        }
      }

      if (brandInfo.scalable) {
        // Icons with `scalableBox` (e.g. github/python/react) honor the icon-size slider like
        // vector paths EXCEPT they crop the artboard's internal whitespace so the visible glyph
        // fills effectiveLogoSize exactly. Icons without a box (e.g. rust) scale the full 64px
        // artboard to effectiveLogoSize, preserving their internal padding.
        const bb = brandInfo.scalableBox;
        const s = effectiveLogoSize / (bb ? bb.w : 64);
        const logoBox = Math.round(effectiveLogoSize);
        if (bb) {
          const gx = height / 2 - (bb.x + bb.w / 2) * s;
          const gy = height / 2 - (bb.y + bb.h / 2) * s;
          if (isMinimal) {
            svgMarkup += `  <!-- Official Custom Vector (Scalable Cropped, Minimal Centered) -->\n  <g transform="translate(${gx.toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          } else {
            svgMarkup += `  <!-- Official Custom Vector (Scalable Cropped, Sized) -->\n  <g transform="translate(${(iconX - bb.x * s).toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          }
        } else if (isMinimal) {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += `  <!-- Official Custom Vector (Scalable, Minimal Centered) -->\n  <g transform="translate(${off}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        } else {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += `  <!-- Official Custom Vector (Scalable, Sized) -->\n  <g transform="translate(${iconX}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        }
      } else if (isMinimal) {
        const minimalScale = height / 64;
        const centerOffsetX = height * (0.5 - 32 / 64);
        svgMarkup += `  <!-- Official Custom Vector (Minimal Centered) -->\n  <g transform="translate(${centerOffsetX.toFixed(2)}, 0) scale(${minimalScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      } else {
        // For cozy/compact styles, center vertically by translating Y by (height - 64*heightScale) / 2
        const yOffset = (height - 64 * heightScale) / 2;
        svgMarkup += `  <!-- Official Custom Vector (Scaled) -->\n  <g transform="translate(${iconXFull}, ${yOffset.toFixed(2)}) scale(${heightScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      }
    } else {
      const scaleFactor = effectiveLogoSize / 24;
      const iconY = Math.round((height - effectiveLogoSize) / 2);
      const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : brandInfo.color);

      svgMarkup += `  <!-- Official Brand Vector Path -->\n  <g transform="translate(${iconX}, ${iconY}) scale(${scaleFactor})" fill="${fillColor}"${logoFilterAttr}>\n    <path d="${brandInfo.path}"/>\n  </g>\n`;
    }
  } else if (state.iconMode === 'upload' && state.uploadedDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <!-- Uploaded Image/SVG Logo -->\n  <image href="${state.uploadedDataUrl}" xlink:href="${state.uploadedDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else if (state.iconMode === 'fontawesome' && !noLogo) {
    const faIconClass = parseFontAwesomeInput();
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : textColor);

    // Add a placeholder slot — will be replaced once the CDN fetch resolves
    svgMarkup += `  <!-- FA_ICON_SLOT -->\n`;

    // Finish building the rest of the SVG (text etc.) before the async fetch
    const textFillAttr2 = useTextGrad ? 'fill="url(#badge-text-grad)"' : `fill="${textColor}"`;
    const textStrokeAttr2 = useTextStroke ? `stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"` : '';
    const subtitleFill2 = `fill="${subtitleColor}"`;
    if (!isMinimal) {
      if (isSingleLine) {
        const cTW = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
        const cTA = availableTextWidth;
        const cTL = cTW > cTA ? `textLength="${cTA}" lengthAdjust="spacingAndGlyphs"` : '';
        svgMarkup += `  <text x="${textX}" y="${height/2 + 5}" ${textFillAttr2} ${textStrokeAttr2}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="13" font-weight="700" ${cTL}>${escapeHtml(bottomText)}</text>\n`;
      } else {
        const topMW = topText ? measureText(topText, topFont) * 0.98 : 0;
        const botMW = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
        if (topText) {
          const tTL = topMW > availableTextWidth ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"` : '';
          svgMarkup += `  <text x="${textX}" y="${topY}" ${subtitleFill2} ${textStrokeAttr2}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="13" font-weight="500" ${tTL}>${escapeHtml(topText)}</text>\n`;
        }
        if (bottomText) {
          const bTL = botMW > availableTextWidth ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"` : '';
          svgMarkup += `  <text x="${textX}" y="${bottomY}" ${textFillAttr2} ${textStrokeAttr2}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="21" font-weight="700" ${bTL}>${escapeHtml(bottomText)}</text>\n`;
        }
      }
    }
    svgMarkup += `</svg>`;

    // Commit with placeholder icon immediately so text shows up right away
    const placeholderIcon = `<text x="${iconX + imgSize / 2}" y="${imgY + imgSize * 0.7}" fill="#ffffff" font-size="${imgSize}" font-family="sans-serif" text-anchor="middle" opacity="0.6">?</text>`;
    const withPlaceholder = svgMarkup.replace('<!-- FA_ICON_SLOT -->', placeholderIcon);
    document.getElementById('badge-stage').innerHTML = withPlaceholder;
    document.getElementById('badge-size-display').innerText = `${width} × ${height} px`;
    updateSnippetOutput(withPlaceholder, bottomText || 'Badge');

    // Async: fetch real icon and swap in
    extractFontAwesomeSvg(faIconClass).then((fa) => {
      if (token !== renderToken) return; // Stale render — a newer one superseded this
      if (!fa) return; // Leave the placeholder if icon not found
      const realIcon = `<svg x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" viewBox="${fa.viewBox}" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg"><path d="${fa.pathData}"/></svg>`;
      const finalSvg = svgMarkup.replace('<!-- FA_ICON_SLOT -->', realIcon);
      document.getElementById('badge-stage').innerHTML = finalSvg;
      document.getElementById('badge-size-display').innerText = `${width} × ${height} px`;
      updateSnippetOutput(finalSvg, bottomText || 'Badge');
    });

    return; // Text already committed above, async swap handles the icon
  } else if (state.iconMode === 'raw' && state.rawSvgDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <!-- Raw Pasted SVG Logo -->\n  <image href="${state.rawSvgDataUrl}" xlink:href="${state.rawSvgDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else {
    const qX = Math.round(iconX + effectiveLogoSize / 2);
    const qY = Math.round(height / 2 + effectiveLogoSize * 0.35);
    svgMarkup += `  <!-- Placeholder ? Icon -->\n  <text x="${qX}" y="${qY}" fill="#ffffff" font-family="Inter, -apple-system, sans-serif" font-size="${effectiveLogoSize}" font-weight="700" text-anchor="middle" opacity="0.6">?</text>\n`;
  }
  }

  // Render Typography with Gradients & Stroke Outlines
  const textFillAttr = useTextGrad ? 'fill="url(#badge-text-grad)"' : `fill="${textColor}"`;
  const textStrokeAttr = useTextStroke ? `stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"` : '';

  if (!isMinimal) {
    if (isSingleLine) {
      const compactTextW = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
      const compactAvail = availableTextWidth;
      const compactTextLenAttr = compactTextW > compactAvail
        ? `textLength="${compactAvail}" lengthAdjust="spacingAndGlyphs"`
        : '';
      const compactAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
      svgMarkup += `  <!-- 1-Line Text -->\n  <text ${compactAnchor} y="${height/2 + 5}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 16 : 13}" font-weight="700" ${compactTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
    } else {
      const topMeasured   = topText    ? measureText(topText,    topFont)    * 0.98 : 0;
      const bottomMeasured = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
      if (topText) {
        const topTextLenAttr = topMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const topAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${topAnchor} y="${topY}" fill="${subtitleColor}" ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 15 : 13}" font-weight="500" ${topTextLenAttr}>${escapeHtml(topText)}</text>\n`;
      }
      if (bottomText) {
        const bottomTextLenAttr = bottomMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const bottomAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${bottomAnchor} y="${bottomY}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 26 : 21}" font-weight="700" ${bottomTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
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

// Build the export-ready SVG for the current style, resolving the FontAwesome icon (if in FA
// mode) so exports never contain the async placeholder or a bare FA_ICON_SLOT comment.
function getExportSvg() {
  if (state.iconMode === 'fontawesome') {
    const faClass = parseFontAwesomeInput();
    return extractFontAwesomeSvg(faClass).then((fa) => generateBadgeForStyle(state.style, fa));
  }
  return Promise.resolve(generateBadgeForStyle(state.style));
}

function downloadSVG() {
  getExportSvg().then((svgMarkup) => {
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
  });
}

function downloadPNG() {
  getExportSvg().then((svgMarkup) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      showToast('PNG export failed — try Download SVG instead.');
      return;
    }

    const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');
    const width = parseInt(svgElement.getAttribute('width'));
    const height = parseInt(svgElement.getAttribute('height'));
    const scale = 3;

    // Clone and fix up SVG for canvas rendering
    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Inject Google Fonts stylesheet so text renders correctly in canvas
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`;
    svgClone.insertBefore(styleEl, svgClone.firstChild);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `devin_${title}_badge.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloaded high-res PNG badge!');
    };
    img.onerror = () => {
      showToast('PNG export failed — try Download SVG instead.');
    };
    img.src = svgDataUrl;
  });
}

// Helper function to generate badge SVG for a specific style.
// `faIcon` (optional) is a resolved FontAwesome icon ({ viewBox, pathData }) so exports can embed
// the real icon synchronously instead of leaving a bare FA_ICON_SLOT comment.
function generateBadgeForStyle(styleName, faIcon) {
  const currentStyle = state.style;
  state.style = styleName;
  
  // Temporarily render the badge for this style
  const topText = document.getElementById('top-text').value;
  const bottomText = document.getElementById('bottom-text').value;
  const showDisk = document.getElementById('show-disk-toggle').checked;
  const diskColor = document.getElementById('disk-color').value;
  const logoColor = document.getElementById('logo-color').value;
  const bgStops = state.bgStops && state.bgStops.length >= 2 ? state.bgStops : ['#181f29', '#0f131a'];
  const textColor = document.getElementById('text-color').value;
  const radius = parseInt(document.getElementById('corner-radius').value);
  const paddingRight = parseInt(document.getElementById('padding-horizontal').value);
  
  const diskDiameter = parseInt(document.getElementById('disk-size-slider').value) || 40;
  const userLogoScale = parseInt(document.getElementById('icon-scale-slider').value) || 34;

  // Dynamic Specs per Style Variant
  let height = 64;
  let topFont = '500 13px Inter, -apple-system, sans-serif';
  let bottomFont = '700 21px Inter, -apple-system, sans-serif';
  let topY = 25;
  let bottomY = 48;
  let isMinimal = false;
  let isSingleLine = false;

  if (styleName === 'compact') {
    height = 40;
    bottomFont = '700 13px Inter, -apple-system, sans-serif';
    isSingleLine = true;
  } else if (styleName === 'cozy-minimal') {
    height = 64;
    isMinimal = true;
  } else if (styleName === 'compact-minimal') {
    height = 40;
    isMinimal = true;
  }

  const heightScale = height / 64;
  const effectiveLogoSize = Math.round(userLogoScale * heightScale);

  // Logo position: 'left' | 'right' | 'none'
  const noLogo = state.logoPosition === 'none';
  const logoOnRight = state.logoPosition === 'right';
  const leftPad = Math.round(12 * heightScale);

  if (noLogo) {
    if (isSingleLine) {
      bottomFont = '700 16px Inter, -apple-system, sans-serif';
    } else {
      topFont = '500 15px Inter, -apple-system, sans-serif';
      bottomFont = '700 26px Inter, -apple-system, sans-serif';
    }
  }

  const presetKey = document.getElementById('preset-select').value;
  const brandInfo = OFFICIAL_BRAND_ICONS[presetKey] || OFFICIAL_BRAND_ICONS.github;

  // Custom-SVG presets normally draw on a full 64px artboard (the size slider is ignored),
  // so reserve the full artboard width for spacing math. Icons marked `scalable` (e.g. rust)
  // behave like vector paths: they honor the icon-size slider and only reserve effectiveLogoSize.
  const isCustomArtboard = state.iconMode === 'preset' && brandInfo.isCustomSvg && !brandInfo.scalable;
  const logoReserve = isCustomArtboard ? 64 * heightScale : effectiveLogoSize;
  // Mirror spacing for right mode: artboard icons draw flush to the logo-side edge (just like
  // left mode, where the artboard starts at x=0). Vector/upload/FA logos get leftPad padding.
  const logoBoxPad = isCustomArtboard ? 0 : leftPad;
  // Right mode: where the logo box should start so the text↔logo and logo↔edge gaps mirror left mode.
  let logoBoxStart = null;

  let textX = 0;
  const textCentered = noLogo;
  if (!noLogo) {
    if (logoOnRight) {
      textX = leftPad;
    } else if (brandInfo && brandInfo.textX && state.iconMode === 'preset') {
      textX = Math.round(brandInfo.textX * heightScale);
    } else {
      textX = Math.round(leftPad + effectiveLogoSize + leftPad);
    }
  }

  let width = height;
  let maxTextW = 0;
  // Max badge width — beyond this, text compresses instead of growing the badge
  const MAX_BADGE_WIDTH = 420;
  if (!isMinimal) {
    const textCorrectionFactor = 0.98;
    if (isSingleLine) {
      maxTextW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
    } else {
      const topW = topText ? measureText(topText, topFont) * textCorrectionFactor : 0;
      const bottomW = bottomText ? measureText(bottomText, bottomFont) * textCorrectionFactor : 0;
      maxTextW = Math.max(topW, bottomW);
    }
    if (noLogo) {
      width = Math.min(Math.ceil(maxTextW + leftPad * 2 + 4), MAX_BADGE_WIDTH);
    } else if (logoOnRight) {
      // Mirrored left-mode spacing: capture the left-mode layout (where the text would start if
      // the logo were on the left) and flip it. This keeps the text↔logo and logo↔outer-edge gaps
      // identical on both sides instead of stacking two full pads on top of the logo width.
      let textXLeft;
      if (brandInfo && brandInfo.textX && state.iconMode === 'preset') {
        textXLeft = Math.round(brandInfo.textX * heightScale);
      } else {
        textXLeft = Math.round(leftPad + effectiveLogoSize + leftPad);
      }
      logoBoxStart = Math.round(leftPad + maxTextW + (textXLeft - (logoBoxPad + logoReserve)));
      width = Math.min(Math.ceil(logoBoxStart + logoReserve + logoBoxPad), MAX_BADGE_WIDTH);
    } else {
      width = Math.min(Math.ceil(textX + maxTextW + paddingRight + 4), MAX_BADGE_WIDTH);
    }
  }

  let availableTextWidth;
  if (noLogo) {
    availableTextWidth = width - leftPad * 2 - 4;
  } else if (logoOnRight) {
    availableTextWidth = Math.max(maxTextW, width - textX - logoBoxPad - 4);
  } else {
    availableTextWidth = width - textX - paddingRight - 4;
  }

  const useTextGrad = document.getElementById('text-grad-toggle')?.checked || false;
  const textGradTop = document.getElementById('text-grad-top')?.value || '#61DAFB';
  const textGradBot = document.getElementById('text-grad-bot')?.value || '#FFFFFF';
  const useTextStroke = document.getElementById('text-stroke-toggle')?.checked || false;
  const textStrokeColor = document.getElementById('text-stroke-color')?.value || '#000000';
  const textStrokeWidth = document.getElementById('text-stroke-width')?.value || '1.5';
  const subtitleColor = document.getElementById('subtitle-color')?.value || '#e0e0e0';
  const useTextShadow = document.getElementById('text-shadow-toggle')?.checked || false;
  const textShadowColor = document.getElementById('text-shadow-color')?.value || '#000000';
  const textShadowBlur = parseFloat(document.getElementById('text-shadow-blur')?.value || '2');

  const useCustomLogoColor = document.getElementById('custom-logo-color-toggle')?.checked || false;
  const customLogoColor = document.getElementById('logo-color')?.value || '#ffffff';
  const useLogoStroke = document.getElementById('logo-stroke-toggle')?.checked || false;
  const logoStrokeColor = document.getElementById('logo-stroke-color')?.value || '#ffffff';
  const logoStrokeWidth = document.getElementById('logo-stroke-width')?.value || '2';
  const useLogoShadow = document.getElementById('logo-shadow-toggle')?.checked || false;
  const logoShadowColor = document.getElementById('logo-shadow-color')?.value || '#000000';
  const logoShadowBlur = parseFloat(document.getElementById('logo-shadow-blur')?.value || '2');

  // Build SVG
  let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" fill="none" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="badge-bg-${styleName}" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
${bgStops.map((hex, i) => `      <stop offset="${(i / (bgStops.length - 1)).toFixed(3)}" stop-color="${hex}"/>`).join('\n')}
    </linearGradient>
`;

  if (useTextGrad) {
    svgMarkup += `    <linearGradient id="badge-text-grad-${styleName}" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
      <stop stop-color="${textGradTop}"/>
      <stop offset="1" stop-color="${textGradBot}"/>
    </linearGradient>\n`;
  }

  // Combined Logo Filter (Universal Tinting for all Uploads/Images/SVGs + Logo Outline Stroke + Drop Shadow)
  svgMarkup += buildLogoFxFilter(`badge-logo-fx-${styleName}`, {
    useTint: useCustomLogoColor && !showDisk,
    tintColor: customLogoColor,
    useStroke: useLogoStroke && !showDisk,
    strokeColor: logoStrokeColor,
    strokeWidth: logoStrokeWidth,
    useShadow: useLogoShadow,
    shadowColor: logoShadowColor,
    shadowBlur: logoShadowBlur
  });

  // Text drop shadow filter (title + subtitle)
  svgMarkup += buildLogoFxFilter(`badge-text-fx-${styleName}`, {
    useTint: false,
    useStroke: false,
    useShadow: useTextShadow,
    shadowColor: textShadowColor,
    shadowBlur: textShadowBlur
  });

  svgMarkup += `  </defs>\n\n  <rect width="${width}" height="${height}" fill="url(#badge-bg-${styleName})" rx="${radius}"/>\n  <rect width="${width - 2}" height="${height - 2}" x="1" y="1" stroke="#ffffff" stroke-opacity=".15" stroke-width="2" rx="${Math.max(0, radius - 1)}"/>\n`;

  const useLogoFxFilter = useCustomLogoColor || useLogoStroke || useLogoShadow;
  const logoFilterAttr = useLogoFxFilter ? ` filter="url(#badge-logo-fx-${styleName})"` : '';
  const textShadowAttr = useTextShadow ? ` filter="url(#badge-text-fx-${styleName})"` : '';

  // Logo X placement: left (default), right (text on the left), or centered (minimal).
  // Right mode mirrors left mode, so the logo box sits at logoBoxStart (or stays flush to the
  // right edge if the badge hit MAX_BADGE_WIDTH).
  const boxRightEdge = width - logoReserve - logoBoxPad;
  const iconX = isMinimal
    ? Math.round((height - effectiveLogoSize) / 2)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : leftPad);

  // Custom-SVG artboards are 64px wide, so right-align the full artboard (same as iconX when right)
  const iconXFull = isMinimal
    ? height * (0.5 - 32 / 64)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : 0);

  if (showDisk && !noLogo) {
    const diskR = Math.round((diskDiameter * heightScale) / 2);
    const diskCx = isMinimal
      ? Math.round(height / 2)
      : (logoOnRight
        ? Math.round(iconX + logoReserve / 2)
        : Math.round((12 + userLogoScale / 2) * heightScale));
    const diskCy = Math.round(height / 2);
    svgMarkup += `  <circle cx="${diskCx}" cy="${diskCy}" r="${diskR}" fill="${diskColor}"/>\n`;
  }

  // Render Icon
  if (!noLogo) {
  if (state.iconMode === 'preset') {
    if (brandInfo.isCustomSvg) {
      let svgContent = brandInfo.svg;
      // noTint icons (e.g. mask/stroke-based artwork) skip internal recolor so masks stay intact;
      // tinting still works through the alpha-based logo-fx filter.
      if (!brandInfo.noTint) {
        svgContent = svgContent.replace(/fill="currentColor"/gi, `fill="${brandInfo.color || '#ffffff'}"`);

        if (showDisk) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${logoColor}"`);
        } else if (useCustomLogoColor) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${customLogoColor}"`);
        }
      }

      if (brandInfo.scalable) {
        // Icons with `scalableBox` (e.g. github/python/react) honor the icon-size slider like
        // vector paths EXCEPT they crop the artboard's internal whitespace so the visible glyph
        // fills effectiveLogoSize exactly. Icons without a box (e.g. rust) scale the full 64px
        // artboard to effectiveLogoSize, preserving their internal padding.
        const bb = brandInfo.scalableBox;
        const s = effectiveLogoSize / (bb ? bb.w : 64);
        const logoBox = Math.round(effectiveLogoSize);
        if (bb) {
          const gx = height / 2 - (bb.x + bb.w / 2) * s;
          const gy = height / 2 - (bb.y + bb.h / 2) * s;
          if (isMinimal) {
            svgMarkup += `  <!-- Official Custom Vector (Scalable Cropped, Minimal Centered) -->\n  <g transform="translate(${gx.toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          } else {
            svgMarkup += `  <!-- Official Custom Vector (Scalable Cropped, Sized) -->\n  <g transform="translate(${(iconX - bb.x * s).toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          }
        } else if (isMinimal) {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += `  <!-- Official Custom Vector (Scalable, Minimal Centered) -->\n  <g transform="translate(${off}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        } else {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += `  <!-- Official Custom Vector (Scalable, Sized) -->\n  <g transform="translate(${iconX}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        }
      } else if (isMinimal) {
        const minimalScale = height / 64;
        const centerOffsetX = height * (0.5 - 32 / 64);
        svgMarkup += `  <g transform="translate(${centerOffsetX.toFixed(2)}, 0) scale(${minimalScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      } else {
        const yOffset = (height - 64 * heightScale) / 2;
        svgMarkup += `  <g transform="translate(${iconXFull}, ${yOffset.toFixed(2)}) scale(${heightScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      }
    } else {
      const scaleFactor = effectiveLogoSize / 24;
      const iconY = Math.round((height - effectiveLogoSize) / 2);
      const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : brandInfo.color);

      svgMarkup += `  <g transform="translate(${iconX}, ${iconY}) scale(${scaleFactor})" fill="${fillColor}"${logoFilterAttr}>\n    <path d="${brandInfo.path}"/>\n  </g>\n`;
    }
  } else if (state.iconMode === 'upload' && state.uploadedDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <image href="${state.uploadedDataUrl}" xlink:href="${state.uploadedDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else if (state.iconMode === 'fontawesome' && !noLogo) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : textColor);
    if (faIcon) {
      svgMarkup += `  <!-- FontAwesome Icon -->\n  <svg x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" viewBox="${faIcon.viewBox}" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg"><path d="${faIcon.pathData}"/></svg>\n`;
    } else {
      // No resolved icon (offline or fetch pending) — keep exported files visually complete
      svgMarkup += `  <!-- FontAwesome Placeholder -->\n  <text x="${iconX + imgSize / 2}" y="${imgY + imgSize * 0.7}" fill="${fillColor}" font-size="${imgSize}" font-family="sans-serif" text-anchor="middle" opacity="0.6">?</text>\n`;
    }
  } else if (state.iconMode === 'raw' && state.rawSvgDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += `  <image href="${state.rawSvgDataUrl}" xlink:href="${state.rawSvgDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  }
  }

  const textFillAttr = useTextGrad ? `fill="url(#badge-text-grad-${styleName})"` : `fill="${textColor}"`;
  const textStrokeAttr = useTextStroke ? `stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"` : '';

  if (!isMinimal) {
    if (isSingleLine) {
      const compactTextW = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
      const compactAvail = availableTextWidth;
      const compactTextLenAttr = compactTextW > compactAvail
        ? `textLength="${compactAvail}" lengthAdjust="spacingAndGlyphs"`
        : '';
      const compactAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
      svgMarkup += `  <!-- 1-Line Text -->\n  <text ${compactAnchor} y="${height/2 + 5}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 16 : 13}" font-weight="700" ${compactTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
    } else {
      const topMeasured = topText ? measureText(topText, topFont) * 0.98 : 0;
      const bottomMeasured = bottomText ? measureText(bottomText, bottomFont) * 0.98 : 0;
      if (topText) {
        const topTextLenAttr = topMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const topAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${topAnchor} y="${topY}" fill="${subtitleColor}" ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 15 : 13}" font-weight="500" ${topTextLenAttr}>${escapeHtml(topText)}</text>\n`;
      }
      if (bottomText) {
        const bottomTextLenAttr = bottomMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const bottomAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${bottomAnchor} y="${bottomY}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 26 : 21}" font-weight="700" ${bottomTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
      }
    }
  }

  svgMarkup += `</svg>`;
  
  // Restore original style
  state.style = currentStyle;
  
  return svgMarkup;
}

function downloadAllStyles() {
  const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');
  const styles = ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'];

  // Resolve the FontAwesome icon (if in FA mode) so every style exports with the real icon
  const faPromise = state.iconMode === 'fontawesome'
    ? extractFontAwesomeSvg(parseFontAwesomeInput())
    : Promise.resolve(null);

  faPromise.then((faIcon) => {
    let downloadCount = 0;

    styles.forEach((styleName, index) => {
      setTimeout(() => {
        const svgMarkup = generateBadgeForStyle(styleName, faIcon);
        const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `devin_${title}_${styleName}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        downloadCount++;
        if (downloadCount === styles.length) {
          showToast('Downloaded all 4 badge styles!');
        }
      }, index * 200); // Stagger downloads by 200ms
    });
  });
}

function createGitHubIssue() {
  const topText    = document.getElementById('top-text').value   || '';
  const bottomText = document.getElementById('bottom-text').value || '';

  const badgePurpose = prompt(
    'What is the badge for?\n(This will be filled into the issue)',
    bottomText ? `A "${bottomText}" badge` : ''
  );
  if (badgePurpose === null) return;

  showToast('Uploading badge previews… please wait.');

  // Resolve the FA icon SVG if in fontawesome mode, then kick off the rest
  let faIconPromise = Promise.resolve(null);
  if (state.iconMode === 'fontawesome') {
    const faClass = parseFontAwesomeInput();
    faIconPromise = extractFontAwesomeSvg(faClass);
  }

  faIconPromise.then((faIcon) => {
    // Build "preferred icons/text" section
    let iconDescription = '';
    if (state.logoPosition === 'none') {
      iconDescription = 'No logo — text only';
    } else if (state.iconMode === 'preset') {
      const presetKey = document.getElementById('preset-select').value;
      iconDescription = `Preset icon: **${presetKey}**`;
    } else if (state.iconMode === 'fontawesome') {
      const faClass = parseFontAwesomeInput();
      const { name } = parseFaClass(faClass);
      const faUrl = `https://fontawesome.com/icons/${name}`;
      if (faIcon) {
        // Embed the actual SVG so the maintainer has everything they need
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${faIcon.viewBox}"><path d="${faIcon.pathData}"/></svg>`;
        iconDescription = `FontAwesome icon: [\`${faClass}\`](${faUrl})\n\n\`\`\`xml\n${iconSvg}\n\`\`\``;
      } else {
        iconDescription = `FontAwesome icon: [\`${faClass}\`](${faUrl})`;
      }
    } else if (state.iconMode === 'raw') {
      const rawSvg = document.getElementById('raw-svg-code')?.value?.trim() || '';
      iconDescription = rawSvg ? `Custom SVG icon:\n\`\`\`xml\n${rawSvg}\n\`\`\`` : 'Custom SVG icon';
    } else {
      // Upload mode — only SVGs are useful to the maintainer
      if (!state.isUploadedSvg) {
        showToast('Please use an SVG icon — PNG/JPG uploads cannot be used by the badge maintainer.');
        return;
      }
      // Reconstruct the SVG from the parsed content we already have
      const svgContent = state.customSvgContent || '';
      iconDescription = svgContent
        ? `Custom uploaded SVG icon:\n\`\`\`xml\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n${svgContent}\n</svg>\n\`\`\``
        : 'Custom uploaded SVG icon (see badge examples below)';
    }

    const textLines = [
      topText    ? `Top text: **${topText}**`       : '',
      bottomText ? `Bottom text: **${bottomText}**` : ''
    ].filter(Boolean).join('\n');

    const iconsAndText = [iconDescription, textLines].filter(Boolean).join('\n\n');

    // Generate SVG for each style, embedding the resolved FA icon (if in FA mode)
    function getResolvedSvg(styleName) {
      return Promise.resolve(generateBadgeForStyle(styleName, faIcon));
    }

    // Render one resolved SVG to a PNG base64 string via canvas
    function svgToPngBase64(svgString, w, h) {
      return new Promise((resolve) => {
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width  = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        const img = new Image();
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }

    // Upload a base64 PNG to Imgur anonymously
    function uploadToImgur(base64png, title) {
      return fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64png, type: 'base64', title })
      })
      .then(r => r.json())
      .then(data => data.success ? data.data.link : null)
      .catch(() => null);
    }

    const styleList = ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'];

    Promise.all(styleList.map(async (s) => {
      const svg = await getResolvedSvg(s);
      const wMatch = svg.match(/width="(\d+)"/);
      const hMatch = svg.match(/height="(\d+)"/);
      const w = wMatch ? parseInt(wMatch[1]) : 200;
      const h = hMatch ? parseInt(hMatch[1]) : 64;
      const base64png = await svgToPngBase64(svg, w, h);
      if (!base64png) return { style: s, url: null };
      const url = await uploadToImgur(base64png, `devin-badge-${s}`);
      return { style: s, url };
    })).then((results) => {
      const exampleLines = results.map(({ style, url }) =>
        url ? `**${style}**\n![${style} badge](${url})` : `**${style}**\n*(upload failed)*`
      ).join('\n\n');

      const body =
`**What is the badge for?**
${badgePurpose}

**Provide any preferred icons/text (icons must be SVG)**
${iconsAndText}

**Example if needed**
${exampleLines}

---
**This issue is made automatically by Badgeworks, so unfortunately no labels and wrong Issue Template :[**`;

      navigator.clipboard.writeText(body)
        .then(() => showToast('Done! Body copied — paste it into the issue form.'))
        .catch(() => showToast('Uploaded! But clipboard failed — copy the body manually.'));

      const title = encodeURIComponent(`${bottomText || badgePurpose} [NEW]`);
      const url = `https://github.com/intensed-dev/devinsbadges-customs/issues/new?template=new-badge.md&title=${title}`;
      window.open(url, '_blank');
    });
  });
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
    logoPosition: state.logoPosition,
    presetKey: document.getElementById('preset-select')?.value || 'github',
    uploadedDataUrl: state.uploadedDataUrl || '',
    rawSvgDataUrl: state.rawSvgDataUrl || '',
    customSvgContent: state.customSvgContent || '',
    isUploadedSvg: state.isUploadedSvg,
    uploadFilename: state.uploadFilename || '',
    faPack: document.getElementById('fa-pack-select')?.value || 'fa-brands',
    faIconName: document.getElementById('fa-icon-name')?.value || 'github',
    faIconInput: parseFontAwesomeInput(),
    showDisk: document.getElementById('show-disk-toggle')?.checked || false,
    diskColor: document.getElementById('disk-color')?.value || '#ffffff',
    logoColor: document.getElementById('logo-color')?.value || '#ffffff',
    bgStops: state.bgStops && state.bgStops.length >= 2 ? state.bgStops.slice() : ['#181f29', '#0f131a'],
    bgGradPreset: state.bgGradPreset || 'custom',
    bgColorTop: (state.bgStops && state.bgStops[0]) || '#181f29',
    bgColorBottom: (state.bgStops && state.bgStops[state.bgStops.length - 1]) || '#0f131a',
    textColor: document.getElementById('text-color')?.value || '#ffffff',
    radius: parseInt(document.getElementById('corner-radius')?.value || '8'),
    paddingRight: parseInt(document.getElementById('padding-horizontal')?.value || '16'),
    diskDiameter: parseInt(document.getElementById('disk-size-slider')?.value || '40'),
    userLogoScale: parseInt(document.getElementById('icon-scale-slider')?.value || '34'),
    useCustomLogoColor: document.getElementById('custom-logo-color-toggle')?.checked || false,
    useLogoStroke: document.getElementById('logo-stroke-toggle')?.checked || false,
    logoStrokeColor: document.getElementById('logo-stroke-color')?.value || '#ffffff',
    logoStrokeWidth: parseFloat(document.getElementById('logo-stroke-width')?.value || '2'),
    useLogoShadow: document.getElementById('logo-shadow-toggle')?.checked || false,
    logoShadowColor: document.getElementById('logo-shadow-color')?.value || '#000000',
    logoShadowBlur: parseFloat(document.getElementById('logo-shadow-blur')?.value || '2'),
    useTextGrad: document.getElementById('text-grad-toggle')?.checked || false,
    textGradTop: document.getElementById('text-grad-top')?.value || '#61DAFB',
    textGradBot: document.getElementById('text-grad-bot')?.value || '#FFFFFF',
    useTextStroke: document.getElementById('text-stroke-toggle')?.checked || false,
    textStrokeColor: document.getElementById('text-stroke-color')?.value || '#000000',
    textStrokeWidth: parseFloat(document.getElementById('text-stroke-width')?.value || '1.5'),
    subtitleColor: document.getElementById('subtitle-color')?.value || '#e0e0e0',
    useTextShadow: document.getElementById('text-shadow-toggle')?.checked || false,
    textShadowColor: document.getElementById('text-shadow-color')?.value || '#000000',
    textShadowBlur: parseFloat(document.getElementById('text-shadow-blur')?.value || '2')
  };
}

function applyBadgeConfig(cfg) {
  if (!cfg) return;

  if (cfg.style) setStyle(cfg.style);
  if (cfg.topText !== undefined && document.getElementById('top-text')) document.getElementById('top-text').value = cfg.topText;
  if (cfg.bottomText !== undefined && document.getElementById('bottom-text')) document.getElementById('bottom-text').value = cfg.bottomText;

  // Restore logo state BEFORE switching modes, so setIconMode()'s internal render
  // picks up the uploaded image / FontAwesome icon already restored
  if (cfg.uploadedDataUrl !== undefined) state.uploadedDataUrl = cfg.uploadedDataUrl;
  if (cfg.rawSvgDataUrl !== undefined) state.rawSvgDataUrl = cfg.rawSvgDataUrl;
  if (cfg.customSvgContent !== undefined) state.customSvgContent = cfg.customSvgContent;
  if (cfg.isUploadedSvg !== undefined) state.isUploadedSvg = cfg.isUploadedSvg;
  if (cfg.uploadFilename !== undefined) state.uploadFilename = cfg.uploadFilename;
  if (cfg.faPack && document.getElementById('fa-pack-select')) {
    document.getElementById('fa-pack-select').value = cfg.faPack;
  }
  if (cfg.faIconName !== undefined && document.getElementById('fa-icon-name')) {
    document.getElementById('fa-icon-name').value = cfg.faIconName;
    updateFontAwesomePreview();
  } else if (cfg.faIconInput) {
    parseFontAwesomeInput(cfg.faIconInput);
    updateFontAwesomePreview();
  }

  if (cfg.iconMode) setIconMode(cfg.iconMode);
  if (cfg.logoPosition) setLogoPosition(cfg.logoPosition);
  if (cfg.presetKey && document.getElementById('preset-select')) document.getElementById('preset-select').value = cfg.presetKey;

  // Bring back the upload preview bar + status text so a loaded image/SVG doesn't look lost
  if (state.iconMode === 'upload' && state.uploadedDataUrl) {
    showUploadPreview(state.uploadFilename || 'Uploaded logo', state.uploadedDataUrl);
  }

  if (cfg.showDisk !== undefined && document.getElementById('show-disk-toggle')) document.getElementById('show-disk-toggle').checked = cfg.showDisk;
  if (cfg.diskColor && document.getElementById('disk-color')) document.getElementById('disk-color').value = cfg.diskColor;
  if (cfg.logoColor && document.getElementById('logo-color')) document.getElementById('logo-color').value = cfg.logoColor;
  // Background gradient stops (migrate legacy 2-color configs to the stop list)
  if (cfg.bgStops && cfg.bgStops.length >= 2) {
    state.bgStops = cfg.bgStops.slice(0, BG_GRADIENT_MAX_STOPS);
  } else if (cfg.bgColorTop || cfg.bgColorBottom) {
    state.bgStops = [cfg.bgColorTop || '#181f29', cfg.bgColorBottom || '#0f131a'];
  }
  if (cfg.bgGradPreset) state.bgGradPreset = cfg.bgGradPreset;
  renderBgStopEditor();
  if (cfg.textColor && document.getElementById('text-color')) document.getElementById('text-color').value = cfg.textColor;
  if (cfg.radius !== undefined && document.getElementById('corner-radius')) document.getElementById('corner-radius').value = cfg.radius;
  if (cfg.paddingRight !== undefined && document.getElementById('padding-horizontal')) document.getElementById('padding-horizontal').value = cfg.paddingRight;
  if (cfg.diskDiameter !== undefined && document.getElementById('disk-size-slider')) document.getElementById('disk-size-slider').value = cfg.diskDiameter;
  if (cfg.userLogoScale !== undefined && document.getElementById('icon-scale-slider')) document.getElementById('icon-scale-slider').value = cfg.userLogoScale;

  if (cfg.useCustomLogoColor !== undefined && document.getElementById('custom-logo-color-toggle')) document.getElementById('custom-logo-color-toggle').checked = cfg.useCustomLogoColor;
  if (cfg.useLogoStroke !== undefined && document.getElementById('logo-stroke-toggle')) document.getElementById('logo-stroke-toggle').checked = cfg.useLogoStroke;
  if (cfg.logoStrokeColor && document.getElementById('logo-stroke-color')) document.getElementById('logo-stroke-color').value = cfg.logoStrokeColor;
  if (cfg.logoStrokeWidth !== undefined && document.getElementById('logo-stroke-width')) document.getElementById('logo-stroke-width').value = cfg.logoStrokeWidth;

  if (cfg.useLogoShadow !== undefined && document.getElementById('logo-shadow-toggle')) document.getElementById('logo-shadow-toggle').checked = cfg.useLogoShadow;
  if (cfg.logoShadowColor && document.getElementById('logo-shadow-color')) document.getElementById('logo-shadow-color').value = cfg.logoShadowColor;
  if (cfg.logoShadowBlur !== undefined && document.getElementById('logo-shadow-blur')) document.getElementById('logo-shadow-blur').value = cfg.logoShadowBlur;

  if (cfg.useTextGrad !== undefined && document.getElementById('text-grad-toggle')) document.getElementById('text-grad-toggle').checked = cfg.useTextGrad;
  if (cfg.textGradTop && document.getElementById('text-grad-top')) document.getElementById('text-grad-top').value = cfg.textGradTop;
  if (cfg.textGradBot && document.getElementById('text-grad-bot')) document.getElementById('text-grad-bot').value = cfg.textGradBot;
  if (cfg.useTextStroke !== undefined && document.getElementById('text-stroke-toggle')) document.getElementById('text-stroke-toggle').checked = cfg.useTextStroke;
  if (cfg.textStrokeColor && document.getElementById('text-stroke-color')) document.getElementById('text-stroke-color').value = cfg.textStrokeColor;
  if (cfg.textStrokeWidth !== undefined && document.getElementById('text-stroke-width')) document.getElementById('text-stroke-width').value = cfg.textStrokeWidth;
  if (cfg.subtitleColor && document.getElementById('subtitle-color')) document.getElementById('subtitle-color').value = cfg.subtitleColor;
  if (cfg.useTextShadow !== undefined && document.getElementById('text-shadow-toggle')) document.getElementById('text-shadow-toggle').checked = cfg.useTextShadow;
  if (cfg.textShadowColor && document.getElementById('text-shadow-color')) document.getElementById('text-shadow-color').value = cfg.textShadowColor;
  if (cfg.textShadowBlur !== undefined && document.getElementById('text-shadow-blur')) document.getElementById('text-shadow-blur').value = cfg.textShadowBlur;

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
