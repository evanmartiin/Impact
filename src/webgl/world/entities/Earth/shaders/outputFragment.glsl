#include <output_fragment>

vec3 color = mix(colorB, colorA, texture2D(texture1, vUv).z);
gl_FragColor = vec4(outgoingLight * color, diffuseColor.a);


// FRESNEL

// vec3 color = vec3(1., 1., 0.5);
// vec3 viewDirection = normalize(cameraPosition - vPosition);
// float fresnelTerm = dot(viewDirection, vNormal);
// fresnelTerm = clamp(1.2 - fresnelTerm, 0.1, .9);
// gl_FragColor = vec4(1.0 - color * fresnelTerm, 1.);