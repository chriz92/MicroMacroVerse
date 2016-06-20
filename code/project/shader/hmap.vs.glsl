/**
 * heightmap vertex shader
 */

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;

uniform vec3 u_lightPos;
uniform vec3 u_spotDirection;
uniform sampler2D u_heightmap;
uniform vec2 u_hmapSize;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_spotVec;

varying vec2 v_texCoord;

float getHeight(vec2 coord){
	//range [-0.25, 0.25]
	return 0.5 * texture2D(u_heightmap, coord).r - 0.25;
}

void main() {
	float height = getHeight(a_texCoord);

	vec3 offset = vec3(0,0, height);
	vec4 eyePosition = u_modelView * vec4(a_position + offset, 1);

	//one pixel in texture coordinates
	vec2 x = vec2(1.0 / u_hmapSize.x, 0);
	vec2 y = vec2(0, 1.0 / u_hmapSize.y);


	//get neighbouring pixels height
	float top = getHeight(a_texCoord + y);
	float bottom = getHeight(a_texCoord - y);
	float left = getHeight(a_texCoord - x);
	float right = getHeight(a_texCoord + x);
	vec3 normal = normalize(vec3(2.0 * (right - left), 4.0, 2.0 * (bottom - top)));
  v_normalVec = u_normalMatrix * normal;

  v_eyeVec = -eyePosition.xyz;
	v_lightVec = u_lightPos - eyePosition.xyz;
	v_spotVec = normalize(u_spotDirection);
	v_texCoord = a_texCoord;

	gl_Position = u_projection * eyePosition;
}
