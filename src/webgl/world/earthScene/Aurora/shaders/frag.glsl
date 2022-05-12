uniform float uTime;
uniform float uOffset;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

float rand(float n){return fract(sin(n) * 43758.5453123);}

float noise1(float p){
	float fl = floor(p);
  float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

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
  vec3 topColor = vec3(0.67, 0.02, 0.69);
  vec3 bottomColor = vec3(0.02, 0.65, 0.33);

  float noiseHeight = noise1(vUv.x * 100.) + .1;

  float noise = fbm(vec3(vPosition.xz * 10., uTime * .0001));
  noise = smoothstep(.6, .8, noise);

  float noise3 = fbm(vPosition * cos(uTime * .001) * vNormal) - .5;
  float opacity = 1. - abs((vUv.y - .5) * 10. * noiseHeight);
  vec3 color = mix(bottomColor, topColor, vUv.y * .7);
  
  gl_FragColor = vec4(0., noise3 * 5., 0., noise3 * opacity);
  gl_FragColor = vec4(color, noise * opacity);
  gl_FragColor = vec4(color, noise * opacity);
}