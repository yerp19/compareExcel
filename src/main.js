const XLSX = require('xlsx');
const { BrowserWindow } = require('electron');

//crear ventana window
let win
function createWindow () {
    win = new BrowserWindow({
        title: 'LECTURA Y COMPARACIÓN DE HOJAS DE EXCEL',
        width: 800,
        height: 600,
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

    var resultFinish = CombertExcelToJson(pathComparatorFile,pathFileCompare);
    return resultFinish;
}

//convertir a formato Json 
const CombertExcelToJson = (pathComparatorFile,pathFileCompare) => {
 
    //objeto del archivo de excel a comparar
    const filePathComparatorFile = XLSX.readFile(pathComparatorFile);
    var nameFilePathComparatorFile = filePathComparatorFile.SheetNames;
    let resNameFilePathComparatorFile = XLSX.utils.sheet_to_json(filePathComparatorFile.Sheets[nameFilePathComparatorFile[0]])

    //objeto del archivo de excel a comparar
    const filePathFileCompare = XLSX.readFile(pathFileCompare);
    var nameFilePathFileCompare = filePathFileCompare.SheetNames;
    let resNameFilePathFileCompare = XLSX.utils.sheet_to_json(filePathFileCompare.Sheets[nameFilePathFileCompare[0]])

   var resComparation = comparationFuction(resNameFilePathComparatorFile, resNameFilePathFileCompare)
   return resComparation;
}

//hacer comparacion de datos y exportacion de datos calculados
const comparationFuction = (resNameFilePathComparatorFile, resNameFilePathFileCompare) => {
    var arrayres = [];
    for (let i = 0; i < resNameFilePathComparatorFile.length; i++) {
        var res = resNameFilePathFileCompare.filter(item => item.identificacion === resNameFilePathComparatorFile[i].identificacion);
        res.forEach(element => {
            arrayres.push(element);
        });
    }
    console.log(arrayres)
    return arrayres
}

module.exports = {
    createWindow,
    uploadFileCompared
}