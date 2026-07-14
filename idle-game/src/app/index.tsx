import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PremiumParkScene } from '@/components/game/premium-park-scene';
import { formatMoney, getSceneProgress, getUpgradeCost } from '@/game/economy';
import { getRevealPoints, SCENES, type Upgrade } from '@/game/game-data';
import { useIdleGame } from '@/hooks/use-idle-game';

type UpgradeSlotProps = {
  upgrade: Upgrade;
  index: number;
  owned: number;
  selected: boolean;
  accent: string;
  onPress: () => void;
};

function UpgradeSlot({ upgrade, index, owned, selected, accent, onPress }: UpgradeSlotProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select ${upgrade.name}`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 43,
        height: 43,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? `${accent}26` : '#0d0b17',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? accent : '#ffffff1c',
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}>
      <Text style={{ color: selected ? accent : '#d4cede', fontSize: 11, fontWeight: '900' }}>
        {String(index + 1).padStart(2, '0')}
      </Text>
      <Text style={{ color: selected ? '#fff' : '#777182', fontSize: 7, fontWeight: '900', marginTop: 2 }}>
        {owned > 0 ? `LV${owned}` : 'NEW'}
      </Text>
    </Pressable>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { test } = useLocalSearchParams<{ test?: string }>();
  const isTestMode = test === '1';
  const game = useIdleGame();
  const scene = SCENES[game.sceneIndex];
  const progress = getSceneProgress(game.lifetimeCash, game.sceneIndex);
  const revealPoints = getRevealPoints(scene);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState(scene.upgrades[0].id);
  const [floatingTap, setFloatingTap] = useState(false);
  const [lastTapEarned, setLastTapEarned] = useState(game.tapValue);
  const [buildFlash, setBuildFlash] = useState(false);
  const [tapAnimation] = useState(() => new Animated.Value(0));
  const [buildAnimation] = useState(() => new Animated.Value(0));

  const selectedUpgrade =
    scene.upgrades.find((upgrade) => upgrade.id === selectedUpgradeId) ?? scene.upgrades[0];
  const selectedOwned = game.owned[selectedUpgrade.id] ?? 0;
  const selectedCost = getUpgradeCost(selectedUpgrade, selectedOwned);
  const selectedUpgradeIndex = Math.max(
    0,
    scene.upgrades.findIndex((upgrade) => upgrade.id === selectedUpgrade.id),
  );
  const canBuySelected = game.cash >= selectedCost;
  const moneyNeededToBuy = Math.max(0, Math.ceil(selectedCost - game.cash));
  const moneyToNextScene = Math.max(0, scene.target - game.lifetimeCash);

  const moneyToNextReveal = useMemo(() => {
    if (progress >= 1) return 0;
    const nextPoint = revealPoints.find((point) => point > progress + 0.001);
    const target =
      nextPoint === undefined
        ? scene.target
        : scene.startAt + (scene.target - scene.startAt) * nextPoint;
    return Math.max(0, Math.ceil(target - game.lifetimeCash));
  }, [game.lifetimeCash, progress, revealPoints, scene.startAt, scene.target]);

  useEffect(() => {
    if (!floatingTap) return;
    tapAnimation.setValue(0);
    Animated.timing(tapAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setFloatingTap(false));
  }, [floatingTap, tapAnimation]);

  const handleTap = () => {
    setLastTapEarned(game.tap());
    setFloatingTap(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCollectBonusVehicle = () => {
    const reward = game.collectBonusVehicle();
    if (reward <= 0) return;
    setLastTapEarned(reward);
    setFloatingTap(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBuy = () => {
    if (!canBuySelected) return;
    game.buyUpgrade(selectedUpgrade.id);
    setBuildFlash(true);
    buildAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(buildAnimation, { toValue: 1, duration: 170, useNativeDriver: true }),
      Animated.delay(650),
      Animated.timing(buildAnimation, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setBuildFlash(false));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <LinearGradient colors={['#03030a', '#10091b', '#03030a']} style={{ flex: 1 }}>
      <View
        style={{
          width: '100%',
          maxWidth: 520,
          flex: 1,
          minHeight: 0,
          alignSelf: 'center',
          paddingTop: insets.top + 6,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingHorizontal: 8,
          gap: 7,
        }}>
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.6 }}>
                NIGHTMARE PARK
              </Text>
              <Text style={{ color: scene.accent, fontSize: 7, fontWeight: '900', letterSpacing: 2 }}>
                BUILD YOUR HORROR EMPIRE
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#8f889a', fontSize: 7, fontWeight: '900', letterSpacing: 1 }}>
                  FUNDS
                </Text>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                  {formatMoney(game.cash)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', paddingBottom: 2 }}>
                <Text style={{ color: scene.accent, fontSize: 12, fontWeight: '900' }}>
                  +{formatMoney(game.incomePerSecond)}/s
                </Text>
                <Text style={{ color: '#777082', fontSize: 7, fontWeight: '900' }}>INCOME</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1, height: 4, borderRadius: 99, overflow: 'hidden', backgroundColor: '#171320' }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.max(1, progress * 100)}%`,
                  borderRadius: 99,
                  backgroundColor: scene.accent,
                  boxShadow: `0 0 8px ${scene.accent}`,
                }}
              />
            </View>
            <Text style={{ color: '#9f98aa', fontSize: 8, fontWeight: '900' }}>
              {Math.floor(progress * 100)}%
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 0 }}>
          <PremiumParkScene
            sceneIndex={game.sceneIndex}
            progress={progress}
            moneyToNextReveal={moneyToNextReveal}
            tapValue={game.tapValue}
            tapStreak={game.tapStreak}
            tapMultiplier={game.tapMultiplier}
            bonusVehicle={game.bonusVehicle}
            onTap={handleTap}
            onCollectBonusVehicle={handleCollectBonusVehicle}
          />

          {floatingTap && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '44%',
                alignItems: 'center',
                opacity: tapAnimation.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateY: tapAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, -45] }) },
                  { scale: tapAnimation.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.8, 1.15, 1] }) },
                ],
              }}>
              <Text style={{ color: scene.accent, fontSize: 25, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 9 }}>
                +{formatMoney(lastTapEarned)}
              </Text>
            </Animated.View>
          )}

          {buildFlash && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 62,
                alignItems: 'center',
                opacity: buildAnimation,
                transform: [{ translateY: buildAnimation.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
              }}>
              <View
                style={{
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: scene.accent,
                  backgroundColor: '#070812ee',
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>
                  {selectedUpgrade.name} · +{formatMoney(selectedUpgrade.income)}/s
                </Text>
              </View>
            </Animated.View>
          )}

          {game.offlineEarnings > 0 && (
            <Pressable
              onPress={game.dismissOfflineEarnings}
              style={{
                position: 'absolute',
                top: 72,
                left: 12,
                right: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 13,
                borderWidth: 1,
                borderColor: `${scene.accent}88`,
                backgroundColor: '#080914ee',
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', flex: 1 }}>
                While away: +{formatMoney(game.offlineEarnings)}
              </Text>
              <Text style={{ color: scene.accent, fontSize: 8, fontWeight: '900' }}>COLLECT</Text>
            </Pressable>
          )}
        </View>

        {isTestMode && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5 }}>
            {[
              ['NEXT BUILD', () => game.addTestFunds(Math.max(1, moneyToNextReveal))],
              ['NEXT SCENE', () => game.addTestFunds(Math.max(1, moneyToNextScene))],
              ['+£100K', () => game.addTestFunds(100_000)],
              ['BONUS', game.spawnBonusVehicle],
              ['RESET', game.resetGame],
            ].map(([label, action]) => (
              <Pressable
                key={label as string}
                onPress={action as () => void}
                style={{ borderRadius: 99, backgroundColor: '#2a172a', paddingHorizontal: 9, paddingVertical: 5 }}>
                <Text style={{ color: '#ffb4d2', fontSize: 8, fontWeight: '900' }}>{label as string}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#ffffff1f',
            backgroundColor: '#100d1a',
            padding: 8,
            gap: 7,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.28)',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 6 }}>
              {scene.upgrades.map((upgrade, index) => (
                <UpgradeSlot
                  key={upgrade.id}
                  upgrade={upgrade}
                  index={index}
                  owned={game.owned[upgrade.id] ?? 0}
                  selected={selectedUpgrade.id === upgrade.id}
                  accent={scene.accent}
                  onPress={() => setSelectedUpgradeId(upgrade.id)}
                />
              ))}
            </ScrollView>
            <View style={{ minWidth: 47, alignItems: 'flex-end' }}>
              <Text style={{ color: scene.accent, fontSize: 8, fontWeight: '900' }}>SLOT</Text>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>
                {String(selectedUpgradeIndex + 1).padStart(2, '0')}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 13, fontWeight: '900', flex: 1 }}>
                  {selectedUpgrade.name}
                </Text>
                {selectedOwned > 0 && (
                  <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900' }}>LV {selectedOwned}</Text>
                )}
              </View>
              <Text numberOfLines={1} style={{ color: '#8f8999', fontSize: 9, marginTop: 2 }}>
                +{formatMoney(selectedUpgrade.income)}/sec · {selectedUpgrade.description}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canBuySelected }}
            disabled={!canBuySelected}
            onPress={handleBuy}
            style={({ pressed }) => ({
              minHeight: 42,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canBuySelected ? scene.accent : '#292533',
              opacity: pressed ? 0.82 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}>
            <Text style={{ color: canBuySelected ? '#100c17' : '#8a8491', fontSize: 13, fontWeight: '900' }}>
              {canBuySelected
                ? `BUILD · ${formatMoney(selectedCost)}`
                : `${formatMoney(moneyNeededToBuy)} MORE TO BUILD`}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={game.unlockedScene !== null}
        animationType="fade"
        onRequestClose={game.dismissSceneUnlock}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#03030ae8',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
          <LinearGradient
            colors={['#2a1b3f', '#0b0913']}
            style={{
              width: '100%',
              maxWidth: 390,
              borderRadius: 28,
              padding: 24,
              alignItems: 'center',
              gap: 12,
              borderWidth: 2,
              borderColor: scene.accent,
            }}>
            <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2.5 }}>
              NEW LOCATION
            </Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
              {scene.name}
            </Text>
            <Text style={{ color: '#b7b0bf', fontSize: 13, lineHeight: 19, textAlign: 'center' }}>
              {scene.strapline}
            </Text>
            <Pressable
              onPress={game.dismissSceneUnlock}
              style={{ backgroundColor: scene.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99 }}>
              <Text style={{ color: '#100c17', fontWeight: '900' }}>OPEN THE GATES</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}
