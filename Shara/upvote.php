<?php

$time = $_POST['time'];

$filename = "markers.txt";
$file = fopen($filename, "r+");

$theCount = 0;
$theLine = "";

while (!feof($file))
{
	$line = fgets($file);
	$data = explode("|||", $line);

	if ($data[5] == $time)
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
		$data = explode("|||", $theLine);

		$votes = (int) $data[6];
		$data[6] = (string) ($votes + 1);

		$data = implode("|||", $data);

		fwrite($file, $data);
		break;
	}

	$line = fgets($file);

	$count++;
}

fclose($file);

?>