// TexturedQuad.js
// 顶点着色器程序
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec2 a_TexCoord;\n' +
'varying vec2 v_TexCoord;\n' +
'void main() {\n' +
'  gl_Position = a_Position;\n' +
'  v_TexCoord = a_TexCoord;\n' +
'}\n';

// 片元着色器程序
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  ' vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
  ' vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
  ' gl_FragColor = color0 * color1;\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.')
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if (!initTextures(gl, n)) {
    console.log('Failed to inialize the texture.');
    return;
  }
}

function initVertexBuffers(gl) {
  // 顶点坐标和纹理坐标
  var verticesTexCoords = new Float32Array([
    -0.5,   0.5,    0.0,    1.0,
    -0.5,   -0.5,   0.0,    0.0,
    0.5,    0.5,    1.0,    1.0,
    0.5,    -0.5,   1.0,    0.0,
  ]);
  var n = 4;

  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  // 将纹理坐标分配给a_TexCoord并开启
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }

  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}

// 配置和加载纹理
function initTextures(gl, n) {
  // 创建纹理对象
  var texture0 = gl.createTexture(); // 纹理对象
  var texture1 = gl.createTexture();

  if (!texture0) {
    console.log('Failed to create the texture object');
    return false;
  }

  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); // 着色器中uniform变量u_Sampler的存储位置
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }
  var image0 = new Image(); // 创建 Image 对象
  var image1 = new Image();
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }
  if (!image1) {
    console.log('Failed to create the iamge object');
    return false;
  }

  image0.onload = function() {
    loadTexture(gl, n, texture0, u_Sampler0, image0, 0)
  }
  image1.onload = function() {
    loadTexture(gl, n, texture1, u_Sampler1, image1, 1);
  }
  image0.src = '../resources/sky.jpg'; // 通知浏览器开始加载图像
  image1.src = '../resources/circle.gif';

  return true;
}

/**
 * 为WebGL配置纹理
 * @param {*} gl WebGL上下文
 * @param {*} n 绘制的顶点个数
 * @param {*} texture 纹理对象
 * @param {*} u_Sampler 片元着色器中纹理坐标
 * @param {*} image 纹理图片
 */
var g_texUnit0 = false, g_texUnit1 = false;
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// 对纹理图像进行y轴反转
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }
  // 绑定纹理对象 需要指定纹理类型 二维纹理 TEXTURE_2D 立方体纹理 TEXTURE_CUBE_MAP
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // 将纹理传递给着色器中的取样器变量
  gl.uniform1i(u_Sampler, texUnit);

  gl.clear(gl.COLOR_BUFFER_BIT);
  if (g_texUnit0 && g_texUnit1) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
}

