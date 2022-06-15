<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

define('HOST', 'localhost');
define('USER', 'root');
define('PASS', 'Jl]D9m}8BN{G(&T1?4}w');
define('NAME', 'lightscreenDB');

$db = new mysqli(HOST ,USER ,PASS ,NAME);
if ($db->connect_errno) {
	die("Database connection error:" . $db->connect_errno);
}
?>