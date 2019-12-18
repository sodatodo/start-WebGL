// PerspectiveView.js
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '   gl_Position = u_MvpMatrix * a_Position;\n' +
  ' v_Color = a_Color;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  ' gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  gl.clearColor(0, 0, 0, 1);
  
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  
  var viewMatrix = new Matrix4(); // 视图矩阵
  var projMatrix = new Matrix4(); // 投影矩阵
  var modelMatrix = new Matrix4(); // 平移矩阵
  var mvpMatrix = new Matrix4(); // 联合矩阵
  
  
  modelMatrix.setTranslate(0.75, 0, 0); 
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0); 
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100); 
  
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  
  gl.enable(gl.DEPTH_TEST); // 开启隐藏面消除功能
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 同时清理颜色缓冲区和深度缓冲区

  gl.drawArrays(gl.TRIANGLES, 0, n);

  modelMatrix.setTranslate(-0.75, 0, 0);

  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    0.0,   1.0,    0.0,    0.4,    0.4,    1.0,
    -0.5,   -1.0,   0.0,    0.4,    0.4,    1.0,
    0.5,   -1.0,   0.0,    1.0,    0.4,    0.4,
    
    0.0,   1.0,    -2.0,   1.0,    1.0,    0.4,
    -0.5,   -1.0,   -2.0,   1.0,    1.0,    0.4,
    0.5,   -1.0,   -2.0,   1.0,    0.4,    0.4,
    
    0.0,   1.0,    -4.0,   0.4,    1.0,    0.4,
    -0.5,   -1.0,   -4.0,   0.4,    1.0,    0.4,
    0.5,   -1.0,   -4.0,   1.0,    0.4,    0.4,
  ])
  var n = 9;
  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var vertexColorbuffer = gl.createBuffer();
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Positon');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return n;
}