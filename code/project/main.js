//the OpenGL context
    var gl = null, program = null;
    var rootNode = null;
    var scene = 0;
    var globalTime;
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
    var planetTextures = null;
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

    //load the shader resources using a utility function
    loadResources({
      vs: 'shader/empty.vs.glsl',
      fs: 'shader/empty.fs.glsl',
      tex_vs: 'shader/texture.vs.glsl',
      tex_fs: 'shader/texture.fs.glsl',
      sunTex: "textures/sun.jpg",
      planet1Tex: "textures/planet1.jpg",
      planet2Tex: "textures/planet2.jpg",
      planet3Tex: "textures/planet3.jpg",
      planet4Tex: "textures/planet4.jpg",
      planet5Tex: "textures/planet5.jpg",
      planet6Tex: "textures/planet6.jpg"
    }).then(function (resources /*an object containing our keys with the loaded resources*/) {
      init(resources);
      //render one frame
      render(0);
    });


/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext();

  initTextures(resources);

  gl.enable(gl.DEPTH_TEST);
  //compile and link shader program
  program = createProgram(gl, resources.vs, resources.fs);
  scene = 1;
  rootNode = new ShaderSGNode(createProgram(gl, resources.tex_vs, resources.tex_fs)); //TODO: global shaders (phong)
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

function initTextures(resources){
   planetTextures = [resources.sunTex,  resources.planet1Tex, resources.planet2Tex, resources.planet3Tex, resources.planet4Tex, resources.planet5Tex, resources.planet6Tex];
  //planetTextures = [initTexture(resources.sunTex),  initTexture(resources.planet1Tex), initTexture(resources.planet2Tex), initTexture(resources.planet3Tex),
  //   initTexture(resources.planet4Tex), initTexture(resources.planet5Tex), initTexture(resources.planet6Tex)];

}

function initTexture(resource)
{
  elementTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, elementTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
  0, //level of detail level (default 0)
  gl.RGBA, //internal format of the data in memory
  gl.RGBA, //image format (should match internal format)
  gl.UNSIGNED_BYTE, //image data type
  resource); //actual image data
  gl.bindTexture(gl.TEXTURE_2D, null);
  return elementTexture;
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


function createSolarSystem(resources, rootNode){
  {
    //initialize light
    let light = new LightSGNode(); //use now framework implementation of light node
    light.ambient = [0.2, 0.2, 0.2, 1];
    light.diffuse = [0.8, 0.8, 0.8, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [0, 0, 0];

    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,-10,10)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    translateLight.append(createSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    rootNode.append(rotateLight);
  }

  function createSphere(){
    //return //new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
      return new RenderSGNode(makeSphere(1,30,30));
    //]);
  }

  // Adding the Sun and all Planets
  //for(i = 0; i < planetSize.length; i++){
  for(i = 0; i < 1; i++){
    var planet = new MaterialSGNode(
      new AdvancedTextureSGNode(planetTextures[i], createSphere())
    );
    var  planetTransformationNode = new TransformationSGNode(mat4.create(), planet);
    planet.ambient = [0, 0, 0, 1];
    planet.diffuse = [0.1, 0.1, 0.1, 1];
    planet.specular = [0.5, 0.5, 0.5, 1];
    planet.shininess = 50.0;

    rootNode.append(planetTransformationNode);
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
