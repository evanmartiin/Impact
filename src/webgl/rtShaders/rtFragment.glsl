uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform sampler2D uPaperTexture;
uniform float uTime;
uniform float uEase;

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


float fbm(vec3 x) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100);
	for (int i = 0; i < 5; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

void main() {
    vec4 whiteColor = vec4(0.98, 0.72, 0.54, 1);
    vec4 fireColor = vec4(0.66, 0.31, 0.05, 1);
    vec4 asheColor = vec4(0.06, 0.04, 0, 1);
    vec4 sceneColor = texture2D(tDiffuse1, vUv);
    vec4 nextSceneColor = texture2D(tDiffuse2, vUv);
    // vec4 paperColor = texture2D(uPaperTexture, vUv);
    // sceneColor.rgb += (paperColor.r - .9) * .5 * uEase;
    float time = uTime * .001 * uEase;

    float distance = distance(vPosition, vec3(0.)) + .5;
    float noise = fbm(vec3(vUv * 15., distance)) * 2.;
    
    float whiteFireStep = smoothstep(distance - .05 + noise, distance + .05 + noise, time + .3);
    vec4 tempColor = mix(fireColor, whiteColor, whiteFireStep);
    
    float asheFireStep = smoothstep(distance - .1 + noise, distance + .1 + noise, time + .4);
    tempColor = mix(asheColor, tempColor, asheFireStep);

    float fireTextureStep = smoothstep(distance - .5 + noise, distance + .5 + noise, time + .8);
    gl_FragColor = mix(sceneColor, tempColor, fireTextureStep);

    float cutStep = smoothstep(distance + noise - .4, distance + noise, time);
    gl_FragColor = mix(nextSceneColor, gl_FragColor, 1. - cutStep);
}