import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Copy, Trash2, Download, MessageSquare, Check } from "lucide-react";

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "ar-SA", label: "Arabic" },
  { code: "hi-IN", label: "Hindi" },
  { code: "it-IT", label: "Italian" },
];

export const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);
  const [history, setHistory] = useState<{ text: string; lang: string; ts: number }[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRClass) { setSupported(false); return; }
  }, []);

  const startListening = () => {
    const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRClass) return;
    const rec = new SRClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimText(interim);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("SpeechRecognition error", e);
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTranscript = () => {
    if (transcript.trim()) {
      setHistory(h => [{ text: transcript, lang: language, ts: Date.now() }, ...h.slice(0, 4)]);
    }
    setTranscript("");
    setInterimText("");
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!supported) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">The Web Speech API is not supported in this browser. Try Chrome or Edge.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Voice to Text Transcription</CardTitle>
            <CardDescription>Real-time speech recognition using the Web Speech API — 100% client-side</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Language + controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {!isListening ? (
            <Button onClick={startListening} className="gap-2">
              <Mic className="h-4 w-4" />Start Recording
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopListening} className="gap-2">
              <MicOff className="h-4 w-4" />Stop Recording
            </Button>
          )}
          {isListening && <Badge className="bg-red-500 text-white animate-pulse">● RECORDING</Badge>}
        </div>

        {/* Live transcript area */}
        <div className="relative">
          <Textarea
            value={transcript + interimText}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Start recording — your speech will appear here in real-time..."
            className="min-h-[200px] font-mono text-sm resize-none"
            readOnly={isListening}
          />
          {interimText && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="text-xs opacity-70">listening...</Badge>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyTranscript} disabled={!transcript}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadTranscript} disabled={!transcript}>
            <Download className="h-4 w-4 mr-1" />Download .txt
          </Button>
          <Button variant="outline" size="sm" onClick={clearTranscript} disabled={!transcript}>
            <Trash2 className="h-4 w-4 mr-1" />Clear
          </Button>
          <Badge variant="secondary" className="ml-auto self-center">
            {transcript.trim().split(/\s+/).filter(Boolean).length} words
          </Badge>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Session History</h3>
            {history.map(h => (
              <div key={h.ts} className="border rounded p-2 text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => setTranscript(prev => prev + h.text)}>
                <div className="text-xs text-muted-foreground mb-1">
                  {new Date(h.ts).toLocaleTimeString()} · {LANGUAGES.find(l => l.code === h.lang)?.label}
                </div>
                <div className="line-clamp-2">{h.text}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Web Speech API</strong> — Uses your browser's built-in speech recognition engine. No audio data leaves your device. Supported in Chrome, Edge, and Safari.
        </div>
      </CardContent>
    </Card>
  );
};
