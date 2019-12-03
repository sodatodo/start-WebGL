// RotatedTriangle_Matrix.js
// 顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  'gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

// var VSHADER_SOURCE =
//   //x' = x cos b - y sin b
//   //y' = x sin b + y cosb
//   //z' = z
//   'attribute vec4 a_Position;\n' +
//   'uniform float u_CosB, u_SinB;\n' +
//   'void main() {\n' +
//   'gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
//   'gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n' +
//   'gl_Position.z = a_Position.z;\n' +
//   'gl_Position.w = 1.0;\n' +
//   '}\n';

// 片元着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}';

var ANGEL = 90.0;

function main() {
  // 获取canvas元素
  var canvas = document.getElementById('webgl');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas/> element');
    return;
  }
  console.log('获取canvas元素成功');

  // 获取WebGL上下文
  var gl = getWebGLContext(canvas);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  console.log('获取WebGL上下文成功')

  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }
  console.log('初始化着色器成功');

  // 设置顶点的位置
  var n = initVertextBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  console.log('顶点位置设置成功');
  var radian = Math.PI * ANGEL / 180.0; // 转为弧度制
  var cosB = Math.cos(radian);
  var sinB = Math.sin(radian);

  // WebGL中矩阵是列主序的 旋转矩阵
  // var xformMatrix = new Float32Array([
  //   cosB, sinB, 0.0, 0.0,
  //   -sinB, cosB, 0.0, 0.0,
  //   0.0, 0.0, 1.0, 0.0,
  //   0.0, 0.0, 0.0, 1.0
  // ])
  // 平移矩阵
  // var Tx = 0.2;
  // var Ty = 0.2;
  // var Tz = 0;
  // var xformMatrix = new Float32Array([
  //   1.0, 0.0, 0.0, 0.0,
  //   0.0, 1.0, 0.0, 0.0,
  //   0.0, 0.0, 1.0, 0.0,
  //   Tx, Ty, Tz, 1.0
  // ])
  // 缩放矩阵
  var Sx = 0.5;
  var Sy = 0.5;
  var Sz = 1.0;
  var xformMatrix = new Float32Array([
    Sx, 0.0, 0.0, 0.0,
    0.0, Sy, 0.0, 0.0,
    0.0, 0.0, Sz, 0.0,
    0.0, 0.0, 0.0, 1.0
  ])
  // 将矩阵传给顶点着色器
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');

  gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
  // 设置 清空颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制三个点
  // gl.drawArrays(gl.LINES, 0, n); // 忽略最后一个点绘制一个线段
  // gl.drawArrays(gl.LINE_STRIP, 0, n); // 绘制两条线条
  // gl.drawArrays(gl.LINE_LOOP, 0, n); // 三条线连成一个三角形
  gl.drawArrays(gl.TRIANGLES, 0, n); // 绘制一个实心三角形

}

/**
 * 返回待绘制顶点的个数 
 * 错误为负数
 * @param {*} gl 
 */
function initVertextBuffers(gl) {
  var vertices = new Float32Array([
    0.0, 0.5, -0.5, -0.5, 0.5, -0.5
  ]); // 能够保证数据类型都是浮点型 类型化数组无push和pop方法
  var n = 3; // 坐标点的个数

  // 创建缓冲区对象
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object ');
    return -1;
  }

  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 向缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // 将缓冲区对象分配给a_Position变量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  return n;
}