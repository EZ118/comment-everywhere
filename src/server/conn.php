<?php
// 数据库文件路径
$database_path = "comments.csv";

// 连接数据库
function connectDatabase() {
    global $database_path;
    return fopen($database_path, "a+");
}

// 关闭数据库连接
function closeDatabase($conn) {
    fclose($conn);
}
?>
