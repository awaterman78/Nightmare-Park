import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParkScene } from '@/components/game/park-scene';
import { formatMoney, getSceneProgress, getUpgradeCost } from '@/game/economy';
import { REVEAL_POINTS, SCENES, type Upgrade } from '@/game/game-data';
import { useIdleGame } from '@/hooks/use-idle-game';

type BuildChipProps = {
  upgrade: Upgrade;
  owned: number;
  selected: boolean;
  accent: string;
  onPress: () => void;
};

function BuildChip({ upgrade, owned, selected, accent, onPress }: BuildChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Select ${upgrade.name}`}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 68,
        minHeight: 70,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: 16,
        backgroundColor: selected ? `${accent}2b` : '#12101f',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? accent : '#ffffff1a',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}>
      <Text style={{ fontSize: 25 }}>{upgrade.icon}</Text>
      <Text
        numberOfLines={1}
        style={{ color: selected ? '#fff' : '#8d879e', fontSize: 8, fontWeight: '900' }}>
        {owned > 0 ? `LV ${owned}` : 'BUILD'}
      </Text>
    </Pressable>
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { test } = useLocalSearchParams<{ test?: string }>();
  const isTestMode = test === '1';
  const game = useIdleGame();
  const scene = SCENES[game.sceneIndex];
  const progress = getSceneProgress(game.lifetimeCash, game.sceneIndex);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState(scene.upgrades[0].id);
  const [floatingTap, setFloatingTap] = useState(false);
  const [lastTapEarned, setLastTapEarned] = useState(game.tapValue);
  const [buildFlash, setBuildFlash] = useState(false);
  const [tapAnimation] = useState(() => new Animated.Value(0));
  const [buildAnimation] = useState(() => new Animated.Value(0));
  const nextScene = SCENES[game.sceneIndex + 1];
  const parkHeight = Math.max(290, Math.min(440, screenHeight * 0.43));

  const selectedUpgrade =
    scene.upgrades.find((upgrade) => upgrade.id === selectedUpgradeId) ?? scene.upgrades[0];
  const selectedOwned = game.owned[selectedUpgrade.id] ?? 0;
  const selectedCost = getUpgradeCost(selectedUpgrade, selectedOwned);
  const canBuySelected = game.cash >= selectedCost;
  const moneyToNextScene = Math.max(0, scene.target - game.lifetimeCash);

  const moneyToNextReveal = useMemo(() => {
    const nextPoint = REVEAL_POINTS.find((point) => point > progress + 0.001);
    const target =
      nextPoint === undefined
        ? scene.target
        : scene.startAt + (scene.target - scene.startAt) * nextPoint;
    return Math.max(1, Math.ceil(target - game.lifetimeCash));
  }, [game.lifetimeCash, progress, scene.startAt, scene.target]);

  useEffect(() => {
    if (!floatingTap) return;
    tapAnimation.setValue(0);
    Animated.timing(tapAnimation, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start(() => setFloatingTap(false));
  }, [floatingTap, tapAnimation]);

  const handleTap = () => {
    setLastTapEarned(game.tap());
    setFloatingTap(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBuy = () => {
    if (!canBuySelected) return;
    game.buyUpgrade(selectedUpgrade.id);
    setBuildFlash(true);
    buildAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(buildAnimation, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(720),
      Animated.timing(buildAnimation, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(() => setBuildFlash(false));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <LinearGradient colors={['#05040c', '#120c21', '#05040c']} style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 690,
          minHeight: screenHeight,
          alignSelf: 'center',
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: 12,
          gap: 10,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.7 }}>
              NIGHTMARE PARK
            </Text>
            <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>
              HORROR EMPIRE
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#ffffff0c',
              borderWidth: 1,
              borderColor: '#ffffff1a',
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 99,
            }}>
            <Text style={{ fontSize: 14 }}>🗺️</Text>
            <Text style={{ color: '#d9d4e5', fontSize: 10, fontWeight: '900' }}>
              {scene.name}
            </Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: `${scene.accent}55`,
            backgroundColor: '#151224',
          }}>
          <LinearGradient
            colors={['#1d1930', '#100e1c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 15, paddingVertical: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#9b93ae', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }}>
                  FEAR FUNDS
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    color: '#fff',
                    fontSize: 32,
                    fontWeight: '900',
                    letterSpacing: -1.3,
                    fontVariant: ['tabular-nums'],
                  }}>
                  {formatMoney(game.cash)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', paddingBottom: 3 }}>
                <Text style={{ color: scene.accent, fontSize: 16, fontWeight: '900' }}>
                  +{formatMoney(game.incomePerSecond)}
                </Text>
                <Text style={{ color: '#827a92', fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>
                  PER SECOND
                </Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: '#06050c', borderRadius: 99, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${Math.max(1, progress * 100)}%`,
                  borderRadius: 99,
                  backgroundColor: scene.accent,
                  boxShadow: `0 0 10px ${scene.accent}`,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ color: '#bab3c8', fontSize: 10, fontWeight: '800' }}>
                PARK VALUE {formatMoney(game.lifetimeCash)}
              </Text>
              <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900' }}>
                {nextScene
                  ? `${formatMoney(moneyToNextScene)} TO ${nextScene.name.toUpperCase()}`
                  : `${formatMoney(moneyToNextScene)} TO COMPLETE`}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ minHeight: parkHeight }}>
          <ParkScene
            sceneIndex={game.sceneIndex}
            progress={progress}
            tapValue={game.tapValue}
            tapStreak={game.tapStreak}
            tapMultiplier={game.tapMultiplier}
            height={parkHeight}
            onTap={handleTap}
          />
          {floatingTap && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: parkHeight * 0.27,
                alignItems: 'center',
                opacity: tapAnimation.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateY: tapAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, -56] }) },
                  { scale: tapAnimation.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.8, 1.15, 1] }) },
                ],
              }}>
              <Text
                style={{
                  color: scene.accent,
                  fontSize: 30,
                  fontWeight: '900',
                  textShadowColor: '#000',
                  textShadowRadius: 10,
                }}>
                +{formatMoney(lastTapEarned)}
              </Text>
            </Animated.View>
          )}
          {buildFlash && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 18,
                right: 18,
                bottom: 21,
                alignItems: 'center',
                opacity: buildAnimation,
                transform: [
                  {
                    translateY: buildAnimation.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                  },
                  {
                    scale: buildAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
                  },
                ],
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  backgroundColor: '#0b0916e8',
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: scene.accent,
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                }}>
                <Text style={{ fontSize: 16 }}>{selectedUpgrade.icon}</Text>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                  {selectedUpgrade.name} upgraded
                </Text>
                <Text style={{ color: scene.accent, fontSize: 11, fontWeight: '900' }}>
                  +{formatMoney(selectedUpgrade.income)}/s
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        <View
          style={{
            backgroundColor: '#12101f',
            borderWidth: 1,
            borderColor: '#ffffff1c',
            borderRadius: 24,
            padding: 11,
            gap: 10,
            boxShadow: '0 -8px 26px rgba(0,0,0,0.18)',
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Build your nightmare</Text>
              <Text style={{ color: '#827a92', fontSize: 10 }}>Pick an attraction, then add it to the park.</Text>
            </View>
            <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900' }}>SCENE {game.sceneIndex + 1}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {scene.upgrades.map((upgrade) => (
              <BuildChip
                key={upgrade.id}
                upgrade={upgrade}
                owned={game.owned[upgrade.id] ?? 0}
                selected={selectedUpgrade.id === upgrade.id}
                accent={scene.accent}
                onPress={() => setSelectedUpgradeId(upgrade.id)}
              />
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                backgroundColor: `${scene.accent}1c`,
              }}>
              <Text style={{ fontSize: 25 }}>{selectedUpgrade.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 13, fontWeight: '900', flex: 1 }}>
                  {selectedUpgrade.name}
                </Text>
                {selectedOwned > 0 && (
                  <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900' }}>LV {selectedOwned}</Text>
                )}
              </View>
              <Text numberOfLines={1} style={{ color: '#91899f', fontSize: 10 }}>
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
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 46,
              borderRadius: 15,
              backgroundColor: canBuySelected ? scene.accent : '#292536',
              opacity: pressed ? 0.82 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}>
            <Text style={{ color: canBuySelected ? '#130f1c' : '#777082', fontWeight: '900', fontSize: 14 }}>
              {canBuySelected ? `BUILD FOR ${formatMoney(selectedCost)}` : `NEED ${formatMoney(selectedCost)}`}
            </Text>
          </Pressable>
        </View>

        {game.offlineEarnings > 0 && (
          <Pressable
            onPress={game.dismissOfflineEarnings}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: `${scene.accent}66`,
              backgroundColor: `${scene.accent}18`,
              borderRadius: 16,
              padding: 11,
            }}>
            <Text style={{ fontSize: 23 }}>🌙</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', flex: 1 }}>
              The park earned {formatMoney(game.offlineEarnings)} while you were away.
            </Text>
            <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900' }}>COLLECT</Text>
          </Pressable>
        )}

        {isTestMode && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
            {[
              ['NEXT OBJECT', () => game.addTestFunds(moneyToNextReveal)],
              ['NEXT SCENE', () => game.addTestFunds(Math.max(1, moneyToNextScene))],
              ['+£100K', () => game.addTestFunds(100_000)],
              ['RESET', game.resetGame],
            ].map(([label, action]) => (
              <Pressable
                key={label as string}
                onPress={action as () => void}
                style={{ backgroundColor: '#3a2136', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 7 }}>
                <Text style={{ color: '#ffb1ca', fontSize: 10, fontWeight: '900' }}>{label as string}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={game.unlockedScene !== null}
        animationType="fade"
        onRequestClose={game.dismissSceneUnlock}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#05040be8',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
          <LinearGradient
            colors={['#2e2046', '#100d1b']}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 30,
              padding: 25,
              alignItems: 'center',
              gap: 13,
              borderWidth: 2,
              borderColor: scene.accent,
            }}>
            <Text style={{ fontSize: 52 }}>🔓</Text>
            <Text style={{ color: scene.accent, fontSize: 11, fontWeight: '900', letterSpacing: 2 }}>
              NEW LOCATION
            </Text>
            <Text style={{ color: '#fff', fontSize: 29, fontWeight: '900', textAlign: 'center' }}>
              {scene.name}
            </Text>
            <Text style={{ color: '#b4adbf', fontSize: 14, lineHeight: 21, textAlign: 'center' }}>
              {scene.strapline}
            </Text>
            <Pressable
              onPress={game.dismissSceneUnlock}
              style={{ backgroundColor: scene.accent, paddingHorizontal: 25, paddingVertical: 13, borderRadius: 99 }}>
              <Text style={{ color: '#140f1d', fontWeight: '900' }}>OPEN THE GATES</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}
