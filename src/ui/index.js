//cargar el formulario
const UploadForm = document.getElementById('uploadForm')

//importaciones de modulos, librerias y archivos
const XLSX = require('xlsx');
const { saveAs } = require('./FileSaver');
const { remote} = require('electron');
const main = remote.require('./main');

//archivos a procesar
const comparatorFile = document.getElementById('comparatorFile');
const fileCompare = document.getElementById('fileCompare');

//otros filtros
function filterData() {
    const tipeidentification = document.getElementById('tipeidentification');
    const identification = document.getElementById('identification');
    const name = document.getElementById('name');
    const lastname = document.getElementById('lastname');
    const surname = document.getElementById('surname');
    const secondsurname = document.getElementById('secondsurname');
    const gender = document.getElementById('gender');
    var filter = {
        name : name.value, 
        identification: identification.value,
        municipality: municipality.value,
        age : age.value,
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
        const resUploadFileCompared = await main.uploadFileCompared(comparator_file, file_compare );
        console.log(resUploadFileCompared)
        const spinner = document.getElementById('spinner')
        
        spinner.innerHTML = `
            <div class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden"></span>
                </div>
            </div>
        `
        const resCombertExcelToJson = await CombertExcelToJson(resUploadFileCompared)
        
        //funcion descargar archivo final
        if(resCombertExcelToJson === 'undefined' || resCombertExcelToJson === [])
        {
            UploadForm.reset();
        }
        else{
           
            downloadAsExcel(resCombertExcelToJson)
            //document.getElementById("spinner").innerHTML = ``;
            UploadForm.reset();
        }
    }
    else{
        //notificacion si no hay archivos cargados
        main.notification('Error al cargar archivos',"Sin Archivo Seleccionado")
    }
});
//convertir a formato Json 
const CombertExcelToJson = async (resUploadFileCompared) => {
  
    const pathComparatorFile = resUploadFileCompared.pathComparatorFile;
    console.log(pathComparatorFile)
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
    if(typeof filter === 'object') {
        if(filter.name.length === 0 && filter.identification.length === 0 && filter.municipality.length === 0 && filter.age.length === 0){
            return arrayres;
        }
        else if(filter.name.length != 0 && filter.identification.length === 0 && filter.municipality.length === 0 && filter.age.length === 0){
            for (let i = 0; i < arrayres.length; i++) {
                if(arrayres[i].primer_nombre){
                    var resFilter = arrayres.filter(data => data.primer_nombre === filter.name ||  data.segundo_nombre === filter.name ||  data.primer_apellido === filter.name ||  data.segundo_apellido === filter.name);
                    //console.log(resFilter)
                    if(resFilter.length === 0 || resFilter[0] === []){
                        main.notification('1: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
                        break;
                    }
                    else{
                        return resFilter
                    }
                }
                else if(arrayres[i].primernombre){
                    var resFilter =  arrayres.filter(data => data.primernombre === filter.name ||  data.segundonombre === filter.name ||  data.primerapellido === filter.name ||  data.segundoapellido === filter.name)
                    console.log(resFilter)
                    if(resFilter.length === 0 ){
                        main.notification('SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
                        break;
                    }
                    else{
                        return resFilter
                    }
                }
                else{
                    main.notification('SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
                }
            }
        }
        else if(filter.name.length === 0 && filter.identification.length != 0 && filter.municipality.length === 0 && filter.age.length === 0 ){
            var resFilter =  arrayres.filter(data => data.identificacion === filter.identification)
            if(resFilter.length === 0){
                main.notification('2: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
            }
            else{
                return resFilter
            }  
        }
        else if(filter.name.length === 0 && filter.identification.length === 0 && filter.municipality.length != 0 && filter.age.length === 0){
            var resFilter =  arrayres.filter(data => data.municipio === filter.municipality)
            if(resFilter.length === 0){
                main.notification('3: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
            }
            else{
                return resFilter
            }  
        }
        else if(filter.name.length === 0 && filter.identification.length === 0 && filter.municipality.length === 0 && filter.age.length != 0){
            var resFilter =  arrayres.filter(data => data.edad === filter.age)
            if(resFilter.length === 0 || resFilter.length === 'undefined'){
                main.notification('4: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
            }
            else{
                return resFilter
            }
        }
        else if(filter.name.length != 0 && filter.identification.length != 0 && filter.municipality.length != 0 && filter.age.length != 0 ){
            var resFilter =  arrayres.filter( 
                data => data.primer_nombre === filter.name ||  data.segundo_nombre === filter.name 
                ||  data.primer_apellido === filter.name ||  data.segundo_apellido === filter.name && data.identificacion === filter.identification 
                && data.municipio === filter.municipality && data.edad === filter.age
            );
            if(resFilter.length === 0 || resFilter.length === 'undefined'){
                main.notification('5: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
            }
            else{
                return resFilter;
            }
        }
        else if(filter.name.length != 0 || filter.identification.length != 0 || filter.municipality.length != 0 || filter.age.length != 0 ){
            var resFilter =  arrayres.filter( 
                data => data.primer_nombre === filter.name || data.segundo_nombre === filter.name 
                ||  data.primer_apellido === filter.name ||  data.segundo_apellido === filter.name 
                || data.identificacion === filter.identification 
                || data.municipio === filter.municipality 
                || data.edad === filter.age
            );
            if(resFilter === 'undefined'){

            }
            if(resFilter.length === 0 || resFilter.length === 'undefined'){
                main.notification('6: SIN NADA POR DESCARGAR',"Filtre por otros datos o No existen el campo en el archivo")
            }
            else{
                return resFilter;
            }
        }
        else{
            main.notification('7: Error de Campos',"No existe este modo de filtro.")
        }
    }
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
    saveExcel(excelBuffer, 'Filtro de base de datos')
};

function saveExcel(buffer, filename){
    const data = new Blob([buffer], {type: EXCEL_TYPE});
    saveAs(data,filename+'_export_'+new Date().getTime()+EXCEL_EXTENSION)
}