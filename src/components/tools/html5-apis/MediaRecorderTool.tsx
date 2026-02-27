import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Video, Square, Download, Trash2, Play, Monitor, Clapperboard } from "lucide-react";

interface Recording { id: string; blob: Blob; url: string; duration: number; type: string; size: number; name: string; }

const AUDIO_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
const VIDEO_MIME_TYPES = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];

function getSupportedMime(types: string[]) {
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? "";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const MediaRecorderTool = () => {
  const [mode, setMode] = useState<"audio" | "video" | "screen">("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"audio" | "video">("audio");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  };

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      let stream: MediaStream;
      if (mode === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (mode === "video") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } else {
        // Screen capture
        stream = await (navigator.mediaDevices as MediaDevices & { getDisplayMedia: (o?: object) => Promise<MediaStream> })
          .getDisplayMedia({ video: true, audio: true });
      }
      streamRef.current = stream;

      if ((mode === "video" || mode === "screen") && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }

      const mimeTypes = mode === "audio" ? AUDIO_MIME_TYPES : VIDEO_MIME_TYPES;
      const mimeType = getSupportedMime(mimeTypes);
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || (mode === "audio" ? "audio/webm" : "video/webm") });
        const url = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const ext = mode === "audio" ? "webm" : "webm";
        setRecordings(prev => [{
          id: `${Date.now()}`,
          blob, url, duration,
          type: mode,
          size: blob.size,
          name: `${mode}-${Date.now()}.${ext}`
        }, ...prev]);
        stopStream();
      };
      mediaRecorderRef.current = rec;
      rec.start(100);
      startTimeRef.current = Date.now();
      setElapsed(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id);
      if (rec) URL.revokeObjectURL(rec.url);
      return prev.filter(r => r.id !== id);
    });
    if (previewUrl) { setPreviewUrl(null); setPlayingId(null); }
  };

  const downloadRecording = (rec: Recording) => {
    const a = document.createElement("a"); a.href = rec.url; a.download = rec.name; a.click();
  };

  const playPreview = (rec: Recording) => {
    setPreviewUrl(rec.url);
    setPreviewType(rec.type === "audio" ? "audio" : "video");
    setPlayingId(rec.id);
  };

  useEffect(() => { return () => { stopStream(); if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clapperboard className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Media Recorder</CardTitle>
            <CardDescription>Record audio, video, or your screen using the MediaRecorder API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Mode selector */}
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "audio", icon: Mic, label: "Audio" },
            { value: "video", icon: Video, label: "Webcam Video" },
            { value: "screen", icon: Monitor, label: "Screen Capture" },
          ] as const).map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={mode === value ? "default" : "outline"}
              onClick={() => setMode(value)}
              disabled={isRecording}
            >
              <Icon className="h-4 w-4 mr-2" />{label}
            </Button>
          ))}
        </div>

        {/* Live preview for video/screen */}
        {(mode === "video" || mode === "screen") && isRecording && (
          <div className="rounded-lg overflow-hidden border bg-black">
            <video ref={liveVideoRef} muted className="w-full max-h-52 object-contain" />
          </div>
        )}

        {/* Record / Stop */}
        <div className="flex gap-3 items-center">
          {!isRecording ? (
            <Button onClick={startRecording} className="gap-2">
              <Mic className="h-4 w-4" />Start Recording
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopRecording} className="gap-2">
              <Square className="h-4 w-4" />Stop Recording
            </Button>
          )}
          {isRecording && (
            <Badge className="bg-red-500 text-white animate-pulse">
              ● REC {formatTime(elapsed)}
            </Badge>
          )}
        </div>

        {/* Preview player */}
        {previewUrl && (
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Preview</div>
            {previewType === "audio" ? (
              <audio src={previewUrl} controls className="w-full" />
            ) : (
              <video src={previewUrl} controls className="w-full max-h-64 rounded" />
            )}
          </div>
        )}

        {/* Recordings list */}
        {recordings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recordings ({recordings.length})</h3>
            {recordings.map(rec => (
              <div key={rec.id} className="border rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {rec.type === "audio" ? <Mic className="h-4 w-4 text-muted-foreground" /> :
                      rec.type === "video" ? <Video className="h-4 w-4 text-muted-foreground" /> :
                        <Monitor className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium truncate">{rec.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(rec.duration)} · {formatSize(rec.size)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => playPreview(rec)}
                    className={playingId === rec.id ? "text-primary" : ""}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadRecording(rec)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteRecording(rec.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {recordings.length === 0 && !isRecording && (
          <div className="text-center py-6 text-muted-foreground">
            <Clapperboard className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a mode and start recording.</p>
            <p className="text-xs mt-1">Recordings are stored in browser memory and never uploaded.</p>
          </div>
        )}

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>MediaRecorder API</strong> + <strong>Screen Capture API</strong> — All recordings are processed locally. Nothing is sent to any server.
        </div>
      </CardContent>
    </Card>
  );
};
