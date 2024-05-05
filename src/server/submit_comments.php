<?php
include 'conn.php';

// 获取传入的参数
$url = $_GET['url'];
$content = $_GET['content'];
$user_id = $_GET['userid'];
$user_name = $_GET['username'];

// 检查必要参数是否为空
if (empty($url) || empty($content) || empty($user_id) || empty($user_name)) {
    echo json_encode(['code' => 412, 'msg' => 'URL, Content, User Name or User ID parameter is missing']);
    exit();
}

// 连接数据库
$conn = connectDatabase();

// 生成comment_id
$comment_id = uniqid();

// 初始点赞数为0
$likes = 0;

// 写入评论
$timestamp = date('Y-m-d H:i:s');
$new_comment = [$url, $content, $comment_id, $user_id, $user_name, $timestamp, $likes];
fputcsv($conn, $new_comment);

// 关闭数据库连接
closeDatabase($conn);

// 返回结果
echo json_encode(['code' => 0, 'msg' => 'success', 'comment_id' => $comment_id]);
?>
