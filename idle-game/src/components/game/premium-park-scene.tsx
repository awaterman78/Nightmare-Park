import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageBackground, Pressable, Text, View } from 'react-native';

import { formatMoney } from '@/game/economy';
import { getRevealPoints, SCENES, type ActiveBonusVehicle } from '@/game/game-data';

const SCENE_ART = [
  [
    require('../../../assets/deadmans-field-stage-0.jpg'),
    require('../../../assets/deadmans-field-stage-1.jpg'),
    require('../../../assets/deadmans-field-v2.jpg'),
  ],
  [
    require('../../../assets/cursed-carnival-stage-0.jpg'),
    require('../../../assets/cursed-carnival-stage-1.jpg'),
    require('../../../assets/cursed-carnival-stage-2.jpg'),
  ],
  [
    require('../../../assets/haunted-resort-stage-0.jpg'),
    require('../../../assets/haunted-resort-stage-1.jpg'),
    require('../../../assets/haunted-resort-stage-2.jpg'),
  ],
];

const BUILD_STATES = ['GROUNDS CLAIMED', 'PARK TAKING SHAPE', 'NIGHTMARE COMPLETE'];

type PremiumParkSceneProps = {
  sceneIndex: number;
  progress: number;
  lifetimeCash: number;
  moneyToNextReveal: number;
  tapValue: number;
  tapStreak: number;
  tapMultiplier: number;
  bonusVehicle: ActiveBonusVehicle | null;
  height: number;
  onTap: () => void;
  onCollectBonusVehicle: () => void;
};

