varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 fireColor;
uniform sampler2D noise;

void main() {
    vec3 noisetex = texture2D(noise, mod(vUv - uTime / 2000., 1.)).rgb;
    gl_FragColor = vec4(noisetex.r);

    if (gl_FragColor.r >= 0.44) {
        gl_FragColor = vec4(fireColor, gl_FragColor.r);
    } else {
        gl_FragColor = vec4(0.);
    }

    gl_FragColor *= vec4(smoothstep(0.3, 0.9, 1. - vUv.y));
}