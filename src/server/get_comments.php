<?php
include 'conn.php';

// 检查是否传入了 URL 参数
if (!isset($_GET['url'])) {
    echo json_encode(['code' => 412, 'msg' => 'URL parameter is missing', 'total' => 0, 'data' => []]);
    exit();
}

// 获取传入的参数
$url = $_GET['url'];
$page_size = $_GET['ps'];
$page_number = $_GET['pn'];

// 连接数据库
$conn = connectDatabase();

// 读取评论
$comments = [];
while (($data = fgetcsv($conn)) !== FALSE) {
    if ($data[0] == $url) {
        $comment = [
            'cid' => $data[2],
            'user_id' => $data[3],
            'user_name' => $data[4],
            'date' => $data[5],
            'content' => $data[1],
            'likes' => (int)$data[6] // 添加点赞数字段
        ];
        $comments[] = $comment;
    }
}

// 分页处理
$total_comments = count($comments);
$start_index = ($page_number - 1) * $page_size;
$end_index = $start_index + $page_size;
$paginated_comments = array_slice($comments, $start_index, $page_size);

// 关闭数据库连接
closeDatabase($conn);

// 返回结果
$response = [
    'code' => 0,
    'msg' => 'success',
    'total' => $total_comments,
    'data' => $paginated_comments
];
echo json_encode($response);
?>
