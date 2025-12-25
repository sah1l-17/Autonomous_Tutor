import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './MatchPairsGame.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const SESSION_STORAGE_KEY = 'autonomousTutorSessionId';

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCardsFromPairs(pairs) {
  // pairs: { term: association }
  const terms = Object.keys(pairs || {});
  const cards = [];

  for (const term of terms) {
    const association = pairs[term];

    cards.push({
      id: `term:${term}`,
      pairKey: term,
      kind: 'term',
      text: term,
    });

    cards.push({
      id: `assoc:${term}`,
      pairKey: term,
      kind: 'assoc',
      text: association,
    });
  }

  return shuffleArray(cards);
}

function evaluateSelection(cardsById, selectedIds) {
  if (selectedIds.length !== 2) return { ok: false, reason: 'Select exactly 2 cards.' };

  const [aId, bId] = selectedIds;
  const a = cardsById.get(aId);
  const b = cardsById.get(bId);

  if (!a || !b) return { ok: false, reason: 'Invalid selection.' };
  if (a.id === b.id) return { ok: false, reason: 'Select two different cards.' };

  // Must be term + assoc from same pair.
  const isDifferentKind = a.kind !== b.kind;
  const isSamePair = a.pairKey === b.pairKey;

  const pairKey = a.pairKey || b.pairKey || null;

  if (isDifferentKind && isSamePair) return { ok: true, pairKey };
  return { ok: false, pairKey };
}

