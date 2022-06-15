varying vec2 vUv;

void main() {
    vec3 vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);

    vUv = uv;
}