let fs = require("fs")
let mysql = require("mysql");

let table = "tbl_steel_nc"
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
  columns = results
  results.forEach((s) => {
    //console.log("m_"  + toCamel(getPrefix(s["data_type"]) + s['column_name']))
  })
  createTableBaseCode()
  createTableServiceBaseCode()
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
function createTableServiceBaseCode() {
  let template = 
  `
'************************************************
'
'    作用/描述： 数据库表 [${table}]映射类,本类自动实现数据库的增删查改分页等操作
'    注意：  本文件由工具自动生成，切勿手动修改，需要新增功能时，新建一个类并继承此类，新功能在子类中实现即可，避免重新生成代码时被覆盖。
'
'    作者：NodeJsCoder
'    日期：${new Date().toString()}
'
'************************************************

Imports System.Web
Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.Web.Script.Services
Imports System.Web.Script.Serialization
Imports iMouldBaseLib


' 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消注释以下行。
<System.Web.Script.Services.ScriptService()> _
<WebService(Namespace:="http://tempuri.org/")> _
<WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)> _
<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Public Class C${upperTable}ServiceBase
    Inherits CommonService

    '根据ID查信息
    <WebMethod(True)> _
    Public Overridable Function Get${upperTable}(ByVal id As Integer, ByRef o${upperTable} As C${upperTable}) As Boolean
        o${upperTable}.id = id
        Return o${upperTable}.GetRecord(m_oDb)
    End Function

    '【Web版】根据ID查信息
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function WGet${upperTable}(ByVal id As Integer) As String
        Try
            Dim o${upperTable} As C${upperTable} = New C${upperTable} With {.id = id}
            If Not o${upperTable}.GetRecord(m_oDb) Then
                Return MesCommonLib.COMMONERROR("没有查询到数据")
            End If
            Return MesCommonLib.SUCCESSRESULT(o${upperTable})
        Catch ex As Exception
            m_oLog.ErrorLog("WGet${upperTable} fail! exception:" + ex.Message + "  ;stack:" + ex.StackTrace)
            Return ex.Message
        End Try
    End Function

    '添加信息
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function Add${upperTable}(ByVal o${upperTable} As C${upperTable}) As Boolean
        Dim bRet As Boolean = True

        Try
            o${upperTable}.InsertRecord(m_oDb)
            bRet = o${upperTable}.GetRecord(m_oDb)

        Catch ex As Exception
            m_oLog.ErrorLog("Add${upperTable} fail! exception:" + ex.Message + "  ;stack:" + ex.StackTrace)
            bRet = False
        End Try

        Return bRet
    End Function

    '根据ID删除信息
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function Delete${upperTable}(ByVal id As Integer) As Boolean
        Dim o${upperTable} As C${upperTable} = New C${upperTable}
        o${upperTable}.id = id

        Dim bRet As Boolean = True
        Try
            bRet = o${upperTable}.DeleteRecord(m_oDb)
        Catch ex As Exception
            m_oLog.ErrorLog("Delete${upperTable} fail! exception:" + ex.Message + "| id=" + id.ToString + "  ;stack:" + ex.StackTrace)
            bRet = False
        End Try

        Return bRet
    End Function

    '修改信息
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function Update${upperTable}(ByVal o${upperTable} As C${upperTable}) As Boolean
        Dim bRet As Boolean = True
        Try
            bRet = o${upperTable}.UpdateRecord(m_oDb)
        Catch ex As Exception
            m_oLog.ErrorLog("Update${upperTable} fail! exception:" + ex.Message + "  ;stack:" + ex.StackTrace)
            bRet = False
        End Try

        Return bRet
    End Function

    '【web版】条件查询
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function WSearch${upperTable}s(o${upperTable} As C${upperTable}, strOrder As String, ByVal iPageNum As Integer, ByVal iPageSize As Integer) As String
        Dim oPageQ As CPageQueryResult(Of C${upperTable}) = New CPageQueryResult(Of C${upperTable})
        If o${upperTable}.GetCustomerRecordListByPage(o${upperTable}.GetStrWhere(m_oDb), strOrder, iPageNum, iPageSize, oPageQ, m_oDb) Then
            Return JSON.stringify(oPageQ)
        End If
        Return MesCommonLib.COMMONERROR
    End Function

    '分页查询
    <WebMethod(True)> _
    Public Overridable Function Get${upperTable}sByPage(ByVal iPageNum As Integer, ByVal iPageSize As Integer, _
           ByRef oPageQueryResult As CPageQueryResult(Of C${upperTable})) As Boolean
        Dim o${upperTable} As C${upperTable} = New C${upperTable}
          If HasPermit("delete_${table}") Then
              oPageQueryResult.m_iCanDelete = 1
          End If
          If HasPermit("add_${table}") Then
              oPageQueryResult.m_iCanAdd = 1
          End If
          If HasPermit("update_${table}") Then
              oPageQueryResult.m_iCanModify = 1
          End If
        Return o${upperTable}.GetRecordListByPage(iPageNum, iPageSize, oPageQueryResult, m_oDb)
    End Function

    '【web版】分页查询
    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function WGet${upperTable}sByPage(ByVal iPageNum As Integer, ByVal iPageSize As Integer) As String
        Try
            Dim oPageQueryResult As CPageQueryResult(Of C${upperTable}) = New CPageQueryResult(Of C${upperTable})
            Get${upperTable}sByPage(iPageNum, iPageSize, oPageQueryResult)
            Dim strJson As String = JSON.stringify(oPageQueryResult)
            Return strJson
        Catch ex As Exception
            m_oLog.ErrorLog("WGet${upperTable}sByPage fail! exception:" + ex.Message + "  ;stack:" + ex.StackTrace)
            Return ex.Message + " " + ex.StackTrace
        End Try
    End Function

    <WebMethod(True)> _
    <ScriptMethod(UseHttpGet:=False, ResponseFormat:=ResponseFormat.Json, XmlSerializeString:=False)> _
    Public Overridable Function BatchDelete${upperTable}s(ByVal ids As String) As String
        If HasPermit("delete_${table}") = False Then
            Return MesCommonLib.COMMONERROR("没有权限")
        End If

        Dim arrDeleteIds As List(Of String) = ids.Split(","c).ToList.FindAll(Function(s) s <> "")

        If arrDeleteIds.Count = 0 Then
            Return MesCommonLib.COMMONERROR("没有选择删除项")
        End If

        Dim iSuccessCount As Integer = 0
        For i As Integer = 0 To arrDeleteIds.Count - 1
            If arrDeleteIds(i) = "" Then
                Continue For
            End If
            Dim o${upperTable} As C${upperTable} = New C${upperTable}
            o${upperTable}.id = Integer.Parse(arrDeleteIds(i))
            If o${upperTable}.DeleteRecord(m_oDb) Then
                iSuccessCount += 1
            End If
        Next

        Return If(iSuccessCount = arrDeleteIds.Count, MesCommonLib.SUCCESSRESULT, MesCommonLib.COMMONERROR("删除异常，其中" & iSuccessCount & "/" & arrDeleteIds.Count & "删除成功"))
    End Function

    '自定义条件分页查询,内部调用
    Protected Overridable Function Search${upperTable}sByPage(ByVal strWhere As String, strOrder As String, ByVal iPageNum As Integer, _
              ByVal iPageSize As Integer, ByRef oPageResult As CPageQueryResult(Of C${upperTable})) As Boolean
        If HasPermit("list_${table}") = False Then
            Return False
        End If

          If HasPermit("delete_${table}") Then
              oPageResult.m_iCanDelete = 1
          End If
          If HasPermit("add_${table}") Then
              oPageResult.m_iCanAdd = 1
          End If
          If HasPermit("update_${table}") Then
              oPageResult.m_iCanModify = 1
          End If
        Dim o${upperTable} As C${upperTable} = New C${upperTable}

        Try
            Return o${upperTable}.GetCustomerRecordListByPage(strWhere, strOrder, iPageNum, iPageSize, oPageResult, m_oDb)
        Catch ex As Exception
            m_oLog.ErrorLog("Search${upperTable}sByPage fail! exception:" + ex.Message + "  ;stack:" + ex.StackTrace)
            Return False
        End Try
    End Function


End Class


  `
  save(`Output/${table}/C${upperTable}ServiceBase.vb`, template)
}
function createTableBaseCode() {

  let mapper = columns.map((o) => {
    let type = o["data_type"]
    let name = o["column_name"]
    if (name.toLowerCase() == "id") return ""
    return `      MapMember("${"m_"  + toCamel(getColumnPrefix(type) + "_" + name)}", New SDbColumnInfo("${name}", EDbColumnTypes.${getColumnDBType(type)}, ${type=="int" || type == "smallint" ? "8" : "255"}))`
  })

  let properties = columns.map((o) => {
    let type = o["data_type"]
    let name = o["column_name"]
    if (name.toLowerCase() == "id") return ""
    return `      Public Property ${"m_"  + toCamel(getColumnPrefix(type) + "_" + name)} As ${getColumnType(type)}`
  })


  let template = `
  '************************************************
  '
  '    作用/描述： 数据库表 [${table}]映射类,本类自动实现数据库的增删查改分页等操作
  '    注意：  本文件由工具自动生成，切勿手动修改，需要新增功能时，新建一个类并继承此类，新功能在子类中实现即可，避免重新生成代码时被覆盖。
  '
  '    作者：NodeJsCoder
  '    日期：${new Date().toString()}
  '
  '************************************************
  
  Imports iMouldBaseLib
  Imports System.Data
  
  
  <Serializable()> Public Class C${upperTable}Base
      Inherits CDbTableBase
  
      Public Sub New()
          MyBase.New("${table}")
          m_strDbName="${schema}"
      End Sub
  
      Public Overridable Function GetStrWhere(oDb As MySqlDb, Optional joiner As String = " And ") As String
          Return ""
      End Function
  
      Protected Overrides Sub MapAllMembers()
          ${mapper.join("\n")}
      End Sub
  
      ${properties.join("\n")}
  
  End Class
  `
  save(`Output/${table}/C${upperTable}Base.vb`, template)
}
