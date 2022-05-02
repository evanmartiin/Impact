#include <begin_vertex>

float distance = distance(transformed, vec3(0.));

vHeight = max(distance * 3. - 3.12, 0.);

transformed.x += uDirection.x * vHeight * uBounceRatio;
transformed.z -= uDirection.y * vHeight * uBounceRatio * .3;

transformed.xz = clamp(transformed.xz, vec2(-.2), vec2(.2));