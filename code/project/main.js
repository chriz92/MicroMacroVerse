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
 var planetOrbitRotation = new Float32Array([
   0,10,15,-20,12,22,-25
 ]);
 var planetRotation = new Float32Array([
   0,10,15,-20,12,22,-25
 ]);
    var planetSize = new Float32Array([3, 0.12, 0.20, 0.35, 0.36, 0.8, 0.72]);
    var planetTransformationNodes = [];
    //var moons = new Float32Array([0, 0, 0, 1, 2, 67, 62, 27, 14]);

    const camera = {
      rotation: {
        x: 0,
        y: 0
      },
      pos:{
        x: 40,
        y: 0
      }
    };
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
  //rootNode.append( new ShaderSGNode(createProgram(gl, resources.vs, resources.fs)));
  switch(scene){
    case 1:
      createSolarSystem(resources, rootNode);
      break;
    case 2:
      break;
    case 3:
      break;
  }
  initInteraction(gl.canvas);
}
function initInteraction(canvas){
  const mouse = {
    pos:{x:0,y:0},
    leftButtonDown:false
  };
  function toPos(event){
    const rect = canvas.getBoundingClientRect();
    return{
      x: event.clientX- rect.left,
      y: event.clientY -rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event){
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event){
    const pos = toPos(event);
    const delta = {x:mouse.pos.x - pos.x, y:mouse.pos.y -pos.y};
    if(mouse.leftButtonDown){
      camera.rotation.x += delta.x;
      camera.rotation.y += delta.y;
    }
    mouse.pos = pos;
  });
canvas.addEventListener('mouseup', function(event){
  mouse.pos = toPos(event);
  mouse.leftButtonDown = false;
});
  document.addEventListener('keypress', function(event) {
    if(event.code == 'KeyR'){
      camera.rotation.x = 0;
      camera.rotation.y = 0;
    }
  });
  document.addEventListener('keypress', function(event) {
      if(event.code == 'KeyW'){
        camera.pos.x-= 1;
      }
    });
    document.addEventListener('keypress', function(event) {
        if(event.code == 'KeyS'){
          camera.pos.x+= 1;
        }
      });
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
  //let lookAtMatrix = mat4.lookAt(mat4.create(), [0,-40,4], [0,0,0], [0,1,0]);
  let lookAtMatrix = mat4.lookAt(mat4.create(),
                          [0,camera.pos.x,4],
                          [0,0,0],
                          [0,1,0]);
  let mouseRotateMatrix = mat4.multiply(mat4.create(),
                          glm.rotateX(camera.rotation.x *0.5),
                          glm.rotateY(camera.rotation.y *0.5));

  //context.projectionMatrix = mat4.perspective(mat4.create(), 30, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  //context.viewMatrix = mat4.lookAt(mat4.create(), [-0,-40,1], [0,0,0], [0,1,0]);
  context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);
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
      new RenderSGNode(makeSphere(1,30,30))
    ]);
  }

  // Adding the Sun and all Planets
  for(i = 0; i < planetSize.length; i++){
  //for(i = 0; i < 2; i++){
    planetTransformationNode = new TransformationSGNode(mat4.create(), createSphere());
    rootNode.append(planetTransformationNode);
    planetTransformationNode.append(createSphere());
    planetTransformationNodes.push(planetTransformationNode);
  }
}

function updatePlanetTransformations(timeInMilliseconds){
    var globalTimeMultiplayer = timeInMilliseconds*0.005; //TODO: respect zoom level
    for(i = 0; i < planetTransformationNodes.length; i++){
    //for(i = 0; i < 2; i++){
      var transformation = mat4.create();
      var scale = planetSize[i];
      var speedMultipler = (planetTransformationNodes.length - i);
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateZ(planetOrbitRotation[i]));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(-(speedMultipler*speedMultipler*globalTimeMultiplayer)));
      transformation = mat4.multiply(mat4.create(), transformation, glm.translate(planetDistance[i],0, 0));
      transformation = mat4.multiply(mat4.create(), transformation, glm.scale(scale, scale, scale));
      transformation = mat4.multiply(mat4.create(), transformation, glm.rotateY(planetRotation[i]*timeInMilliseconds));
      planetTransformationNodes[i].matrix = transformation;
  }
}
