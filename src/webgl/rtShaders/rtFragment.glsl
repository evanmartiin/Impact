uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
    vec4 fireColor = vec4(1, 0.3, 0.09, 1);
    vec4 asheColor = vec4(1, 0.88, 0.76, 1);

    float distance = distance(vPosition, vec3(0.));
    float noise = noise(vec3(vUv * 20., distance));
    float asheFireStep = smoothstep(distance - .1 + noise, distance + .1 + noise, uTime * .004 + .05);
    vec4 tempColor = mix(asheColor, fireColor, asheFireStep);

    vec4 color = texture2D(uTexture, vUv);
    float fireTextureStep = smoothstep(distance - .1 + noise, distance + .1 + noise, uTime * .004 + .2);
    gl_FragColor = mix(color, tempColor, fireTextureStep);

    float cutStep = step(distance + noise, uTime * .004);
    gl_FragColor.a = 1. - cutStep;
    // gl_FragColor = vec4(color.rgb, noise(vUv * 100.));
}