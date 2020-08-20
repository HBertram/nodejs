var Crawler = require("crawler");
const fs = require("fs");
const mysql = require("mysql");
const waitUtil = require('wait-until');

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

function download(err, res, done) {
    if(err){
        console.error(err.stack);
    }else{
        save(res.options.filename, res.body)
        console.log("下载完成 - " + res.options.filename)
        //fs.createWriteStream(res.options.filename).write(res.body);
    }
    
    done();
}

function parsePage($) {
    const title = $(".album-container .media-heading").text().substr(3);
    const mp = $('#picswitch .pu-box img').map((i, o) => o.attribs.src)
    c.queue(mp.toArray().map((href, i) => {
        return {
            encoding: null,
            uri: encodeURI(href),
            jQuery: false,
            filename: `../钢琴谱/${title}/${title}-${i+1}.png`,
            // 覆盖全局的callback
            callback: download
        }
    }))
    console.log("解析完成 - " + title)
}


var c = new Crawler({
    rateLimit: 10,
    maxConnections : 5,
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

let iCurrentIndex = 57593
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
    .interval(1000)
    .times(-1)
    .condition(() => {
        save(`../钢琴谱/index.txt`, '' + iIndex)
        console.log("queue size = " + c.queueSize)
        return c.queueSize <= 10
    }).done(() => {
        console.log(`加入爬取队列 - https://www.hqgq.com/pu/show/${iIndex}`)
        c.queue(`https://www.hqgq.com/pu/show/${iIndex}`)
        waitEnqueueNext(iIndex+1)
    })
}