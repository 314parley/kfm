<?php
# see license.txt for licensing
function kfm_functions_image_setCaption($fid,$newCaption){
	// parameters: $fileid, $newCaption
	// until then....
	return 'error: caption cannot be set';
	global $db;
	$q = $db->prepare("UPDATE files SET caption = '$newCaption' WHERE id='$fileid'");
	$q->execute();
	// checks for succes in the future
	// until then.... assume success
	return true;
}
?>
