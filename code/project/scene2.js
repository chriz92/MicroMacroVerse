
var birdTransformations = [];
var birdTextures = [];
var oldAngle = 0;
var rnd = 0;
var timeEarth = 0;
var birdAngle;

function createBird(){
  var bird = new MaterialSGNode();
  bird.ambient = [0.2, 0.2, 0.2, 1];
  bird.specular = [0.5, 0.5, 0.5, 1];
  bird.diffuse = [0.2, 0.2, 0.2, 1];
  bird.shininess = 10.0;
  var birdTransformation = new TransformationSGNode(glm.transform({translate: [0, -10, 0], scale: 0.5}));
  birdTransformations.push(birdTransformation);
  //bird head
  var birdhead = new AdvancedTextureSGNode(birdTextures[0], new RenderSGNode(makeSphere(1, 30, 30)));
  var birdheadTransform = new TransformationSGNode( glm.transform({translate: [0, -0.03, 0.75], rotateX: -20 ,scale: [0.20,0.20,0.4] }), birdhead);
  bird.append(birdheadTransform);

  //bird torso
  var birdtorso = new AdvancedTextureSGNode(birdTextures[0], new RenderSGNode(makeSphere(1, 30, 30)));
  var birdtorsoTransform = new TransformationSGNode( glm.transform({translate: [0, 0, 0], scale: [0.43,0.23,0.7] }), birdtorso);
  bird.append(birdtorsoTransform);

  //bird feet
  var birdfoot = new AdvancedTextureSGNode(birdTextures[1], new RenderSGNode(makeSphere(1, 30, 30)));
  var birdfootTransform = new TransformationSGNode( glm.transform({translate: [0, 0.15, -0.22], scale: [0.25,0.20,0.35] }), birdfoot);
  for(i = -1; i < 2; i += 2){
    var transform = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(0.3*i, 0, 0), birdfootTransform.matrix), birdfootTransform);
    bird.append(transform);
  }

  //bird wing
  var birdwing = new AdvancedTextureSGNode(birdTextures[0], new RenderSGNode(makeSphere(1, 30, 30)));
  var birdwingTransform = new TransformationSGNode( glm.transform({rotateY: 0, rotateX: 0, scale: [0.85,0.2,0.5] }), birdwing);
  for(i = -1; i < 2; i += 2){
    var transform = new TransformationSGNode(mat4.multiply(mat4.create(), glm.translate(0.5*i, 0, 0.4), birdwingTransform.matrix), birdwingTransform);
    bird.append(transform);
    birdTransformations.push(transform);
  }
  //bird peak

  birdTransformation.append(bird);
  return birdTransformation;
}

/// creates new plane with width x height vertices
function makePlane(width, height){
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var i = 0; i <= height; i++) {
      for (var j = 0; j <= width; j++) {
        //vertex positions rangeing from -1 to 1
        var x = 2*(i / height) - 1;
        var y = 2*(j / width) - 1;
        //texture coordinates rangeing from 0 to 1
        var u = i/height;
        var v = j/width;

        normalData.push(0);
        normalData.push(0);
        normalData.push(1);
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(x);
        vertexPositionData.push(y);
        vertexPositionData.push(0);
      }
    }
    var indexData = [];
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var first = (i * (width + 1)) + j;
        var second = first + width + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);
        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
    return {
      position: vertexPositionData,
      normal: normalData,
      texture: textureCoordData,
      index: indexData
    };
    }

function createEarth(rootNode, resources){
  //initialize heightmap shader
  var hmapNode = new ShaderSGNode(createProgram(gl, resources.hmap_vs, resources.hmap_fs));
  rootNode.append(hmapNode);

  {
    //initialize skybox
    let envNode = new ShaderSGNode(createProgram(gl, resources.env_vs, resources.env_fs));
    rootNode.append(envNode);
    let texture = createCubeMap(resources.day_px, resources.day_nx, resources.day_py, resources.day_ny, resources.day_pz, resources.day_nz);
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
    //light.direction = [0, 1 , 0];
    //light.cutoff = 35;
    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(-34,-35,0)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    rootNode.append(rotateLight);
    hmapNode.append(rotateLight);
  }

  {
    //initialize earth surface with heightmap
    var earth = new MaterialSGNode(
       new HeightmapSGNode(resources.grass,resources.hmap,[10,10],
         new RenderSGNode(makePlane(40,40))
       )
     );
    var earthTransform = new TransformationSGNode( glm.transform({translate: [0,0, 0], rotateX : 90, rotateZ : 90, scale: 20.0 }), earth);
    earth.ambient = [0.2, 0.2, 0.2, 1];
    earth.diffuse = [0.2, 0.2, 0.2, 1];
    earth.specular = [0.5, 0.5, 0.5, 1];
    earth.shininess = 10.0;
    hmapNode.append(earthTransform);
  }

  //add bird texture to an array
  birdTextures.push(resources.birdfeather)
  birdTextures.push(resources.birdskin)

  {
    for(i = 0; i < 3; i++){
      var bird = createBird();
      rootNode.append(bird);
      rootNode.append(new TransformationSGNode(glm.transform({translate: [7,-3,-3], rotateY: 280}), bird));
      rootNode.append(new TransformationSGNode(glm.transform({translate: [-5,2,5], rotateY: 140}), bird));
    }
  }
}

function updateBirdTransformation(delta){
  timeEarth+= delta;
  rnd += delta;
  if(rnd > 6000){
    rnd = 0;
    birdAngle = 90 * Math.random();
  }
  var angle = 0;
  var birdTrans = birdTransformations[0];
  if(birdAngle > 0 && rnd < 1000){
    angle = birdAngle / 1000 * delta;
    birdTrans.matrix = mat4.multiply(mat4.create(), birdTrans.matrix, glm.rotateY(angle));
  }
  birdTrans.matrix = mat4.multiply(mat4.create(), birdTrans.matrix, glm.translate(0,0,0.001*delta));

  var wingA = birdTransformations[1];
  var wingB = birdTransformations[2];
  angle = 15 * Math.sin(timeEarth/300.0);
  wingA.matrix = mat4.multiply(mat4.create(), glm.rotateZ(oldAngle - angle), wingA.matrix);
  wingB.matrix = mat4.multiply(mat4.create(), glm.rotateZ(angle - oldAngle), wingB.matrix);
  oldAngle = angle;
}
