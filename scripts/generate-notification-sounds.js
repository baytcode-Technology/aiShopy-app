/**
 * Generates short notification tone WAV files for the sound picker.
 * Run: node scripts/generate-notification-sounds.js
 */
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds')

const TONES = [
  { name: 'default', freq: 880, durationMs: 280 },
  { name: 'chime', freq: 988, durationMs: 320 },
  { name: 'bell', freq: 784, durationMs: 400 },
  { name: 'ping', freq: 1175, durationMs: 180 },
  { name: 'alert', freq: 660, durationMs: 350 },
  { name: 'soft', freq: 523, durationMs: 300 },
  { name: 'bright', freq: 1319, durationMs: 220 },
  { name: 'pulse', freq: 740, durationMs: 260 },
]

function writeWav(filePath, frequency, durationMs) {
  const sampleRate = 44100
  const numSamples = Math.floor((sampleRate * durationMs) / 1000)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate
    const envelope = Math.min(1, i / 800) * Math.max(0, 1 - (i - numSamples + 2000) / 2000)
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.35
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)))
    buffer.writeInt16LE(intSample, 44 + i * 2)
  }

  fs.writeFileSync(filePath, buffer)
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

for (const tone of TONES) {
  const filePath = path.join(OUT_DIR, `${tone.name}.wav`)
  writeWav(filePath, tone.freq, tone.durationMs)
  console.log('Wrote', filePath)
}
