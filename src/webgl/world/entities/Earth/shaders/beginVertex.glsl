#include <begin_vertex>

float distance = distance(transformed, vec3(0.));

vHeight = max(distance * 3. - 3.12, 0.);

transformed += uDirection * clamp(uForce, 0., .1) * vHeight;