/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Animated,
  Text as Txt,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import * as d3Shapes from 'd3-shape';
import {snap} from '@popmotion/popcorn';
import {Svg, G, Text, TSpan, Path} from 'react-native-svg';
import {State} from 'react-native-gesture-handler';
import {useState} from 'react';
const {width} = Dimensions.get('screen');

const numberSegment = 10;
const wheelSize = width * 0.9;
const fontSize = 26;
const oneTurn = 360;
const angleBySegment = oneTurn / numberSegment;
const angleOffSet = angleBySegment / 2;

const colors = [
  '#de3529',
  '#1668a6',
  '#fcc21c',
  '#de3529',
  '#1668a6',
  '#fcc21c',
  '#de3529',
  '#1668a6',
  '#fcc21c',
  '#1668a6',
];

const makeWheel = () => {
  const data = Array.from({length: numberSegment}).fill(1);
  const arcs = d3Shapes.pie()(data);

  return arcs.map((arc, index) => {
    const instance = d3Shapes
      .arc()
      .padAngle(0.01)
      .outerRadius(width / 2)
      .cornerRadius(8)
      .innerRadius(10);

    return {
      path: instance(arc),
      color: colors[index],
      value: 200 + (index + 1),
      centroid: instance.centroid(arc),
    };
  });
};

const App = () => {
  const wheelPath = makeWheel();
  const _angle = new Animated.Value(0);
  const [enabled, setEnabled] = useState(false);
  const [winner, setWinner] = useState(null);
  const [finished, setFinished] = useState(false);

  let angle = 0;

  useEffect(() => {
    _angle.addListener(event => {
      if (enabled === true) {
        setFinished(false);
        setEnabled(false);
      }
      angle = event.value;
    });
  }, [enabled]);

  const getWinnerIndex = () => {
    const deg = Math.abs(Math.round(angle % oneTurn));
    return Math.floor(deg / angleBySegment);
  };

  function onPan({nativeEvent}) {
    if (nativeEvent.state === State.END) {
      const {velocityY} = nativeEvent;
      Animated.decay(_angle, {
        velocity: velocityY / 1000,
        deceleration: 0.999,
        useNativeDriver: true,
      }).start(() => {
        _angle.setValue(angle % oneTurn);
        const snapTo = snap(oneTurn / numberSegment);
        Animated.timing(_angle, {
          toValue: snapTo(angle),
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          const winnerIndex = getWinnerIndex();
          setWinner(wheelPath[winnerIndex].value);
          setFinished(false);
          setEnabled(true);
        });
      });
    }
  }

  const renderSvgWheel = () => {
    return (
      <View style={styles.container}>
        {renderKnob()}
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: _angle.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`],
                }),
              },
            ],
          }}>
          <Svg
            width={wheelSize}
            height={wheelSize}
            stroke={'#aaadbb'}
            strokeWidth="1"
            style={{transform: [{rotate: `-${angleOffSet}deg`}]}}
            viewBox={`0 0 ${width} ${width}`}>
            <G y={width / 2} x={width / 2}>
              {wheelPath.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();
                return (
                  <G key={`arc${i}`}>
                    <Path d={arc.path} fill={arc.color} />
                    <G
                      rotation={(i * oneTurn) / numberSegment + angleOffSet}
                      origin={`${x}, ${y}`}>
                      <Text
                        x={x}
                        stroke="none"
                        y={y - 70}
                        fill="white"
                        textAnchor="middle"
                        fontSize={fontSize}>
                        {Array.from({length: number.length}).map((_, i) => {
                          return (
                            <TSpan x={x} dy={fontSize} key={`an${i}`}>
                              {number.charAt(i)}
                            </TSpan>
                          );
                        })}
                      </Text>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };

  function renderKnob() {
    const knobSize = 40;
    const knobItem = Animated.modulo(
      Animated.divide(
        Animated.modulo(Animated.subtract(_angle, angleOffSet), oneTurn),
        new Animated.Value(angleBySegment),
      ),
      1,
    );
    return (
      <Animated.View
        style={{
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
          transform: [
            {
              rotate: knobItem.interpolate({
                inputRange: [-1, -0.25, -0.0001, 0.0001, 0.25, 1],
                outputRange: [
                  '0deg',
                  '0deg',
                  '25deg',
                  '-25deg',
                  '0deg',
                  '0deg',
                ],
              }),
            },
          ],
        }}>
        <Svg
          width={knobSize}
          height={(knobSize * 100) / 57}
          style={{transform: [{translateY: 30}]}}
          viewBox="0 0 57 100">
          <Path
            fill="#8ea4af"
            d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289l16,24  C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289C54.289,34.008,56,29.219,56,24  C56,10.746,45.254,0,32,0z M32,32c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S36.418,32,32,32z"></Path>
        </Svg>
      </Animated.View>
    );
  }

  function renderWinner() {
    if (winner === 204 || winner === 202 || winner === 201) {
      return <Txt style={styles.winner}>Congratulations You Won</Txt>;
    }
    return <Txt style={styles.winner}>Better Luck Next Time</Txt>;
  }

  function handleReset() {
    setEnabled(false);
  }

  return (
    <>
      <GestureHandlerRootView style={{flex: 1}}>
        <PanGestureHandler onHandlerStateChange={onPan} enabled={!enabled}>
          <View style={styles.container}>
            {renderSvgWheel()}
            {enabled && renderWinner()}
          </View>
        </PanGestureHandler>
        <View style={styles.btnContainer}>
          <Txt style={styles.btn} onPress={handleReset}>
            Reset Game
          </Txt>
        </View>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  btnContainer: {
    width: '100%',
    display: 'flex',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    fontSize: 24,
    marginBottom: 60,
    backgroundColor: '#0076b8',
    paddingHorizontal: 40,
    paddingVertical: 20,
    color: 'white',
    borderRadius: 10,
  },
  winner: {
    marginBottom: 60,
    fontSize: 32,
    fontWeight: '500',
    fontFamily: 'Lyon-Italic',
    color: 'black',
  },
});

export default App;
