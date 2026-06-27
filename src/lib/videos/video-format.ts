export type SupportedVideoOrientation = "PORTRAIT" | "LANDSCAPE"

export type SupportedVideoFormat = {
  orientation: SupportedVideoOrientation
  label: string
}

const ASPECT_RATIO_TOLERANCE = 0.03

export function getSupportedVideoFormat(width: number, height: number): SupportedVideoFormat | null {
  if (width <= 0 || height <= 0) {
    return null
  }

  const ratio = width / height

  if (height > width && isWithinTolerance(ratio, 9 / 16)) {
    return { orientation: "PORTRAIT", label: "9:16竖屏" }
  }

  if (width > height && isWithinTolerance(ratio, 16 / 9)) {
    return { orientation: "LANDSCAPE", label: "16:9横屏" }
  }

  return null
}

export function isSupportedVideoAspectRatio(width: number, height: number) {
  return getSupportedVideoFormat(width, height) !== null
}

function isWithinTolerance(value: number, expected: number) {
  return Math.abs(value - expected) <= ASPECT_RATIO_TOLERANCE
}