function MatchPairsGame() {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState('loading'); // loading, ready, playing, completed, error
  const [currentGame, setCurrentGame] = useState(null);
  const [queuedGames, setQueuedGames] = useState([]);

  const [cards, setCards] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [lastCheck, setLastCheck] = useState({ ids: [], correct: null }); // correct: true|false|null

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  // Per-game attempts: Score is correct_matches / attempts
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const [isCorrect, setIsCorrect] = useState(null);
  const [message, setMessage] = useState('');
  const [whyText, setWhyText] = useState('');

  useEffect(() => {
    const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!existingSessionId) {
      setSessionId(null);
      setGameState('error');
      setMessage('No session found. Go to Chat, ingest content, and get the concept marked understood first.');
      return;
    }

    setSessionId(existingSessionId);
    setGameState('ready');
    setMessage('Pick two cards that form a correct pair, then click “Check”.');
  }, []);

  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const pairsCount = useMemo(() => {
    const pairs = currentGame?.pairs;
    if (!pairs || typeof pairs !== 'object') return 0;
    return Object.keys(pairs).length;
  }, [currentGame]);

  const matchedPairsCount = useMemo(() => Math.floor(matchedIds.size / 2), [matchedIds]);

  const isLocked = useMemo(() => Array.isArray(lastCheck.ids) && lastCheck.ids.length > 0, [lastCheck]);

  const gridCols = useMemo(() => {
    const count = cards.length;
    if (count === 0) return 3;
    // We always have 2 * N cards; want N above + N below.
    const cols = Math.max(1, Math.floor(count / 2));
    return Math.min(cols, 5);
  }, [cards.length]);

  const startGame = async () => {
    if (!sessionId) {
      setMessage('Error: No session found. Please refresh the page.');
      return;
    }

    setGameState('loading');
    setMessage('Generating game...');

    try {
      const response = await fetch(`${API_BASE}/api/game/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          game_type: 'match_pairs',
          nuances: [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate game');
      }

      const data = await response.json();
      const batch = data?.response;
      const games = Array.isArray(batch?.games) ? batch.games : [];
      if (games.length === 0) throw new Error('No games returned from server');

      const first = games[0];
      setCurrentGame(first);
      setQueuedGames(games.slice(1));

      const newCards = buildCardsFromPairs(first.pairs);
      setCards(newCards);

      setSelectedIds([]);
      setMatchedIds(new Set());
      setLastCheck({ ids: [], correct: null });
      setIsCorrect(null);
      setWhyText('');
      setScore({ correct: 0, total: 0 });

      setGameState('playing');
      setMessage('Select two cards that belong together, then click Check.');
    } catch (error) {
      console.error('Error starting match-pairs:', error);
      setMessage(`Error: ${error.message}`);
      setGameState('error');
    }
  };

  const resetStats = () => {
    setStreak(0);
    setBestStreak(0);
    setScore({ correct: 0, total: 0 });
    setMessage('Stats reset! Ready for a fresh start.');
  };

  const getAccuracy = () => {
    if (score.total === 0) return 0;
    return Math.round((score.correct / score.total) * 100);
  };

  useEffect(() => {
    if (pairsCount > 0 && matchedPairsCount === pairsCount && gameState === 'playing') {
      setGameState('completed');
      setMessage('🎉 All pairs matched!');
      setSelectedIds([]);
      setLastCheck({ ids: [], correct: null });
      setIsCorrect(true);
    }
  }, [pairsCount, matchedPairsCount, gameState]);

  // Clear temporary feedback colors so the user can keep trying.
  useEffect(() => {
    if (!lastCheck || !Array.isArray(lastCheck.ids) || lastCheck.ids.length === 0) return;
    const timeoutMs = lastCheck.correct === true ? 550 : 750;
    const t = window.setTimeout(() => {
      setLastCheck({ ids: [], correct: null });
      setIsCorrect(null);
      setSelectedIds([]);
    }, timeoutMs);
    return () => window.clearTimeout(t);
  }, [lastCheck]);

  const onCardClick = (cardId) => {
    if (gameState === 'loading' || gameState === 'error') return;
    if (gameState !== 'playing') return;
    if (isLocked) return;
    if (matchedIds.has(cardId)) return;

    setSelectedIds((prev) => {
      if (prev.includes(cardId)) return prev;
      if (prev.length >= 2) return [cardId];
      return [...prev, cardId];
    });
  };

  const handleCheck = () => {
    if (!currentGame) return;
    if (isLocked) return;

    if (selectedIds.length !== 2) {
      setMessage('Select two cards, then click Check.');
      return;
    }

    const result = evaluateSelection(cardsById, selectedIds);

    // Always update Why for the selection (every check).
    const termKeyForWhy = result.pairKey;
    const rationale =
      termKeyForWhy && typeof currentGame?.why?.[termKeyForWhy] === 'string' ? currentGame.why[termKeyForWhy] : '';
    setWhyText(rationale);

    if (result.ok) {
      // Disallow re-matching a pair that's already matched.
      if (selectedIds.some((id) => matchedIds.has(id))) {
        setIsCorrect(false);
        setLastCheck({ ids: [...selectedIds], correct: false });
        setMessage('❌ Those cards are already matched. Try a different pair.');
        setStreak(0);

        setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }));

        if (sessionId) {
          fetch(`${API_BASE}/api/game/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              game_type: 'match_pairs',
              is_correct: false,
              selected: selectedIds,
            }),
          }).catch(() => {});
        }

        return;
      }

      setIsCorrect(true);
      setLastCheck({ ids: [...selectedIds], correct: true });

      setMatchedIds((prev) => {
        const next = new Set(prev);
        for (const id of selectedIds) next.add(id);
        return next;
      });

      // Correct match increments attempts + correct.
      setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      setMessage('✅ Correct pair!');

      if (sessionId) {
        fetch(`${API_BASE}/api/game/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            game_type: 'match_pairs',
            is_correct: true,
            selected: selectedIds,
          }),
        }).catch(() => {});
      }

      return;
    }

    // Wrong: show red on the two selected cards.
    setIsCorrect(false);
    setLastCheck({ ids: [...selectedIds], correct: false });
    setMessage('❌ Not a correct pair.');
    setStreak(0);

    setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }));

    if (sessionId) {
      fetch(`${API_BASE}/api/game/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          game_type: 'match_pairs',
          is_correct: false,
          selected: selectedIds,
        }),
      }).catch(() => {});
    }
  };

  const playNext = () => {
    if (queuedGames.length > 0) {
      const [next, ...rest] = queuedGames;
      setCurrentGame(next);
      setQueuedGames(rest);

      const newCards = buildCardsFromPairs(next.pairs);
      setCards(newCards);

      setSelectedIds([]);
      setMatchedIds(new Set());
      setLastCheck({ ids: [], correct: null });
      setIsCorrect(null);
      setWhyText('');
      setScore({ correct: 0, total: 0 });

      setGameState('playing');
      setMessage('Select two cards that belong together, then click Check.');
      return;
    }

    startGame();
  };

  const retry = () => {
    const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!existingSessionId) {
      setSessionId(null);
      setGameState('error');
      setMessage('No session found. Go to Chat, ingest content, and get the concept marked understood first.');
      return;
    }

    setSessionId(existingSessionId);
    setGameState('ready');
    setMessage('Pick two cards that form a correct pair, then click “Check”.');
  };

  return (
    <div className="match-pairs-game">
      <div className="container">
        <motion.div
          className="game-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="game-title-section">
            <h1 className="game-title">
              Match <span className="accent">Pairs</span>
            </h1>
            <p className="game-subtitle">Pick two cards that belong together.</p>
          </div>

          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-label">Current Streak</div>
              <div className="stat-value streak-value">{streak} 🔥</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best Streak</div>
              <div className="stat-value">{bestStreak}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{getAccuracy()}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Score</div>
              <div className="stat-value">
                {score.correct}/{score.total}
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              className={`message ${isCorrect === true ? 'success' : isCorrect === false ? 'error' : 'info'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="game-area">
          {gameState === 'loading' && (
            <motion.div className="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="loader"></div>
              <p>Generating your game...</p>
            </motion.div>
          )}

          {gameState === 'ready' && (
            <motion.div className="ready-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button className="btn btn-primary btn-large" onClick={startGame}>
                🎮 Start Game
              </button>
              {score.total > 0 && (
                <button className="btn btn-secondary" onClick={resetStats}>
                  Reset Stats
                </button>
              )}
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'completed') && currentGame && (
            <motion.div className="game-board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="cards-grid-match" style={{ '--cols': gridCols }}>
                {cards.map((card, index) => {
                  const isSelected = selectedIds.includes(card.id);
                  const isMatched = matchedIds.has(card.id);

                  const wasChecked = lastCheck.ids.includes(card.id);
                  const showWrong = wasChecked && lastCheck.correct === false;
                  const showCorrect = wasChecked && lastCheck.correct === true;

                  const className = [
                    'card',
                    isSelected ? 'selected' : '',
                    isMatched ? 'correct' : '',
                    showCorrect ? 'correct' : '',
                    showWrong ? 'wrong' : '',
                    isLocked || gameState !== 'playing' ? 'disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className={className}
                        role="button"
                        tabIndex={0}
                        onClick={() => onCardClick(card.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') onCardClick(card.id);
                        }}
                      >
                        {card.text}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* keep the section below cards just like impostor */}
              {whyText && whyText.trim().length > 0 && (
                <div className="why-panel" aria-live="polite">
                  <div className="why-title">Why</div>
                  <p className="why-text">{whyText}</p>
                </div>
              )}

              {gameState === 'playing' && (
                <motion.div className="game-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <button className="btn btn-primary" onClick={handleCheck}>
                    Check
                  </button>
                </motion.div>
              )}

              {gameState === 'completed' && (
                <motion.div
                  className="game-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button className="btn btn-primary" onClick={playNext}>
                    ▶ Next Game
                  </button>
                  <button className="btn btn-secondary" onClick={() => setGameState('ready')}>
                    Reset Score
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'error' && (
            <motion.div className="error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="error-icon">⚠️</div>
              <p>{message}</p>
              <button className="btn btn-secondary" onClick={retry}>
                Retry
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchPairsGame;
