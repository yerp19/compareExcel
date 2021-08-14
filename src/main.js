
const { BrowserWindow, Notification } = require('electron');

//crear ventana window
let win
function notification(title, mensaje) {
    new Notification({
        title: title,
        body: mensaje
    }).show();
}

function createWindow () {
    win = new BrowserWindow({
        title: 'LECTURA Y COMPARACIÓN DE HOJAS DE EXCEL',
        width: 800,
        height: 800,
       webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })
  
    win.loadFile('src/ui/index.html')
}

//llegad de los datos a comparar
function uploadFileCompared(comparator_file, file_compare){
    pathComparatorFile = comparator_file.path;
    pathFileCompare = file_compare.path;
    console.log(pathComparatorFile, pathFileCompare )
    return {pathComparatorFile, pathFileCompare};
}

module.exports = {
    createWindow,
    uploadFileCompared,
    notification
}