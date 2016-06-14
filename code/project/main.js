//the OpenGL context
    var gl = null, program = null;
    var rootNode = null, envNode = null;
    var scene = 0;
    var globalTime;
    var sunTransformationNode = null;
    var context;
    var resources;
    var envcubetexture;
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
        x: -40,
        y: 0
      }
    };

    //load the shader resources using a utility function
    loadResources({
      vs: 'shader/empty.vs.glsl',
      fs: 'shader/empty.fs.glsl',
      tex_vs: 'shader/texture.vs.glsl',
      tex_fs: 'shader/texture.fs.glsl',
      env_vs: 'shader/envmap.vs.glsl',
      env_fs: 'shader/envmap.fs.glsl',
      sunTex: "textures/sun.jpg",
      planet1Tex: "textures/planet1.jpg",
      planet2Tex: "textures/planet2.jpg",
      planet3Tex: "textures/planet3.jpg",
      planet4Tex: "textures/planet4.jpg",
      planet5Tex: "textures/planet5.jpg",
      planet6Tex: "textures/planet6.jpg",
      env_pos_x: 'textures/Galaxy_RT.jpg',
      env_neg_x: 'textures/Galaxy_LT.jpg',
      env_pos_y: 'textures/Galaxy_DN.jpg',
      env_neg_y: 'textures/Galaxy_UP.jpg',
      env_pos_z: 'textures/Galaxy_FT.jpg',
      env_neg_z: 'textures/Galaxy_BK.jpg',
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
  initCubeMap(resources);
  gl.enable(gl.DEPTH_TEST);
  //compile and link shader program
  program = createProgram(gl, resources.vs, resources.fs);
  scene = 1;
  rootNode = new ShaderSGNode(createProgram(gl, resources.tex_vs, resources.tex_fs)); //TODO: global shaders (phong)
  //rootNode.append( new ShaderSGNode(createProgram(gl, resources.vs, resources.fs)));
  envNode = new ShaderSGNode(createProgram(gl, resources.env_vs, resources.env_fs));
  rootNode.append(envNode);
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

function initCubeMap(resources) {
  //create the texture
  envcubetexture = gl.createTexture();
  //define some texture unit we want to work on
  gl.activeTexture(gl.TEXTURE0);
  //bind the texture to the texture unit
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, envcubetexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT); //will be available in WebGL 2
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //set correct image for each side of the cube map
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);//flipping required for our skybox, otherwise images don't fit together
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_z);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_z);
  //generate mipmaps (optional)
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  //unbind the texture again
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

function initTextures(resources){
   planetTextures = [resources.sunTex,  resources.planet1Tex, resources.planet2Tex, resources.planet3Tex, resources.planet4Tex, resources.planet5Tex, resources.planet6Tex];
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
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  rootNode.render(context);
  //request another call as soon as possible
  requestAnimationFrame(render);
  //animate based on elapsed time
}

function createSphere(){
  //return //new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
    return new RenderSGNode(makeSphere(1,30,30));
  //]);
}

function createSolarSystem(resources, rootNode){
  {
    let skybox = new EnvironmentSGNode(envcubetexture, 0, false, new RenderSGNode(makeSphere(50,30,30)));
    envNode.append(skybox);
  }
  {
    //initialize light
    let light = new LightSGNode(); //use now framework implementation of light node
    light.ambient = [0.2, 0.2, 0.2, 1];
    light.diffuse = [0.8, 0.8, 0.8, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [0, 0, 0];

    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,-20,20)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    //translateLight.append(createSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    rootNode.append(rotateLight);
  }





  // Adding the Sun and all Planets
  for(i = 0; i < planetSize.length; i++){
  //for(i = 0; i < 1; i++){
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

class EnvironmentSGNode extends SGNode {

  constructor(envtexture, textureunit, doReflect , children ) {
      super(children);
      this.envtexture = envtexture;
      this.textureunit = textureunit;
      this.doReflect = doReflect;
  }

  render(context)
  {
    //set additional shader parameters
    let invView3x3 = mat3.fromMat4(mat3.create(), context.invViewMatrix); //reduce to 3x3 matrix since we only process direction vectors (ignore translation)
    gl.uniformMatrix3fv(gl.getUniformLocation(context.shader, 'u_invView'), false, invView3x3);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_texCube'), this.textureunit);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_useReflection'), this.doReflect)

    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envtexture);

    //render children
    super.render(context);

    //clean up
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}
