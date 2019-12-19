var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightDirection;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '   gl_Position = u_MvpMatrix * a_Position;\n' +
  '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '   float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  '   vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  '   vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  '   v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
  '}\n';

  var FSHADER_SOURCE = 
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders');
    return;
  }
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information.');
    return ;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightDirection || !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  // 设置光线颜色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // 设置光线的方向
  const lightDirection = new Vector3([0.0, 3.0, 4.0]);
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  // 设置环境光
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  const modelMatrix = new Matrix4();
  const mvpMatrix = new Matrix4();
  var normalMatrix = new Matrix4();

  modelMatrix.setTranslate(0, 0.9, 0);
  modelMatrix.rotate(90, 0, 0, 1);

  mvpMatrix.setPerspective(30, canvas.width/canvas.clientHeight, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
  // 矩形
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // const points = new Float32Array([
  //   1.0,  1.0,  1.0, // v0
  //   -1.0, 1.0,  1.0, // v1
  //   -1.0, -1.0, 1.0, // v2
  //   1.0, -1.0,  1.0, // v3
  //   1.0, -1.0, -1.0, // v4
  //   1.0, 1.0, -1.0,  // v5
  //   -1.0, -1.0, 1.0, // v6
  //   -1.0, -1.0,-1.0, // v7
  // ])
  // console.log('points', points);
  var vertices = new Float32Array([
    1.0,  1.0, 1.0,    -1.0, 1.0, 1.0,   -1.0, -1.0,  1.0,    1.0, -1.0, 1.0, // v0-v1-v2-v3 front
    1.0,  1.0, 1.0,    1.0, -1.0, 1.0,   1.0,  -1.0, -1.0,    1.0, 1.0, -1.0, // v0-v3-v4-v5 right
    1.0,  1.0, 1.0,    1.0, -1.0, 1.0,   -1.0, -1.0, 1.0,     -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,    -1.0, -1.0, 1.0,  -1.0, -1.0, -1.0,    -1.0, -1.0, 1.0,// v1-v6-v7-v2 left
    -1.0, -1.0,-1.0,   1.0, -1.0, -1.0,   1.0, -1.0,  1.0,    -1.0, -1.0, 1.0,// v7-v4-v3-v2 down
    1.0, -1.0, -1.0,   -1.0, -1.0,-1.0,   -1.0, -1.0, 1.0,    1.0, 1.0, -1.0,// v4-v7-v6-v5 back
  ])
  // 颜色
  var colors = new Float32Array([
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // front
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // right
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // up
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // left
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // down
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  // back
  ])

  // 法向量
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ])
// 索引
  var indices = new Uint8Array([
    0,  1,  2,    0,  2,  3,  // front
    4,  5,  6,    4,  6,  7,  // right
    8,  9,  10,   8,  10, 11, // up
    12, 13, 14,   12, 14, 15, // left
    16, 17, 18,   16, 18, 19, // down
    20, 21, 22,   20, 22, 23, // back
  ])

  if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -2;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -3;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -4
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length; 
}
/**
 * 设置缓冲区数据
 * @param {*} gl 
 * @param {*} attribute 目标位置名称
 * @param {*} data 数据
 * @param {*} num 偏移量
 */
function initArrayBuffer(gl, attribute, data, num) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}