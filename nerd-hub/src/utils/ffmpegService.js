import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    // Only log essential ffmpeg info if needed
    // console.log(message);
  });

  await ffmpeg.load({
    coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

const toBlobURL = async (url, mimeType) => {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
};

export const renderGameToVideo = async (history, renderFrameCallback, width = 1080, height = 1080, fps = 30) => {
  const f = await initFFmpeg();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // We add a few frames at the end to hold the final state
  const holdFrames = fps * 2; // 2 seconds hold
  const totalFrames = history.length + holdFrames;

  for (let i = 0; i < totalFrames; i++) {
    const stepIndex = Math.min(i, history.length - 1);

    // Draw background
    ctx.fillStyle = '#020617'; // obsidian-900
    ctx.fillRect(0, 0, width, height);

    renderFrameCallback(ctx, history, stepIndex, width, height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const frameData = await fetchFile(blob);

    const num = (i + 1).toString().padStart(3, '0');
    await f.writeFile(`frame_${num}.png`, frameData);
  }

  await f.exec([
    '-framerate', `${fps}`,
    '-i', 'frame_%03d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    'out.mp4'
  ]);

  const data = await f.readFile('out.mp4');

  for (let i = 0; i < totalFrames; i++) {
    const num = (i + 1).toString().padStart(3, '0');
    await f.deleteFile(`frame_${num}.png`);
  }

  return new Blob([data.buffer], { type: 'video/mp4' });
};
