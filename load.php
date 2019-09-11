<?php
$files = glob("comments/*.json");
echo '{"count":' . count($files) ;
foreach($files as $file){
	echo ', "' . basename($file, ".json") . '":';
	echo file_get_contents($file);
}
echo "}";

?>
