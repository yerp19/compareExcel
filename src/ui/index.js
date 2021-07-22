//cargar el formulario
const UploadForm = document.getElementById('uploadForm')

//importaciones de modulos, librerias y archivos
const XLSX = require('xlsx');
const { remote} = require('electron');
const { saveAs } = require('./FileSaver');
const main = remote.require('./main');

//archivos a procesar
const comparatorFile = document.getElementById('comparatorFile');
const fileCompare = document.getElementById('fileCompare');

//otros filtros


function filterData() {
    const itemCampo1 = document.getElementById('itemCampo1');
    const itemSelect1 = document.getElementById('itemSelect1');
    const itemValor1 = document.getElementById('itemValor1');

    const itemCampo2 = document.getElementById('itemCampo2');
    const itemSelect2 = document.getElementById('itemSelect2');
    const itemValor2 = document.getElementById('itemValor2');
    const itemValor3 = document.getElementById('itemValor3');
    var filter = {
        itemCampo1 : itemCampo1.value,
        itemSelect1: itemSelect1.value,
        itemValor1: itemValor1.value,
    
        itemCampo2 : itemCampo2.value,
        itemSelect2: itemSelect2.value,
        itemValor2: itemValor2.value,
        itemValor3: itemValor3.value,
    }

    return filter;
}


//evento para enviar el formulario
UploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if(comparatorFile.files && comparatorFile.files[0] && fileCompare.files && fileCompare.files[0]){
        const file_compare = comparatorFile.files[0];
        const comparator_file = fileCompare.files[0];

        //notificacion de esperar descarga
        main.notification('Procesando Información',"Espere a que el archivo de descargue, esto tardara dependiendo la cantidad de datos procesados ")

        //funcion que compara los archivos
        var resUploadFileCompared = main.uploadFileCompared(comparator_file, file_compare );
        const resCombertExcelToJson = await CombertExcelToJson(resUploadFileCompared)
        //console.log(resCombertExcelToJson)

        //funcion descargar archivo final
        //downloadAsExcel(resCombertExcelToJson)
    }
    else{
        //notificacion si no hay archivos cargados
        main.notification('Error al cargar archivos',"Sin Archivo Seleccionado")
    }
});


//convertir a formato Json 
const CombertExcelToJson = async (resUploadFileCompared) => {
    const pathComparatorFile = resUploadFileCompared.pathComparatorFile;
    const pathFileCompare = resUploadFileCompared.pathFileCompare;
    //objeto del archivo de excel a comparar
    const filePathComparatorFile = XLSX.readFile(pathComparatorFile);
    var nameFilePathComparatorFile = filePathComparatorFile.SheetNames;
    let resNameFilePathComparatorFile = await XLSX.utils.sheet_to_json(filePathComparatorFile.Sheets[nameFilePathComparatorFile[0]], {
        blankRows: true,
        defval: '',
    })

    //objeto del archivo de excel a comparar
    const filePathFileCompare = XLSX.readFile(pathFileCompare);
    var nameFilePathFileCompare = filePathFileCompare.SheetNames;
    let resNameFilePathFileCompare = XLSX.utils.sheet_to_json(filePathFileCompare.Sheets[nameFilePathFileCompare[0]], {
        blankRows: true,
        defval: '',
    })

    rescomparationFuction = comparationFuction(resNameFilePathComparatorFile, resNameFilePathFileCompare)

    return rescomparationFuction;
}

//hacer comparacion de datos y exportacion de datos calculados
const comparationFuction = (resNameFilePathComparatorFile, resNameFilePathFileCompare) => {
    const filter = filterData()
    var arrayres = [];
    for (let i = 0; i < resNameFilePathComparatorFile.length; i++) {
        var res = resNameFilePathFileCompare.filter(item => item.identificacion === resNameFilePathComparatorFile[i].identificacion);
        res.forEach(element => {
            arrayres.push(element);
        });
    }
    if (typeof filter === 'object') {
        if(filter.itemCampo1.length != 0  && filter.itemCampo1.length != 0 && filter.itemValor1.length != 0 && filter.itemCampo2.length != 0 && filter.itemValor2.length != 0 && filter.itemValor3.length != 0){
            let validateCampo1 = filter.itemCampo1;
            let validateValor1 = filter.itemValor1;
            let validateCampo2 = filter.itemCampo1;
            let validateValor2 = filter.itemValor2;
            let validateValor3 = filter.itemValor3;

            arrayres.forEach(element => {
                //console.log(element)
                for (const key in element) {
                    let value = Object.values(element)
                    //console.log(key === validateCampo1);
                    if(key === validateCampo1){
                        arrayres.filter(item =>  console.log(item.validateCampo1));
                    }
                }
            });
        }
        else if(filter.itemCampo1.length === 0 && filter.itemValor1.length === 0 && filter.itemCampo2.length === 0 && filter.itemValor2.length === 0 && filter.itemValor3.length === 0){
            return arrayres;
        }
        else if(filter.itemCampo1.length != 0 && filter.itemValor1.length != 0 && filter.itemCampo2.length === 0 && filter.itemValor2.length === 0 && filter.itemValor3.length === 0){
            let validateCampo1 = filter.itemCampo1;
            let validateValor1 = filter.itemValor1;
            
        }
        else if(filter.itemCampo1.length === 0 && filter.itemValor1.length === 0 && filter.itemCampo2.length != 0 && filter.itemValor2.length != 0 && filter.itemValor3.length != 0){
            let validateCampo2 = filter.itemCampo1;
            let validateValor2 = filter.itemValor2;
            let validateValor3 = filter.itemValor3;  
        }
    }
    return arrayres;
}

//variables y funciones para descargar el archivo final excel
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

function downloadAsExcel(resUploadFileCompared) {
    const worksheet = XLSX.utils.json_to_sheet(resUploadFileCompared);
    const workbook = {
        Sheets:{
            'resUploadFileCompared': worksheet
        },
        SheetNames:['resUploadFileCompared']
    }
    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx',type:'array'});
    console.log(excelBuffer)
    saveExcel(excelBuffer, 'Filtro de base de datos')
};

function saveExcel(buffer, filename){
    const data = new Blob([buffer], {type: EXCEL_TYPE});
    saveAs(data,filename+'_export_'+new Date().getTime()+EXCEL_EXTENSION)
}