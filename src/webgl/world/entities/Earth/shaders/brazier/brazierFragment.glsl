// vec3 brazierColor = vec3(1., 0., 0.);

float random = noise(vBrazierPosition.xyz * uBrazierRandomRatio);
float pct = smoothstep(vBrazierPosition.y - uBrazierRange/2. + random, vBrazierPosition.y + uBrazierRange/2. + random, uBrazierThreshold);
vec4 brazierColor = texture2D(uBrazierTexture, vBrazierUv);

gl_FragColor.rgb = mix(gl_FragColor.rgb, brazierColor.rgb, pct);