//搜索关键词
const keyword = '东莞模具'
//开始搜索的页码
let iCurrentIndex = 29
//登陆后的Cookie凭证
const cookie = `aliyungf_tc=AQAAAPnayXJtqQUA7wJ7dx/H+qDuh3qo; csrfToken=r9NhUFCzIr8IjYkBXpWQOg24; TYCID=d3f71f50dc6f11eaa693351f46844a1d; ssuid=9916168435; bannerFlag=false; _ga=GA1.2.1479475026.1597225415; Hm_lvt_e92c8d65d92d534b0fc290df538b4758=1595311002,1597125802; _gid=GA1.2.692545678.1597374260; RTYCID=e20fc6095e3d4f598b49757d223b3c9a; CT_TYCID=8dd70200f16945f189a3211cffb7833c; cloud_token=2f4cc32826264c98944e13bec89666fa; token=825c2ce4f9f946c8ac26184fbea49eb3; _utm=851f7d19a9ad42649e369443157c571b; tyc-user-info=%257B%2522claimEditPoint%2522%253A%25220%2522%252C%2522vipToMonth%2522%253A%2522false%2522%252C%2522explainPoint%2522%253A%25220%2522%252C%2522personalClaimType%2522%253A%2522none%2522%252C%2522integrity%2522%253A%252210%2525%2522%252C%2522state%2522%253A%25225%2522%252C%2522score%2522%253A%25224656%2522%252C%2522surday%2522%253A%2522145%2522%252C%2522announcementPoint%2522%253A%25220%2522%252C%2522bidSubscribe%2522%253A%2522-1%2522%252C%2522vipManager%2522%253A%25220%2522%252C%2522monitorUnreadCount%2522%253A%2522143%2522%252C%2522discussCommendCount%2522%253A%25221%2522%252C%2522onum%2522%253A%252240%2522%252C%2522showPost%2522%253Anull%252C%2522claimPoint%2522%253A%25220%2522%252C%2522token%2522%253A%2522eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzYwMjUxOTYzMCIsImlhdCI6MTU5NzM3NTUwOSwiZXhwIjoxNjI4OTExNTA5fQ.74Jn2bv_ZLfw2uozPRuV41sSwSO9MDPD8_1_J5ySKNFDWNQTTha9gh1y9_OfIMYgytfexPluCVfrIRLPUu2hcg%2522%252C%2522schoolAuthStatus%2522%253A%25222%2522%252C%2522vipToTime%2522%253A%25221609849420777%2522%252C%2522scoreUnit%2522%253A%2522%2522%252C%2522redPoint%2522%253A%25220%2522%252C%2522myTidings%2522%253A%25220%2522%252C%2522companyAuthStatus%2522%253A%25222%2522%252C%2522myAnswerCount%2522%253A%25220%2522%252C%2522myQuestionCount%2522%253A%25220%2522%252C%2522signUp%2522%253A%25220%2522%252C%2522privateMessagePointWeb%2522%253A%25220%2522%252C%2522nickname%2522%253A%2522%25E8%25B4%259D%25E5%25A4%259A%25E8%258A%25AC%2522%252C%2522privateMessagePoint%2522%253A%25220%2522%252C%2522bossStatus%2522%253A%25222%2522%252C%2522isClaim%2522%253A%25220%2522%252C%2522yellowDiamondEndTime%2522%253A%25220%2522%252C%2522isExpired%2522%253A%25220%2522%252C%2522yellowDiamondStatus%2522%253A%2522-1%2522%252C%2522pleaseAnswerCount%2522%253A%25221%2522%252C%2522bizCardUnread%2522%253A%25220%2522%252C%2522vnum%2522%253A%252260%2522%252C%2522mobile%2522%253A%252213602519630%2522%257D; auth_token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzYwMjUxOTYzMCIsImlhdCI6MTU5NzM3NTUwOSwiZXhwIjoxNjI4OTExNTA5fQ.74Jn2bv_ZLfw2uozPRuV41sSwSO9MDPD8_1_J5ySKNFDWNQTTha9gh1y9_OfIMYgytfexPluCVfrIRLPUu2hcg; tyc-user-phone=%255B%252213602519630%2522%252C%2522188%25202607%25205574%2522%255D; Hm_lpvt_e92c8d65d92d534b0fc290df538b4758=1597375525`
//爬虫时间间隔(单位:毫秒)
const rateLimit = 2000





var Crawler = require("crawler");
const fs = require("fs");
const waitUtil = require('wait-until');
const mysql = require("mysql");

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Der5@^7jY*',
    database : 'imould-mes'
  });
connection.connect()


