import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { REVEAL_POINTS, SCENES } from '@/game/game-data';

type ParkSceneProps = {
  sceneIndex: number;
  progress: number;
  tapValue: number;
  tapStreak: number;
  tapMultiplier: number;
  height: number;
  onTap: () => void;
};

function Stars() {
  return (
    <G fill="#fff7c7">
      <Circle cx="34" cy="38" r="1.6" />
      <Circle cx="78" cy="66" r="1.2" />
      <Circle cx="128" cy="31" r="1.4" />
      <Circle cx="181" cy="57" r="1.3" />
      <Circle cx="239" cy="29" r="1.7" />
      <Circle cx="298" cy="61" r="1.2" />
      <Circle cx="348" cy="37" r="1.5" />
    </G>
  );
}

function Fog() {
  return (
    <G opacity={0.23} fill="#d9e9ff">
      <Path d="M-18 215 Q20 192 62 213 T142 210 T224 216 T310 207 T410 214 V245 H-18Z" />
      <Path d="M-12 242 Q36 222 91 243 T199 235 T300 246 T410 235 V274 H-12Z" opacity={0.55} />
    </G>
  );
}

function DeadmansField({ revealed }: { revealed: boolean[] }) {
  return (
    <>
      <Circle cx="318" cy="60" r="28" fill="#f6e7ae" opacity={0.94} />
      <Circle cx="307" cy="52" r="5" fill="#decf9e" opacity={0.65} />
      <Path d="M0 168 Q70 115 140 165 T285 158 T390 150 V300 H0Z" fill="#1b2336" />
      <Path d="M0 205 Q90 165 176 203 T390 190 V300 H0Z" fill="#27362d" />
      <Ellipse cx="195" cy="272" rx="210" ry="70" fill="#35412c" />
      <G opacity={revealed[0] ? 1 : 0}>
        <Rect x="34" y="147" width="10" height="78" rx="2" fill="#4b2e22" />
        <Rect x="114" y="147" width="10" height="78" rx="2" fill="#4b2e22" />
        <Path d="M39 163 Q78 132 119 163" stroke="#b8ff5c" strokeWidth="5" fill="none" />
        <Rect x="47" y="163" width="64" height="24" rx="6" fill="#47283f" stroke="#b8ff5c" strokeWidth="2" />
        <Path d="M57 175 H101" stroke="#ffe890" strokeWidth="3" strokeDasharray="4 3" />
      </G>
      <G opacity={revealed[1] ? 1 : 0}>
        <Path d="M135 224 V161 L183 143 L220 165 V224Z" fill="#62412b" stroke="#2b1721" strokeWidth="4" />
        <Path d="M125 166 L181 132 L231 168Z" fill="#7b2538" />
        <Rect x="158" y="181" width="30" height="43" fill="#241b28" />
        <Rect x="190" y="174" width="20" height="18" fill="#ffcb55" opacity={0.85} />
      </G>
      <G opacity={revealed[2] ? 1 : 0}>
        <Path d="M252 227 Q245 197 267 190 Q286 193 283 226Z" fill="#6cbb45" stroke="#253523" strokeWidth="3" />
        <Circle cx="262" cy="202" r="3" fill="#fff6a5" />
        <Circle cx="274" cy="202" r="3" fill="#fff6a5" />
        <Path d="M260 214 Q268 220 277 213" stroke="#263722" strokeWidth="3" fill="none" />
        <Path d="M240 232 L232 194" stroke="#6a4229" strokeWidth="5" />
        <Path d="M226 194 L238 190 L241 204 L229 206Z" fill="#9ea7a0" />
      </G>
      <G opacity={revealed[3] ? 1 : 0}>
        <Path d="M42 254 Q130 206 223 249 T356 239" stroke="#181820" strokeWidth="7" fill="none" />
        <G transform="translate(276 213)">
          <Rect x="0" y="10" width="61" height="27" rx="9" fill="#551f53" stroke="#ffcf4a" strokeWidth="3" />
          <Circle cx="15" cy="39" r="7" fill="#17121c" />
          <Circle cx="48" cy="39" r="7" fill="#17121c" />
          <Circle cx="31" cy="9" r="10" fill="#d8f7ff" opacity={0.75} />
        </G>
      </G>
      <G opacity={revealed[4] ? 1 : 0} transform="translate(65 201)">
        <Rect x="0" y="40" width="95" height="11" rx="5" fill="#4d283e" />
        <Path d="M10 40 L48 0 L86 40Z" fill="#7a285d" stroke="#ffcf4a" strokeWidth="3" />
        <Rect x="45" y="6" width="6" height="39" fill="#ffcf4a" />
        <Circle cx="25" cy="33" r="8" fill="#70e7ff" />
        <Circle cx="70" cy="33" r="8" fill="#b8ff5c" />
      </G>
    </>
  );
}

