// Basic WAV Encoder
export function encodeWAV(samples: Float32Array, sampleRate: number, numChannels: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
  
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
  
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * numChannels * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);
  
    // Float to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  
    return new Blob([view], { type: 'audio/wav' });
}
  
export function interceptChannels(buffer: AudioBuffer): Float32Array {
    const length = buffer.length;
    const channels = buffer.numberOfChannels;
    const interleaved = new Float32Array(length * channels);
  
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < channels; j++) {
        interleaved[i * channels + j] = buffer.getChannelData(j)[i];
      }
    }
    return interleaved;
}

export async function convertToWav(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Interleave
    const interleaved = interceptChannels(audioBuffer);
    
    return encodeWAV(interleaved, audioBuffer.sampleRate, audioBuffer.numberOfChannels);
}

export async function convertAudio(file: File, format: 'wav' | 'mp3' | 'ogg' | 'aac'): Promise<Blob> {
    if (format === 'wav') {
        return convertToWav(file);
    }
    throw new Error(`Conversion to ${format.toUpperCase()} requires external libraries (ffmpeg.wasm or lamejs) which are not currently installed.`);
}
