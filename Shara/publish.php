<?php

$lat = $_POST['lat'];
$lng = $_POST['lng'];
$title = $_POST['title'];
$story = $_POST['story'];

$filename = "markers.txt";

$file = fopen($filename, "a");

$string = "\n";
$string .= $lat . "|||";
$string .= $lng . "|||";
$string .= $title . "|||";
$string .= $story;

fwrite($file, $string);

fclose($file);

?>