<?php
include 'conn.php';

// 检查是否传入了评论ID和用户ID参数
if (!isset($_GET['commentid']) || !isset($_GET['userid'])) {
    echo json_encode(['code' => 412, 'msg' => 'Comment ID or User ID parameter is missing']);
    exit();
}

// 获取传入的评论ID和用户ID
$comment_id = $_GET['commentid'];
$user_id = $_GET['userid'];

// 打开数据库文件
$file = fopen($database_path, 'r');

// 找到带有指定评论ID的数据行
$comments = [];
$found = false;
while (($data = fgetcsv($file)) !== FALSE) {
    if ($data[2] == $comment_id) {
        $found = true;
        // 判断用户ID是否匹配，如果匹配则删除评论
        if ($data[3] == $user_id) {
            // 删除评论
            continue;
        } else {
            fclose($file);
            echo json_encode(['code' => 403, 'msg' => 'User ID does not match, cannot delete comment']);
            exit();
        }
    }
    $comments[] = $data;
}
fclose($file);

// 如果找不到指定评论ID的数据行，返回错误消息
if (!$found) {
    echo json_encode(['code' => 404, 'msg' => 'Comment ID not found']);
    exit();
}

// 打开数据库文件以写入
$file = fopen($database_path, 'w');
foreach ($comments as $comment) {
    fputcsv($file, $comment);
}
fclose($file);

// 返回成功消息
echo json_encode(['code' => 0, 'msg' => 'Comment deleted successfully']);
?>
