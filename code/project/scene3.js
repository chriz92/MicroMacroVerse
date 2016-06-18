var atomDistance = new Float32Array([
0, 5, 6, 9, 16, 26, 28
]);
var atomOrbitRotation = new Float32Array([
0,10,15,-20,12,22,-25
]);
var atomRotation = new Float32Array([
0,10,15,-20,12,22,-25
]);
var atomSize = new Float32Array([3, 0.12, 0.20, 0.35, 0.36, 0.8, 0.72]);
var atomTransformationNodes = [];
    //var moons = new Float32Array([0, 0, 0, 1, 2, 67, 62, 27, 14]);

function createAtoms(rootNode, resources){
  {
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
    // Adding all atoms
    for(i = 0; i < atomSize.length; i++){
      var atom = new MaterialSGNode(
        new RenderSGNode(makeSphere(1, 30, 30))
      );
      var atomTransformationNode = new TransformationSGNode(mat4.create(), atom);
      if(i == 0){
        atom.ambient = [1.0, 1.0, 1.0, 1];
        atom.specular = [0.9, 0.9, 0.9, 1];
      }else{
        atom.ambient = [0.2, 0.2, 0.2, 1];
        atom.specular = [0.5, 0.5, 0.5, 1];
      }
      atom.diffuse = [0.2, 0.2, 0.2, 1];

      atom.shininess = 10.0;

      rootNode.append(atomTransformationNode);
      atomTransformationNodes.push(atomTransformationNode);
    }
  }
}

function updateAtomTransformations(timeInMilliseconds){
    var globalTimeMultiplier = timeInMilliseconds*0.005; //TODO: respect zoom level
    for(i = 0; i < atomTransformationNodes.length; i++){
    //for(i = 0; i < 2; i++){
      var transformation = mat4.create();
      var scale = atomSize[i];
      var speedMultiplier = (atomTransformationNodes.length - i);
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(atomOrbitRotation[i]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(-(speedMultiplier*speedMultiplier*globalTimeMultiplier)));
      transformation = mat4.multiply(mat4.create(), transformation, glm.translate(atomDistance[i], 0, 0));
      position = mat4.create();
      position[0] = 1;
      position[4] = 1;
      position[8] = 1;
      position[12] = 1;
      position = mat4.multiply(mat4.create(), position, transformation);
      transformation = mat4.multiply(mat4.create(), transformation, glm.scale(scale, scale, scale));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(atomRotation[i]*timeInMilliseconds));
      atomTransformationNodes[i].matrix = transformation;
  }
}
