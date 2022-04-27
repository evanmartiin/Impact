uniform float uTime;
uniform vec3 uISSPos;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vLifespan;

void main() {
    float strength = distance(gl_PointCoord, vec2(.5));
    strength *= 2.;
    strength = 1. - strength;

    float opacity = .5 - distance(vPosition, uISSPos);

    gl_FragColor = vec4(vec3(strength), opacity);
}