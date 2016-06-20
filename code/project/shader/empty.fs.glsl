/**
 * empty basic fragment shader
 */

//need to specify how "precise" float should be
precision mediump float;
 uniform vec4 u_forceColor;

//entry point again
void main() {
  gl_FragColor = u_forceColor;
}
