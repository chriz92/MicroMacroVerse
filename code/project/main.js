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
    var planetPosition = new Float32Array([
   0,0,0,
   3,0,0,
   6,0,0,
   9,0,0,
   16,0,0,
   26,0,0,
   40,0,0
 ]);
 var planetRotation = new Float32Array([
   0,0,0,
   30,10,30,
   21,12,10,
   9,15,7,
   16,5,22,
   40,0,20,
   23,23,20,
 ]);

    var planetSize = new Float32Array([2, 0.12, 0.20, 0.35, 0.36, 1.2, 0.90]);

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

  sunTransformationNode.matrix = glm.rotateY(-timeInMilliseconds*0.05);
  const context = createSGContext(gl);
  //context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  context.viewMatrix = mat4.lookAt(mat4.create(), [-5,-25,-50], [0,0,0], [0,1,0]);
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
  sunTransformationNode = new TransformationSGNode(mat4.create(), createSphere());
  rootNode.append(sunTransformationNode);
  //sphereNode = createSphere();

  // Planets
  for(i = 1; i < planetSize.length; i++){
    var scale = planetSize[i];
    var planetTransformationMatrix = mat4.multiply(mat4.create(), mat4.create(), glm.rotateX(planetRotation[i*3]));
    planetTransformationMatrix = mat4.multiply(mat4.create(), planetTransformationMatrix, glm.rotateY(planetRotation[i*3+1]));
    planetTransformationMatrix = mat4.multiply(mat4.create(), planetTransformationMatrix, glm.rotateZ(planetRotation[i*3+2]));
    planetTransformationMatrix = mat4.multiply(mat4.create(), planetTransformationMatrix, glm.translate(planetPosition[i*3],planetPosition[i*3 + 1], planetPosition[i*3 + 2]));
    planetTransformationMatrix = mat4.multiply(mat4.create(), planetTransformationMatrix, glm.scale(scale, scale, scale));
    planetTransformationNode = new TransformationSGNode(planetTransformationMatrix);
    sunTransformationNode.append(planetTransformationNode);
    //sphereNode = new SphereRenderNode();
    planetTransformationNode.append(createSphere());
  }
}
