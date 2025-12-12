<?php

try {
    $pdo = new PDO('mysql:host=mysql;dbname=vibecode-full-stack-starter-kit_app;charset=utf8mb4', 'root', 'vibecode-full-stack-starter-kit_mysql_pass');
    $stmt = $pdo->query('select * from activity_logs order by id desc limit 20');
    $rows = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $row;
    }
    echo json_encode($rows, JSON_PRETTY_PRINT).PHP_EOL;
} catch (Throwable $e) {
    echo 'error: '.$e->getMessage().PHP_EOL;
}
