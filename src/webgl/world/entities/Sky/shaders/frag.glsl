uniform float uRadius;
uniform float uRatio;

varying vec4 vPosition;

void main() {
  	vec2 vCoords = vPosition.xy;
    vCoords /= vPosition.w;
    vCoords = vCoords * .5 + .5;

    float opacity = distance(vCoords, vec2(.5, .5));
    opacity *= uRatio;
    opacity -= uRadius;

    gl_FragColor = vec4(vec3(1.), opacity);
}