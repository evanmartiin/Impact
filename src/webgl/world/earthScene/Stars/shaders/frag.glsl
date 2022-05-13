uniform float uRadius;
uniform float uRatio;
uniform float uTime;
uniform float uThreshold;

varying vec4 vPosition;
varying vec3 vParams;

void main() {
  float isBlinking = vParams.x;
  float blinkOffset = vParams.y;
  float colorOffset = vParams.z;

  vec3 hotColor = vec3(1, 0.86, 0.86);
  vec3 coldColor = vec3(0.86, 0.86, 1);

  vec2 vCoords = vPosition.xy;
  vCoords /= vPosition.w;
  vCoords = vCoords * .5 + .5;

  float opacity = distance(vCoords, vec2(.5, .5));
  opacity *= uRatio;
  opacity -= uRadius;

  float blinking = step(uThreshold, isBlinking);
  blinking *= cos(uTime * .003 + blinkOffset * 10000.) * .5;

  vec3 color = mix(hotColor, coldColor, colorOffset);

  gl_FragColor = vec4(color, opacity + blinking);
}