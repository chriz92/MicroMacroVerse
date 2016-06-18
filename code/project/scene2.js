

function makePlane(width, height){

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var i = 0; i <= height; i++) {
      for (var j = 0; j <= width; j++) {
        var x = 2*(i / height) - 1;
        var y = 2*(j / width) - 1;
        var u = 1 - y;
        var v = 1 - x;

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
      index: indexData //1
    };
    }

function createEarth(rootNode, resources){
  var hmapNode = new ShaderSGNode(createProgram(gl, resources.hmap_vs, resources.hmap_fs));
  rootNode.append(hmapNode);

  {
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

    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,20,0)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    //translateLight.append(makeSphere(1,10,10)); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    rootNode.append(rotateLight);
  }

  {
    var earth = new MaterialSGNode(
       new TextureHeightmapSGNode(resources.grass,resources.hmap,[16,16],
         new RenderSGNode(makePlane(200,200))
       )
     );
    var earthTransform = new TransformationSGNode( glm.transform({translate: [0,0, 0], rotateX : 90, rotateZ : 90, scale: 20.0 }), earth);
    earth.ambient = [0.2, 0.2, 0.2, 1];
    earth.diffuse = [0.2, 0.2, 0.2, 1];
    earth.specular = [0.5, 0.5, 0.5, 1];
    earth.shininess = 10.0;
    hmapNode.append(earthTransform);
  }
}
