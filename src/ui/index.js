const UploadForm = document.getElementById('uploadForm')
const XLSX = require('xlsx');

const { remote} = require('electron');
const { saveAs } = require('./FileSaver');
const main = remote.require('./main');

const comparatorFile = document.getElementById('comparatorFile');
const fileCompare = document.getElementById('fileCompare');

UploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if(comparatorFile.files && comparatorFile.files[0] && fileCompare.files && fileCompare.files[0]){
        const file_compare = comparatorFile.files[0];
        const comparator_file = fileCompare.files[0];

        var resUploadFileCompared = main.uploadFileCompared(comparator_file, file_compare );
        document.getElementById("json").innerHTML = JSON.stringify(resUploadFileCompared, undefined, 4);
        console.log(resUploadFileCompared);
        downloadAsExcel(resUploadFileCompared)
    }
    else{
        console.log("Sin Archivo Seleccionado ")
    }

    // let resTbody = document.querySelector('#resTbody');
    // let resThead = document.querySelector('#resThead');

    // resTbody.innerHTML = '';
    // resThead.innerHTML = '';

    // for (let i = 0; i < resUploadFileCompared.length; i++) {
    //     const element = resUploadFileCompared[i];
    //     //console.log(element)
    //     let key = Object.keys(element);
    //     let value = Object.values(element);

    //     for (let k = 0; k < key.length; k++) {
    //         console.log(key[k])
    //         resThead.innerHTML += `
    //         <tr>
    //             <th scope="col">${key[k]}</th>
    //         </tr>
    //         `
    //     }
    //     for (let i = 0; i < value.length; i++) {
    //         resTbody.innerHTML += `
    //         <tr>
    //             <td>${value[i]}</td>
    //         </tr>
    //         `
    //     }
    // }
});




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


