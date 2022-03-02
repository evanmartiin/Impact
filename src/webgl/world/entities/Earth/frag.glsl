varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform sampler2D texture1;

vec3 colorA = vec3(0.0,0.7,0.1);
vec3 colorB = vec3(0.3,0.5,0.9);

void main() {
    // vec3 color = mix(colorB, colorA, texture2D(texture1, vUv).z);

    // gl_FragColor = vec4(color, 1.0);

    vec3 color = vec3(1., 1., 1.);
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnelTerm = dot(viewDirection, vNormal);
    fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);

    gl_FragColor = vec4( color * fresnelTerm, 1.);
}