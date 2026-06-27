import assert from "node:assert/strict"

import {
  getSupportedVideoFormat,
  isSupportedVideoAspectRatio,
} from "../src/lib/videos/video-format"

assert.deepEqual(getSupportedVideoFormat(720, 1280), {
  orientation: "PORTRAIT",
  label: "9:16竖屏",
})

assert.deepEqual(getSupportedVideoFormat(1280, 720), {
  orientation: "LANDSCAPE",
  label: "16:9横屏",
})

assert.equal(isSupportedVideoAspectRatio(1080, 1920), true)
assert.equal(isSupportedVideoAspectRatio(1920, 1080), true)
assert.equal(isSupportedVideoAspectRatio(1024, 768), false)
assert.equal(isSupportedVideoAspectRatio(1080, 1080), false)
assert.equal(isSupportedVideoAspectRatio(0, 1080), false)

console.log("video format checks passed")
