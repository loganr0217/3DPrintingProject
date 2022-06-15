<?php
include 'database.php';
$users = [];

$sql = "SELECT * FROM users";
if($result = $db->query($sql))
{
	$i = 0;
	while($row = $result->fetch_assoc())
	{
		$users[$i]['id'] = $row['id'];
		$users[$i]['firstName'] = $row['firstName'];
        $users[$i]['lastName'] = $row['lastName'];
        $users[$i]['userEmail'] = $row['userEmail'];
        $users[$i]['userPassword'] = $row['userPassword'];
        $users[$i]['lightscreenOrders'] = $row['lightscreenOrders'];
		$users[$i]['permissions'] = $row['permissions'];
		$i++;
	}
	echo json_encode($users);
}
else
{
	http_response_code(404);
}