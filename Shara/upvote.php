<?php

$user = $_POST['user'];
$time = $_POST['time'];

$filename = "markers.txt";

$theCount = 0;
$theLine = "";

$data = file($filename, FILE_IGNORE_NEW_LINES);

for ($i = 0; $i < count($data); $i++)
{
	$line = explode("|||", $data[$i]);
	if ($line[5] == $time)
	{
		$votes = (int) $line[6];
		$newVotes = $votes + 1;
		$line[6] = (string) $newVotes;

		if ($line[7] == "")
			$line[7] = $line[7] . $user;
		else
			$line[7] = $line[7] . "," . $user;
		
		$data[$i] = implode("|||", $line);
		break;
	}
}

$text = implode("\n", $data);

$file = fopen($filename, "w");

fwrite($file, $text);

fclose($file);

?>