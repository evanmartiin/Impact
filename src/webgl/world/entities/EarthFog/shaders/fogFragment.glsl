float fogDepth = length(vWorldPosition) - .9;
fogDepth *= 5.;
fogDepth = 1. - fogDepth;

gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogDepth);