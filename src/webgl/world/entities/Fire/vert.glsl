varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform sampler2D noise;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec3 pos = position;
    vec3 noisetex = texture2D(noise, mod(vUv - uTime / 2000., 1.)).rgb;

    // if (pos.y <= 20.) {
        pos = vec3(position.x * sin((position.y + 4.3) / 2.) * 2.,
        position.y, position.z * sin((position.y + 4.3) / 2.) * 2.);
    // } else{
    //     pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),
    //     position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
    // }

    pos.xz *= noisetex.r;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}