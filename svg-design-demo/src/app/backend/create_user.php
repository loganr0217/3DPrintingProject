<?php
include 'database.php';
$postdata = file_get_contents("php://input");
if(isset($postdata) && !empty($postdata))
{
	$request = json_decode($postdata,true);
	// Validate.
	if(trim($request['firstName']) === '' || trim($request['lastName']) === '' || 
    trim($request['userEmail']) === '' || trim($request['userPassword']) === '')
	{
		return http_response_code(400);
	}
	$firstName = mysqli_real_escape_string($db, trim($request['firstName']));
    $lastName = mysqli_real_escape_string($db, trim($request['lastName']));
    $userEmail = mysqli_real_escape_string($db, trim($request['userEmail']));
    $userPassword = mysqli_real_escape_string($db, trim($request['userPassword']));
	$sql = "INSERT INTO users (firstName,lastName,userEmail, userPassword) VALUES ('$firstName','$lastName', '$userEmail', 'MD5($userPassword)')";
	if($db->query($sql))
	{
		http_response_code(201);
		$user = ['firstName' => $firstName, 'lastName' => $lastName, 'userEmail' => $userEmail, 
		'userPassword' => $userPassword];
		echo json_encode($user);
	}
	else
	{
		http_response_code(422);
	}
}