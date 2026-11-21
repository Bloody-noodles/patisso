"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatNaira, menuForAssistant, menuItems } from "@/lib/menu";
import type { DemoOrder } from "@/lib/demo-orders";

type CallStatus = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";
type TranscriptLine = { role: "you" | "patisso"; text: string };

const LIVE_MODEL = "models/gemini-3.1-flash-live-preview";
const LIVE_SOCKET =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=";

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

function makeOrderRequest(args: Record<string, unknown>): { items: { name: string; quantity: number }[]; specialInstructions: string } | null {
  if (args.visitorConfirmed !== true || !Array.isArray(args.items) || args.items.length < 1 || args.items.length > 8) return null;
  const items: { name: string; quantity: number }[] = [];
  for (const raw of args.items) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as { name?: unknown; quantity?: unknown };
    const itemName = item.name;
    const quantity = item.quantity;
    if (typeof itemName !== "string" || typeof quantity !== "number") return null;
    const match = menuItems.find((entry) => entry.name.toLowerCase() === itemName.trim().toLowerCase());
    if (!match || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) return null;
    items.push({ name: match.name, quantity });
  }
  if (items.reduce((sum, item) => sum + item.quantity, 0) > 20) return null;
  return {
    items,
    specialInstructions: typeof args.specialInstructions === "string" ? args.specialInstructions.trim().slice(0, 240) : "",
  };
}

