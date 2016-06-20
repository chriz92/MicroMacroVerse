/**
 * static color fragment shader
 */


 //need to specify how "precise" float should be
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
 uniform Light u_light2;
 uniform Light u_light3;
 uniform Light u_light4;
 uniform Light u_light5;
 uniform Light u_light6;
 uniform Light u_light7;

 varying vec3 v_normalVec;
 varying vec3 v_eyeVec;
 varying vec3 v_lightVec;
 varying vec3 v_light2Vec;
 varying vec3 v_light3Vec;
 varying vec3 v_light4Vec;
 varying vec3 v_light5Vec;
 varying vec3 v_light6Vec;
 varying vec3 v_light7Vec;

 uniform vec4 u_forceColor;


vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);
  //compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);
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

//entry point again
void main() {
  vec4 color = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, u_forceColor)
  +calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec, u_forceColor)
  +calculateSimplePointLight(u_light3, u_material, v_light3Vec, v_normalVec, v_eyeVec, u_forceColor)
  +calculateSimplePointLight(u_light4, u_material, v_light4Vec, v_normalVec, v_eyeVec, u_forceColor);
  color.a = u_forceColor.a;
	gl_FragColor = color;
}
