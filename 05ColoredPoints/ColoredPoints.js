// ColoredPoints.js
// 顶点着色器程序
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' + 
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
    ' gl_Position = a_Position;\n' + // 设置坐标
    ' gl_PointSize = a_PointSize;\n' + // 设置尺寸
    '}\n';

// 片元着色器程序
var FSHADER_SOURCE =
    'precision mediump float;\n' + // 精度限定词 中等精度
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n' + // 设置颜色
    '}\n';

function main() {
    // 获取 canvas
    var canvas = document.getElementById('webgl');

    // 获取WebGL上下文
    var gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //   获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

    


    console.log("a positon:", a_Position);
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get u_FragColor variable');
        return;
    }
    //   将顶点位置信息传输给attribute变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0);
    gl.vertexAttrib1f(a_PointSize, 5.0);

    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, a_Position, u_FragColor);
    }
    // 设置 canvas 背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空 canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制一个点
    // gl.drawArrays(gl.POINTS, 0, 1);
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);
    g_points.push(x); g_points.push(y);

    // 存储颜色
    if (x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0])
    } else if (x < 0.0 & y < 0.0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0])
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0])
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (let i = 0; i < len; i+=2) {
        var rgba = g_colors[i / 2];
        gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.drawArrays(gl.POINTS, 0, 1)
    }
}