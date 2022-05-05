uniform float uRadius;
uniform float uRatio;
uniform float uTime;
uniform float uThreshold;

varying vec4 vPosition;
varying vec2 vBlinking;

void main() {
    float isBlinking = vBlinking.x;
    float blinkOffset = vBlinking.y;

  	vec2 vCoords = vPosition.xy;
    vCoords /= vPosition.w;
    vCoords = vCoords * .5 + .5;

    float opacity = distance(vCoords, vec2(.5, .5));
    opacity *= uRatio;
    opacity -= uRadius;

    float blinking = step(uThreshold, isBlinking);
    blinking *= cos(uTime * .003 + blinkOffset * 10000.) * .5;

    gl_FragColor = vec4(vec3(1.), opacity + blinking);
}