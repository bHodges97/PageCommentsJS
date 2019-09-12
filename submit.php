<?php

$data = file_get_contents('php://input');
$obj = json_decode($data, true);
$id = $obj["id"];
$highlighted = $obj["highlighted"];
$desc = $obj["desc"];
$comment = $obj["comment"];
$offset = $obj["offset"];
$username = $obj["username"];
$folder = __DIR__ . "/comments/";
$file = $folder . $id . ".json"; 

if (!file_exists($folder)) {
    mkdir($folder, 0777, true);
}

if (!file_exists($file)) {
	$newfile = array();
	$newfile['desc'] = $desc;
	$newfile['offset'] = $offset;
	$newfile['highlighted'] = $highlighted;
	$newfile['comments'] = array($comment);
	$newfile['usernames'] = array($username);
	$fp = fopen($file, 'w');
	fwrite($fp, json_encode($newfile));
	fclose($fp);
}else{
	$str = file_get_contents($file);
	$json = json_decode($str, true);
	if(end($json['comments']) === $comment && end($json['usernames']) === $username){ 
		exit(1);
	}
	array_push($json['comments'], $comment);
	array_push($json['usernames'], $username);
	$fp = fopen($file, 'w');
	fwrite($fp, json_encode($json));
	fclose($fp);
}

echo $username . ": " . $comment

?>
