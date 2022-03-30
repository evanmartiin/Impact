#include <output_fragment>

vec3 color = mix(colorB, colorA, texture2D(texture1, vUv).z);

gl_FragColor = vec4(outgoingLight * color, diffuseColor.a);
// gl_FragColor = vec4(vNormal, diffuseColor.a);
// gl_FragColor = vec4(vPosition, diffuseColor.a);


// vec3 direction = normalize(cameraPosition - vPosition);
// vec3 nDirection = normalize( direction );
// vec3 nNormal = normalize( vNormal );
// vec3 halfDirection = normalize( nNormal + nDirection );

// bool invert = true;
// float cosine = dot( halfDirection, nDirection);
// float product = max( cosine, 0.0 );
// float factor = invert ? 1.0 - pow( product, 5.0 ) : pow( product, 5.0 );

// gl_FragColor = vec4( vec3(factor), 1.);
