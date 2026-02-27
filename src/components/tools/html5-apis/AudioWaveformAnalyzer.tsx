import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Upload, Mic, MicOff, Play, Pause, Square, Music, Activity } from "lucide-react";

export const AudioWaveformAnalyzer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const freqCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [fftSize, setFftSize] = useState(2048);
  const [stats, setStats] = useState({ peak: 0, rms: 0, freq: 0 });
  const [mode, setMode] = useState<"waveform" | "frequency">("waveform");

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (!analyserRef.current) {
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
  };

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "hsl(222 47% 8%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsl(142 71% 45%)";
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Compute stats
    let peak = 0, sumSq = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = Math.abs(dataArray[i] - 128) / 128;
      if (v > peak) peak = v;
      sumSq += v * v;
    }
    setStats(s => ({ ...s, peak: Math.round(peak * 100), rms: Math.round(Math.sqrt(sumSq / bufferLength) * 100) }));
  }, []);

  const drawFrequency = useCallback(() => {
    const canvas = freqCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "hsl(222 47% 8%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    let maxVal = 0, maxIdx = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxVal) { maxVal = dataArray[i]; maxIdx = i; }
      const barHeight = (dataArray[i] / 255) * canvas.height;
      const hue = (i / bufferLength) * 280;
      ctx.fillStyle = `hsl(${hue} 80% 55%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    if (audioCtxRef.current) {
      const freq = Math.round((maxIdx / bufferLength) * (audioCtxRef.current.sampleRate / 2));
      setStats(s => ({ ...s, freq }));
    }
  }, []);

  const animate = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    drawWaveform();
    drawFrequency();
  }, [drawWaveform, drawFrequency]);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (sourceRef.current) {
      try { (sourceRef.current as AudioBufferSourceNode).stop?.(); } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsPlaying(false);
    setIsRecording(false);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    stopAll();
    initAudio();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioCtxRef.current!.decodeAudioData(arrayBuffer);
    setAudioBuffer(buffer);
  };

  const playAudio = () => {
    if (!audioBuffer || !audioCtxRef.current || !analyserRef.current) return;
    stopAll();
    initAudio();
    const src = audioCtxRef.current.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(analyserRef.current);
    src.start(0);
    src.onended = () => { setIsPlaying(false); cancelAnimationFrame(animFrameRef.current); };
    sourceRef.current = src;
    setIsPlaying(true);
    animate();
  };

  const startMicInput = async () => {
    stopAll();
    initAudio();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const src = audioCtxRef.current!.createMediaStreamSource(stream);
    src.connect(analyserRef.current!);
    sourceRef.current = src as unknown as AudioBufferSourceNode;
    setIsRecording(true);
    animate();
  };

  useEffect(() => {
    return () => { stopAll(); audioCtxRef.current?.close(); };
  }, [stopAll]);

  useEffect(() => {
    if (analyserRef.current) analyserRef.current.fftSize = fftSize;
  }, [fftSize]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Audio Waveform Analyzer</CardTitle>
            <CardDescription>Visualize audio waveforms and frequency spectrum using the Web Audio API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />Upload Audio
          </Button>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          {audioBuffer && !isPlaying && (
            <Button onClick={playAudio}>
              <Play className="h-4 w-4 mr-2" />Play
            </Button>
          )}
          {isPlaying && (
            <Button variant="destructive" onClick={stopAll}>
              <Square className="h-4 w-4 mr-2" />Stop
            </Button>
          )}
          {!isRecording ? (
            <Button variant="secondary" onClick={startMicInput}>
              <Mic className="h-4 w-4 mr-2" />Live Microphone
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopAll}>
              <MicOff className="h-4 w-4 mr-2" />Stop Mic
            </Button>
          )}
          {fileName && <Badge variant="outline">{fileName}</Badge>}
          {isRecording && <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>}
        </div>

        {/* FFT Size */}
        <div className="space-y-1">
          <label className="text-sm font-medium">FFT Size: {fftSize}</label>
          <Slider min={512} max={8192} step={512} value={[fftSize]}
            onValueChange={([v]) => setFftSize(v)} className="w-48" />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "waveform" ? "default" : "outline"} onClick={() => setMode("waveform")}>
            <Activity className="h-4 w-4 mr-1" />Waveform
          </Button>
          <Button size="sm" variant={mode === "frequency" ? "default" : "outline"} onClick={() => setMode("frequency")}>
            <Music className="h-4 w-4 mr-1" />Frequency
          </Button>
        </div>

        {/* Canvas */}
        <div className="rounded-lg overflow-hidden border bg-[hsl(222_47%_8%)]">
          <canvas ref={canvasRef} width={800} height={180} className={`w-full ${mode !== "waveform" ? "hidden" : ""}`} />
          <canvas ref={freqCanvasRef} width={800} height={180} className={`w-full ${mode !== "frequency" ? "hidden" : ""}`} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Peak Amplitude", value: `${stats.peak}%` },
            { label: "RMS Level", value: `${stats.rms}%` },
            { label: "Dominant Freq", value: `${stats.freq} Hz` },
          ].map(({ label, value }) => (
            <div key={label} className="border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Web Audio API</strong> — This tool uses the browser's built-in audio processing engine to decode, play, and analyze audio in real time. No data is uploaded to any server.
        </div>
      </CardContent>
    </Card>
  );
};
