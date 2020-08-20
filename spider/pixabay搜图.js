
var Crawler = require("crawler");
const mysql = require("mysql");
const waitUtil = require('wait-until');

let connection = mysql.createConnection({
    host     : '139.9.200.212',
    user     : 'root',
    password : '123456',//'Der5@^7jY*',
    database : 'meet_strangers'
  });
connection.connect()



function parsePage($) {
    $('.image-box img').each((i,o) => {
        if(!o.attribs['data-original']) return;
        connection.query(`update music_score set image_url = 'https:${o.attribs['data-original']}' where image_url is null limit 1`, [], (err, result) => {
            if(!!err) console.error(err, result)
        })
        console.log(o.attribs['data-original'])
    })
}

function parseHeaders(str) {
    let res = ''
    str.split("\n").forEach(s => {
        if (!s) return
        if (s.startsWith(":")) {
            s = s.substr(1)
            res += `':${s.split(":")[0]}': \`${s.split(":")[1].trim()}\`,\n`
        } else {
            res += `'${s.split(":")[0]}': \`${s.split(":")[1].trim()}\`,\n`
        }
    })
    return res
}

var c = new Crawler({
    rateLimit: 100,
    maxConnections : 5,
    headers: {
        'user-agent': `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36`
    },
    // 这个回调每个爬取到的页面都会触发
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        } else {
            var $ = res.$;
            // $默认使用Cheerio
            // 这是为服务端设计的轻量级jQuery核心实现
            parsePage($)
        }
        done();
    }
});

let iCurrentIndex = 114
waitEnqueueNext(iCurrentIndex)

function waitEnqueueNext(iIndex) {
    waitUtil()
    .interval(1000)
    .times(-1)
    .condition(() => {
        return c.queueSize < 1
    }).done(() => {
        const url = `https://www.58pic.com/piccate/17-0-0-p${iIndex}.html`
        console.log(`加入爬取队列 - ${url}`)
        c.queue(url)
        waitEnqueueNext(iIndex+1)
    })
}