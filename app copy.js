let path = require('path');
let fs = require('fs');
let fse = require('fs-extra')
const chokidar = require('chokidar');
let array = require('./splice-array')
const client = require('../server/helpers/connectMqtt')


const dataFolder = 'D:/MeesApp/FTPtechnolog/'; 
const folderMulti = 'D:/MeesApp/FTPtechnolog/TT47Multiple/'; 

chokidar.watch(dataFolder).on('add', (event) => {
  let filename = event.slice(event.lastIndexOf('\\') +1, event.indexOf('.'))+'.txt'
  let filename1 = filename.slice(filename.lastIndexOf('_')+1,filename.indexOf('.')  )

  let foldername = filename.slice(0, filename.lastIndexOf('_'));
  let sitename = foldername.split('_')
  let sitenameleng = sitename.length

  let year = filename1.slice(0,4)
  let month = filename1.slice(4,6)
  let day = filename1.slice(6,8)

  //Duong dan luu file txt
  let folderpath = 'D:/MeesApp/DATATT242017FTP/'+ foldername + '/'.concat(year +'/',month +'/' ,day + '/')

  fs.mkdir(folderpath, { recursive: true }, (err) => {
    if (err) 
    console(err)
  });


  let oldPath = 'D:/MeesApp/FTPtechnolog/' + filename
  let newPath = folderpath + filename

  if (sitenameleng == 3) {
    fs.readFile(path.join( dataFolder , filename ),'utf-8' , function (err, data) {
      if (err) throw err;
  
      let data_temp = data.replace(/\r?\n|\r/g,',')
      let data_aray = data_temp.split(/[\t \r , ]/)
  
      let result = array(data_aray, 5);
      let resul_leng = result.length -1
  
      for (let index = 0; index < resul_leng; index++) {
          let Parameter_name = result[index][0]
          let Parameter_valuve = result[index][1]
          let Site_unit = result[index][2]
          let Parameter_time = result[index][3]
          let Parameter_status = result[index][4]
          let Pa_valuve_float = parseFloat(Parameter_valuve)
  
  
          let Year = Parameter_time.slice(0,4)
          let Month = Parameter_time.slice(4,6)
          let Day = Parameter_time.slice(6,8)
          let Hours = Parameter_time.slice(8,10)
          let Minutes = Parameter_time.slice(10,12)
          let Second = Parameter_time.slice(12,14)
          let Daytime = Year + '-'.concat (Month + '-', Day)
          let Hourstime = Hours + ':'.concat (Minutes + ':', Second)


          let mqttjson = {
            "Type":"Tech09",
            "Device_id":foldername,
            "Time":Parameter_time,
            "Data":[
              {"CN":Parameter_name, "V":Pa_valuve_float, "U":Site_unit, "St":Parameter_status},
            ]
           }
           let pubmess = JSON.stringify(mqttjson)
           client.publish('SYS/AI_DATA', pubmess,{ qos: 0, retain: false , dup : false }, (error) =>{
            if (error) {
                console.error('loi publis roi:'+ error)
            }
         })
           //console.log(mqttjson)

      }
      
    })

    function movefile (oldPath, newPath ) {
      try {
        fse.move(oldPath, newPath, {overwrite : true})
      } catch (err) {
        console.error(err)
      }
    }
    movefile(oldPath, newPath)

  }

});

chokidar.watch(folderMulti).on('add', (event) => {

  let filenamemulti = event.slice(event.lastIndexOf('\\') +1, event.indexOf('.'))+'.txt'
  let filename1 = filenamemulti.slice(filenamemulti.lastIndexOf('_')+1,filenamemulti.indexOf('.')  )
  
  let foldername = filenamemulti.slice(0, filenamemulti.lastIndexOf('_'));

  let year = filename1.slice(0,4)
  let month = filename1.slice(4,6)
  let day = filename1.slice(6,8)
  let folderpath =  'D:/MeesApp/DATATT242017FTP/'+ foldername + '/'.concat(year +'/',month +'/' ,day + '/')

  //Duong dan luu file txt
  
    fs.mkdir(folderpath, { recursive: true }, (err) => {
      if (err) 
      console.log(err)
    });
  
  let oldPath = 'D:/MeesApp/FTPtechnolog/TT47Multiple/' + filenamemulti
  let newPath = folderpath + filenamemulti
  
    fs.readFile(path.join (folderMulti ,filenamemulti ),'utf-8' , function (err, data) {
      if (err) throw err
  
      let data_temp = data.replace(/\r?\n|\r/g,',')
      let data_aray = data_temp.split(/[\t \r , ]/)
  
      let result = array(data_aray, 6);
      let resul_leng = result.length -1
  
      for (let index = 0; index < resul_leng; index++) {
          let Parameter_name = result[index][1]
          let Site_name = result[index][0]
          let Site_unit = result[index][3]
          let Parameter_valuve = result[index][2]
          let Parameter_time = result[index][4]
          let Parameter_status = result[index][5]
          let Pa_valuve_float = parseFloat(Parameter_valuve)
  
          let Year = Parameter_time.slice(0,4)
          let Month = Parameter_time.slice(4,6)
          let Day = Parameter_time.slice(6,8)
          let Hours = Parameter_time.slice(8,10)
          let Minutes = Parameter_time.slice(10,12)
          let Second = Parameter_time.slice(12,14)
          let Daytime = Year + '-'.concat (Month + '-', Day)
          let Hourstime = Hours + ':'.concat (Minutes + ':', Second)

         // 
         // console.log(DeviceStt)
          // console.log(Parameter_status)
           //console.log(Parameter_name)

          // console.log(Pa_valuve_float)
          // console.log(Site_unit)         
          // console.log(Site_name)
          // console.log(Parameter_time)

          let mqttjson = {
            "Type":"Tech09",
            "Device_id":foldername+ '_' + Site_name,
            "Time":Parameter_time,
            "Data":[
              {"CN":Parameter_name, "V":Pa_valuve_float, "U":Site_unit, "St":Parameter_status},
            ]
           }
           let pubmess = JSON.stringify(mqttjson)
           client.publish('SYS/AI_DATA', pubmess,{ qos: 0, retain: false , dup : false }, (error) =>{
            if (error) {
                console.error('loi publis roi:'+ error)
            }
         })

      } 
      
    })
  

  function movefile (oldPath, newPath ) {
    try {
      fse.move(oldPath, newPath, {overwrite : true})

    } catch (err) {
      console.log(err)
    }
  }
  movefile(oldPath, newPath)

});

