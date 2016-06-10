//the OpenGL context
    var gl = null, program = null;
    var rootNode = null;
    var scene = 0;
    var globalTime;
    var globalResources = null;
    var sunTransformationNode = null;
    var context;
    var resources;
    var animatedAngle = 0;
    var planetDistance = new Float32Array([
   0, 5, 6, 9, 16, 26, 40
 ]);
 var planetRotation = new Float32Array([
   0,0,0,
   0,0,90,
   0,0,-45,
   0,75,7,
   0,280,22,
   -30,210,20,
   0,300,20,
 ]);

    var planetSize = new Float32Array([2, 0.12, 0.20, 0.35, 0.36, 1.2, 0.90]);
    var planetTransformationNodes = [];
    //var moons = new Float32Array([0, 0, 0, 1, 2, 67, 62, 27, 14]);

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  globalResources = resources;
  //create a GL context
  gl = createContext();
  gl.enable(gl.DEPTH_TEST);
  //compile and link shader program
  program = createProgram(gl, resources.vs, resources.fs);
  scene = 1;
  rootNode = new SGNode(); //TODO: global shaders (phong)

  switch(scene){
    case 1:
      createSolarSystem(resources, rootNode);
      break;
    case 2:
      break;
    case 3:
      break;
  }
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  checkForWindowResize(gl);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //sunTransformationNode.matrix = glm.rotateY(-timeInMilliseconds*0.05);
  updatePlanetTransformations(timeInMilliseconds);
  const context = createSGContext(gl);
  //context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  context.viewMatrix = mat4.lookAt(mat4.create(), [-0,-40,1], [0,0,0], [0,1,0]);
  rootNode.render(context);
  //request another call as soon as possible
  requestAnimationFrame(render);

  //animate based on elapsed time
}

//load the shader resources using a utility function
loadResources({
  vs: 'shader/empty.vs.glsl',
  fs: 'shader/empty.fs.glsl'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);
  //render one frame
  render(0);
});

function createSolarSystem(resources, rootNode){
  function createSphere(){
    return new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
      new RenderSGNode(makeSphere(1,100,100))
    ]);
  }
  // Sun
  //sunTransformationNode = new TransformationSGNode(mat4.create(), createSphere());
  //rootNode.append(sunTransformationNode);
  //planetTransformationNodes.push(sunTransformationNode);
  // Planets
  for(i = 0; i < planetSize.length; i++){
  //for(i = 1; i < 2; i++){
    planetTransformationNode = new TransformationSGNode(mat4.create(), createSphere());
    rootNode.append(planetTransformationNode);
    planetTransformationNode.append(createSphere());
    planetTransformationNodes.push(planetTransformationNode);
  }
}

function updatePlanetTransformations(timeInMilliseconds){
    for(i = 0; i < planetSize.length; i++){
    var transformation = mat4.create();
      var scale = planetSize[i];
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateX(planetRotation[i*3]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(planetRotation[i*3+1]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(planetRotation[i*3+2]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(timeInMilliseconds*-0.03))
      transformation = mat4.multiply(mat4.create(), transformation, glm.translate(planetDistance[i],0, 0));
      transformation = mat4.multiply(mat4.create(), transformation, glm.scale(scale, scale, scale));
      planetTransformationNodes[i].matrix = transformation;
  }
}
