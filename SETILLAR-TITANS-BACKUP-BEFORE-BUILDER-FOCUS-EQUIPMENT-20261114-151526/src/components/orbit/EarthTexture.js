import * as THREE from 'three'

function traceLand(context, points, width, height, color) {
  context.beginPath()
  points.forEach(([x, y], index) => {
    const px = x * width
    const py = y * height
    if (index === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  })
  context.closePath()
  context.fillStyle = color
  context.fill()
}

export function createEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1536
  canvas.height = 768
  const context = canvas.getContext('2d')
  const ocean = context.createLinearGradient(0, 0, 0, canvas.height)
  ocean.addColorStop(0, '#225574')
  ocean.addColorStop(0.52, '#174267')
  ocean.addColorStop(1, '#0d2d50')
  context.fillStyle = ocean
  context.fillRect(0, 0, canvas.width, canvas.height)

  const land = '#60917e'
  const highlands = '#819c82'
  const continents = [
    [[.05,.23],[.11,.17],[.18,.17],[.22,.21],[.20,.26],[.17,.28],[.16,.34],[.12,.36],[.10,.43],[.07,.40],[.08,.33],[.04,.29]],
    [[.18,.42],[.22,.44],[.24,.50],[.23,.57],[.25,.62],[.22,.70],[.21,.78],[.18,.73],[.17,.65],[.15,.58],[.16,.50]],
    [[.39,.25],[.43,.20],[.48,.22],[.50,.27],[.48,.31],[.45,.32],[.43,.38],[.40,.34]],
    [[.44,.35],[.49,.33],[.53,.37],[.54,.44],[.52,.52],[.49,.58],[.47,.53],[.45,.47],[.42,.43]],
    [[.49,.24],[.56,.19],[.64,.20],[.70,.23],[.76,.20],[.82,.23],[.88,.27],[.91,.33],[.86,.36],[.81,.34],[.78,.39],[.72,.38],[.68,.34],[.63,.36],[.60,.32],[.55,.34],[.52,.30]],
    [[.78,.54],[.82,.52],[.85,.56],[.84,.62],[.80,.64],[.77,.60]],
    [[.02,.11],[.06,.08],[.09,.10],[.08,.17],[.05,.19],[.02,.16]],
  ]
  continents.forEach((shape, index) => traceLand(context, shape, canvas.width, canvas.height, index % 2 ? land : highlands))
  context.fillStyle = '#d4e7e8'
  context.fillRect(0, 0, canvas.width, 18)
  context.fillRect(0, canvas.height - 16, canvas.width, 16)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

let cachedEarthTexture
export function getEarthTexture() {
  cachedEarthTexture ??= createEarthTexture()
  return cachedEarthTexture
}
