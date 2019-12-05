// HelloTriangle_FragCoord.js
// 顶点着色器
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  ' gl_Position = a_Position;\n' +
  '}';

// 片元着色器
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform float u_Width;\n' +
  'uniform float u_Height;\n' +
  'void main() {\n' +
  'gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);\n' +
  '}';

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

  // 获取u_Width
  var u_Width = gl.getUniformLocation(gl.program, 'u_Width');
  if (!u_Width) {
    console.log('Failed to get the storage location of u_Width');
    return;
  }

  var u_Height = gl.getUniformLocation(gl.program, 'u_Height');
  if (!u_Height) {
    console.log('Failed to get the storage location of u_Height');
    return;
  }

  // Pass the width and hight of the <canvas>
  gl.uniform1f(u_Width, gl.drawingBufferWidth);
  gl.uniform1f(u_Height, gl.drawingBufferHeight);

  // Enable the generic vertex attribute array
  gl.enableVertexAttribArray(a_Position);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // 连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  return n;
}