function CursedCarnival({ revealed }: { revealed: boolean[] }) {
  return (
    <>
      <Circle cx="62" cy="61" r="24" fill="#ffd86b" opacity={0.9} />
      <Path d="M0 184 Q70 138 146 181 T290 168 T390 175 V300 H0Z" fill="#2c1738" />
      <Ellipse cx="195" cy="272" rx="215" ry="76" fill="#47274d" />
      <G opacity={revealed[0] ? 1 : 0}>
        <Rect x="25" y="132" width="10" height="98" fill="#1b1528" />
        <Rect x="120" y="132" width="10" height="98" fill="#1b1528" />
        <Path d="M30 151 Q78 111 125 151" stroke="#ffcf4a" strokeWidth="7" fill="none" />
        <Path d="M41 157 Q79 131 114 157" stroke="#ff4fa3" strokeWidth="4" fill="none" />
      </G>
      <G opacity={revealed[1] ? 1 : 0} transform="translate(23 202)">
        <Rect x="0" y="39" width="104" height="11" rx="5" fill="#24172e" />
        <Path d="M10 39 L51 0 L94 39Z" fill="#8b2468" stroke="#ffcf4a" strokeWidth="3" />
        <Circle cx="28" cy="32" r="9" fill="#72e8ff" />
        <Circle cx="75" cy="32" r="9" fill="#b8ff5c" />
      </G>
      <G opacity={revealed[2] ? 1 : 0}>
        <Path d="M129 242 L190 131 L255 242Z" fill="#d13a67" stroke="#2b1733" strokeWidth="5" />
        <Path d="M154 242 L190 131 L218 242Z" fill="#f8bd45" />
        <Path d="M184 132 L196 132 L204 111 L213 132 L226 132 L216 145 L187 145Z" fill="#ffcf4a" />
        <Rect x="181" y="202" width="23" height="40" rx="10" fill="#2a1735" />
      </G>
      <G opacity={revealed[3] ? 1 : 0}>
        <Path d="M277 239 V151 L319 112 L355 151 V239Z" fill="#35244e" stroke="#141124" strokeWidth="4" />
        <Path d="M270 154 L319 100 L362 154Z" fill="#6f2a77" />
        <Rect x="309" y="177" width="17" height="62" fill="#171126" />
        <Circle cx="319" cy="142" r="10" fill="#b8ff5c" opacity={0.85} />
      </G>
      <G opacity={revealed[4] ? 1 : 0} transform="translate(235 228)">
        <Path d="M0 20 Q16 -9 35 16 Q54 -8 72 20 Q57 45 36 36 Q16 45 0 20Z" fill="#782f43" stroke="#ff835f" strokeWidth="3" />
        <Circle cx="24" cy="18" r="3" fill="#ffec82" />
        <Circle cx="49" cy="18" r="3" fill="#ffec82" />
      </G>
    </>
  );
}

function HauntedResort({ revealed }: { revealed: boolean[] }) {
  return (
    <>
      <Circle cx="315" cy="52" r="26" fill="#d9fbff" opacity={0.92} />
      <Path d="M0 177 Q85 144 167 179 T315 164 T390 168 V300 H0Z" fill="#12363d" />
      <Ellipse cx="195" cy="273" rx="220" ry="74" fill="#21504c" />
      <G opacity={revealed[0] ? 1 : 0}>
        <Rect x="18" y="150" width="12" height="94" fill="#12262e" />
        <Rect x="102" y="150" width="12" height="94" fill="#12262e" />
        <Path d="M24 157 Q66 119 108 157" stroke="#69e7ff" strokeWidth="7" fill="none" />
        <Rect x="37" y="153" width="59" height="21" rx="8" fill="#123743" stroke="#ffcf4a" strokeWidth="2" />
      </G>
      <G opacity={revealed[1] ? 1 : 0}>
        <Ellipse cx="91" cy="253" rx="60" ry="24" fill="#49c5d8" stroke="#bff8ff" strokeWidth="4" />
        <Ellipse cx="91" cy="250" rx="42" ry="12" fill="#8ef0ef" opacity={0.5} />
        <Path d="M76 245 Q90 220 106 245" stroke="#f0ffff" strokeWidth="4" fill="none" opacity={0.75} />
      </G>
      <G opacity={revealed[2] ? 1 : 0}>
        <Rect x="128" y="102" width="121" height="147" rx="9" fill="#28475a" stroke="#0d202c" strokeWidth="5" />
        <Rect x="144" y="128" width="23" height="20" rx="3" fill="#ffdd67" />
        <Rect x="181" y="128" width="23" height="20" rx="3" fill="#69e7ff" />
        <Rect x="217" y="128" width="17" height="20" rx="3" fill="#ffdd67" />
        <Rect x="144" y="165" width="23" height="20" rx="3" fill="#69e7ff" />
        <Rect x="181" y="165" width="23" height="20" rx="3" fill="#ffdd67" />
        <Rect x="217" y="165" width="17" height="20" rx="3" fill="#69e7ff" />
        <Rect x="177" y="208" width="31" height="41" rx="6" fill="#102331" />
        <Path d="M119 107 L188 68 L259 107Z" fill="#63356a" />
      </G>
      <G opacity={revealed[3] ? 1 : 0}>
        <Rect x="263" y="146" width="91" height="100" rx="8" fill="#492c55" stroke="#1d1730" strokeWidth="4" />
        <Path d="M255 150 L309 110 L361 150Z" fill="#802e69" />
        <Circle cx="309" cy="174" r="20" fill="#ffcf4a" />
        <Path d="M296 174 H322 M309 161 V187" stroke="#6d315a" strokeWidth="5" />
      </G>
      <G opacity={revealed[4] ? 1 : 0}>
        <Path d="M166 69 Q190 27 214 69 Q242 101 190 111 Q141 98 166 69Z" fill="#61e8ff" opacity={0.8} />
        <Path d="M174 69 Q190 44 205 69 Q220 88 191 94 Q160 87 174 69Z" fill="#111a3c" />
        <Circle cx="190" cy="68" r="31" stroke="#ffcf4a" strokeWidth="4" fill="none" strokeDasharray="5 5" />
      </G>
    </>
  );
}

