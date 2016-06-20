var colorNode = null;
var atomXDistance;
var atomYDistance;
var atomOrbitRotation;
var atomRotation;
var atomSize;
var atomTransformationNodes = [];
var neutronColor = [0,0,1,1];
var protonColor = [1,0,0,1];
var electronColor = [1,1,0,1];
var atomColors;
var secondLayer = 11;
var coreLayer =10;
var timeAtom = 0;

function createAtoms(rootNode, resources){
  {
    colorNode = new ShaderSGNode(createProgram(gl,resources.color_vs, resources.color_fs));
    rootNode.append(colorNode);
  }

  {
    //initialize skybox
    let envNode = new ShaderSGNode(createProgram(gl, resources.env_vs, resources.env_fs));
    rootNode.append(envNode);
    let texture = createCubeMap(resources.noise, resources.noise, resources.noise, resources.noise, resources.noise, resources.noise);
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

    var rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,0,0)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    //translateLight.append(createSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    //rootNode.append(rotateLight);
  }
    createNeutrogenAtom();
  {
    // Adding all atoms
    for(i = 0; i < atomSize.length; i++){
        var atom = new SetUniformSGNode("u_forceColor", atomColors[i]);
      var atomTransformationNode = new TransformationSGNode(mat4.create(), atom);

      atom.ambient = [1.0, 1.0, 1.0, 1];
      atom.specular = [0.9, 0.9, 0.9, 1];
      atom.diffuse = [0.2, 0.2, 0.2, 1];
      atom.shininess = 10.0;

      colorNode.append(atomTransformationNode);
      let sphere = atomTransformationNode.append(new MaterialSGNode(new RenderSGNode(makeSphere(1, 30, 30))));
      //initialize light
      if(i > 9){
        let light = new LightSGNode(); //use now framework implementation of light node#
        let index = i - 10;
        if(i > 0)
          light.uniform = 'u_light' + (index + 1);
        light.ambient = [1.0, 1.0, 1.0, 1];
        light.diffuse = [0.8, 0.72, 0.68, 1];
        light.specular = [1, 0.95, 0.80, 1];
        light.position = [0, 0, 0];
        atomTransformationNode.append(light);
        atomTransformationNode.append(new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), new RenderSGNode(makeSphere(1, 30, 30))));
      }
      else{
        atomTransformationNode.append(sphere);
      }
      atomTransformationNodes.push(atomTransformationNode);
    }

    //add nucleus
    let nucleus = new MaterialSGNode(new AdvancedTextureSGNode(resources.nucleus, new RenderSGNode(makeSphere(5, 30, 30))));
    nucleus.ambient = [1.0, 1.0, 1.0, 1];
    nucleus.specular = [0.9, 0.9, 0.9, 1];
    nucleus.diffuse = [0.2, 0.2, 0.2, 1];
    nucleus.shininess = 10.0;
    rootNode.append(nucleus);
  }
}

const proton = {
  size: 2,
  color:[1,0,0,1]
};
const neutron = {
  size: 2,
  color:[0,0,1,1]
};
const electron = {
  size: 1,
  color:[1,1,0,1]
};
function createNeutrogenAtom()
{
    atomColors =[proton.color,proton.color,proton.color,proton.color,proton.color,
                 neutron.color, neutron.color, neutron.color,neutron.color,neutron.color,
                 electron.color, electron.color, electron.color, electron.color, electron.color, electron.color, electron.color
                ];

   atomYDistance = new Float32Array([1,-1.5,2,0,1.5, -1,2,1,0,0, 0,0,0,0,0,0,0,0]);
   atomXDistance = new Float32Array([0,0.5,1,1.5,2, 2,1,0,-1,-2, 15,15, 20,20,20,20,20,0]);
   atomOrbitRotation = new Float32Array([0,1,0,0,0, 0,0,0,0,0, 22,25, 21,20,18,17,16,0]);
   atomRotation = new Float32Array([0,0,0,0,0,0,0,0,0,0, 20,20, 20,20,20,20,20,0]);
   atomSize =
      new Float32Array([proton.size,proton.size,proton.size,proton.size,proton.size,
                        neutron.size,neutron.size,neutron.size,neutron.size,neutron.size,
                        electron.size,electron.size,electron.size,electron.size,electron.size,electron.size,electron.size
                       ]);
}

function updateAtomTransformations(delta){
    timeAtom += delta;
    var globalTimeMultiplier = timeAtom*0.005;
    for(i = 0; i < atomTransformationNodes.length; i++){
      var transformation = mat4.create();
      var scale = atomSize[i];
      var speedMultiplier = (atomTransformationNodes.length - i);
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(atomOrbitRotation[i]));
      if(scale == 1){
        if(i >secondLayer)
        {
          speedMultiplier = 3+i/4;
          transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(-(speedMultiplier*speedMultiplier*globalTimeMultiplier)));
        }
        else
        {
          speedMultiplier = 3+i/4;
          transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(-(speedMultiplier*speedMultiplier*globalTimeMultiplier)));
        }
      }
      transformation = mat4.multiply(mat4.create(), transformation, glm.translate(atomXDistance[i], atomYDistance[i], 0));
      position = mat4.create();
      position[0] = 1;
      position[4] = 1;
      position[8] = 1;
      position[12] = 1;
      position = mat4.multiply(mat4.create(), position, transformation);
      transformation = mat4.multiply(mat4.create(), transformation, glm.scale(scale, scale, scale));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(atomRotation[i]*timeAtom));
      atomTransformationNodes[i].matrix = transformation;
  }
}
