#include <begin_vertex>

vUv = uv;

vPosition = position;
// vPosition =(modelViewMatrix * vec4(position, 1.0)).xyz;

float x = smoothstep(0.0, scale, texture2D(texture1, uv).z);
transformed += normal * vec3(x);
