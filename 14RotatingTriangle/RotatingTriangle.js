// RotatedTranslatedTriangle.js
// 顶点着色器程序
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_ModelMatrix * a_Position;\n' +
  '}\n';

// 片元着色器
var FSHADER_SOURCE =
  'void main() {\n' +
  'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}';

// 旋转速度(度/秒)
var ANGLE_STEP = 45.0;

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

  // 指定背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 三角形当前旋转角度
  var currentAngle = 0.0;

  // 模型矩阵
  var modelMatrix = new Matrix4();

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  // 开始绘制三角形
  var tick = function () {
    currentAngle = animate(currentAngle); // 更新旋转角
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); // 绘制图像
    requestAnimationFrame(tick);
  }
  tick();
}

/**
* 返回待绘制顶点的个数 
* 错误为负数
* @param {*} gl 
*/
function initVertextBuffers(gl) {
  var vertices = new Float32Array([
    0.0, 0.3, -0.3, -0.3, 0.3, -0.3
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

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // 设置旋转矩阵
  modelMatrix.setRotate(currentAngle, 0, 0, 1);

  // 将旋转矩阵传输给顶点着色器
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // 清除canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_last = Date.now();
function animate(angle) {
  // 计算距离上次调用经过了多长时间
  var now = Date.now();
  var elapsed = now - g_last; // 毫秒
  g_last = now;
  // 根据距离上次的调用时间更新旋转角度
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}