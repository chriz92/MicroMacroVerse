var planetDistance = new Float32Array([
0, 5, 6, 9, 16, 26, 28
]);
var planetOrbitRotation = new Float32Array([
0,10,15,-20,12,22,-25
]);
var planetRotation = new Float32Array([
0,7,11,-15,41,23,-24
]);
var planetSize = new Float32Array([3, 0.12, 0.20, 0.35, 0.36, 0.8, 0.72]);
var planetTransformationNodes = [];
var timeSolar = 0;

function createSolarSystem(rootNode, resources){
  {
    //initialize skybox
    let envNode = new ShaderSGNode(createProgram(gl, resources.env_vs, resources.env_fs));
    rootNode.append(envNode);
    let texture = createCubeMap(resources.uni_px, resources.uni_nx, resources.uni_py, resources.uni_ny, resources.uni_pz, resources.uni_nz);
    let skybox = new EnvironmentSGNode(texture, 0, false, new RenderSGNode(makeSphere(30,20,20)));
    envNode.append(skybox);
  }
  {
    //initialize light
    let light = new LightSGNode(); //use now framework implementation of light node
    light.ambient = [1.0, 1.0, 1.0, 1];
    light.diffuse = [0.8, 0.72, 0.68, 1];
    light.specular = [1, 0.95, 0.80, 1];
    light.position = [0, 0, 0];

    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,0,0)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    //translateLight.append(createSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    rootNode.append(rotateLight);
  }
  {
    let planetTextures = [resources.sunTex,  resources.planet1Tex, resources.planet2Tex, resources.planet3Tex, resources.planet4Tex, resources.planet5Tex, resources.planet6Tex];
    //initialize the sun and all Planets
    for(i = 0; i < planetSize.length; i++){
      var planet = new MaterialSGNode(
        new AdvancedTextureSGNode(planetTextures[i], new RenderSGNode(makeSphere(1, 30, 30)))
      );
      var  planetTransformationNode = new TransformationSGNode(mat4.create(), planet);
      if(i == 0){ //if planet is sun, we use special material values
        planet.ambient = [1.0, 1.0, 1.0, 1];
        planet.specular = [0.9, 0.9, 0.9, 1];
      }else{
        planet.ambient = [0.2, 0.2, 0.2, 1];
        planet.specular = [0.5, 0.5, 0.5, 1];
      }
      planet.diffuse = [0.2, 0.2, 0.2, 1];
      planet.shininess = 10.0;

      rootNode.append(planetTransformationNode);
      //save transformation nodes to update them later
      planetTransformationNodes.push(planetTransformationNode);
    }
  }
}

function updatePlanetTransformations(delta){
    timeSolar += delta;
    var timeMultiplier = timeSolar*0.005;
    for(i = 0; i < planetTransformationNodes.length; i++){
      var transformation = mat4.create();
      var scale = planetSize[i];
      var speedMultiplier = (planetTransformationNodes.length - i);
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(planetOrbitRotation[i]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(-(speedMultiplier*speedMultiplier*timeMultiplier)));
      transformation = mat4.multiply(mat4.create(), transformation, glm.translate(planetDistance[i], 0, 0));
      transformation = mat4.multiply(mat4.create(), transformation, glm.scale(scale, scale, scale));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(planetRotation[i]*timeMultiplier));
      planetTransformationNodes[i].matrix = transformation;
  }
}