var c = new Crawler({
    rateLimit: rateLimit,
    maxConnections : 1,
    headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36`,
        //'Accept-Encoding': `gzip, deflate, br`,
        //'Accept-Language': `zh-CN,zh;q=0.9`,
        //'Cache-Control':`no-cache`,
        //'Connection': `keep-alive`,
        //'Content-Length': `292`,
        //'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
        'Cookie': cookie,
        'Origin': `https://www.tianyancha.com`,
        'Pragma': `no-cache`,
        'Referer': `https://www.tianyancha.com/search/p1?key=${encodeURIComponent(keyword)}`
    },
    // 这个回调每个爬取到的页面都会触发
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        } else {
            const page_index = res.options.iIndex
            var $ = res.$;
            // $默认使用Cheerio
            // 这是为服务端设计的轻量级jQuery核心实现
            $(".search-item .header .name").map((i, o) => o.attribs.href).toArray().forEach((s) => {
                c.queue({
                    uri: s,
                    callback: (error, res, done) => {
                        if(error){
                            console.error(err.stack);
                        }else{
                            let $ = res.$
                            const view_count = $(".company-header-block .visitor-content .pv-txt").text().substr(4)
                            let phone = ""
                            try {
                                let txt = $('#company_web_top > div.box.-company-box > div.content > div.detail > div:nth-child(1) > div.in-block.sup-ie-company-header-child-1 > span:nth-child(3) > span').text()
                                if (txt.indexOf('[') >= 0 && txt.indexOf(']') >= 0) {
                                    phone = JSON.parse(txt.substr(txt.indexOf('['), txt.lastIndexOf(']')-txt.indexOf('[')+1))[0].phoneNumber
                                } else {
                                    phone = JSON.parse(txt.replace("查看更多修改电话认证成功后，即可在个人中心修改企业联系电话，让客户精准联系，避免不必要的打扰",''))[0].phoneNumber
                                }
                            } catch(e) {
                                phone = $('#company_web_top > div.box.-company-box > div.content > div.detail > div:nth-child(1) > div.in-block.sup-ie-company-header-child-1').text()
                            }
                            const address = $('#company_web_top > div.box.-company-box > div.content > div.detail > div.f0.clearfix > div.in-block.sup-ie-company-header-child-2 > div > div').text()
                            const name = $('#company_web_top > div.box.-company-box > div.content > div.header > h1').text()
                            const description = $('#company_web_top > div.box.-company-box > div.content > div.detail > div.summary > div > div').text()
                            const legal_person = $('#_container_baseInfo > table:nth-child(1) > tbody > tr:nth-child(1) > td.left-col.shadow > div > div:nth-child(1) > div.humancompany > div.name > a').text()
                            const website = $('#company_web_top > div.box.-company-box > div.content > div.detail > div.f0.clearfix > div.in-block.sup-ie-company-header-child-1 .company-link').text()
                            const email = $('#company_web_top > div.box.-company-box > div.content > div.detail > div:nth-child(1) > div.in-block.sup-ie-company-header-child-2 > span:nth-child(2)').text()
                            const registered_capital = $('#_container_baseInfo > table.table.-striped-col.-border-top-none.-breakall > tbody > tr:nth-child(1) > td:nth-child(2) > div').text()
                            const establish_time = $('#_container_baseInfo > table.table.-striped-col.-border-top-none.-breakall > tbody > tr:nth-child(2) > td:nth-child(2) > div').text()
                            const status = $('#_container_baseInfo > table.table.-striped-col.-border-top-none.-breakall > tbody > tr:nth-child(2) > td:nth-child(4)').text()
                            const number_of_insured_persons = $('#_container_baseInfo > table.table.-striped-col.-border-top-none.-breakall > tbody > tr:nth-child(8) > td:nth-child(4)').text()
                            const business = $('#_container_baseInfo > table.table.-striped-col.-border-top-none.-breakall > tbody > tr:nth-child(11) > td:nth-child(2) > span').text()

                            const addSql = "insert into tianyan_company (`name`, `address`, `phone`, `view_count`, `description`, `legal_person`, `website`, `email`, `registered_capital`, `establish_time`, `status`, `number_of_insured_persons`, `business`, `page_index`, `keyword`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

                            connection.query(addSql,[name, address, phone, view_count, description, legal_person, website, email, registered_capital, establish_time, status, number_of_insured_persons, business, page_index, keyword],function (err, result) {
                                if(err){
                                    console.log('[INSERT ERROR] - ',err.message);
                                    return;
                                }
                                console.log("插入成功，公司名称：" + name)
                            });
                        }
                        
                        done();
                    }
                })
            })
        }
        done();
    }
});




c.queue({
    uri: `https://www.tianyancha.com/search/p${iCurrentIndex}?key=${encodeURIComponent(keyword)}`,
    iIndex: iCurrentIndex
})

waitEnqueueNext(iCurrentIndex+1)
function waitEnqueueNext(iIndex) {
    waitUtil()
    .interval(3000)
    .times(-1)
    .condition(() => {
        return c.queueSize < 1
    }).done(() => {
        console.log(`接下来爬取第${iIndex}页数据`)
        c.queue({
            uri: `https://www.tianyancha.com/search/p${iIndex}?key=${encodeURIComponent(keyword)}`,
            iIndex: iIndex
        })
        waitEnqueueNext(iIndex+1)
    })
}
