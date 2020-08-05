let fs = require("fs")
let mysql = require("mysql");

let table = "tbl_supplier"
let schema = "imould-mes"


let name = table.replace("tbl_", "")
let upperTable = name[0].toUpperCase() + toCamel(name).substr(1)
let columns = []

let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Der5@^7jY*',
  database : 'imould-mes'
});
connection.connect()
connection.query(`select column_name,column_comment,data_type from information_schema.columns where table_name="${table}" and table_schema="${schema}"`, function (error, results, fields) {
  if (error) throw error;
  columns = results.filter(o=>o.column_name.toLowerCase() != "id")
  results.forEach((s) => {
    //console.log("m_"  + toCamel(getPrefix(s["data_type"]) + s['column_name']))
  })
  createTableBaseCode()
})


function getColumnPrefix(type) {
  return type == "int" || type == "smallint" || type=="tinyint" ? "i" : 
         type == "double" ? "d" : 
         "str"
}
function getColumnType(type) {
  return type == "int" || type == "smallint" ? "Integer" : 
         type == "double" ? "Double" :
         "String"
}
function getColumnDBType(type) {
  return type == "int" || type == "smallint" ? "DB_INT" : 
         type == "double" ? "DB_DOUBLE" :
         "DB_VARCHAR"
}

function toCamel(str) {
  return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

function toLowerLine(str) {
	var temp = str.replace(/[A-Z]/g, function (match) {	
		return "_" + match.toLowerCase();
  	});
  	if(temp.slice(0,1) === '_'){ //如果首字母是大写，执行replace时会多一个_，这里需要去掉
  		temp = temp.slice(1);
  	}
	return temp;
};


function save(path, content, callback=(err)=>{if(err)console.error(err)}) {
  let lastPath = path.substring(0, path.lastIndexOf("/"));
  fs.mkdir(lastPath, {recursive: true}, (err) => {
      if (err) return callback(err);
      fs.writeFile(path, content, function(err){
          if (err) return callback(err);
          return callback(null);
      });
  });
}

let chinese = {
}

function explanPropName(prop) {
    return chinese[prop] || "未知"
}

function createTableBaseCode () {

    let template = `
    export default {
        add${upperTable}: {
            url: "${name}",
            method: "put"
        },
        save${upperTable}: {
            url: "${name}",
            method: "post"
        },
        get${upperTable}: {
            urlFunc: ({ id }) => {
                return \`${name}/\${ id }\`
            },
            method: "get"
        },
        get${upperTable}s: {
            url: "${name}",
            method: "get"
        },
        delete${upperTable}: {
            urlFunc: ({ id }) => {
                return \`${name}/\${ id }\`
            },
            method: "delete"
        }
    }
    `
    save(`Output/${table}/api_${name}.js`, template)
}