export function VoiceConcierge() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState("");
  const [demoOrder, setDemoOrder] = useState<DemoOrder | null>(null);
  const [demoOrderSaved, setDemoOrderSaved] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [voiceLevel, setVoiceLevel] = useState(0);
  const panelRef = useRef<HTMLElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  const playbackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const closedByUserRef = useRef(false);
  const callAttemptRef = useRef(0);
  const connectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCall = useCallback(() => {
    callAttemptRef.current += 1;
    closedByUserRef.current = true;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    inputAnalyserRef.current = null;
    setVoiceLevel(0);
    if (connectionTimerRef.current) {
      clearTimeout(connectionTimerRef.current);
      connectionTimerRef.current = null;
    }
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, "Call ended");
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    playbackSourcesRef.current.forEach((source) => { try { source.stop(); } catch { /* already stopped */ } });
    playbackSourcesRef.current.clear();
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

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    return () => launcherRef.current?.focus();
  }, [open]);

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
    const attempt = ++callAttemptRef.current;
    const isCurrentAttempt = () => callAttemptRef.current === attempt && !closedByUserRef.current;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support microphone access. Try a recent version of Chrome.");
      }

      // iOS Safari may suspend Web Audio until it is resumed directly from
      // the user's tap. Create and resume both contexts before awaiting
      // microphone permission or any network request.
      const inputContext = new AudioContext({ sampleRate: 16000 });
      const outputContext = new AudioContext({ sampleRate: 24000 });
      inputContextRef.current = inputContext;
      outputContextRef.current = outputContext;

      let audioContextError: unknown = null;
      const audioContextsReady = Promise.all([
        inputContext.resume(),
        outputContext.resume(),
      ]).then(
        () => true,
        (caught: unknown) => {
          audioContextError = caught;
          return false;
        },
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!isCurrentAttempt()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      if (!(await audioContextsReady)) {
        throw audioContextError instanceof Error
          ? audioContextError
          : new Error("Your browser could not start audio playback. Please tap to try again.");
      }
      if (inputContext.state !== "running" || outputContext.state !== "running") {
        throw new Error("Audio is not ready. Please try starting the call again.");
      }

      const tokenResponse = await fetch("/api/gemini/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const tokenData = (await tokenResponse.json()) as { token?: string; error?: string };
      if (!isCurrentAttempt()) return;
      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error(tokenData.error || "The voice assistant is not configured yet.");
      }

      if (!isCurrentAttempt()) return;

      const socket = new WebSocket(LIVE_SOCKET + encodeURIComponent(tokenData.token));
      socketRef.current = socket;
      connectionTimerRef.current = setTimeout(() => {
        if (!isCurrentAttempt() || socket.readyState === WebSocket.OPEN) return;
        setError("The voice service took too long to connect. Check your connection and try again.");
        stopCall();
        setStatus("error");
      }, 20000);

      socket.onopen = () => {
        if (!isCurrentAttempt()) {
          socket.close(1000, "Call no longer active");
          return;
        }
        if (connectionTimerRef.current) {
          clearTimeout(connectionTimerRef.current);
          connectionTimerRef.current = null;
        }
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
            tools: [{
              functionDeclarations: [{
                name: "create_demo_order",
                description: "Save the visitor’s order details to Pâtissö’s order database only after the visitor has reviewed and explicitly confirmed every item, quantity and total.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    visitorConfirmed: { type: "BOOLEAN", description: "Must be true only after the visitor explicitly confirms the complete read-back." },
                    items: {
                      type: "ARRAY",
                      description: "One or more exact menu item names and quantities.",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING", description: "Exact dish name from the supplied menu." },
                          quantity: { type: "INTEGER", description: "Quantity from 1 to 10." }
                        },
                        required: ["name", "quantity"]
                      }
                    },
                    specialInstructions: {
                      type: "STRING",
                      description: "Optional short preference or note from the visitor. Do not treat this as a verified allergen or dietary guarantee."
                    }
                  },
                  required: ["items", "visitorConfirmed"]
                }
              }]
            }],
            systemInstruction: {
              parts: [{
                text: `You are Pâtissö’s warm, polished voice concierge. Be welcoming, natural, concise and helpful. Speak like a thoughtful human host, not a call-centre script. Treat this as a normal restaurant conversation: do not call the experience a demo, prototype or simulation, and do not repeatedly explain its technical limitations. Ask one clear question at a time, use the visitor’s wording, remember their preferences throughout this call, and do not repeat questions they have already answered.

Here is the complete current website menu. Only recommend or accept dishes from this list. The descriptions and ₦ prices below are the complete menu details supplied; do not invent ingredients, sizes, allergens, availability, opening hours, or delivery promises.

${menuForAssistant}

Help visitors choose by asking what they feel like eating, suggesting a small number of relevant options, and explaining the menu descriptions accurately. When someone chooses a meal, naturally offer one relevant drink from the drinks category as an optional pairing; never pressure them or add it to the order without permission. If a visitor says they want something creamy, spicy, light, sweet, or filling, use the supplied descriptions to make a sensible suggestion without claiming unlisted ingredients. If you do not know something, say so plainly.

ORDER FLOW:
- You can build an order during this voice call.
- Ask which dish or dishes they want and the quantity for each. Clarify any ambiguous item.
- You may capture a short preference as a special instruction, but never promise it can be fulfilled.
- Read back every item, quantity, unit price and line total, then state the grand total in Nigerian Naira (₦). Ask: "Shall I place this order?"
- Do NOT call create_demo_order until the visitor clearly says yes or otherwise explicitly confirms after hearing the complete read-back. When calling, set visitorConfirmed to true. Never set it true based on an assumption, silence, or an earlier unrelated yes.
- If they change their mind, update the proposed order and read it back again before asking for confirmation.
- Call create_demo_order only with exact menu item names and valid quantities. If the tool rejects the request, apologise briefly and clarify the item.
- After a successful tool response, say naturally: "Your order has been recorded. Your reference is [reference], and your total is [total]." If stored is false, explain briefly that you could not save the order. Do not announce technical implementation details unless asked.

Be transparent when it matters: if a visitor asks whether food will actually be prepared or delivered, whether a restaurant has received the order, or whether payment is taken, explain plainly that this website currently records orders for demonstration purposes only; no kitchen receives them and no payment is processed. Do not volunteer this disclaimer during ordinary menu conversation or repeat it after every response. Never claim that food is being prepared, dispatched or delivered. Use only the exact ₦ prices in the menu. The order tool calculates and returns the authoritative total; never estimate or mentally recalculate it. Keep turns short and conversational, and allow interruptions.`
              }],
            },
          },
        }));
      };

      socket.onmessage = async (event) => {
        if (!isCurrentAttempt()) return;
        try {
          const payload = event.data instanceof Blob
            ? await event.data.text()
            : event.data instanceof ArrayBuffer
              ? new TextDecoder().decode(event.data)
              : typeof event.data === "string"
                ? event.data
                : null;
          if (payload === null) throw new Error("The voice service sent an unsupported message format.");
          const message = JSON.parse(payload) as {
            setupComplete?: unknown;
            toolCall?: { functionCalls?: Array<{ id?: string; name?: string; args?: Record<string, unknown> }> };
            serverContent?: {
              inputTranscription?: { text?: string };
              outputTranscription?: { text?: string };
              modelTurn?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
              interrupted?: boolean;
              toolCall?: { functionCalls?: Array<{ id?: string; name?: string; args?: Record<string, unknown> }> };
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
            const analyser = inputContext.createAnalyser();
            analyser.fftSize = 256;
            inputAnalyserRef.current = analyser;
            source.connect(analyser);
            analyser.connect(processor);
            const silentGain = inputContext.createGain();
            silentGain.gain.value = 0;
            processor.connect(silentGain);
            silentGain.connect(inputContext.destination);
            const samples = new Uint8Array(analyser.fftSize);
            const animateLevel = () => {
              if (!isCurrentAttempt() || !inputAnalyserRef.current) return;
              analyser.getByteTimeDomainData(samples);
              let energy = 0;
              for (let index = 0; index < samples.length; index += 1) {
                const normalized = (samples[index] - 128) / 128;
                energy += normalized * normalized;
              }
              setVoiceLevel(Math.min(1, Math.sqrt(energy / samples.length) * 4.5));
              animationFrameRef.current = window.requestAnimationFrame(animateLevel);
            };
            animationFrameRef.current = window.requestAnimationFrame(animateLevel);
            setStatus("listening");
          }

          const calls = message.toolCall?.functionCalls ?? message.serverContent?.toolCall?.functionCalls ?? [];
          if (calls.length > 0) {
            const functionResponses = await Promise.all(calls.map(async (call) => {
              if (call.name !== "create_demo_order") {
                return { id: call.id, name: call.name, response: { ok: false, message: "Unknown action." } };
              }
              const requestBody = makeOrderRequest(call.args ?? {});
              if (!requestBody) {
                return {
                  id: call.id,
                  name: call.name,
                  response: { ok: false, message: "The order could not be validated. Check menu item names, quantities and explicit visitor confirmation." }
                };
              }
              try {
                const response = await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...requestBody, visitorConfirmed: true }),
                });
                const result = await response.json();
                if (!response.ok || !result.ok || !result.order) {
                  return { id: call.id, name: call.name, response: { ok: false, message: result.error ?? "The order could not be saved. Please try again." } };
                }
                const order = result.order as DemoOrder;
                setDemoOrder(order);
                setDemoOrderSaved(true);
                setTrackingUrl(result.trackingUrl as string);
                setTranscript((current) => [
                  ...current,
                  { role: "patisso" as const, text: `Order recorded · Reference ${order.reference}` }
                ].slice(-12));
                return {
                  id: call.id,
                  name: call.name,
                  response: {
                    ok: true,
                    reference: order.reference,
                    items: order.items,
                    totalNaira: order.totalNaira,
                    formattedTotal: formatNaira(order.totalNaira),
                    trackingUrl: result.trackingUrl,
                    message: "The order has been recorded in Pâtissö. The total is " + formatNaira(order.totalNaira) + ". Reference: " + order.reference + "."
                  }
                };
              } catch {
                return { id: call.id, name: call.name, response: { ok: false, message: "The order service could not be reached. Please try again." } };
              }
            }));
            socket.send(JSON.stringify({ toolResponse: { functionResponses } }));
          }

          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            const text = content.inputTranscription.text.trim();
            if (text) {
              setTranscript((current) => [...current, { role: "you" as const, text }].slice(-12));
              setStatus("thinking");
            }
          }
          if (content?.outputTranscription?.text) {
            const text = content.outputTranscription.text.trim();
            if (text) {
              setTranscript((current) => [...current, { role: "patisso" as const, text }].slice(-12));
              setStatus("speaking");
            }
          }
          if (content?.interrupted) {
            playbackSourcesRef.current.forEach((source) => { try { source.stop(); } catch { /* already stopped */ } });
            playbackSourcesRef.current.clear();
            nextPlaybackTimeRef.current = outputContext.currentTime;
            if (isCurrentAttempt()) setStatus("listening");
          }

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
            playbackSourcesRef.current.add(source);
            source.onended = () => playbackSourcesRef.current.delete(source);
            const startAt = Math.max(audioContext.currentTime + 0.02, nextPlaybackTimeRef.current);
            source.start(startAt);
            setStatus("speaking");
            source.onended = () => {
              playbackSourcesRef.current.delete(source);
              if (isCurrentAttempt() && playbackSourcesRef.current.size === 0) setStatus("listening");
            };
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
        if (!isCurrentAttempt()) return;
        setError("We couldn't connect to the voice service. Please try again.");
        stopCall();
        setStatus("error");
      };

      socket.onclose = () => {
        if (connectionTimerRef.current) {
          clearTimeout(connectionTimerRef.current);
          connectionTimerRef.current = null;
        }
        if (isCurrentAttempt()) {
          stopCall();
          setError("The voice connection ended. Your microphone has been released. You can try calling again.");
          setStatus("error");
        }
      };
    } catch (caught) {
      if (!isCurrentAttempt()) return;
      const messageText = caught instanceof Error ? caught.message : "Something went wrong starting the call.";
      setError(messageText);
      stopCall();
      setStatus("error");
    }
  }, [status, stopCall]);

  return (
    <>
      <button ref={launcherRef} className="voice-launcher" type="button" onClick={() => setOpen(true)}>
        <span className="voice-launcher-icon" aria-hidden="true">♫</span>
        <span>Call Pâtissö</span>
      </button>

      {open && (
        <div className="voice-backdrop" role="presentation" onKeyDown={(event) => {
          if (event.key === "Escape") { stopCall(); setOpen(false); }
          if (event.key === "Tab" && panelRef.current) {
            const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }} onMouseDown={(event) => {
          if (event.target === event.currentTarget && status !== "connecting" && status !== "listening") setOpen(false);
        }}>
          <section ref={panelRef} className="voice-panel" role="dialog" aria-modal="true" aria-labelledby="voice-title" aria-describedby="voice-description">
            <button ref={closeButtonRef} className="voice-close" type="button" aria-label="Close voice assistant" onClick={() => {
              stopCall();
              setOpen(false);
            }}>×</button>
            <p className="voice-kicker">THE PÂTISSÖ TABLE</p>
            <h2 id="voice-title">A little chat<br /><em>over good food.</em></h2>
            <p id="voice-description" className="voice-intro">Talk to our voice concierge. Ask about the menu, get ideas and explore the Pâtissö experience.</p>
            <div className={"voice-orb voice-orb--" + status} style={{ "--voice-level": voiceLevel } as React.CSSProperties} aria-hidden="true"><span /><i /><b /></div>
            <div className={"voice-visualizer voice-visualizer--" + status} aria-hidden="true">{Array.from({ length: 21 }, (_, index) => <i key={index} style={{ "--bar": 0.35 + ((index * 7) % 9) / 10, "--voice-level": voiceLevel } as React.CSSProperties} />)}</div>
            <p className="voice-status" aria-live="polite">
              {status === "connecting" ? "Connecting to Pâtissö…" : status === "listening" ? "Listening · Your turn" : status === "thinking" ? "One moment · Thinking" : status === "speaking" ? "Pâtissö is speaking" : status === "error" ? "Call unavailable" : "Ready when you are"}
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
            {demoOrder && (
              <section className="voice-order" aria-live="polite" aria-label="Order confirmation">
                <div className="voice-order-heading">
                  <span>ORDER CONFIRMED</span>
                  <b>#{demoOrder.reference}</b>
                </div>
                <ul>
                  {demoOrder.items.map((item) => (
                    <li key={item.name}><span>{item.name} × {item.quantity}<small>{formatNaira(item.unitPrice)} each</small></span><b>{formatNaira(item.lineTotal)}</b></li>
                  ))}
                </ul>
                <div className="voice-order-total"><span>ORDER TOTAL</span><b>{formatNaira(demoOrder.totalNaira)}</b></div>
                {demoOrder.specialInstructions && <p className="voice-order-note">Your note: {demoOrder.specialInstructions}</p>}
                {demoOrderSaved && <a className="voice-track-link" href={trackingUrl}>Track order ↗</a>}
                <p className="voice-order-foot">{demoOrderSaved ? "Saved securely to the central demo database. Nothing has been sent to a restaurant." : "This is a simulated receipt. Nothing has been sent to a restaurant."}</p>
              </section>
            )}
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
