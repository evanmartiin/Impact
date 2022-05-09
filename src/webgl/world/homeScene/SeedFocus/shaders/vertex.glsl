varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float coef;
uniform float sina;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    modelPosition.y += sin(modelPosition.x * sina) * coef;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
    vPosition = position;
    vNormal = normal;
}
