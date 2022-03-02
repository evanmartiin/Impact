varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform sampler2D texture1;
uniform float scale;

void main() {
    float x = smoothstep(0.0, scale, texture2D(texture1, uv).z);

    vPosition = vec3( vec4( position, 1.0 ) * modelMatrix);
    vNormal = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );

    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * vec3(x), 1.0);
}