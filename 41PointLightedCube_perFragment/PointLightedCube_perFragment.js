/**
 * 点光源
 * 通过顶点着色器中的处理方式实现点光源的效果
 * 每当新增一个点光源 就需要在片元着色器中对每一个片元进行颜色运算
 */
const VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // 顶点缓冲区
  'attribute vec4 a_Color;\n' + // 颜色缓冲区
  'attribute vec4 a_Normal;\n' + // 法向量缓冲区
  'uniform mat4 u_MvpMatrix;\n' + // 视图 投影 平移 变换矩阵  => 现实到虚拟
  'uniform mat4 u_ModelMatrix;\n' + // 模型变换矩阵 现实坐标内
  'uniform mat4 u_NormalMatrix;\n' + // 向量变换矩阵
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  ' gl_Position = u_MvpMatrix * a_Position;\n' + // 获取顶点的视图坐标
  ' v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  ' v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  ' v_Color = a_Color;\n' +
  '}\n';

const FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' + // 光线颜色
  'uniform vec3 u_LightPosition;\n' + // 光源位置 现实坐标
  'uniform vec3 u_AmbientLight;\n' + // 环境光颜色
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  ' vec3 normal = normalize(v_Normal);\n' + // 对发现进行归一化 因为其内插之后长度不一定是1.0
  ' vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' + // 计算光线方向并归一化
  ' float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  ' vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  ' vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  ' gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
  '}\n';

function main() {
  const canvas = document.getElementById('webgl');
  const gl = getWebGLContext(canvas);
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  const n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information', n);
    return;
  }
  // console.log('get n', n);
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 设置清空颜色
  gl.enable(gl.DEPTH_TEST); // 开启深度检测

  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.log('Failed to get the storage location');
    return;
  }

  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  const modelMatrix = new Matrix4();
  const mvpMatrix = new Matrix4();
  const normalMatrix = new Matrix4();

  modelMatrix.setRotate(90, 0, 1, 0); // 旋转 一个y轴角度
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  mvpMatrix.setPerspective(30, canvas.width/canvas.clientHeight, 1, 100);
  mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([
    2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
    2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
    2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
    2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1; // 设置顶点缓冲区
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -2; // 设置颜色缓冲区
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -3; // 设置法向量缓冲区

  gl.bindBuffer(gl.ARRAY_BUFFER, null); // 清空gl缓冲区
  // 设置索引缓冲区数据
  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -4
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

/**
 * 设置缓冲区的通用方法
 * @param {*} gl 
 * @param {*} attribute 
 * @param {*} data 
 * @param {*} num 
 * @param {*} type 
 */
function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}