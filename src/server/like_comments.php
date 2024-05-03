<?php
include 'conn.php';

// 获取传入的参数
$comment_id = $_GET['commentid'];

// 连接数据库
$conn = connectDatabase();

// 创建临时文件句柄
$temp_file_handle = fopen('php://temp', 'w+');

// 标记是否找到对应评论
$found = false;

// 读取评论并更新点赞数
while (($data = fgetcsv($conn)) !== FALSE) {
    if ($data[2] == $comment_id) {
        $found = true;
        $data[6] = (int)$data[6] + 1; // 点赞数加1
    }
    fputcsv($temp_file_handle, $data);
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
if ($found) {
    echo json_encode(['message' => '点赞成功']);
} else {
    echo json_encode(['error' => '评论不存在']);
}
?>
