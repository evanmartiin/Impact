#include <fog_pars_vertex>

uniform vec2 uWiggleDirection;
uniform float uWiggleRatio;

varying vec2 vUv;

void main() {
    vec3 vPosition = position;

    float distance = distance(vPosition, vec3(0.));

    float vHeight = max(distance * 3. - 3.12, 0.);

    vPosition.x += uWiggleDirection.x * vHeight * uWiggleRatio;
    vPosition.z -= uWiggleDirection.y * vHeight * uWiggleRatio * .3;

    vPosition.xz = clamp(vPosition.xz, vec2(-.2), vec2(.2));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.);

    vUv = uv;
    
    #include <fog_vertex>
}