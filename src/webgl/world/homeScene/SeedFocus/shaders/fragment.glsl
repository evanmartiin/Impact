varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    float strength = mod(vUv.y * 10.0, 1.0);
    strength = step(0.5, strength);
    vec4 transparentColor = vec4(0);
    vec4 whiteColor = vec4(1);
    vec4 mixedColor = mix(whiteColor, transparentColor, strength);
    gl_FragColor = mixedColor;
}