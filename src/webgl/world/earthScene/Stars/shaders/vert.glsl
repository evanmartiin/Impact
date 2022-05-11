attribute vec3 aParams;

uniform float uSize;
uniform float uScale;

varying vec4 vPosition;
varying vec3 vParams;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uScale;
    gl_PointSize *= uSize;
    gl_PointSize *= (1. / - viewPosition.z);
    
    vPosition = projectedPosition;
    vParams = aParams;
}