import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board/Board";
import { Pool } from "@/components/Pool/Pool";
import { PlayingCard } from "@/components/Card/PlayingCard";
import { useGameStore } from "@/store/gameStore";
import type { Card } from "@/engine/card";
import { canDropOnCell, legalCellKeys, POOL_SIZE_OPTIONS } from "@/engine/game";
import { parseCellKey } from "@/engine/grid";
import { ScoringRulesModal } from "@/components/ScoringRules/ScoringRulesModal";
import { NewGameConfirmModal } from "@/components/NewGameConfirm/NewGameConfirmModal";
import { GameSummaryModal } from "@/components/GameSummary/GameSummaryModal";
import { FirstGameTutorial, shouldShowTutorial } from "@/components/Tutorial/FirstGameTutorial";
import { LinesPanel } from "@/components/LinesPanel/LinesPanel";
import { usePlayTimerDisplay } from "@/hooks/usePlayTimer";
import "./App.css";

export default function App() {
  const poolSize = useGameStore((s) => s.poolSize);
  const state = useGameStore((s) => s.state);
  const liveScore = useGameStore((s) => s.liveScore);
  const actionCount = useGameStore((s) => s.actionCount);
  const initGame = useGameStore((s) => s.initGame);
  const dropCard = useGameStore((s) => s.dropCard);
  const undo = useGameStore((s) => s.undo);
  const canUndo = useGameStore((s) => s.canUndo);
  const timerStartAt = useGameStore((s) => s.timerStartAt);
  const timerStoppedAt = useGameStore((s) => s.timerStoppedAt);
  const playTimerLabel = usePlayTimerDisplay();

  const elapsedMs =
    timerStartAt !== null && timerStoppedAt !== null
      ? timerStoppedAt - timerStartAt
      : null;

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [lastPlacedKey, setLastPlacedKey] = useState<string | null>(null);
  const [scoringRulesOpen, setScoringRulesOpen] = useState(false);
  const [newGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  const [gameSummaryOpen, setGameSummaryOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const placeFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatus = useRef(state.status);

  useEffect(() => {
    return () => {
      if (placeFxTimer.current) clearTimeout(placeFxTimer.current);
    };
  }, []);

  useEffect(() => {
    if (prevStatus.current !== "finished" && state.status === "finished") {
      setGameSummaryOpen(true);
    }
    prevStatus.current = state.status;
  }, [state.status]);

  useEffect(() => {
    if (shouldShowTutorial()) {
      setTutorialOpen(true);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const legalKeys = new Set(legalCellKeys(state));

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo]);

  function startNewGame() {
    initGame(poolSize);
    setNewGameConfirmOpen(false);
    setGameSummaryOpen(false);
  }

  function handleNewGame() {
    setNewGameConfirmOpen(true);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (!id.startsWith("pool-")) return;
    const index = Number(id.replace("pool-", ""));
    setActiveCard(state.pool[index] ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    const poolIndex = Number(String(active.id).replace("pool-", ""));
    if (!over || Number.isNaN(poolIndex)) return;
    const overId = String(over.id);
    if (!overId.startsWith("cell-")) return;
    const { row, col } = parseCellKey(overId.replace("cell-", ""));
    if (canDropOnCell(state, row, col)) {
      dropCard(poolIndex, row, col);
      const key = `${row},${col}`;
      setLastPlacedKey(key);
      if (placeFxTimer.current) clearTimeout(placeFxTimer.current);
      placeFxTimer.current = setTimeout(() => setLastPlacedKey(null), 480);
    }
  }

  const hasProgress = state.turn > 0;

  return (
    <div className="app">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="game-layout">
          <header className="app-topbar">
            <h1>Quintet</h1>
            <div className="topbar-actions">
              <button type="button" onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
                Undo
              </button>
              <button type="button" className="btn-new-game" onClick={handleNewGame}>
                New game
              </button>
            </div>
          </header>

          <div className="sidebar-column">
            <aside className="game-sidebar" aria-label="Game options and stats">
              <div className="sidebar-section">
                <h2 className="sidebar-heading">Options</h2>
                <label className="sidebar-field">
                  <span className="sidebar-label">Pool k</span>
                  <select
                    value={poolSize}
                    disabled={state.turn > 0 && state.status === "playing"}
                    onChange={(e) => initGame(Number(e.target.value))}
                  >
                    {POOL_SIZE_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="sidebar-section">
                <h2 className="sidebar-heading">Stats</h2>
                <dl className="sidebar-stats">
                  <div className="stat-row">
                    <dt>Deck</dt>
                    <dd>{state.deck.length}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>Turn</dt>
                    <dd>{state.turn}/25</dd>
                  </div>
                  <div className="stat-row">
                    <dt>Actions</dt>
                    <dd>{actionCount}</dd>
                  </div>
                  <div className="stat-row stat-row-score">
                    <dt>Score</dt>
                    <dd>{liveScore.total.toFixed(1)}</dd>
                  </div>
                  {playTimerLabel ? (
                    <div className="stat-row">
                      <dt>Time</dt>
                      <dd>{playTimerLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <LinesPanel score={liveScore} />
            </aside>

            <button
              type="button"
              className="how-to-play-btn"
              onClick={() => setTutorialOpen(true)}
            >
              How to play
            </button>

            {state.status === "finished" && !gameSummaryOpen ? (
              <button
                type="button"
                className="view-results-btn"
                onClick={() => setGameSummaryOpen(true)}
              >
                View results
              </button>
            ) : null}

            <button
              type="button"
              className="scoring-rules-btn"
              onClick={() => setScoringRulesOpen(true)}
              aria-haspopup="dialog"
            >
              Scoring rules
            </button>
          </div>

          <Board
            legalDropKeys={legalKeys}
            isDragging={activeCard !== null}
            lastPlacedKey={lastPlacedKey}
          />
          <Pool disabled={state.status === "finished"} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="card-drag-wrapper">
              <PlayingCard card={activeCard} variant="drag" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <FirstGameTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <ScoringRulesModal open={scoringRulesOpen} onClose={() => setScoringRulesOpen(false)} />
      <NewGameConfirmModal
        open={newGameConfirmOpen}
        hasProgress={hasProgress}
        isFinished={state.status === "finished"}
        onConfirm={startNewGame}
        onClose={() => setNewGameConfirmOpen(false)}
      />
      <GameSummaryModal
        open={gameSummaryOpen}
        score={liveScore}
        actionCount={actionCount}
        elapsedMs={elapsedMs}
        onClose={() => setGameSummaryOpen(false)}
        onNewGame={() => {
          setGameSummaryOpen(false);
          setNewGameConfirmOpen(true);
        }}
      />
    </div>
  );
}
