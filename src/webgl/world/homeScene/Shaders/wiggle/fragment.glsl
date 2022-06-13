uniform sampler2D uBakedTexture;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(uBakedTexture, vUv);
    gl_FragColor = color;
}