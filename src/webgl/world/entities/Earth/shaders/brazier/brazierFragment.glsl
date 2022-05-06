vec4 fireColor = vec4(1., 0., 0., 1.);

float random = noise(vBrazierPosition.xyz * uBrazierRandomRatio);
float pct = smoothstep(vBrazierPosition.y - uBrazierRange/2. + random, vBrazierPosition.y + uBrazierRange/2. + random, uBrazierThreshold);
vec4 brazierColor = texture2D(uBrazierTexture, vBrazierUv);
brazierColor = mix(fireColor, brazierColor, pct);
float brutePct = step(vBrazierPosition.y + random, uBrazierThreshold);

gl_FragColor.rgb = mix(gl_FragColor.rgb, brazierColor.rgb, pct);