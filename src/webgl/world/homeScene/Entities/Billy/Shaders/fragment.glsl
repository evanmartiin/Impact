#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
}