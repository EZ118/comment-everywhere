<?php
    echo json_encode([
        "info" => [
            "name" => "测试服务器",
            "version" => "0.1.0",
            "description" => "这是一个用于存储用户评论的服务器",
            "status" => "online",
            "noticeboard" => "欢迎来到服务器，在该服务器上你可以看到一些评论，并且可以自由提交自己的评论。"
        ],
        "api" => [
            "get_comments" => "get_comments.php?url={{url}}&ps={{page_size}}&pn={{page_number}}",
            "submit_comments" => "submit_comments.php?url={{url}}&content={{content}}&userid={{user_id}}&username={{user_name}}",
            "delete_comments" => "delete_comments.php?commentid={{comment_id}}&&userid={{user_id}}",
            "like_comments" => "like_comments.php?commentid={{comment_id}}",
        ]
    ]);
?>