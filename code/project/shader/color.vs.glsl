/**
 * static color vertex shader
 */

 attribute vec3 a_position;
 attribute vec3 a_normal;

 uniform mat4 u_modelView;
 uniform mat3 u_normalMatrix;
 uniform mat4 u_projection;

 uniform vec3 u_lightPos;
 uniform vec3 u_light2Pos;
 uniform vec3 u_light3Pos;
 uniform vec3 u_light4Pos;
 uniform vec3 u_light5Pos;
 uniform vec3 u_light6Pos;
 uniform vec3 u_light7Pos;

 varying vec3 v_normalVec;
 varying vec3 v_eyeVec;
 varying vec3 v_lightVec;
 varying vec3 v_light2Vec;
 varying vec3 v_light3Vec;
 varying vec3 v_light4Vec;
 varying vec3 v_light5Vec;
 varying vec3 v_light6Vec;
 varying vec3 v_light7Vec;


void main() {
  vec4 eyePosition = u_modelView * vec4(a_position,1);
  v_normalVec = u_normalMatrix * a_normal;

  v_eyeVec = -eyePosition.xyz;
  v_lightVec = u_lightPos - eyePosition.xyz;
  v_light2Vec = u_light2Pos - eyePosition.xyz;
  v_light3Vec = u_light3Pos - eyePosition.xyz;
  v_light4Vec = u_light2Pos - eyePosition.xyz;
  v_light5Vec = u_light3Pos - eyePosition.xyz;
  v_light6Vec = u_light2Pos - eyePosition.xyz;
  v_light7Vec = u_light3Pos - eyePosition.xyz;

  gl_Position = u_projection * eyePosition;
}
