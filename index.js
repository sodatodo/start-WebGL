const path = require('path');
const fs = require('fs');
const filePath = path.resolve(__dirname);

const pathFiles = fs.readdirSync(filePath);

const dirs = {};

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
  if (filestat.isDirectory()) {
    dirs[filename] = filedir;
  }
})

fs.writeFileSync('directorys.json', JSON.stringify(dirs), err => {
  if (!err) console.log('success'); 
})