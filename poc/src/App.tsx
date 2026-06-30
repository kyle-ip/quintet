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
import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board/Board";
import { Pool } from "@/components/Pool/Pool";
import { PlayingCard } from "@/components/Card/PlayingCard";
import { useGameStore, type GameMode } from "@/store/gameStore";
import type { Card } from "@/engine/card";
import { canDropOnCell, legalCellKeys, POOL_SIZE_OPTIONS } from "@/engine/game";
import { BOARD_SIZE_OPTIONS, boardCellCount, parseCellKey } from "@/engine/grid";
import { CARD_THEME_LIST } from "@themes/index";
import type { ColorMode } from "@/config/colorMode";
import { NewGameConfirmModal } from "@/components/NewGameConfirm/NewGameConfirmModal";
import { GameSummaryModal } from "@/components/GameSummary/GameSummaryModal";
import { FirstGameTutorial, shouldShowTutorial } from "@/components/Tutorial/FirstGameTutorial";
import { useAutoPlay } from "@/hooks/useAutoPlay";
import { useTapPlaceMode } from "@/hooks/useTapPlaceMode";
import { MobileStatsBar } from "@/components/Layout/MobileStatsBar";
import { FloorBanner } from "@/components/Endless/FloorBanner";
import { FloorResultModal } from "@/components/Endless/FloorResultModal";
import { RunSummaryModal } from "@/components/Endless/RunSummaryModal";
import {
  EndlessTutorial,
  shouldShowEndlessTutorial,
} from "@/components/Endless/EndlessTutorial";
import {
  ENDLESS_STARTING_LIVES,
  getBossIdForFloor,
  getEndlessGateBreakdown,
} from "@/engine/run";
import { usePlayTimerDisplay } from "@/hooks/usePlayTimer";
import "./App.css";

const GAME_MODES: { id: GameMode; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "endless", label: "Endless" },
];

