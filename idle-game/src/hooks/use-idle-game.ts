import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getIncomePerSecond, getSceneIndex, getTapValue, getUpgradeCost } from '@/game/economy';
import { SCENES } from '@/game/game-data';

const STORAGE_KEY = 'nightmare-park-save-v1';
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;

type GameState = {
  cash: number;
  lifetimeCash: number;
  owned: Record<string, number>;
  lastSeenAt: number;
};

const INITIAL_STATE: GameState = {
  cash: 0,
  lifetimeCash: 0,
  owned: {},
  lastSeenAt: Date.now(),
};

export function useIdleGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [unlockedScene, setUnlockedScene] = useState<number | null>(null);
  const previousScene = useRef(0);
  const streak = useRef({ count: 0, lastTapAt: 0 });
  const streakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapStreak, setTapStreak] = useState(0);

  const incomePerSecond = useMemo(() => getIncomePerSecond(state.owned), [state.owned]);
  const tapValue = getTapValue(incomePerSecond);
  const sceneIndex = getSceneIndex(state.lifetimeCash);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active || !saved) return;
        const parsed = JSON.parse(saved) as GameState;
        const savedIncome = getIncomePerSecond(parsed.owned ?? {});
        const elapsed = Math.min(
          MAX_OFFLINE_SECONDS,
          Math.max(0, (Date.now() - parsed.lastSeenAt) / 1000),
        );
        const earned = savedIncome * elapsed;
        setState({
          cash: (parsed.cash ?? 0) + earned,
          lifetimeCash: (parsed.lifetimeCash ?? 0) + earned,
          owned: parsed.owned ?? {},
          lastSeenAt: Date.now(),
        });
        if (earned >= 1) setOfflineEarnings(earned);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || incomePerSecond <= 0) return;
    const timer = setInterval(() => {
      const earned = incomePerSecond / 4;
      setState((current) => ({
        ...current,
        cash: current.cash + earned,
        lifetimeCash: current.lifetimeCash + earned,
      }));
    }, 250);
    return () => clearInterval(timer);
  }, [incomePerSecond, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, lastSeenAt: Date.now() }),
      ).catch(() => undefined);
    }, 700);
    return () => clearTimeout(timer);
  }, [isLoaded, state]);

  useEffect(() => {
    if (!isLoaded) return;
    if (sceneIndex > previousScene.current) setUnlockedScene(sceneIndex);
    previousScene.current = sceneIndex;
  }, [isLoaded, sceneIndex]);

  useEffect(() => {
    return () => {
      if (streakTimer.current) clearTimeout(streakTimer.current);
    };
  }, []);

  const tap = useCallback(() => {
    const now = Date.now();
    const nextStreak = now - streak.current.lastTapAt < 950
      ? Math.min(25, streak.current.count + 1)
      : 1;
    const multiplier = 1 + Math.floor(nextStreak / 5) * 0.15;
    const earned = Math.max(1, Math.round(tapValue * multiplier));

    streak.current = { count: nextStreak, lastTapAt: now };
    if (streakTimer.current) clearTimeout(streakTimer.current);
    streakTimer.current = setTimeout(() => setTapStreak(0), 950);
    setTapStreak(nextStreak);
    setState((current) => ({
      ...current,
      cash: current.cash + earned,
      lifetimeCash: current.lifetimeCash + earned,
    }));
    return earned;
  }, [tapValue]);

  const buyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = SCENES.flatMap((scene) => scene.upgrades).find(
      (item) => item.id === upgradeId,
    );
    if (!upgrade) return;
    setState((current) => {
      const owned = current.owned[upgradeId] ?? 0;
      const cost = getUpgradeCost(upgrade, owned);
      if (current.cash < cost) return current;
      return {
        ...current,
        cash: current.cash - cost,
        owned: { ...current.owned, [upgradeId]: owned + 1 },
      };
    });
  }, []);

  const addTestFunds = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setState((current) => ({
      ...current,
      cash: current.cash + amount,
      lifetimeCash: current.lifetimeCash + amount,
    }));
  }, []);

  const resetGame = useCallback(() => {
    previousScene.current = 0;
    setOfflineEarnings(0);
    setUnlockedScene(null);
    setState({ ...INITIAL_STATE, lastSeenAt: Date.now() });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  return {
    ...state,
    isLoaded,
    incomePerSecond,
    tapValue,
    tapStreak,
    tapMultiplier: 1 + Math.floor(tapStreak / 5) * 0.15,
    sceneIndex,
    offlineEarnings,
    unlockedScene,
    tap,
    buyUpgrade,
    addTestFunds,
    resetGame,
    dismissOfflineEarnings: () => setOfflineEarnings(0),
    dismissSceneUnlock: () => setUnlockedScene(null),
  };
}
