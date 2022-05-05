float _fogDepth = length(_vFogWorldPosition) - .9;
_fogDepth *= 5.;
_fogDepth = 1. - _fogDepth;
_fogDepth = clamp(_fogDepth, 0., 1.);
// vec3 p = _vFogWorldPosition;
// _fogDepth *= FBM(p + FBM(p)) * .5;

vec3 _fogViewDirection = normalize(_uFogCameraPosition - _vFogWorldPosition);
float _fogFresnelTerm = dot(_fogViewDirection, _vFogNormal);
// _fogFresnelTerm = clamp(pow(1.2 - _fogFresnelTerm, 2.), 0., 1.);
_fogFresnelTerm = clamp(1. - _fogFresnelTerm, 0., 1.);

// gl_FragColor.rgb = mix(gl_FragColor.rgb, _uFogColor, _fogDepth * _fogFresnelTerm);
gl_FragColor.rgb = _vFogNormal;