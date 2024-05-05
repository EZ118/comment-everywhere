// ==UserScript==
// @name         评论一切 comment-everywhere
// @namespace    https://ez118.github.io/
// @version      0.1
// @description  在任意网页都能留下自己的评论
// @author       ZZY_WISU
// @match        https://*/*
// @match        http://*/*
// @connect      *
// @license      GNU GPLv3
// @icon         data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgc3R5bGU9InZlcnRpY2FsLWFsaWduOiBtaWRkbGU7ZmlsbDogY3VycmVudENvbG9yO292ZXJmbG93OiBoaWRkZW47IiB2aWV3Qm94PSIwIDAgMTA4OCAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwODggMHY3ODAuOGwtMjA0LjggNTEuMi0xNjAgMTc5LjJjLTYuNCA2LjQtMTkuMiAxMi44LTI1LjYgMTIuOC02LjQgMC0xMi44IDAtMTkuMi02LjQtMTIuOC0xMi44LTEyLjgtMzIgMC00NC44bDE3Mi44LTE5OC40IDE3OS4yLTQ0LjhWNjRINjR2NjU5LjJoNTc2YzE5LjIgMCAzMiAxMi44IDMyIDMycy0xMi44IDMyLTMyIDMySDBWMGgxMDg4ek0yNTYgMzg0YzAgMzguNCAyNS42IDY0IDY0IDY0czY0LTI1LjYgNjQtNjQtMjUuNi02NC02NC02NC02NCAyNS42LTY0IDY0eiBtMjI0IDBjMCAzOC40IDI1LjYgNjQgNjQgNjRzNjQtMjUuNiA2NC02NC0yNS42LTY0LTY0LTY0LTY0IDI1LjYtNjQgNjR6TTgzMiAzODRjMC0zOC40LTI1LjYtNjQtNjQtNjRzLTY0IDI1LjYtNjQgNjQgMjUuNiA2NCA2NCA2NCA2NC0zMiA2NC02NHoiIGZpbGw9IiM4MDgwODAiPjwvcGF0aD48L3N2Zz4=
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js
// @require      https://cdn.bootcss.com/blueimp-md5/2.12.0/js/md5.min.js
// ==/UserScript==

var currentServer = "http://localhost/";
var userInfo = { "name": "EZ118", "id": "1145141919810" };
var pageSize = 20;
var serverCfg = [];
var commentContainer;

function runAsync(url,send_type,data_ry) {
    var p = new Promise((resolve, reject)=> {
        GM_xmlhttpRequest({
            method: send_type, url: url, headers: {"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}, data: data_ry,
            onload: function(response){resolve(response.responseText);}, onerror: function(response){resolve("response-error");}
        });
    });
    return p;
}

function getRequest(url, func) {
    runAsync(url,"GET","").then((result)=>{ return result; }).then(function(result){
        if(result == "response-error") { func(null) }
        func(result);
    });
}

function escapeHtml(str) {
    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, (match) => htmlEntities[match]);
}

function getCurrentUrl(){
    var url = window.location.href + "#";
    return url.split("#")[0];
}

function getServerConfig(url, func){
    getRequest(url, function(res){
        try{
            var result = JSON.parse(res);
            if(!result.info || !result.api) { alert("无法获得服务器基本信息"); return; }
            if(result.info.status != "online") { alert("服务器被配置为非工作状态，暂时无法链接"); alert("【公告】" + result.info.noticeboard); return; }
            result.url = url;
            func(result);
        } catch {
            alert("无法处理服务器传回的信息");
            return;
        }
    });
}

function getComments(url, servercfg, containerEle){
    var newUrl = servercfg.api.get_comments.replace("{{url}}", encodeURI(url)).replace("{{page_size}}", pageSize).replace("{{page_number}}", 1);
    getRequest(currentServer + "/" + newUrl, function(res){
        var result = JSON.parse(res);
        if(result.code != 0) { containerEle.innerHTML += "<b>服务器返回了错误信息</b><br><i>" + result.msg + "</i>"; return; }
        var html = "<h1>当前评论</h1><p class='notice'>【公告】" + escapeHtml(servercfg.info.noticeboard) + "</p>";
        for(let i = result.data.length - 1; i >= 0; i --) {
            html += `<div class="item">
                     ◩&nbsp;` + escapeHtml(result.data[i].user_name) + `&nbsp;[评论ID:` + escapeHtml(result.data[i].cid) + `]<br>
                     ` + escapeHtml(result.data[i].content) + `<br>
                     <span class="pubdate">` + escapeHtml(result.data[i].date) + `</span>
                 </div>`;
        }
        /* ▣◩ */
        containerEle.innerHTML = html;
    });
}

