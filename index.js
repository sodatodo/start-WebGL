const path = require('path');
const fs = require('fs');
// 获取文件根目录
const filePath = path.resolve(__dirname);
// 获取目录下所有文件
const pathFiles = fs.readdirSync(filePath);

const dirs = {};
// 遍历文件 判断是否为文件夹
pathFiles.forEach((filename, index) => {
  const filedir = path.join(filePath, filename);
  const ignore = ['node_modules', 'lib', '.git', 'book', 'resources'];
  let badDir = false;
  ignore.forEach(igoreDirName => {
    if (filedir.indexOf(igoreDirName) > -1) {
      badDir = true;
    }
  })
  if (badDir) return;
  
  const filestat = fs.statSync(filedir);
  // 将文件夹存放到数组中
  if (filestat.isDirectory()) {
    dirs[filename] = filedir;
  }
})
// 将数组写入文件
fs.writeFileSync('directorys.json', JSON.stringify(dirs), err => {
  if (!err) console.log('success'); 
})