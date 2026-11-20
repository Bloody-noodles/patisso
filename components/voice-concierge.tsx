"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CallStatus = "idle" | "connecting" | "listening" | "error";
type TranscriptLine = { role: "you" | "patisso"; text: string };

const LIVE_MODEL = "models/gemini-3.1-flash-live-preview";
const LIVE_SOCKET =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=";

function resample(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i += 1) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, input.length - 1);
    const weight = position - left;
    output[i] = input[left] * (1 - weight) + input[right] * weight;
  }
  return output;
}

function encodePcm(samples: Float32Array) {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function VoiceConcierge() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  const closedByUserRef = useRef(false);

  const stopCall = useCallback(() => {
    closedByUserRef.current = true;
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, "Call ended");
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const inputContext = inputContextRef.current;
    const outputContext = outputContextRef.current;
    inputContextRef.current = null;
    outputContextRef.current = null;
    if (inputContext && inputContext.state !== "closed") void inputContext.close();
    if (outputContext && outputContext.state !== "closed") void outputContext.close();
    setStatus("idle");
  }, []);

  useEffect(() => () => {
    closedByUserRef.current = true;
    socketRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (inputContextRef.current && inputContextRef.current.state !== "closed") {
      void inputContextRef.current.close();
    }
    if (outputContextRef.current && outputContextRef.current.state !== "closed") {
      void outputContextRef.current.close();
    }
  }, []);

  const startCall = useCallback(async () => {
    if (status === "connecting" || status === "listening") return;
    setError("");
    setStatus("connecting");
    closedByUserRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support microphone access. Try a recent version of Chrome.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const tokenResponse = await fetch("/api/gemini/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const tokenData = (await tokenResponse.json()) as { token?: string; error?: string };
      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error(tokenData.error || "The voice assistant is not configured yet.");
      }

      const inputContext = new AudioContext({ sampleRate: 16000 });
      const outputContext = new AudioContext({ sampleRate: 24000 });
      inputContextRef.current = inputContext;
      outputContextRef.current = outputContext;
      await Promise.all([inputContext.resume(), outputContext.resume()]);

      const socket = new WebSocket(LIVE_SOCKET + encodeURIComponent(tokenData.token));
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          setup: {
            model: LIVE_MODEL,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: {
              parts: [{
                text: "You are Pâtissö's warm, polished voice concierge. You are speaking to a visitor on the Pâtissö restaurant demo website. Be welcoming, natural, concise and helpful. Help visitors explore the food categories shown on the website: pasta, savoury favourites, bakery and sweets. Do not invent prices, ingredients, allergens, opening hours, delivery promises or restaurant facts. This is a portfolio demonstration, not a real restaurant: no real food is prepared, no payment is taken and no real order is fulfilled. If asked to order, explain that you can demonstrate the ordering journey, but the demo order is simulated. Invite the visitor to browse the menu if they need exact dish details. Speak in short, conversational turns and allow interruptions.",
              }],
            },
          },
        }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as {
            setupComplete?: unknown;
            serverContent?: {
              inputTranscription?: { text?: string };
              outputTranscription?: { text?: string };
              modelTurn?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
              interrupted?: boolean;
            };
            error?: { message?: string };
          };

          if (message.error?.message) throw new Error(message.error.message);

          if (message.setupComplete) {
            const source = inputContext.createMediaStreamSource(stream);
            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            sourceRef.current = source;
            processorRef.current = processor;
            processor.onaudioprocess = (audioEvent) => {
              if (socket.readyState !== WebSocket.OPEN) return;
              const samples = resample(
                audioEvent.inputBuffer.getChannelData(0),
                inputContext.sampleRate,
                16000,
              );
              socket.send(JSON.stringify({
                realtimeInput: {
                  audio: { data: encodePcm(samples), mimeType: "audio/pcm;rate=16000" },
                },
              }));
            };
            source.connect(processor);
            processor.connect(inputContext.destination);
            setStatus("listening");
          }

          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            const text = content.inputTranscription.text.trim();
            if (text) setTranscript((current) => [...current, { role: "you" as const, text }].slice(-12));
          }
          if (content?.outputTranscription?.text) {
            const text = content.outputTranscription.text.trim();
            if (text) setTranscript((current) => [...current, { role: "patisso" as const, text }].slice(-12));
          }
          if (content?.interrupted) nextPlaybackTimeRef.current = outputContext.currentTime;

          for (const part of content?.modelTurn?.parts ?? []) {
            const audioBase64 = part.inlineData?.data;
            if (!audioBase64 || !outputContextRef.current) continue;
            const binary = atob(audioBase64);
            const pcm = new Int16Array(binary.length / 2);
            for (let i = 0; i < pcm.length; i += 1) {
              pcm[i] = (binary.charCodeAt(i * 2) & 0xff) | (binary.charCodeAt(i * 2 + 1) << 8);
            }
            const audioContext = outputContextRef.current;
            const buffer = audioContext.createBuffer(1, pcm.length, 24000);
            const channel = buffer.getChannelData(0);
            for (let i = 0; i < pcm.length; i += 1) channel[i] = pcm[i] / 32768;
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            const startAt = Math.max(audioContext.currentTime + 0.02, nextPlaybackTimeRef.current);
            source.start(startAt);
            nextPlaybackTimeRef.current = startAt + buffer.duration;
          }
        } catch (caught) {
          const messageText = caught instanceof Error ? caught.message : "The voice connection encountered a problem.";
          setError(messageText);
          stopCall();
          setStatus("error");
        }
      };

      socket.onerror = () => {
        setError("We couldn't connect to the voice service. Please try again.");
        stopCall();
        setStatus("error");
      };

      socket.onclose = () => {
        if (!closedByUserRef.current) {
          setError("The voice connection ended. You can try calling again.");
          setStatus("error");
        }
      };
    } catch (caught) {
      const messageText = caught instanceof Error ? caught.message : "Something went wrong starting the call.";
      setError(messageText);
      stopCall();
      setStatus("error");
    }
  }, [status, stopCall]);

  return (
    <>
      <button className="voice-launcher" type="button" onClick={() => setOpen(true)}>
        <span className="voice-launcher-icon" aria-hidden="true">♫</span>
        <span>Call Pâtissö</span>
      </button>

      {open && (
        <div className="voice-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && status !== "connecting" && status !== "listening") setOpen(false);
        }}>
          <section className="voice-panel" role="dialog" aria-modal="true" aria-labelledby="voice-title">
            <button className="voice-close" type="button" aria-label="Close voice assistant" onClick={() => {
              stopCall();
              setOpen(false);
            }}>×</button>
            <p className="voice-kicker">THE PÂTISSÖ TABLE</p>
            <h2 id="voice-title">A little chat<br /><em>over good food.</em></h2>
            <p className="voice-intro">Talk to our voice concierge. Ask about the menu, get ideas and explore the Pâtissö experience.</p>
            <div className={"voice-orb voice-orb--" + status} aria-hidden="true"><span /><i /><b /></div>
            <p className="voice-status" aria-live="polite">
              {status === "connecting" ? "Connecting to Pâtissö…" : status === "listening" ? "You're connected. Go ahead." : status === "error" ? "Call unavailable" : "Ready when you are"}
            </p>
            {error && <p className="voice-error" role="alert">{error}</p>}
            <div className="voice-transcript" aria-live="polite">
              {transcript.length === 0 ? (
                <p>Your conversation will appear here.</p>
              ) : transcript.map((line, index) => (
                <p className={"voice-line voice-line--" + line.role} key={index}>
                  <b>{line.role === "you" ? "YOU" : "PÂTISSÖ"}</b>{line.text}
                </p>
              ))}
            </div>
            {status === "idle" || status === "error" ? (
              <button className="voice-action" type="button" onClick={() => void startCall()}>
                {status === "error" ? "Try again" : "Start voice call"}
              </button>
            ) : (
              <button className="voice-action voice-action--end" type="button" onClick={stopCall}>
                End call
              </button>
            )}
            <p className="voice-disclaimer">Demo experience · No real orders or payments</p>
          </section>
        </div>
      )}
    </>
  );
}