export default function App() {
  const gameMode = useGameStore((s) => s.gameMode);
  const boardSize = useGameStore((s) => s.boardSize);
  const poolSize = useGameStore((s) => s.poolSize);
  const state = useGameStore((s) => s.state);
  const liveScore = useGameStore((s) => s.liveScore);
  const actionCount = useGameStore((s) => s.actionCount);
  const themeId = useGameStore((s) => s.themeId);
  const colorMode = useGameStore((s) => s.colorMode);
  const endlessRun = useGameStore((s) => s.endlessRun);
  const showFloorBanner = useGameStore((s) => s.showFloorBanner);
  const undoUsesThisFloor = useGameStore((s) => s.undoUsesThisFloor);
  const initGame = useGameStore((s) => s.initGame);
  const startEndlessRun = useGameStore((s) => s.startEndlessRun);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const continueEndlessFloor = useGameStore((s) => s.continueEndlessFloor);
  const retryEndlessFloor = useGameStore((s) => s.retryEndlessFloor);
  const endEndlessRun = useGameStore((s) => s.endEndlessRun);
  const dismissFloorBanner = useGameStore((s) => s.dismissFloorBanner);
  const dropCard = useGameStore((s) => s.dropCard);
  const undo = useGameStore((s) => s.undo);
  const canUndo = useGameStore((s) => s.canUndo);
  const getUndoLimit = useGameStore((s) => s.getUndoLimit);
  const getEndlessFloorTarget = useGameStore((s) => s.getEndlessFloorTarget);
  const setThemeId = useGameStore((s) => s.setThemeId);
  const setColorMode = useGameStore((s) => s.setColorMode);
  const timerStartAt = useGameStore((s) => s.timerStartAt);
  const timerStoppedAt = useGameStore((s) => s.timerStoppedAt);
  const playTimerLabel = usePlayTimerDisplay();

  const elapsedMs =
    timerStartAt !== null && timerStoppedAt !== null
      ? timerStoppedAt - timerStartAt
      : null;

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [lastPlacedKey, setLastPlacedKey] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [newGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  const [gameSummaryOpen, setGameSummaryOpen] = useState(false);
  const [floorResultOpen, setFloorResultOpen] = useState(false);
  const [runSummaryOpen, setRunSummaryOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [endlessTutorialOpen, setEndlessTutorialOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const placeFxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatus = useRef(state.status);

  const handleAutoPlaced = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    setLastPlacedKey(key);
    if (placeFxTimer.current) clearTimeout(placeFxTimer.current);
    placeFxTimer.current = setTimeout(() => setLastPlacedKey(null), 480);
  }, []);

  const tapPlaceMode = useTapPlaceMode();
  const poolDisabled = state.status === "finished" || autoPlay;
  const placementActive =
    tapPlaceMode && selectedPoolIndex !== null && !poolDisabled;
  const boardPlacementActive = activeCard !== null || placementActive;

  useEffect(() => {
    setSelectedPoolIndex(null);
  }, [state.turn, state.status]);

  useEffect(() => {
    if (!settingsOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSettingsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen]);

  const handleSelectPoolCard = useCallback(
    (index: number) => {
      if (poolDisabled) return;
      setSelectedPoolIndex((prev) => (prev === index ? null : index));
    },
    [poolDisabled],
  );

  const handleCellTap = useCallback(
    (row: number, col: number) => {
      if (selectedPoolIndex === null || poolDisabled) return;
      if (canDropOnCell(state, row, col)) {
        dropCard(selectedPoolIndex, row, col);
        setSelectedPoolIndex(null);
        const key = `${row},${col}`;
        setLastPlacedKey(key);
        if (placeFxTimer.current) clearTimeout(placeFxTimer.current);
        placeFxTimer.current = setTimeout(() => setLastPlacedKey(null), 480);
      }
    },
    [selectedPoolIndex, poolDisabled, state, dropCard],
  );

  const isEndless = gameMode === "endless";
  const floorTarget = getEndlessFloorTarget();
  const gateBreakdown =
    isEndless && endlessRun
      ? getEndlessGateBreakdown(
          endlessRun.floor,
          { clearedScores: endlessRun.clearedScores },
          boardSize,
        )
      : null;
  const undoLimit = getUndoLimit();
  const cellCount = boardCellCount(state.boardSize);
  const boardLocked =
    state.turn > 0 && state.status === "playing" && (!isEndless || endlessRun?.floor !== 1);
  const poolLocked = isEndless
    ? endlessRun?.floor !== 1 || state.turn > 0
    : state.turn > 0 && state.status === "playing";

  const autoPlayBlocked =
    newGameConfirmOpen ||
    tutorialOpen ||
    endlessTutorialOpen ||
    gameSummaryOpen ||
    runSummaryOpen ||
    (isEndless && showFloorBanner);

  useAutoPlay({
    autoPlay,
    state,
    dropCard,
    onPlaced: handleAutoPlaced,
    blocked: autoPlayBlocked,
    floorResultOpen,
    pendingFloorResult: endlessRun?.pendingFloorResult,
    lives: endlessRun?.lives ?? 0,
    onContinueFloor: () => {
      setFloorResultOpen(false);
      continueEndlessFloor();
    },
    onRetryFloor: () => {
      setFloorResultOpen(false);
      retryEndlessFloor(false);
    },
    onEndRun: () => {
      setFloorResultOpen(false);
      endEndlessRun();
    },
  });

  useEffect(() => {
    return () => {
      if (placeFxTimer.current) clearTimeout(placeFxTimer.current);
    };
  }, []);

  useEffect(() => {
    if (gameMode !== "classic") return;
    if (prevStatus.current !== "finished" && state.status === "finished") {
      setGameSummaryOpen(true);
    }
    prevStatus.current = state.status;
  }, [state.status, gameMode]);

  useEffect(() => {
    if (isEndless && endlessRun?.pendingFloorResult) {
      setFloorResultOpen(true);
    }
  }, [isEndless, endlessRun?.pendingFloorResult]);

  useEffect(() => {
    if (isEndless && endlessRun?.runOver) {
      setRunSummaryOpen(true);
    }
  }, [isEndless, endlessRun?.runOver]);

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
    if (isEndless) {
      startEndlessRun(poolSize);
    } else {
      initGame(poolSize);
    }
    setNewGameConfirmOpen(false);
    setGameSummaryOpen(false);
    setFloorResultOpen(false);
    setRunSummaryOpen(false);
  }

  function handleNewGame() {
    setNewGameConfirmOpen(true);
  }

  function startBoard(board: typeof boardSize, poolK: number) {
    if (isEndless) {
      useGameStore.setState({ boardSize: board });
      startEndlessRun(poolK);
    } else {
      useGameStore.setState({ boardSize: board });
      initGame(poolK);
    }
  }

  function handleGameModeChange(nextMode: GameMode) {
    if (nextMode === gameMode) return;
    const hasProgress = state.turn > 0 && state.status === "playing";
    if (hasProgress) {
      setPendingMode(nextMode);
      setNewGameConfirmOpen(true);
      return;
    }
    setGameMode(nextMode);
    if (nextMode === "endless" && shouldShowEndlessTutorial()) {
      setEndlessTutorialOpen(true);
    }
  }

  function confirmModeOrNewGame() {
    if (pendingMode) {
      setGameMode(pendingMode);
      setPendingMode(null);
      setNewGameConfirmOpen(false);
      if (pendingMode === "endless" && shouldShowEndlessTutorial()) {
        setEndlessTutorialOpen(true);
      }
      return;
    }
    startNewGame();
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
  const undoLabel =
    undoLimit !== null ? `Undo (${undoUsesThisFloor}/${undoLimit})` : "Undo";

  return (
    <div className="app">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="game-layout">
          <header className="app-topbar">
            <div className="topbar-brand">
              <h1>Quintet</h1>
              <span className="topbar-score-mobile">{liveScore.total.toFixed(1)}</span>
            </div>
            <div className="topbar-center">
              {isEndless && endlessRun && !endlessRun.runOver ? (
                <div className="topbar-endless" aria-label="Endless run status">
                  <span>Floor {endlessRun.floor}</span>
                  {floorTarget !== null ? <span>Target {floorTarget.toFixed(1)}</span> : null}
                  <span aria-label={`${endlessRun.lives} lives`}>
                    {"♥".repeat(endlessRun.lives)}
                    {"♡".repeat(Math.max(0, ENDLESS_STARTING_LIVES - endlessRun.lives))}
                  </span>
                  <span>Run {endlessRun.totalScore.toFixed(1)}</span>
                </div>
              ) : (
                <span className="topbar-spacer" />
              )}
              <div className="topbar-actions">
                <button
                  type="button"
                  className="btn-settings-mobile"
                  aria-label="Settings"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  ⚙
                </button>
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo()}
                  title={undoLimit !== null ? `Undo (${undoUsesThisFloor}/${undoLimit})` : "Undo (Ctrl+Z)"}
                >
                  {undoLabel}
                </button>
                <button type="button" className="btn-new-game" onClick={handleNewGame}>
                  New game
                </button>
              </div>
            </div>
          </header>

          {settingsOpen ? (
            <button
              type="button"
              className="settings-backdrop"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
            />
          ) : null}

          {isEndless && endlessRun && showFloorBanner && !endlessRun.runOver && floorTarget !== null ? (
            <FloorBanner
              floor={endlessRun.floor}
              target={floorTarget}
              baseTarget={gateBreakdown?.baseGate ?? floorTarget}
              paceTarget={gateBreakdown?.paceGate ?? null}
              lives={endlessRun.lives}
              maxLives={ENDLESS_STARTING_LIVES}
              deckSize={state.deckSize}
              poolK={state.poolSize}
              bossId={getBossIdForFloor(endlessRun.floor)}
              runScore={endlessRun.totalScore}
              gateReliefActive={endlessRun.gateReliefActive}
              onDismiss={dismissFloorBanner}
            />
          ) : null}

          <div className={`sidebar-column${settingsOpen ? " settings-open" : ""}`}>
            <aside className="game-sidebar" aria-label="Game options and stats">
              <div className="settings-sheet-header">
                <h2>Settings & stats</h2>
                <button
                  type="button"
                  className="settings-close-btn"
                  aria-label="Close settings"
                  onClick={() => setSettingsOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="sidebar-section">
                <h2 className="sidebar-heading">Options</h2>
                <label className="sidebar-field">
                  <span className="sidebar-label">Game mode</span>
                  <select
                    value={gameMode}
                    onChange={(e) => handleGameModeChange(e.target.value as GameMode)}
                  >
                    {GAME_MODES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sidebar-field">
                  <span className="sidebar-label">Board</span>
                  <select
                    value={boardSize}
                    disabled={boardLocked}
                    onChange={(e) => {
                      const next = Number(e.target.value) as 4 | 5;
                      startBoard(next, poolSize);
                    }}
                  >
                    {BOARD_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}×{n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sidebar-field">
                  <span className="sidebar-label">Pool k</span>
                  <select
                    value={poolSize}
                    disabled={poolLocked}
                    onChange={(e) => {
                      const k = Number(e.target.value);
                      startBoard(boardSize, k);
                    }}
                  >
                    {POOL_SIZE_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sidebar-field">
                  <span className="sidebar-label">Theme</span>
                  <select value={themeId} onChange={(e) => setThemeId(e.target.value as typeof themeId)}>
                    {CARD_THEME_LIST.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sidebar-field">
                  <span className="sidebar-label">Appearance</span>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as ColorMode)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label className="sidebar-field sidebar-field-checkbox">
                  <span className="sidebar-label">Auto play</span>
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                  />
                </label>
              </div>

              <div className="sidebar-section">
                <h2 className="sidebar-heading">Stats</h2>
                <dl className="sidebar-stats">
                  {isEndless && endlessRun ? (
                    <>
                      <div className="stat-row">
                        <dt>Floor</dt>
                        <dd>{endlessRun.floor}</dd>
                      </div>
                      <div className="stat-row">
                        <dt>Target</dt>
                        <dd>{floorTarget?.toFixed(1) ?? "—"}</dd>
                      </div>
                      <div className="stat-row">
                        <dt>Lives</dt>
                        <dd>{endlessRun.lives}</dd>
                      </div>
                      <div className="stat-row">
                        <dt>Run score</dt>
                        <dd>{endlessRun.totalScore.toFixed(1)}</dd>
                      </div>
                    </>
                  ) : null}
                  <div className="stat-row">
                    <dt>Deck</dt>
                    <dd>{state.deck.length}</dd>
                  </div>
                  <div className="stat-row">
                    <dt>Turn</dt>
                    <dd>{state.turn}/{cellCount}</dd>
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


            </aside>

            <button
              type="button"
              className="how-to-play-btn"
              onClick={() => setTutorialOpen(true)}
            >
              How to play
            </button>

            {gameMode === "classic" && state.status === "finished" && !gameSummaryOpen ? (
              <button
                type="button"
                className="view-results-btn"
                onClick={() => setGameSummaryOpen(true)}
              >
                View results
              </button>
            ) : null}

            {isEndless && state.status === "finished" && endlessRun?.pendingFloorResult && !floorResultOpen ? (
              <button
                type="button"
                className="view-results-btn"
                onClick={() => setFloorResultOpen(true)}
              >
                View floor result
              </button>
            ) : null}
          </div>

          <div className="play-main">
            <MobileStatsBar
              score={liveScore.total}
              turn={state.turn}
              cellCount={cellCount}
              deckCount={state.deck.length}
              actionCount={actionCount}
              timeLabel={playTimerLabel}
              isEndless={isEndless && !!endlessRun && !endlessRun.runOver}
              floor={endlessRun?.floor}
              target={floorTarget}
              lives={endlessRun?.lives}
              runScore={endlessRun?.totalScore}
            />

            <Board
              legalDropKeys={legalKeys}
              isDragging={boardPlacementActive}
              lastPlacedKey={lastPlacedKey}
              tapPlaceMode={tapPlaceMode}
              onCellTap={handleCellTap}
            />
          </div>

          <div className="play-bottom">
            {placementActive ? (
              <p className="tap-place-hint" role="status">
                Tap a highlighted cell to place the card
              </p>
            ) : tapPlaceMode && !poolDisabled ? (
              <p className="tap-place-hint tap-place-hint-idle">Tap a card from the pool below</p>
            ) : null}
            <Pool
              disabled={poolDisabled}
              tapPlaceMode={tapPlaceMode}
              selectedIndex={selectedPoolIndex}
              onSelectCard={handleSelectPoolCard}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="card-drag-wrapper">
              <PlayingCard card={activeCard} variant="drag" className="card-dragging" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <FirstGameTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <EndlessTutorial open={endlessTutorialOpen} onClose={() => setEndlessTutorialOpen(false)} />
      <NewGameConfirmModal
        open={newGameConfirmOpen}
        hasProgress={hasProgress || pendingMode !== null}
        isFinished={state.status === "finished"}
        onConfirm={confirmModeOrNewGame}
        onClose={() => {
          setNewGameConfirmOpen(false);
          setPendingMode(null);
        }}
      />
      <GameSummaryModal
        open={gameSummaryOpen && gameMode === "classic"}
        score={liveScore}
        actionCount={actionCount}
        elapsedMs={elapsedMs}
        onClose={() => setGameSummaryOpen(false)}
        onNewGame={() => {
          setGameSummaryOpen(false);
          setNewGameConfirmOpen(true);
        }}
      />
      {isEndless && endlessRun?.pendingFloorResult ? (
        <FloorResultModal
          open={floorResultOpen}
          floor={endlessRun.floor}
          result={endlessRun.pendingFloorResult}
          lives={endlessRun.lives}
          maxLives={ENDLESS_STARTING_LIVES}
          gateReliefAvailable={!endlessRun.gateReliefUsedThisFloor}
          onContinue={() => {
            setFloorResultOpen(false);
            continueEndlessFloor();
          }}
          onRetry={() => {
            setFloorResultOpen(false);
            retryEndlessFloor(false);
          }}
          onRetryWithRelief={() => {
            setFloorResultOpen(false);
            retryEndlessFloor(true);
          }}
          onEndRun={() => {
            setFloorResultOpen(false);
            endEndlessRun();
          }}
          onClose={() => setFloorResultOpen(false)}
        />
      ) : null}
      {isEndless && endlessRun?.runOver ? (
        <RunSummaryModal
          open={runSummaryOpen}
          maxFloorCleared={endlessRun.maxFloorCleared}
          totalScore={endlessRun.totalScore}
          startingPoolK={endlessRun.startingPoolK}
          onNewRun={() => {
            setRunSummaryOpen(false);
            startEndlessRun(endlessRun.startingPoolK);
          }}
          onClassicMode={() => {
            setRunSummaryOpen(false);
            initGame(poolSize);
          }}
          onClose={() => setRunSummaryOpen(false)}
        />
      ) : null}
    </div>
  );
}
