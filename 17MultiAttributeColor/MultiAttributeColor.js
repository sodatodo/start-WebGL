// MultiAttributeColor.js
// 顶点着色器程序
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' + // varing变量
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = 10.0;\n' +
    '   v_Color = a_Color;\n' + // 将数据传给片元着色器
    '}\n';
// 片元着色器
var FSHADER_SOURCE =
    'precision mediump float;\n' + // 需要声明浮点数精度 否则No precision specified for (float)
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' + // 从顶点着色器接收数据
    '}\n';

function main() {
    var canvas = document.getElementById('webgl');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // 设置顶点位置
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, n);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesSizes = new Float32Array([
        0.0,    0.5,    1.0,    0.0,    0.0, // 第一个点
        -0.5,   -0.5,   0.0,    1.0,    0.0, // 第二个点
        0.5,    -0.5,   0.0,    0.0,    1.0, // 第三个点
    ])
    var n = 3; // 点的个数

    // 创建缓冲区对象
    var vertexSizeBuffer = gl.createBuffer();
    if (!vertexSizeBuffer) {
        console.log('Failed to create thie buffer object');
        return -1;
    }

    // 将缓冲区对象保存到目标上
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);

    // 将缓存对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
    console.log('FSIZE :', FSIZE);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('failed to get the storage location of a_Position');
        return -1;
    }

    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);

    // 链接a_Postion变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_PointSize < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_PointSize, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}