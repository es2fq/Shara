<?php

$lat = $_POST['lat'];
$lng = $_POST['lng'];
$title = $_POST['title'];
$story = $_POST['story'];
$time = $_POST['time'];
$upvotes = $_POST['upvotes'];

$filename = "markers.txt";

$file = fopen($filename, "a");

$string = "\n";
$string .= $lat . "|||";
$string .= $lng . "|||";
$string .= $title . "|||";
$string .= $story . "|||";
$string .= $time . "|||";
$string .= $upvotes;

fwrite($file, $string);

fclose($file);

?>