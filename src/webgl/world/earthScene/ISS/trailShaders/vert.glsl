attribute vec3 aPosition;
attribute vec3 aParams;

uniform float uTime;
uniform float uLength;
uniform vec3 uISSPos;
uniform float uRadius;
uniform float uOffset;

varying vec3 vPosition;

void main() {
    float aScale = aParams.x;
    float aSpeed = aParams.y;
    float aIndex = aParams.z;

    vec3 translation = vec3(0.);
    translation.y = uISSPos.y;

    float index = uTime / 2000.;
    index *= -aSpeed;
    index -= aIndex / 100.;
    index = mod(index, uLength);
    index -= uOffset;
    
    translation.x = cos(index + uTime / 2000. - uLength);
    translation.z = sin(index + uTime / 2000. - uLength);
    translation.xz = translation.xz * uRadius;
    
    translation += aPosition; // Random shift

    vec4 viewPosition = modelViewMatrix * vec4(translation, 1.);
    gl_Position = projectionMatrix * viewPosition;

    // Size attenuation
    gl_PointSize = aScale;
    // gl_PointSize = aScale * (uISSPos.x + uLength - translation.x);
    gl_PointSize *= (1.0 / -viewPosition.z);

    vPosition = translation;
}