export function ParkScene({
  sceneIndex,
  progress,
  tapValue,
  tapStreak,
  tapMultiplier,
  height,
  onTap,
}: ParkSceneProps) {
  const scene = SCENES[sceneIndex];
  const [drift] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const revealed = useMemo(
    () => REVEAL_POINTS.map((point) => progress >= point),
    [progress],
  );
  const nextRevealIndex = revealed.findIndex((value) => !value);

  useEffect(() => {
    const drifting = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ]),
    );
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    drifting.start();
    pulsing.start();
    return () => {
      drifting.stop();
      pulsing.stop();
    };
  }, [drift, pulse]);

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
          borderRadius: 28,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: `${scene.accent}70`,
          boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
        }}>
        <Svg width="100%" height="100%" viewBox="0 0 390 300" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={scene.skyTop} />
              <Stop offset="1" stopColor={scene.skyBottom} />
            </LinearGradient>
          </Defs>
          <Rect width="390" height="300" fill="url(#sky)" />
          <Stars />
          {sceneIndex === 0 && <DeadmansField revealed={revealed} />}
          {sceneIndex === 1 && <CursedCarnival revealed={revealed} />}
          {sceneIndex === 2 && <HauntedResort revealed={revealed} />}
          <Fog />
        </Svg>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: '#090816c7',
              borderWidth: 1,
              borderColor: `${scene.accent}80`,
              paddingHorizontal: 11,
              paddingVertical: 6,
              borderRadius: 99,
            }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
              LOCATION {sceneIndex + 1}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>
              {revealed.filter(Boolean).length}/{scene.revealNames.length} BUILT
            </Text>
            <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '800' }}>
              {nextRevealIndex === -1 ? 'PARK MAXED' : scene.revealNames[nextRevealIndex]}
            </Text>
          </View>
        </View>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '10%',
            bottom: '19%',
            opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.92] }),
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-8, 15] }) },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [5, -6] }) },
            ],
          }}>
          <Text style={{ fontSize: 27 }}>👻</Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: '11%',
            bottom: '18%',
            opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.45] }),
            transform: [
              { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [10, -10] }) },
              { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [-2, 7] }) },
            ],
          }}>
          <Text style={{ fontSize: 25 }}>{sceneIndex === 2 ? '🧟' : sceneIndex === 1 ? '🤡' : '🧛'}</Text>
        </Animated.View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '31%',
            alignItems: 'center',
          }}>
          <Animated.View
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              backgroundColor: '#090816d9',
              borderWidth: 3,
              borderColor: `${scene.accent}cc`,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 36px ${scene.accent}99`,
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.055],
                  }),
                },
              ],
            }}>
            <Text style={{ fontSize: 43 }}>👻</Text>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
              SCARE
            </Text>
            <Text style={{ color: scene.accent, fontSize: 16, fontWeight: '900' }}>
              +£{tapValue.toLocaleString('en-GB')}
            </Text>
          </Animated.View>
          {tapStreak >= 5 && (
            <View
              style={{
                marginTop: 10,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 99,
                backgroundColor: '#130d1fd9',
                borderWidth: 1,
                borderColor: scene.accent,
              }}>
              <Text style={{ color: scene.accent, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }}>
                SCREAM STREAK ×{tapMultiplier.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 13,
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: '#090816c7',
              borderRadius: 99,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: '#ffffff20',
            }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 }}>
              TAP ANYWHERE TO COLLECT SCREAMS
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
