//the OpenGL context
    var gl = null, text = null;
    var rootNode = null
    var context;
    var resources;
    var envcubetexture;
    var animatedAngle = 0;
    var globalTime = 0;
    var animationTime = 0;
    var reverseTime = 0;
    var scene = 0;
    var scenePositions = [
      [-60, 0, 60],
      [0,0,60],
      [60,0,60]
    ]
    var sceneViewPoint =[
      [-60, 0, 42],
      [0,-10,60],
      [60,-10,50]
    ]

    const camera = {
      rotation: {
        x: 0,
        y: 0
      },
      position: [0,0,10],
      velocity: 0,
      isAccelerating: false,
      animatedMode: true
    };

    //load the shader resources using a utility function
    loadResources({
      vs: 'shader/empty.vs.glsl',
      fs: 'shader/empty.fs.glsl',
      tex_vs: 'shader/texture.vs.glsl',
      tex_fs: 'shader/texture.fs.glsl',
      env_vs: 'shader/envmap.vs.glsl',
      env_fs: 'shader/envmap.fs.glsl',
      hmap_vs: 'shader/hmap.vs.glsl',
      hmap_fs: 'shader/hmap.fs.glsl',
      color_vs: 'shader/color.vs.glsl',
      color_fs: 'shader/color.fs.glsl',
      sunTex: "textures/sun.jpg",
      planet1Tex: "textures/planet1.jpg",
      planet2Tex: "textures/planet2.jpg",
      planet3Tex: "textures/planet3.jpg",
      planet4Tex: "textures/planet4.jpg",
      planet5Tex: "textures/planet5.jpg",
      planet6Tex: "textures/planet6.jpg",
      uni_px: 'textures/purplenebula_rt.jpg',
      uni_nx: 'textures/purplenebula_lf.jpg',
      uni_py: 'textures/purplenebula_dn.jpg',
      uni_ny: 'textures/purplenebula_up.jpg',
      uni_pz: 'textures/purplenebula_ft.jpg',
      uni_nz: 'textures/purplenebula_bk.jpg',
      day_px: 'textures/day_rt.bmp',
      day_nx: 'textures/day_lf.bmp',
      day_py: 'textures/day_dn.bmp',
      day_ny: 'textures/day_up.bmp',
      day_pz: 'textures/day_ft.bmp',
      day_nz: 'textures/day_bk.bmp',
      hmap: 'textures/hmap.png',
      grass:'textures/grass.jpg',
      bird: 'textures/bird.jpg',
      birdfeather: 'textures/birdfeather.jpg',
      noise: 'textures/noise.jpg'
    }).then(function (resources /*an object containing our keys with the loaded resources*/) {
      init(resources);
      //render one frame
      render(0);
    });


function getActiveScene(){
      active = [Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE];
      position = camera.position;
      active = -1;
      for(i = 0; i < scenePositions.length; i++){
        pos = scenePositions[i];
        dist = Math.sqrt(Math.pow(position[0] - pos[0] , 2) + Math.pow(position[1] - pos[1] , 2) + Math.pow(position[2] - pos[2] , 2)) - 30;
        if(dist < 0) active = i;
      }
      return active;
    }


function updateCamera(context, delta){

  if(camera.animatedMode){
    if(animationTime < 12000){
      camera.rotation.x -= 0.0001*delta;
      if(animationTime < 6000){
        camera.rotation.y += 0.001*delta;

      }

      if(animationTime >= 6000){
        camera.rotation.y -= 0.002*delta;

      }
      if(animationTime > 10000){
        animationTime = 0;
        if(scene < 2){
            scene += 1;
        }
        else{
            scene = 0;
        }
        camera.position = sceneViewPoint[scene];
        if(scene == 3){
          camera.rotation.y -=20;
        }
      }
    }
    //distance = camera.velocity * delta;
    //camera.position = camera.position.map((x,i) => x + (direction[i] * distance));
    //direction = camera.position.map((x,i) => x + direction[i]);
    let lookAtMatrix = mat4.lookAt(mat4.create(),
                          camera.position,
                          scenePositions[0],
                          [0,1,0]);
    let mouseRotateMatrix = mat4.multiply(mat4.create(),
                          glm.rotateX(camera.rotation.x),
                          glm.rotateY(camera.rotation.y));
    context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  }
  else{
    if(camera.isAccelerating == 0){
      if (camera.velocity > 0){
			   camera.velocity -= 0.0009 * delta;
			   camera.velocity = Math.max(camera.velocity, 0);
		  }
		  else{
			   camera.velocity += 0.0009 * delta;
			   camera.velocity = Math.min(camera.velocity, 0);
		  }
    } else{
      camera.velocity += camera.isAccelerating * 0.0004 * delta;
      camera.velocity = Math.max(Math.min(camera.velocity, 0.025), -0.025)
      camera.isAccelerating = 0;
    }

    direction = [
      Math.cos(camera.rotation.y) * Math.sin(camera.rotation.x),
      Math.sin(camera.rotation.y),
      Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)
    ];
    distance = camera.velocity * delta;
    camera.position = camera.position.map((x,i) => x + (direction[i] * distance));
    direction = camera.position.map((x,i) => x + direction[i]);
    let lookAtMatrix = mat4.lookAt(mat4.create(),
                          camera.position,
                          direction,
                          [0,1,0]);
    context.viewMatrix = lookAtMatrix;
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  }
}


