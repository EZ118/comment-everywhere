// ==UserScript==
// @name         评论一切 everywhereComment
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
            onload: function(response){resolve(response.responseText);}, onerror: function(response){reject("请求失败");}
        });
    });
    return p;
}

function getRequest(url, func) {
    runAsync(url,"GET","").then((result)=>{ return result; }).then(function(result){
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
            if(!result.info || !result.api) { throw new Error("无法获得服务器基本信息"); }
            result.url = url;
            func(result);
        } catch {
            func({ "info": { "name": "无效的服务器", "version": "0.0.1", "description": "不是有效服务器", "status": "invalid", "noticeboard": "无效服务器，请重新添加", "url":"" }, "api": { "get_comments": "get_comments.php?url={{url}}&ps={{page_size}}&pn={{page_number}}", "submit_comments": "submit_comments.php?url={{url}}content={{content}}&userid={{user_id}}&username={{user_name}}", "delete_comments": "delete_comments.php?commentid={{comment_id}}" } });
        }
    });
}

function getComments(url, servercfg, containerEle){
    var newUrl = servercfg.api.get_comments.replace("{{url}}", encodeURI(url)).replace("{{page_size}}", pageSize).replace("{{page_number}}", 1);
    getRequest(currentServer + "/" + newUrl, function(res){
        var result = JSON.parse(res);
        if(result.code != 0) { containerEle.innerHTML += "<b>服务器返回了错误信息</b><br><i>" + result.msg + "</i>"; return; }
        var html = "<h1>当前评论</h1><i>&nbsp;&nbsp;服务器公告：" + escapeHtml(servercfg.info.noticeboard) + "</i>";
        for(let i = result.data.length - 1; i >= 0; i --) {
            html += `<div class="userscript-commentItem">
                     ◩&nbsp;` + result.data[i].user_name + `&nbsp;[UID:` + result.data[i].user_id + `]<br>
                     ` + result.data[i].content + `<br>
                     <span class="pubdate">` + result.data[i].date + `</span>
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
        if(!result.error) { alert("ok"); getComments(url, servercfg, commentContainer) }
        else { alert(result.error) }
    });
}

(function() {
    'use strict';

    GM_addStyle(`.userscript-webPreviewBtn{ background:#FFF; padding:3px 13px; margin-left:5px; border-radius:10px; border:2px solid #555; cursor:pointer; }
                 .userscript-webPreviewBtn:active{ background:#111; border:2px solid #AAA; }
                 .userscript-commentContainer{ position:fixed; top:5vh; right:-300px; bottom:5vh; z-index:9998; width:310px; height:calc(90vh - 10px); background:#d4d9e8ed; color:#333; transition: all .1s; border:1px dashed blue; overflow-x:hidden; overflow-y:scroll; border-radius:15px 0px 0px 15px; padding:5px; }
                 .userscript-commentContainer:hover{ right: -1px; }
                 .userscript-commentItem{ padding: 10px; margin: 8px 10px; width:250px; background:#e1e6f5cd; border-radius: 10px; }
                 .userscript-commentItem .pubdate{ font-size: small; color: #888; user-select:none; }
                 .userscript-commentBtn { position: fixed; bottom: 10px; right: 10px; padding: 5px 8px; border:2px solid #138AF1; border-radius:15px; z-index: 9999; font-size: large; background:AAA; cursor: pointer; }
                 h1{ margin:10px; }
                 `);
    commentContainer = document.createElement("div");
    commentContainer.setAttribute("class", "userscript-commentContainer");
    commentContainer.setAttribute("id", "userscript-commentContainer");
    document.body.appendChild(commentContainer);
    commentContainer.innerHTML = "";

    var commentBtn = document.createElement("button");
    var commentBtnTxt = document.createTextNode(" 📝 ");
    commentBtn.setAttribute("class", "userscript-commentBtn");
    document.body.appendChild(commentBtn);
    commentBtn.appendChild(commentBtnTxt);

    var url = getCurrentUrl();
    getServerConfig(currentServer, function(serverCfg){
        getComments(url, serverCfg, commentContainer);

        $(commentBtn).click(function(){
            var val = prompt("输入评论内容", "");
            if(val){ sendComments(url, serverCfg, val, userInfo.name, userInfo.id); }
        });
    });


})();