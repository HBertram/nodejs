let fs = require("fs")
let mysql = require("mysql");

let table = "task"
let schema = "i-mouldnew"


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
  return type == "int" || type == "smallint" ? "i" : 
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

function explanPropName(prop) {
    return "未知属性"
}

function createTableBaseCode () {

    let templateCol = columns.map((o) => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        if (name.toLowerCase() == "id") return ""
        return `
        <el-table-column v-if="isColumnCanShow('${mName}')" prop="${mName}" 
                         label="${explanPropName(name)}"
                         sortable="custom">
        </el-table-column>`
      }).join("")
    
    let templateForm = 
    columns.map((o) => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        if (name.toLowerCase() == "id") return ""
        return   `
        <el-form-item label="${explanPropName(name)}:" prop="${mName}">
            <el-input v-if="scope.row.editing" v-model="scope.row.${mName}"></el-input>
            <span v-else>{{ scope.row.${mName} }}</span>
        </el-form-item>`
      }).join("")
    
    let templateRuleForm = columns.map((o)=> {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        if (name.toLowerCase() == "id") return ""
        return   `${mName}: [
                { required: true, message: '不能为空', trigger: 'blur' }
            ]`
    }).filter(s=>s!="").join(",")

    let templateColumnsConfig = columns.map(o => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `
        {
            name: '${mName}',
            text: '${explanPropName(mName)}',
            canShow: true
        }`
    }).join(", ")

    let templateShowColumns = columns.map(o => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `'${mName}'`
    }).join(", ")

    let template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <link href="lib/element-ui/theme-chalk/index.css" rel="stylesheet" />
        <link href="css/style.css" rel="stylesheet" />
        <script src="lib/jQuery-3.3.1/jquery-3.3.1.min.js"></script>
        <script src="js/vue.js"></script>
        <script src="js/Common.js"></script>
        <script src="lib/element-ui/index.js"></script>
        <title></title>
        <style>
            .el-table .warning-row {
                background: oldlace;
            }
    
            .el-table .success-row {
                background: #f0f9eb;
            }
        </style>
    </head>
    <body>
        <div id="app">
            <el-table ref="multipleTable"
                      v-loading="loading"
                      :data="data.m_lstRecords"
                      @sort-change="sortChange"
                      sortable="custom"
                      row-key="id"
                      :expand-row-keys="data.m_lstRecords.filter(o => o.editing == true).map(o=>o.id)"
                      style="width: 100%"
                      :row-class-name="(o) => o.row.editing ? 'warning-row' : tableRowClassName(o)"
                      :default-sort="{prop: 'id', order: 'descending'}"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
    
                <el-table-column type="expand" v-if="HasPermit('list_${name}')">
                    <template slot="header" slot-scope="scope">
                        <el-popover
                            placement="right"
                            width="400"
                            trigger="click">
                            <el-checkbox-group v-model="showColumns">
                                <el-checkbox v-for="column in columnsConfig" :label="column.name" :key="column.name">{{column.text}}</el-checkbox>
                            </el-checkbox-group>
                            <el-button size="mini" circle slot="reference"><i class="el-icon-edit-outline"></i></el-button>
                        </el-popover>
                    </template>
                    <template slot-scope="scope">
                        <el-form :ref="'ref-form-'+scope.row.id" :rules="rules" :inline="true" :class="scope.row.editing ? '' : 'table-expand'" :model="scope.row" status-icon label-position="right" style="min-width: 600px; max-width: 70%;" label-width="150px">
                            ${templateForm}
                            <el-form-item label="操作:">
                                <el-button v-if="!scope.row.editing" type="warning" size="mini" @click="$set(scope.row, 'editing', true)"><i class="el-icon-edit"></i>修改</el-button>
                                <el-button v-if="scope.row.editing" type="primary" size="mini" @click="handleSave(scope.row, 'ref-form-'+scope.row.id)"><i class="el-icon-check"></i>保存</el-button>
                                <el-button v-if="scope.row.editing" size="mini" @click="refreshData"><i class="el-icon-close"></i>取消</el-button>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                ${templateCol}
                <el-table-column label="操作"
                                 width="200">
                    <template slot-scope="scope">
                        <el-button @click="handleDelete([scope.row])" type="danger" size="mini"><i class="el-icon-delete"></i>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="block">
                <el-pagination  hide-on-single-page    
                                background
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="searchParam.iPageNum"
                                :page-sizes="[10, 15, 30, 50]"
                                :page-size="searchParam.iPageSize"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="data.m_iTotalNum || 0">
                </el-pagination>
            </div>
        </div>
        
    
    <script>
        let $app = new Vue({
            el: "#app",
            data() {
                return {
                    data: {
                        m_iTotalPage: 0,
                        m_iTotalNum: 0,
                        m_lstRecords: []
                    },
                    searchParam: {
                        o${upperTable}: {},
                        strOrder: "",
                        iPageNum: 1,
                        iPageSize: 15
                    },
                    loading: false,
                    multipleSelection: [],
                    editingRows: [],
                    columnsConfig: [
                        ${templateColumnsConfig}
                    ],
                    showColumns: [${templateShowColumns}],
                    rules: {
                        ${templateRuleForm}
                    }
                }
            },
            computed: {
                isColumnCanShow() {
                    let that = this
                    return (prop) => {
                        return that.showColumns.includes(prop)
                    }
                } 
            },
            watch: {
                searchParam: {
                    handler(searchParam) {
                        this.loadData()
                    },
                    immediate: true,  //刷新加载 立马触发一次handler
                    deep: true  // 可以深度检测到 person 对象的属性值的变化
                }
            },
            methods: {
                HasPermit: HasPermit,
                handleSizeChange(val) { this.searchParam.iPageSize = val },
                handleCurrentChange(val) { this.searchParam.iPageNum = val },
                loadData() {
                    let that = this;
                    PostData("${upperTable}Service.asmx/WSearch${upperTable}s", this.searchParam, function (r) {
                        that.data = r
                        that.loading = false;
                    })
                },
                handleDelete(rows) {
                    this.$confirm('此操作将删除数据, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        PostData("${upperTable}Service.asmx/BatchDelete${upperTable}s", { ids: rows.map(o=>o.id).join(",") }, r=>{
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                            this.refreshData()
                        })
                    })
                },
                handleSave(row, ref) {
                    this.$refs[ref].validate((valid, a, c) => {
                        console.log(valid, a, c)
                        if (valid) {
                            PostData("${upperTable}Service.asmx/Update${upperTable}", {o${upperTable} : row}, r=> {
                                this.$message({
                                    type: 'success',
                                    message: '保存成功!'
                                });
                                this.refreshData()
                            })
                        } else {
                            return false;
                        }
                    });
                },
                handleSelectionChange(val) {
                    this.multipleSelection = val;
                },
                sortChange({ prop, order }) {
                    this.searchParam.strOrder = order==null ? "" : (TransformProp(prop) + (order == "ascending" ? "" : " desc"))
                },
                tableRowClassName(a,b,c) {
                    return ''
                },
                refreshData() {
                    this.loadData()
                }
            }
        })
        </script>
    </body>
    </html>
    `
    console.log(template)
    save("C:/web/MES/test.html", template)
}