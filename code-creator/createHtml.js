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
    purchase_number: "单项采购id",
    purchase_record_number: "采购单号",
    material_code: "物料编号",
    creator: "请购人",
    price: "价钱",
    predict_arrival_time: "预计到料时间",
    actual_arrival_time: "实际到料时间",
    supplier: "供应商",
    status: "状态",
    amount: "数量",
    received_amount: "到料数量",
    confirm_time: "采购时间",
    confirm_user: "采购人",
    weight: "重量",
    length: "长度",
    review_user: "审核人",
    receive_user: "收货人",
    check_user: "检验人",
    store_user: "入库人",
    supplier_name: "供应商",
address: "地址",
linkman: "联系人",
phone: "电话",
supply_materials: "支持物料",
tax_rate: "税率",
pay_condition: "支付条件",
settlement_modes: "结算方式",
tax_number: "税号",
tax_type: "税种",
send_type: "寄送方式",
country: "国家",
location: "地区",
nick_name: "简称"
}

function explanPropName(prop) {
    return chinese[prop] || "未知"
}

function createTableBaseCode () {
    console.log(columns.map(o=> {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `${name}: ""`
    }).join(",\n"))
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
        return   `                        ${mName}: [{ required: true, message: '不能为空', trigger: 'blur' }]`
    }).filter(s=>s!="").join(",\n")

    let templateColumnsConfig = columns.map(o => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `                                    { name: '${mName}', text: '${explanPropName(name)}' }`
    }).join(",\n")

    let templateShowColumns = columns.map(o => {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `'${mName}'`
    }).join(", ")

    let templateSearchParamObject = columns.map(o=> {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `                            ${mName} : undefined`
    }).join(",\n")

    let templateSearchParamForm = columns.map(o=> {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `<el-form-item label="${explanPropName(name)}:" prop="${mName}">
        <el-input v-model.lazy="searchParam.dicParam.${mName}"></el-input>
    </el-form-item>`
    }).join("\n")

    let templateAddForm = columns.map(o=> {
        let type = o["data_type"]
        let name = o["column_name"]
        let mName = "m_"  + toCamel(getColumnPrefix(type) + "_" + name)
        return `<el-form-item label="${explanPropName(name)}:" prop="${mName}">
        <el-input v-model.lazy="addObject.${mName}"></el-input>
    </el-form-item>`
    }).join("\n")

    let template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <link href="lib/element-ui/theme-chalk/index.css" rel="stylesheet" />
        <link href="css/style.css" rel="stylesheet" />
        <script src="lib/jQuery-3.3.1/jquery-3.3.1.min.js"></script>
        <script src="js/vue.js"></script>
        <script src="lib/xlsx/xlsx.full.min.js"></script>
        <script src="lib/element-ui/index.js"></script>
        <script src="js/Common.js"></script>
    </head>
    <body>
        <div id="app">
            <el-main>
            <el-row>
                <el-col :span="24">
                    <el-button-group>
                        <el-button type="primary" plain size="small" v-if="HasPermit('add_material_purchase')" icon="el-icon-plus" @click="addFormVisible = true">添加</el-button>
                        <el-button type="success" plain size="small" :disabled="multipleSelection.length == 0" title="导出已勾选项数据" icon="el-icon-document" @click="exportExcel">导出</el-button>
                        <el-button type="danger" plain size="small" :disabled="multipleSelection.length == 0" title="删除已勾选项数据" v-if="HasPermit('delete_material_purchase')" icon="el-icon-delete" @click="handleDelete()">删除</el-button>
                    </el-button-group>
                </el-col>
            </el-row>
            <el-card style="margin-top: 10px">
                <el-form size="small" :inline="true" :model="searchParam.dicParam" status-icon label-position="right" label-width="150px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item></el-form-item>
                        </el-col>
                        <el-col :span="12" align="right">
                            <el-button-group>
                                <el-button-group>
                                    <el-button type="primary" plain size="small" icon="el-icon-search" @click="refreshData">搜索</el-button>
                                    <el-button type="primary" plain size="small" :class="showMoreFilter? 'el-icon-arrow-down' : 'el-icon-arrow-right'" @click="()=>showMoreFilter = !showMoreFilter"></el-button>
                                </el-button-group>
                            </el-button-group>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-collapse-transition>
                            <div v-show="showMoreFilter">
                            ${templateSearchParamForm}
                            </div>
                            </el-collapse-transition>
                        </el-col>
                    </el-row>
                </el-form>
            </el-card>
            <el-divider></el-divider>
            <el-table v-if="HasPermit('list_${name}')"
                      ref="maintable"
                      v-loading="loading"
                      :data="data.m_lstRecords"
                      @sort-change="sortChange"
                      sortable="custom"
                      row-key="id"
                      :expand-row-keys="data.m_lstRecords.filter(o => o.editing == true).map(o=>o.id)"
                      :row-class-name="(o) => o.row.editing ? 'warning-row' : tableRowClassName(o)"
                      :default-sort="{prop: 'id', order: 'descending'}"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
    
                <el-table-column type="expand">
                    <template slot="header" slot-scope="scope">
                        <el-popover
                            placement="right"
                            width="400"
                            trigger="click">
                            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
                            <el-checkbox-group v-model="showColumns" @change="handleCheckedColumnChange">
                                <el-checkbox v-for="column in columnsConfig" :label="column.name" :key="column.name">{{column.text}}</el-checkbox>
                            </el-checkbox-group>
                            <el-button plain type="primary" size="mini" circle slot="reference"><i class="el-icon-edit-outline"></i></el-button>
                        </el-popover>
                    </template>
                    <template slot-scope="scope">
                        <el-card>
                        <el-form size="small" :ref="'ref-form-'+scope.row.id" :rules="rules" :inline="true" :class="scope.row.editing ? '' : 'table-expand'" :model="scope.row" status-icon label-position="right" style="min-width: 600px; max-width: 70%;" label-width="150px">
                            ${templateForm}
                            <el-form-item label="操作:">
                                <el-button-group v-if="HasPermit('update_${name}')">
                                    <el-button v-show="!scope.row.editing" size="mini" @click="$set(scope.row, 'editing', true)" icon="el-icon-edit">修改</el-button>
                                    <el-button v-show="scope.row.editing" size="mini" @click="handleSave(scope.row, 'ref-form-'+scope.row.id)" icon="el-icon-check">保存</el-button>
                                    <el-button v-show="scope.row.editing" size="mini" @click="refreshData" icon="el-icon-close">取消</el-button>
                                </el-button-group>
                            </el-form-item>
                        </el-form>
                        </el-card>
                    </template>
                </el-table-column>
                ${templateCol}

                <el-table-column label="操作"
                                 width="200">
                    <template slot-scope="scope">
                        <el-button plain v-if="HasPermit('delete_${name}')" type="danger" @click="handleDelete([scope.row])" size="mini" icon="el-icon-delete">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            </el-main>
            <el-footer>
            <div class="block">
                <el-pagination  background
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="searchParam.iPageNum"
                                :page-sizes="[10, 15, 30, 50]"
                                :page-size="searchParam.iPageSize"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="data.m_iTotalNum || 0">
                </el-pagination>
            </div>
            </el-footer>
            <el-drawer
                :visible.sync="addFormVisible"
                size="90%"
                :before-close="handleCloseDrawer"
                direction="rtl">
                <div style="padding: 0 40px;">
                    <h2>添加</h2>
                    <el-row style="">
                        <el-form size="small" ref="addForm" :inline="true" :rules="rules" :model="addObject" status-icon label-position="right" label-width="150px">
                        ${templateAddForm}
                        </el-form>
                    </el-row>
                    <el-row style="text-align: right;">
                        <el-button type="primary" @click="handleAdd">保 存</el-button>
                        <el-button @click="addFormVisible = false">取 消</el-button>
                    </el-row>
                </div>
            </el-drawer>
        </div>
        
    
    <script type="module">
        import commonVue from "./js/common_vue.js"
        window.$app = new Vue({
            el: "#app",
            mixins: [commonVue],
            data() {
                return {
                    LOCAL_STORAGE_SHOW_COLUMN: "${name.toUpperCase()}_SHOW_COLUMNS",
                    data: {
                        m_iTotalPage: 0,
                        m_iTotalNum: 0,
                        m_lstRecords: []
                    },
                    addObject: {
${templateSearchParamObject}
                    },
                    searchParam: {
                        dicParam: {
${templateSearchParamObject}
                        },
                        strOrder: "",
                        iPageNum: 1,
                        iPageSize: 15
                    },
                    columnsConfig: [
${templateColumnsConfig}],
                    rules: {
${templateRuleForm}
                    }
                }
            },
            computed: {
                parsedSearchParam() {
                    let obj = Object.assign({}, this.searchParam)
                    obj.dicParam = {}
                    for(let key in this.searchParam.dicParam) {
                        let v = this.searchParam.dicParam[key]
                        if (undefined !== v && null !== v && "" !== v) {
                            obj.dicParam[key] = this.searchParam.dicParam[key]
                        }
                    }
                    return obj
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
            mounted() {
                let params = getUrlParams();
                let searchObj = this.searchParam.dicParam
                for (let key in params) {
                    if (searchObj.hasOwnProperty(key)) {
                        searchObj[key] = params[key]
                    }
                }
            },
            methods: {
                tableRowClassName(a,b,c) {
                    return a.rowIndex%2==0 ? "odd-row" : ""
                },
                handleAdd() {
                    this.$refs["addForm"].validate((valid, a, c) => {
                        if (valid) {
                            PostData("${upperTable}Service.asmx/WAdd${upperTable}", {o${upperTable} : this.addObject}, r=> {
                                if(r) {
                                    CommonAlert("保存成功!", "提示", "success")
                                    this.addFormVisible = false
                                    this.refreshData()
                                } else {
                                    CommonAlert("保存失败!", "提示", "error")
                                }
                            })
                        } else {
                            return false;
                        }
                    });
                },
                handleDelete(rows) {
                    if (rows == undefined) rows = this.multipleSelection
                    if (rows.length == 0) {
                        CommonAlert("请勾选需要删除的数据", "提示", "warning")
                        return;
                    }
                    this.$confirm('此操作将删除数据, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        PostData("${upperTable}Service.asmx/BatchDelete${upperTable}s", { ids: rows.map(o=>o.id).join(",") }, r=>{
                            CommonAlert("删除成功!", "提示", "success")
                            this.refreshData()
                        })
                    })
                },
                handleSave(row, ref) {
                    this.$refs[ref].validate((valid, a, c) => {
                        if (valid) {
                            PostData("${upperTable}Service.asmx/Update${upperTable}", {o${upperTable} : row}, r=> {
                                CommonAlert("保存成功!", "提示", "success")
                                this.refreshData()
                            })
                        } else {
                            return false;
                        }
                    });
                },
                loadData() {
                    let that = this;
                    PostData("${upperTable}Service.asmx/WSearch", this.parsedSearchParam, function (r) {
                        that.data = r
                        that.loading = false;
                    })
                }
            }
        })
        </script>
    </body>
    </html>
    `
    save("C:/web/MES/test.html", template)
}