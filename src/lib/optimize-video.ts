import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

async function getFFmpeg(onProgress?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg

  onProgress?.('Loading ffmpeg...')
  ffmpeg = new FFmpeg()
  await ffmpeg.load()
  return ffmpeg
}

export async function optimizeVideo(
  file: File,
  onProgress?: (msg: string) => void,
): Promise<{ video: Blob; poster: Blob }> {
  const ff = await getFFmpeg(onProgress)

  onProgress?.('Optimizing video...')
  await ff.writeFile('input.mp4', await fetchFile(file))

  // Optimize: scale to 800px wide, 16:9 crop, H.264 CRF 28, strip audio, faststart
  await ff.exec([
    '-i', 'input.mp4',
    '-vf', 'scale=800:-2,crop=800:450',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-an',
    '-movflags', '+faststart',
    '-y', 'output.mp4',
  ])

  // Extract first frame as JPEG
  await ff.exec([
    '-i', 'input.mp4',
    '-vframes', '1',
    '-q:v', '2',
    '-y', 'poster.jpg',
  ])

  const videoData = await ff.readFile('output.mp4') as Uint8Array
  const posterData = await ff.readFile('poster.jpg') as Uint8Array

  // Clean up
  await ff.deleteFile('input.mp4')
  await ff.deleteFile('output.mp4')
  await ff.deleteFile('poster.jpg')

  onProgress?.('Done')

  return {
    video: new Blob([videoData.buffer as ArrayBuffer], { type: 'video/mp4' }),
    poster: new Blob([posterData.buffer as ArrayBuffer], { type: 'image/jpeg' }),
  }
}
