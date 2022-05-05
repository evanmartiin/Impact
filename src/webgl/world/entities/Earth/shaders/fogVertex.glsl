vec4 _fogWorldPosition = modelMatrix * vec4(position, 1.0);
_vFogWorldPosition = _fogWorldPosition.xyz;
_vFogNormal = normal;