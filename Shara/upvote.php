<?php

$time = $_POST['time'];

$filename = "testMarkers.txt";
$file = fopen($filename, "r+");

$theCount = 0;
$theLine = "";

while (!feof($file))
{
	$line = fgets($file);
	$data = explode("|||", $line);

	if ($data[4] == $time)
	{
		$theLine = $line;
		break;
	}

	$theCount++;
}

rewind($file);

$count = 0;
while (!feof($file))
{
	if ($count == $theCount)
	{
		echo $theLine . "<br>";

		$data = explode("|||", $theLine);

		echo $data[5];

		$votes = (int) $data[5];
		$data[5] = (string) ($votes + 1);

		echo $data[5];

		$data = implode("|||", $data);

		fwrite($file, $data);
		break;
	}

	$line = fgets($file);

	$count++;
}

fclose($file);

?>