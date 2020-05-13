let mysql = require("mysql");
let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Der5@^7jY*',
  database : 'imould-mes'
});
connection.connect()
connection.query('SELECT * from tbl_user limit 1', function (error, results, fields) {
  if (error) throw error;
  console.log('The result is: ', results, fields);
})


function getCamel(s) {

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