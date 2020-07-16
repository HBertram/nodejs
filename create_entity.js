let fs = require("fs")
let mysql = require("mysql");
let schema = "imould-mes"

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
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Der5@^7jY*',
    database : 'imould-mes'
  });
connection.connect()

let sql = `select table_name from information_schema.tables where table_schema='${schema}'`
console.log(sql)
connection.query(sql, (e, r, f) => {
    console.log(r)
    let str = ''
    let str2 = ''
    r.forEach((o) => {
        let name = o.table_name.replace("tbl_", "")
        Handle(o.table_name)
        str += `import ${name}Api from "./apis/api_${name}.js"\n`
        str2 += `   ...${name}Api,\n`
    })
    save(`Output/java/api/register.js`, str + '\n' + str2)
})
function Handle(table) {
    console.log(`handle ${table}`)
    let name = table.replace("tbl_", "")
    let upperTable = name[0].toUpperCase() + toCamel(name).substr(1)
    let columns = []
    
    connection.query(`select column_name,column_comment,data_type from information_schema.columns where table_name="${table}" and table_schema="${schema}"`, function (error, results, fields) {
      if (error) throw error;
      columns = results.filter((o) => o.column_name.toLowerCase() != "id")
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
      return type == "int" || type == "smallint" || type=="tinyint" ? "Integer" : 
             type == "double" ? "Double" :
             type == "timestamp" ? "Date" :
             "String"
    }
    function getColumnDBType(type) {
      return type == "int" || type == "smallint" || type=="tinyint" ? "DB_INT" : 
             type == "double" ? "DB_DOUBLE" :
             type == "timestamp" ? "DB_TIMESTAMP" :
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
    
    
    //第一个字母大写
    function myCamel (str) {
        str = toCamel(str)
        return str[0].toUpperCase() + str.substr(1)
    }
      
    function createTableBaseCode() {
    
    
        let upper = name.toUpperCase()
        
        let camel = name[0].toUpperCase() + name.substr(1)
        
        let getters = columns.map((sb) => {
            s = sb.column_name
            return `
            public ${getColumnType(sb.data_type)} get${myCamel(s)}() {
                return ${toCamel(s)};
            }
            public void set${myCamel(s)}(${getColumnType(sb.data_type)} ${toCamel(s)}) {
                this.${toCamel(s)} = ${toCamel(s)};
            }
            `
        
        })
        
        let strings = columns.map((sb) => {
            s = sb.column_name
            return `
            @Column(name = "${s}")
            `            +
            (
                getColumnType(sb.data_type) == "Date" ? `@Temporal(TemporalType.TIMESTAMP)\n@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")`:''
            )
            +
            `
            protected ${getColumnType(sb.data_type)} ${toCamel(s)};
            `
        
        })
        
        let template = 
        `package com.imould.mes.dao.entity;
import java.util.Date;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import com.fasterxml.jackson.annotation.JsonFormat;
    @Entity
    @Table(name = "${table}")
    public class ${upperTable} extends BaseEntity {
    
    ${getters.join("")}
        
        
    ${strings.join("")}
    }
        `
        
        save(`Output/java/entity/${upperTable}.java`, template)
        
    
    
        let template2 = `
        package com.imould.mes.dao.repository;
        
        import org.springframework.data.jpa.repository.JpaRepository;
        import org.springframework.stereotype.Repository;
        
        import com.imould.mes.dao.entity.${upperTable};
        
        @Repository
        public interface ${upperTable}Repository extends JpaRepository<${upperTable}, String>{
            
        }
        `  
        save(`Output/java/Repository/${upperTable}Repository.java`, template2)
        


        let template3 = 
`package com.imould.mes.api;

import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.imould.mes.api.utils.ApiResult;
import com.imould.mes.api.utils.ApiResultBuilder;
import com.imould.mes.dao.entity.${upperTable};
import com.imould.mes.dao.repository.${upperTable}Repository;

@RestController
@RequestMapping("/api")
public class ${upperTable}Controller {
	@Autowired
	private ${upperTable}Repository ${name}Rpy;
	
	@GetMapping("/${name}/{id}")@ResponseBody
	public ApiResult<${upperTable}> getOne(@PathVariable String id) {
		return ApiResultBuilder.success(${name}Rpy.getOne(id));
	}
	
	@GetMapping("/${name}s/{page}/{size}")@ResponseBody
	public ApiResult<Page<${upperTable}>> get(@RequestParam Map<String, String> mp, @PathVariable Integer page, @PathVariable Integer size, @RequestParam(required = false, defaultValue = "id") String order, @RequestParam(required = false, defaultValue = "asc") String direction) {
		${upperTable} temp = new ${upperTable}();
		try {
			BeanUtils.populate(temp, mp);
		} catch(Exception e) { e.printStackTrace(); }
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction.equals("desc") ? Order.desc(order) : Order.asc(order)));
		Page<${upperTable}> p = ${name}Rpy.findAll(Example.of(temp), pageRequest);
		return ApiResultBuilder.success(p);
	}
	
	@PostMapping("/${name}")@ResponseBody
	public ApiResult<${upperTable}> post(@RequestBody ${upperTable} ${name}) {
    	${upperTable} p = ${name}Rpy.save(${name});
		return ApiResultBuilder.success(p);
    }

    @PutMapping("/${name}")@ResponseBody
	public ApiResult<${upperTable}> add(@RequestBody ${upperTable} ${name}) {
    	${upperTable} p = ${name}Rpy.save(${name});
		return ApiResultBuilder.success(p);
	}
	
	@DeleteMapping("/${name}/{id}")@ResponseBody
	public ApiResult<?> delete(@PathVariable String id) {
		${name}Rpy.deleteById(id);
		return ApiResultBuilder.successNoData();
	}

}
`
    save(`Output/java/Controller/${upperTable}Controller.java`, template3)
        


    let template4 = 
`export default {
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
		urlFunc: ({ page, size }) => {
			return \`${name}s/\${page}/\${size}\`
		},
		method: "get"
	},
	delete${upperTable}: {
		urlFunc: ({ id }) => {
			return \`${name}/\${ id }\`
		},
		method: "delete"
	}
}`

save(`Output/java/api/api_${name}.js`, template4)
    }
}

