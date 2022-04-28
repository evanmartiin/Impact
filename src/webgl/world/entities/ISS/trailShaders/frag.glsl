uniform vec3 uISSPos;
uniform float uOpacityRatio;

varying vec3 vPosition;

void main() {
    // Circle blurred particle
    // float strength = distance(gl_PointCoord, vec2(.5));
    // strength *= 2.;
    // strength = 1. - strength;

    float distanceFromISS = distance(vPosition, uISSPos);

    float opacity = .8 - distanceFromISS;
    opacity *= distanceFromISS * 2.;
    opacity *= uOpacityRatio;

    gl_FragColor = vec4(vec3(1.), opacity);
}