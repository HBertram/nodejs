var Crawler = require("crawler");
const mysql = require("mysql");
const fs = require("fs");
const waitUtil = require('wait-until');

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Der5@^7jY*',
    database : 'meet_strangers'
  });
connection.connect()


function parsePage(res) {
    var $ = res.$;
    const title = $(".album-container .media-heading").text().substr(3);
    const author = $(".album-container .performers").text()
    const difficult = $('.album-container .play-difficulty').attr("data-difficulty")
    const mp = $('#picswitch .pu-box img').map((i, o) => o.attribs.src)
    const lstHrefs = mp.toArray().map((href, i) => {
        return encodeURI(href);
    })
    const scoreId = res.options.iIndex
    const addScore = "insert into music_score (id,title,content,source_url,total_page,author,difficult) VALUES(?,?,?,?,?,?,?)"
    const addPage = "insert into music_score_page (music_score_id,`name`,`index`,url) VALUES(?,?,?,?)"
    connection.query(addScore,[scoreId, title, res.body, res.request.uri.href, lstHrefs.length, author, difficult],function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            return;
        }        
       console.log('INSERT TITLE(' + scoreId + '):',title);        
       lstHrefs.forEach((href, i) => {
            connection.query(addPage,[scoreId, title + "-" + (i+1), i+1, href],function (err, result) {
                if(err){
                    console.log('[INSERT ERROR] - ',err.message);
                    return;
                }
            });
       })
    });
}


var c = new Crawler({
    rateLimit: 10,
    maxConnections : 5,
    // 这个回调每个爬取到的页面都会触发
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        } else {
            // $默认使用Cheerio
            // 这是为服务端设计的轻量级jQuery核心实现
            parsePage(res)
        }
        done();
    }
});

let iCurrentIndex = 126
waitEnqueueNext(iCurrentIndex)
/*
c.queue(`https://www.hqgq.com/pu/show/${iCurrentIndex++}`)
for (let iMusicPageIndex = iCurrentIndex; iMusicPageIndex <= 2000; iMusicPageIndex++) {
    let iIndex = iMusicPageIndex
    waitUtil()
        .interval(500)
        .times(-1)
        .condition(() => {
            return c.queueSize <= 3 && iIndex == iCurrentIndex
        }).done(() => {
            iCurrentIndex ++
            console.log(`加入爬取队列 - https://www.hqgq.com/pu/show/${iIndex}`)
            c.queue(`https://www.hqgq.com/pu/show/${iIndex}`)
        })
}
*/

function waitEnqueueNext(iIndex) {
    waitUtil()
    .interval(50)
    .times(-1)
    .condition(() => {
        return c.queueSize <= 10
    }).done(() => {
        c.queue({
            uri: `https://www.hqgq.com/pu/show/${iIndex}`,
            iIndex: iIndex
        })
        waitEnqueueNext(iIndex+1)
    })
}