/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext();
  //create a 2D context
  text = create2DContext();

  gl.enable(gl.DEPTH_TEST);
  //compile and link shader program
  rootNode = new ShaderSGNode(createProgram(gl, resources.tex_vs, resources.tex_fs)); //TODO: global shaders (phong)
  //rootNode.append( new ShaderSGNode(createProgram(gl, resources.vs, resources.fs)));
  solarsystemNode = new TransformationSGNode(glm.transform({translate: scenePositions[0]}));
  earthNode = new TransformationSGNode(glm.transform({translate: scenePositions[1]}));
  atomNode = new TransformationSGNode(glm.transform({translate: scenePositions[2]}));
  createSolarSystem(solarsystemNode, resources);
  createEarth(earthNode, resources);
  createAtoms(atomNode, resources);
  updatePlanetTransformations(0);
  updateBirdTransformation(0);
  updateAtomTransformations(0);
  rootNode.append(solarsystemNode);
  rootNode.append(earthNode);
  rootNode.append(atomNode);
  initInteraction(gl.canvas);
}

function createCubeMap(pos_x, neg_x, pos_y, neg_y, pos_z, neg_z) {
  //create the texture
  var texture = gl.createTexture();
  //define some texture unit we want to work on
  gl.activeTexture(gl.TEXTURE0);
  //bind the texture to the texture unit
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT); //will be available in WebGL 2
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //set correct image for each side of the cube map
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);//flipping required for our skybox, otherwise images don't fit together
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pos_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, neg_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pos_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, neg_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pos_z);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, neg_z);
  //generate mipmaps (optional)
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  //unbind the texture again
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  return texture;
}


/**
 * render one frame
 */
function render(timeInMilliseconds) {
  checkForWindowResize(gl);
  var delta = timeInMilliseconds - globalTime;
  globalTime = timeInMilliseconds;

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  text.clearRect(0, 0, text.canvas.width, text.canvas.height);
  const context = createSGContext(gl);
  //sunTransformationNode.matrix = glm.rotateY(-timeInMilliseconds*0.05);
  let active = getActiveScene();

  if(active != -1){
    animationTime += delta;
    if(active == 0)
      updatePlanetTransformations(delta);
    else if(active == 1)
      updateBirdTransformation(delta);
    else if(active == 2)
      updateAtomTransformations(delta);
  }
  updateCamera(context, delta);

  rootNode.render(context);
  //request another call as soon as possible
  fps = 1000 / delta;
  text.fillText(Math.round(fps).toString(), 50, 50);
  requestAnimationFrame(render);
  //animate based on elapsed time
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

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); //TODO: delete

    //render children
    super.render(context);

    gl.cullFace(gl.BACK); //delete
    gl.disable(gl.CULL_FACE);
    //clean up
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}

class TextureHeightmapSGNode extends SGNode {
  constructor(texture, heightmap,ratio, children ) {
      super(children);
      this.texture = texture;
      this.heightmap = heightmap;
      this.textureId = -1;
      this.heightmapId= -1;
      this.ratio = ratio;
  }

  init(gl)
  {
    this.textureId = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT || gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.heightmapId = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.heightmapId);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT || gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.heightmap);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  render(context)
  {
    if(this.textureId == -1){
      this.init(context.gl);
    }
    //tell shader to use our texture
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);
    //set additional shader parameters
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), 0);
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_heightmap'), 1);
    gl.uniform2f(gl.getUniformLocation(context.shader, 'u_hmapSize'), this.heightmap.width, this.heightmap.height)
    var wratio = this.heightmap.width / this.texture.width;
    var hratio = this.heightmap.height /this.texture.height;
    gl.uniform2f(gl.getUniformLocation(context.shader, 'u_ratio'), this.ratio[0] , this.ratio[1]);

    //Texture0 buffer
    //Texture1

    //activate/select texture unit and bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textureId);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.heightmapId);

    //render children
    super.render(context);

    //clean up
    gl.activeTexture(gl.TEXTURE1); //set active texture unit since it might have changed in children render functions
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.activeTexture(gl.TEXTURE0); //set active texture unit since it might have changed in children render functions
    gl.bindTexture(gl.TEXTURE_2D, null);

    //disable texturing in shader
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
  }
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
    if(!camera.animatedMode && mouse.leftButtonDown){
      //var new_x = camera.rotation.x - 0.01 * delta.x
      //var new_y = camera.rotation.y - 0.01 * delta.x
      camera.rotation.x -= 0.01 * delta.x;
      camera.rotation.y += 0.01 * delta.y;
    }
    mouse.pos = pos;
  });
canvas.addEventListener('mouseup', function(event){
  mouse.pos = toPos(event);
  mouse.leftButtonDown = false;
});
  document.addEventListener('keypress', function(event) {
    if(event.code == 'KeyC'){
      camera.rotation = {x: 0, y: 0};
      camera.animatedMode = !camera.animatedMode;

      if(camera.animatedMode){
        animationTime = 0;
        camera.position = [-60, 0, 42];
        //camera.position = scenePositions[3];
      }
      else{
        animationTime = 0;
        camera.position = [0,0,10];
      }
    }
  });


  document.addEventListener('keypress', function(event) {
      if(!camera.animatedMode && event.code == 'KeyW'){
        camera.isAccelerating = 1;
        //if(camera.velocity < 10) camera.velocity += 0.01;
      }
    });
  document.addEventListener('keypress', function(event) {
      if(!camera.animatedMode && event.code == 'KeyS'){
        camera.isAccelerating = -1;
        //if(camera.velocity > -10) camera.velocity -= 0.01;
      }
  });
}
