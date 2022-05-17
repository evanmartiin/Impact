uniform float uRadius;
uniform float uRatio;
uniform float uAge;
uniform float uThreshold;

varying vec4 vPosition;
varying float vLifespan;

void main() {
  vec3 fireColor = vec3(1., 0.44, 0.);
  vec3 ashColor = vec3(0.34, 0.12, 0.02);

  vec2 vCoords = vPosition.xy;
  vCoords /= vPosition.w;
  vCoords = vCoords * .5 + .5;

  // float blinking = step(uThreshold, isBlinking);
  // blinking *= cos(uAge * .003 + blinkOffset * 10000.) * .5;

  float opacity = 1. - vLifespan;
  opacity -= uAge * .0003;

  vec3 color = mix(ashColor, fireColor, opacity);

  gl_FragColor = vec4(color, opacity);
}