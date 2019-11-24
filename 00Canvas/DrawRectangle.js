function main() {
    // 获取<canvas>元素
    var canvas = document.getElementById('example');

    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // 获取绘制二维图像的上下文
    var context = canvas.getContext('2d');

    // 绘制蓝色矩形
    context.fillStyle='rgba(0, 0, 255, 1.0)'; // 设置填充色为蓝色

    context.fillRect(120, 10, 150, 150); // 使用设定的颜色填充指定范围的矩形
    
}