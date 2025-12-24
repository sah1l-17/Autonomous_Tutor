import { useEffect, useMemo, useRef, useState } from 'react';
import './Chat.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const SESSION_STORAGE_KEY = 'autonomousTutorSessionId';

function Chat() {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) || '');
  const [hasContent, setHasContent] = useState(false);
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Upload a PDF/image/text (or paste text) to begin. Then ask questions and I\'ll tutor you.',
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isBusy, [input, isBusy]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadSessionState() {
      if (!sessionId) return;
      try {
        const res = await fetch(`${API_BASE}/api/session/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setHasContent(Boolean(data?.state?.has_content));
      } catch {
        // ignore
      }
    }

    loadSessionState();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const pushMessage = (role, content) => {
    setMessages((prev) => prev.concat({ id: crypto.randomUUID(), role, content }));
  };

  const persistSessionId = (newSessionId) => {
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
  };

  const handleApiChat = async (payload) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = 'Request failed';
      try {
        const err = await res.json();
        detail = err?.detail || detail;
      } catch {
        // ignore
      }
      throw new Error(detail);
    }

    return res.json();
  };

  const handleUpload = async (file) => {
    setFileBusy(true);
    setHasInteracted(true);
    try {
      pushMessage('user', `Uploaded: ${file.name}`);
      pushMessage('assistant', 'Processing your file...');

      const form = new FormData();
      form.append('file', file);
      if (sessionId) form.append('session_id', sessionId);

      const res = await fetch(`${API_BASE}/api/upload/file`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        let detail = 'Upload failed';
        try {
          const err = await res.json();
          detail = err?.detail || detail;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const data = await res.json();
      if (data?.session_id) persistSessionId(data.session_id);

      const message = data?.response?.message || 'File processed successfully';
      // Remove the "Processing..." message
      setMessages((prev) => prev.slice(0, -1));
      const concepts = data?.response?.data?.core_concepts || [];

      pushMessage('assistant', concepts.length ? `${message}\n\nConcepts found: ${concepts.join(', ')}` : message);
      setHasContent(true);
    } finally {
      setFileBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await handleUpload(file);
    } catch (err) {
      pushMessage('assistant', `Error: ${err.message}`);
    }
  };

  const onReset = async () => {
    if (!sessionId) {
      setHasContent(false);
      setHasInteracted(false);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Upload a PDF/image/text (or paste text) to begin. Then ask questions and I\'ll tutor you.',
        },
      ]);
      return;
    }

    setIsBusy(true);
    try {
      await fetch(`${API_BASE}/api/session/${sessionId}`, { method: 'DELETE' });
    } finally {
      setIsBusy(false);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSessionId('');
      setHasContent(false);
      setHasInteracted(false);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Session cleared. Upload content to start again.',
        },
      ]);
    }
  };

  const onSend = async () => {
    if (!canSend) return;

    const text = input.trim();
    setInput('');
    setHasInteracted(true);
    pushMessage('user', text);

    setIsBusy(true);
    try {
      if (!hasContent) {
        pushMessage('assistant', 'Processing your content...');
        const data = await handleApiChat({ session_id: sessionId || null, type: 'text', content: text });
        if (data?.session_id) persistSessionId(data.session_id);

        const status = data?.response?.status;
        const msg = data?.response?.message;
        const concepts = data?.response?.concepts_found || [];

        // Remove the "Processing..." message
        setMessages((prev) => prev.slice(0, -1));
        pushMessage(
          'assistant',
          status === 'ingested'
            ? `${msg || 'Content ingested.'}${concepts.length ? `\n\nConcepts found: ${concepts.join(', ')}` : ''}`
            : JSON.stringify(data?.response || {}, null, 2)
        );

        setHasContent(true);
        return;
      }

      pushMessage('assistant', 'Thinking...');
      const data = await handleApiChat({ session_id: sessionId || null, type: 'question', question: text });
      if (data?.session_id) persistSessionId(data.session_id);

      const explanation = data?.response?.explanation;
      // Remove the "Thinking..." message
      setMessages((prev) => prev.slice(0, -1));
      if (explanation) {
        pushMessage('assistant', explanation);
      } else {
        pushMessage('assistant', JSON.stringify(data?.response || {}, null, 2));
      }
    } catch (err) {
      // Remove any loading message
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'assistant' && (lastMsg.content === 'Thinking...' || lastMsg.content === 'Processing your content...')) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      pushMessage('assistant', `Error: ${err.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="chat-page">
      <input
        ref={fileInputRef}
        className="chat-file-input"
        type="file"
        accept=".pdf,.txt,image/*"
        onChange={onPickFile}
        disabled={fileBusy}
        aria-label="Upload PDF, text, or image"
      />

      {!hasInteracted && (
        <div className="chat-header">
          <div className="sparkle-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="chat-title">What you want to learn?</h1>
        </div>
      )}

      <div className="chat-content">
        <div className="chat-thread" role="log" aria-label="Chat messages">
          {messages.map((m) => (
            <div key={m.id} className={`chat-row ${m.role === 'user' ? 'right' : 'left'}`}>
              <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="bubble-label">{m.role === 'user' ? 'ME' : 'OUR AI'}</div>
                <div className="bubble-content">{m.content}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="chat-composer">
        <div className="input-wrapper">
          <button
            className="action-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileBusy || isBusy}
            title="Upload file"
          >
            +
          </button>
          <button
            className="action-btn"
            type="button"
            onClick={onReset}
            disabled={isBusy || fileBusy}
            title="Reset session"
          >
            ⟲
          </button>
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasContent ? 'Ask me anything about your projects' : 'Paste text to ingest…'}
            rows={1}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button className="send-btn" type="button" onClick={onSend} disabled={!canSend}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12L19 12M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
