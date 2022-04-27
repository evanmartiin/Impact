attribute vec3 aPosition;
attribute vec3 aParams;

uniform float uTime;
uniform float uLength;
uniform vec3 uDirection;
uniform vec3 uISSPos;

varying vec3 vPosition;
varying float vLifespan;

void main() {
    float aScale = aParams.x;
    float aSpeed = aParams.y;
    float aLifespan = aParams.z;
    
    vLifespan = aLifespan;
    vPosition = aPosition;

    // gl_Position = projectionMatrix * modelViewMatrix * vec4((uBasePos + position + mod(uTime/2000. * aSpeed, uLength)), 1.);
    vec4 viewPosition = modelViewMatrix * vec4(position + aPosition, 1.);
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = aScale;
    gl_PointSize *= (1.0 / -viewPosition.z); // Size attenuation
}