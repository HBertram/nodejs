let fs = require("fs")

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

function toCamel(str) {
    return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
      return $1 + $2.toUpperCase();
    });
  }
//第一个字母大写
function myCamel (str) {
    str = toCamel(str)
    return str[0].toUpperCase() + str.substr(1)
}

let name = "user_auth"

let upper = name.toUpperCase()



let template = 
`
package pers.bertram.planeverything.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pers.bertram.planeverything.dao.entity.${myCamel(name)};

@Repository
public interface ${myCamel(name)}Repository extends JpaRepository<${myCamel(name)}, String>{
    
}
`

console.log(template)
save(`./${myCamel(name)}Repository.java`, template)
