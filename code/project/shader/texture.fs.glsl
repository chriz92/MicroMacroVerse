/**
 * a phong shader implementation with texture and spotlight support
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

//illumination related variables
uniform Material u_material;
uniform Light u_light;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_spotVec;
uniform float u_spotCutoff;

//texture related variables
uniform bool u_enableObjectTexture;
varying vec2 v_texCoord;
uniform sampler2D u_tex;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec3 spotVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);
  spotVec = normalize(spotVec);

  float spec = 0.0;
  float angle = dot(-lightVec, spotVec);
  //return vec4(spotVec, 1);
  //return vec4(angle,0, 0,1);

  if((u_spotCutoff == 0.0) || dot(-lightVec, spotVec) > cos(radians(u_spotCutoff))){
    //compute diffuse term
	  float diffuse = max(dot(normalVec,lightVec),0.0);

	  //compute specular term
	  vec3 reflectVec = reflect(-lightVec,normalVec);
	  spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);
    material.diffuse = textureColor;
    //material.ambient = textureColor;
    //material.diffuse *= textureColor;
    material.ambient *= textureColor;
    vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
    vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
    vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
    vec4 c_em   = material.emission;
    return c_amb + c_diff + c_spec + c_em;
  }
  else return textureColor * material.ambient + light.ambient * material.ambient;
}

void main (void) {
  vec4 textureColor = vec4(0,0,0,1);
	textureColor = texture2D(u_tex,v_texCoord);

	gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, v_spotVec, textureColor);
}
