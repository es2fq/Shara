<?php

$user = $_POST['user'];
$lat = $_POST['lat'];
$lng = $_POST['lng'];
$title = $_POST['title'];
$story = $_POST['story'];
$time = $_POST['time'];
$upvotes = $_POST['upvotes'];
$userUpvotes = "";

$filename = "markers.txt";

$file = fopen($filename, "a");

$string = "\n";
$string .= $user . "|||";
$string .= $lat . "|||";
$string .= $lng . "|||";
$string .= $title . "|||";
$string .= $story . "|||";
$string .= $time . "|||";
$string .= $upvotes. "|||";
$string .= $userUpvotes;

fwrite($file, $string);

fclose($file);

?>