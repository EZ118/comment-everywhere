<?php
include 'conn.php';

// 获取传入的参数
$comment_id = $_GET['commentid'];

// 连接数据库
$conn = connectDatabase();

// 创建临时文件句柄
$temp_file_handle = fopen('php://temp', 'w+');

// 读取评论并过滤掉需要删除的评论
while (($data = fgetcsv($conn)) !== FALSE) {
    if ($data[2] != $comment_id) {
        fputcsv($temp_file_handle, $data);
    }
}

// 关闭原始文件句柄
fclose($conn);

// 移动临时文件到原始文件位置
$temp_file_handle = fopen('php://temp', 'r');
$conn = connectDatabase();
while (($data = fgetcsv($temp_file_handle)) !== FALSE) {
    fputcsv($conn, $data);
}

// 关闭临时文件句柄
fclose($temp_file_handle);

// 关闭数据库连接
closeDatabase($conn);

// 返回结果
echo json_encode(['message' => 'success']);
?>
