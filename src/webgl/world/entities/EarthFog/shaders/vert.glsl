uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

    vPosition = position;
    vUv = uv;
    vNormal = normal;
}