import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParkScene } from '@/components/game/park-scene';
import { UpgradeCard } from '@/components/game/upgrade-card';
import { formatMoney, getSceneProgress } from '@/game/economy';
import { SCENES } from '@/game/game-data';
import { useIdleGame } from '@/hooks/use-idle-game';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const game = useIdleGame();
  const scene = SCENES[game.sceneIndex];
  const progress = getSceneProgress(game.lifetimeCash, game.sceneIndex);
  const [floatingTap, setFloatingTap] = useState(false);
  const [tapAnimation] = useState(() => new Animated.Value(0));
  const nextScene = SCENES[game.sceneIndex + 1];

  const moneyToNextScene = useMemo(
    () => Math.max(0, scene.target - game.lifetimeCash),
    [game.lifetimeCash, scene.target],
  );

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
    game.tap();
    setFloatingTap(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBuy = (upgradeId: string) => {
    game.buyUpgrade(upgradeId);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <LinearGradient colors={['#080713', '#141026', '#080713']} style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 680,
          alignSelf: 'center',
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 16,
          gap: 16,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text
              style={{
                color: '#fff',
                fontSize: 24,
                fontWeight: '900',
                letterSpacing: -0.8,
              }}>
              NIGHTMARE PARK
            </Text>
            <Text
              style={{
                color: scene.accent,
                fontSize: 11,
                fontWeight: '900',
                letterSpacing: 1.5,
              }}>
              HORROR EMPIRE
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#211d36',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 99,
            }}>
            <Text style={{ color: '#c9c4d9', fontSize: 11, fontWeight: '800' }}>
              LOCATION {game.sceneIndex + 1}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#171429',
            borderWidth: 1,
            borderColor: '#302a48',
            borderRadius: 24,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
            }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#8f89a5',
                  fontSize: 11,
                  fontWeight: '800',
                  letterSpacing: 1,
                }}>
                FEAR FUNDS
              </Text>
              <Text
                selectable
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: '#fff',
                  fontSize: 39,
                  fontWeight: '900',
                  letterSpacing: -1.5,
                  fontVariant: ['tabular-nums'],
                }}>
                {formatMoney(game.cash)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', paddingBottom: 5 }}>
              <Text
                style={{
                  color: scene.accent,
                  fontSize: 17,
                  fontWeight: '900',
                  fontVariant: ['tabular-nums'],
                }}>
                +{formatMoney(game.incomePerSecond)}
              </Text>
              <Text style={{ color: '#8f89a5', fontSize: 10, fontWeight: '800' }}>
                PER SECOND
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 7,
              backgroundColor: '#0d0b19',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                width: `${Math.max(1, progress * 100)}%`,
                backgroundColor: scene.accent,
                borderRadius: 99,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: '#bbb5ca', fontSize: 12, fontWeight: '800' }}>
              {scene.name}
            </Text>
            <Text style={{ color: '#777087', fontSize: 12, fontWeight: '700' }}>
              {nextScene
                ? `${formatMoney(moneyToNextScene)} to ${nextScene.name}`
                : `${formatMoney(moneyToNextScene)} to complete`}
            </Text>
          </View>
        </View>

        <View>
          <ParkScene sceneIndex={game.sceneIndex} progress={progress} onTap={handleTap} />
          {floatingTap && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 120,
                alignItems: 'center',
                opacity: tapAnimation.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [1, 1, 0],
                }),
                transform: [
                  {
                    translateY: tapAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -52],
                    }),
                  },
                  {
                    scale: tapAnimation.interpolate({
                      inputRange: [0, 0.25, 1],
                      outputRange: [0.75, 1.15, 1],
                    }),
                  },
                ],
              }}>
              <Text
                style={{
                  color: scene.accent,
                  fontSize: 28,
                  fontWeight: '900',
                  textShadowColor: '#000',
                  textShadowRadius: 8,
                }}>
                +{formatMoney(game.tapValue)}
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={{ gap: 4, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{scene.name}</Text>
          <Text style={{ color: '#9993aa', fontSize: 13, textAlign: 'center' }}>
            {scene.strapline}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleTap}
          style={({ pressed }) => ({
            alignSelf: 'center',
            minWidth: 220,
            alignItems: 'center',
            paddingHorizontal: 28,
            paddingVertical: 15,
            borderRadius: 99,
            backgroundColor: pressed ? '#fff' : scene.accent,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            boxShadow: `0 9px 28px ${scene.accent}44`,
          })}>
          <Text
            style={{
              color: '#11101c',
              fontSize: 17,
              fontWeight: '900',
              letterSpacing: 0.5,
            }}>
            SCARE  +{formatMoney(game.tapValue)}
          </Text>
        </Pressable>

        {game.offlineEarnings > 0 && (
          <Pressable
            onPress={game.dismissOfflineEarnings}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: `${scene.accent}18`,
              borderWidth: 1,
              borderColor: `${scene.accent}55`,
              borderRadius: 18,
              padding: 14,
            }}>
            <Text style={{ fontSize: 28 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>The park kept screaming</Text>
              <Text style={{ color: '#aaa4b8', fontSize: 12 }}>
                You earned {formatMoney(game.offlineEarnings)} while away.
              </Text>
            </View>
            <Text style={{ color: scene.accent, fontWeight: '900' }}>NICE</Text>
          </Pressable>
        )}

        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}>
            <View>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
                Build the horror
              </Text>
              <Text style={{ color: '#8f89a5', fontSize: 12 }}>
                Upgrades keep earning when you leave.
              </Text>
            </View>
            <Text style={{ color: scene.accent, fontSize: 11, fontWeight: '900' }}>
              SCENE {game.sceneIndex + 1}
            </Text>
          </View>
          {scene.upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              owned={game.owned[upgrade.id] ?? 0}
              cash={game.cash}
              accent={scene.accent}
              onBuy={() => handleBuy(upgrade.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={game.unlockedScene !== null}
        animationType="fade"
        onRequestClose={game.dismissSceneUnlock}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#05040bd9',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
          <LinearGradient
            colors={['#292044', '#121020']}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 30,
              padding: 24,
              alignItems: 'center',
              gap: 15,
              borderWidth: 2,
              borderColor: scene.accent,
            }}>
            <Text style={{ fontSize: 52 }}>🔓</Text>
            <Text
              style={{
                color: scene.accent,
                fontSize: 12,
                fontWeight: '900',
                letterSpacing: 2,
              }}>
              NEW LOCATION
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 30,
                fontWeight: '900',
                textAlign: 'center',
              }}>
              {scene.name}
            </Text>
            <Text
              style={{
                color: '#aaa4b8',
                fontSize: 14,
                lineHeight: 21,
                textAlign: 'center',
              }}>
              {scene.strapline}
            </Text>
            <Pressable
              onPress={game.dismissSceneUnlock}
              style={{
                marginTop: 6,
                backgroundColor: scene.accent,
                paddingHorizontal: 26,
                paddingVertical: 13,
                borderRadius: 99,
              }}>
              <Text style={{ color: '#11101c', fontWeight: '900' }}>OPEN THE GATES</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}
