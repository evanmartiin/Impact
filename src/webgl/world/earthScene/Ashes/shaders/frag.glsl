uniform float uRatio;
uniform float uTime;
uniform float uThreshold;
uniform sampler2D uTexture;

varying vec4 vPosition;
varying vec3 vParams;

void main() {
  float isBlinking = vParams.x;
  float blinkOffset = vParams.y;

  vec2 vCoords = vPosition.xy;
  vCoords /= vPosition.w;
  vCoords = vCoords * .5 + .5;

  float opacity = distance(vCoords, vec2(.5, .5));
  opacity *= uRatio;

  float blinking = step(uThreshold, isBlinking);
  blinking *= cos(uTime * .003 + blinkOffset * 10000.) * .5;

  vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
  gl_FragColor = texture2D(uTexture, uv);

  float transparent = step(.6, gl_FragColor.r);
  
  gl_FragColor.a = opacity + blinking;
  gl_FragColor.a *= transparent;
}