function sendComments(url, servercfg, content, username, userid){
    var newUrl = servercfg.api.submit_comments.replace("{{url}}", encodeURI(url)).replace("{{user_id}}", encodeURI(userid)).replace("{{user_name}}", encodeURI(username)).replace("{{content}}", encodeURI(content));
    getRequest(currentServer + "/" + newUrl, function(res){
        var result = JSON.parse(res);
        if(result.code == 0) { alert("ok"); getComments(url, servercfg, commentContainer) }
        else { alert(result.msg) }
    });
}

function delComments(url, servercfg, commentid, userid){
    var newUrl = servercfg.api.delete_comments.replace("{{comment_id}}", encodeURI(commentid)).replace("{{user_id}}", encodeURI(userid));
    getRequest(currentServer + "/" + newUrl, function(res){
        var result = JSON.parse(res);
        if(result.code == 0) { alert("ok"); }
        else { alert(result.msg) }
    });
}

var menu1 = GM_registerMenuCommand('用户设置', function () {
    try{ var origval = GM_getValue("userInfo").name; } catch { var origval = null; }
    var val = prompt("【用户设置】请设置用户名以使用脚本（请勿以敏感字符作为用户名）", origval ?? "");
    var gen_id = md5(val + Date.now()).substring(0,10);
    if(val) { GM_setValue("userInfo", {"name": val, "id": gen_id})}
    else { alert("无效的用户名，请重新设置") }
}, 'u');
var menu2 = GM_registerMenuCommand('删除评论', function () {
    var val = prompt("【删除评论】请输入需要删除的评论ID（只能删除自己的评论）", "");
    if(!val) { alert("无效的ID") }
    delComments(getCurrentUrl(), serverCfg, val, userInfo.id);
}, 'o');

(function() {
    'use strict';

    if(!GM_getValue("userInfo")) { alert("【评论一切 comment-everywhere】未设置用户名，请在该页面任意位置右键->Tampermonkey->评论一切->用户设置，自定义个人昵称/用户名，方可使用") }
    else { userInfo = GM_getValue("userInfo"); }

    GM_addStyle(`.userscript-commentContainer{ position:fixed; top:5vh; right:-300px; bottom:5vh; z-index:9998; width:310px; height:calc(90vh - 10px); background:#d4d9e8ed; color:#333; transition: all .1s; border:1px dashed blue; overflow-x:hidden; overflow-y:scroll; border-radius:15px 0px 0px 15px; padding:5px; }
                 .userscript-commentContainer:hover{ right: -1px; }
                 .userscript-commentContainer h1{ font-size:large; font-weight:bold; margin:10px; }
                 .userscript-commentContainer .notice { font-size:medium; font-weight:light; padding:5px; border:1px solid #52add2; background:#bfecff; color:#3c98bd; word-wrap:break-word; word-break:normal; margin:5px 10px; width:260px; border-radius:10px; }
                 .userscript-commentContainer .item{ font-size:medium; font-weight:light; padding: 5px; border:1px solid #969baa; margin: 5px 10px; word-wrap:break-word; word-break:normal; width:260px; background:#e1e6f5cd; border-radius: 10px; }
                 .userscript-commentContainer .item .pubdate{ font-size: small; color: #888; user-select:none; }
                 .userscript-commentBtn { position: fixed; bottom: 10px; right: 10px; padding: 5px 8px; border:2px solid #138AF1; border-radius:15px; z-index: 9999; font-size: large; background:AAA; cursor: pointer; }
                 `);
    commentContainer = document.createElement("div");
    commentContainer.setAttribute("class", "userscript-commentContainer");
    commentContainer.setAttribute("id", "userscript-commentContainer");
    document.body.appendChild(commentContainer);
    commentContainer.innerHTML = "";

    var commentBtn = document.createElement("button");
    var commentBtnTxt = document.createTextNode("📝");
    commentBtn.setAttribute("class", "userscript-commentBtn");
    document.body.appendChild(commentBtn);
    commentBtn.appendChild(commentBtnTxt);

    var url = getCurrentUrl();
    getServerConfig(currentServer, function(server_cfg){
        serverCfg = server_cfg;
        getComments(url, server_cfg, commentContainer);

        $(commentBtn).click(function(){
            var val = prompt("输入评论内容", "");
            if(val){ sendComments(url, server_cfg, val, userInfo.name, userInfo.id); }
        });
    });


})();