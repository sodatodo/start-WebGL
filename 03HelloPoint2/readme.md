# attribute变量与uniform变量
attribute变量传输的是那些与顶点相关的数据 是一种 GLSL ES变量 被用来从外部向顶点着色器内传输数据
uniform变量传输的是那些对于所有顶点都相同(与单一顶点无关)的数据
# 使用attribute变量
## 1.在顶点着色器中声明`attribute`变量
## 2.将`attribute`变量赋值给gl_Position变量
``` javascript
// 顶点着色器程序
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' + // attribute称为存储限定符 表示声明的变量是attribute变量
  'void main() {\n' +
  ' gl_Position = a_Position;\n' + // 设置坐标
  ' gl_PointSize = 10.0;\n' + // 设置尺寸
  '}\n';
```
## 3.向`attribute`变量传输数据
``` javascript
//   获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    console.log("a positon:", a_Position);
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    //   将顶点位置信息传输给attribute变量
    gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0);// vertextAttrib --OpenGL函数基础名 3 --矢量元素个数 f --float(i --int)
```