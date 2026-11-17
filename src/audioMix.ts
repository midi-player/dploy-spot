import musicMedievalUrl from '@/audio/MoyenAge.mp3?url';
import music50sUrl from '@/audio/50s.mp3?url';
import music80sUrl from '@/audio/80s.mp3?url';
import music2020Url from '@/audio/2020.mp3?url';
import musicFuturUrl from '@/audio/Futur.mp3?url';
import musicXmasUrl from '@/audio/Xmas_mood.mp3?url';

const INTRO = 2;       // seconds of music before voice starts
const OUTRO = 2.5;     // seconds of music after voice ends
const DUCK = 0.15;     // music gain while voice is playing
const SAMPLE_RATE = 44100;

const eraMusicUrl: Record<string, string> = {
  '1500': musicMedievalUrl,
  '1950': music50sUrl,
  '1980': music80sUrl,
  '2020': music2020Url,
  '2500': musicFuturUrl,
  'Noël': musicXmasUrl,
};

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const samples = buffer.length;
  const bitsPerSample = 16;
  const dataSize = samples * channels * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, bitsPerSample, true);
  str(36, 'data'); view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < channels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

export async function mixVoiceWithMusic(voiceBlob: Blob, era: string): Promise<Blob> {
  const musicUrl = eraMusicUrl[era];
  if (!musicUrl) return voiceBlob;

  const [voiceAb, musicAb] = await Promise.all([
    voiceBlob.arrayBuffer(),
    fetch(musicUrl).then((r) => r.arrayBuffer()),
  ]);

  // Decode using a temporary context then close it
  const tmpCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const [voiceDec, musicDec] = await Promise.all([
    tmpCtx.decodeAudioData(voiceAb),
    tmpCtx.decodeAudioData(musicAb),
  ]);
  await tmpCtx.close();

  const total = INTRO + voiceDec.duration + OUTRO;
  const offCtx = new OfflineAudioContext(2, Math.ceil(total * SAMPLE_RATE), SAMPLE_RATE);

  // Voice: starts after intro
  const voiceSrc = offCtx.createBufferSource();
  voiceSrc.buffer = voiceDec;
  const voiceGain = offCtx.createGain();
  voiceSrc.connect(voiceGain);
  voiceGain.connect(offCtx.destination);
  voiceSrc.start(INTRO);

  // Music: looped for the whole duration, ducked during voice
  const musicSrc = offCtx.createBufferSource();
  musicSrc.buffer = musicDec;
  musicSrc.loop = true;
  const musicGain = offCtx.createGain();
  musicSrc.connect(musicGain);
  musicGain.connect(offCtx.destination);
  musicSrc.start(0);
  musicSrc.stop(total);

  // Gain automation: intro full → duck → unduck → fade out
  musicGain.gain.setValueAtTime(0.85, 0);
  musicGain.gain.linearRampToValueAtTime(DUCK, INTRO);
  musicGain.gain.setValueAtTime(DUCK, INTRO + voiceDec.duration);
  musicGain.gain.linearRampToValueAtTime(0.85, INTRO + voiceDec.duration + 0.5);
  musicGain.gain.setValueAtTime(0.85, total - OUTRO);
  musicGain.gain.linearRampToValueAtTime(0, total);

  const rendered = await offCtx.startRendering();
  return encodeWav(rendered);
}