export function PremiumParkScene({
  sceneIndex,
  progress,
  lifetimeCash,
  moneyToNextReveal,
  tapValue,
  tapStreak,
  tapMultiplier,
  bonusVehicle,
  height,
  onTap,
  onCollectBonusVehicle,
}: PremiumParkSceneProps) {
  const scene = SCENES[sceneIndex];
  const revealPoints = getRevealPoints(scene);
  const revealed = useMemo(
    () => revealPoints.map((point) => progress >= point),
    [progress, revealPoints],
  );
  const openedCount = revealed.filter(Boolean).length;
  const nextRevealIndex = revealed.findIndex((value) => !value);
  const visualStage = progress >= 0.7 ? 2 : progress >= 0.34 ? 1 : 0;
  const previousStage = useRef(visualStage);
  const [targetPulse] = useState(() => new Animated.Value(0));
  const [sceneReveal] = useState(() => new Animated.Value(0));
  const [showStageReveal, setShowStageReveal] = useState(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(targetPulse, { toValue: 1, duration: 1_150, useNativeDriver: true }),
        Animated.timing(targetPulse, { toValue: 0, duration: 1_150, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [targetPulse]);

  useEffect(() => {
    if (visualStage === previousStage.current) return;
    previousStage.current = visualStage;
    setShowStageReveal(true);
    sceneReveal.setValue(0);
    Animated.sequence([
      Animated.timing(sceneReveal, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.delay(1_050),
      Animated.timing(sceneReveal, { toValue: 0, duration: 360, useNativeDriver: true }),
    ]).start(() => setShowStageReveal(false));
  }, [sceneReveal, visualStage]);

  const imageSource = SCENE_ART[sceneIndex]?.[visualStage] ?? SCENE_ART[0][0];
  const latestAttraction = scene.revealNames[Math.max(0, openedCount - 1)];
  const chapterValue = Math.max(scene.startAt, Math.min(scene.target, lifetimeCash));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tap the park to earn fear funds"
      onPress={onTap}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: height,
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}>
      <View
        style={{
          flex: 1,
          minHeight: height,
          overflow: 'hidden',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: `${scene.accent}aa`,
          backgroundColor: '#090d1b',
          boxShadow: '0 18px 42px rgba(0,0,0,0.5)',
        }}>
        <ImageBackground source={imageSource} resizeMode="cover" style={{ flex: 1 }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: '#03050c1f',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '36%',
              backgroundColor: '#0305114d',
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 13,
              left: 13,
              right: 13,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                maxWidth: '67%',
                backgroundColor: '#050916df',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: `${scene.accent}99`,
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}>
              <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }}>
                CHAPTER {String(sceneIndex + 1).padStart(2, '0')}
              </Text>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 2 }}>
                {scene.name.toUpperCase()}
              </Text>
              <Text style={{ color: '#aab2c3', fontSize: 8, fontWeight: '800', marginTop: 3, letterSpacing: 0.8 }}>
                {BUILD_STATES[visualStage]}
              </Text>
            </View>
            <View
              style={{
                alignItems: 'flex-end',
                backgroundColor: '#050916d6',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ffffff38',
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>
                {openedCount}/{scene.revealNames.length}
              </Text>
              <Text style={{ color: '#b4bdcc', fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                OPEN
              </Text>
            </View>
          </View>

          {openedCount > 0 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 13,
                top: '29%',
                maxWidth: '46%',
                backgroundColor: '#050916d9',
                borderRadius: 10,
                borderLeftWidth: 3,
                borderLeftColor: scene.accent,
                paddingHorizontal: 9,
                paddingVertical: 6,
              }}>
              <Text style={{ color: scene.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                JUST OPENED
              </Text>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 10, fontWeight: '900', marginTop: 2 }}>
                {latestAttraction}
              </Text>
            </View>
          )}

          {bonusVehicle && (
            <View style={{ position: 'absolute', right: 13, top: '27%' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Collect ${bonusVehicle.name}`}
                onPress={(event) => {
                  event.stopPropagation();
                  onCollectBonusVehicle();
                }}
                style={({ pressed }) => ({
                  minWidth: 142,
                  backgroundColor: '#050916f0',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: bonusVehicle.accent,
                  paddingHorizontal: 11,
                  paddingVertical: 9,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  boxShadow: `0 8px 20px ${bonusVehicle.accent}55`,
                })}>
                <Text style={{ color: bonusVehicle.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                  LIMITED ARRIVAL · {bonusVehicle.timeLeft}s
                </Text>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', marginTop: 3 }}>
                  {bonusVehicle.name}
                </Text>
                <Text style={{ color: '#d7ddea', fontSize: 10, fontWeight: '800', marginTop: 4 }}>
                  CLAIM {formatMoney(bonusVehicle.reward)}
                </Text>
              </Pressable>
            </View>
          )}

          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, top: '39%', alignItems: 'center' }}>
            <Animated.View
              style={{
                width: 138,
                height: 138,
                borderRadius: 69,
                borderWidth: 1,
                borderColor: `${scene.accent}aa`,
                backgroundColor: '#0308148a',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [
                  { scale: targetPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
                ],
                boxShadow: `0 0 38px ${scene.accent}55`,
              }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Make visitors scream"
                onPress={(event) => {
                  event.stopPropagation();
                  onTap();
                }}
                style={({ pressed }) => ({
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? `${scene.accent}33` : '#07121de8',
                  borderWidth: 2,
                  borderColor: scene.accent,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}>
                <Text style={{ color: '#abb6c5', fontSize: 8, fontWeight: '900', letterSpacing: 1.8 }}>
                  TAP TO EARN
                </Text>
                <Text style={{ color: '#fff', fontSize: 23, fontWeight: '900', letterSpacing: 1, marginTop: 3 }}>
                  SCREAM
                </Text>
                <Text style={{ color: scene.accent, fontSize: 15, fontWeight: '900', marginTop: 2 }}>
                  +{formatMoney(tapValue)}
                </Text>
              </Pressable>
            </Animated.View>
            {tapStreak >= 5 && (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: `${scene.accent}aa`,
                  backgroundColor: '#050916e8',
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                }}>
                <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900', letterSpacing: 0.9 }}>
                  {tapStreak} HIT STREAK · ×{tapMultiplier.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 13,
              right: 13,
              bottom: 13,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 8,
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#050916e6',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ffffff35',
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#a5afbf', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }}>
                {nextRevealIndex === -1 ? 'CHAPTER TARGET' : 'NEXT CONSTRUCTION'}
              </Text>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 12, fontWeight: '900', marginTop: 3 }}>
                {nextRevealIndex === -1 ? 'Open the next location' : scene.revealNames[nextRevealIndex]}
              </Text>
              <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900', marginTop: 2 }}>
                {formatMoney(moneyToNextReveal)} TO GO
              </Text>
            </View>
            <View
              style={{
                minWidth: 99,
                backgroundColor: '#050916e6',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: `${scene.accent}99`,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#a5afbf', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }}>
                EMPIRE VALUE
              </Text>
              <Text style={{ color: scene.accent, fontSize: 15, fontWeight: '900', marginTop: 3 }}>
                {formatMoney(chapterValue)}
              </Text>
            </View>
          </View>

          {showStageReveal && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#02030cc9',
                opacity: sceneReveal,
              }}>
              <Animated.View
                style={{
                  alignItems: 'center',
                  transform: [
                    {
                      scale: sceneReveal.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }),
                    },
                  ],
                }}>
                <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900', letterSpacing: 3 }}>
                  PARK EVOLVED
                </Text>
                <Text style={{ color: '#fff', fontSize: 27, fontWeight: '900', marginTop: 5 }}>
                  {BUILD_STATES[visualStage]}
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </ImageBackground>
      </View>
    </Pressable>
  );
}
