
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

let name = "active"
let columns = `date,activity_id,checked`.split(",")

let upper = name.toUpperCase()

let camel = name[0].toUpperCase() + name.substr(1)


let getters = columns.map((s) => {
    return `
    public String get${myCamel(s)}() {
        return ${toCamel(s)};
    }
    
    public void set${myCamel(s)}(String ${toCamel(s)}) {
        this.${toCamel(s)} = ${toCamel(s)};
    }
    `

})

let strings = columns.map((s) => {
    return `
    @Column(name = "${s}")
    protected String ${toCamel(s)};
    `

})

let template = 
`
package pers.bertram.planeverything.dao.entity;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
 
@Entity
@Table(name = "${name}")
public class ${camel} extends BaseEntity {


${getters.join("")}
	
	
${strings.join("")}
}
`

console.log(template)
