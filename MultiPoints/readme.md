# 使用缓冲区对象
### 1.创建缓冲区对象(gl.createBuffer())
var vertexBuffer = gl.createBuffer();
### 2.绑定缓冲区对象(gl.bindBuffer())

### 3.将数据写入缓冲区对象(gl.bufferData())
### 4.将缓冲区对象分配给一个attribute变量(gl.vertexAttribPointer())
将整个缓冲区对象赋值给attribute变量
(将一个顶点数据分配给attribute变量 gl.vertexAttrib[1234]f)
### 5.开启attribute变量
gl.enableVertexAttribArray(a_Position)
函数名看似用来处理顶点数组的 实际上处理的对象是缓冲区 这是由于历史原因(从OpenGL中继承)造成的
可以执行
gl.disableVertexAttribArray(a_Position)来关闭分配

开启了attribute变量后就不能再使用gl.vertexAttrib[1234]f向它传数据了 除非显示的关闭该attribute变量