<?php
class Image extends File{
	var $caption = '';
	var $width;
	var $height;
	var $thumb_url;
	var $thumb_path;
	var $info = array();  // info from getimagesize
	function Image($file){
		if(is_object($file) && $file->isImage())parent::__construct($file->id);
		else if(is_numeric($file))parent::__construct($file);
		else return false;
		// TODO select image data and set the properties
		$this->caption = 'Not yet available';
		$this->image_id = $this->getImageId();
		$this->info = getimagesize($this->path);
		$this->type=str_replace('image/','',$this->info['mime']);
		$this->width = $this->info[0];
		$this->height = $this->info[1];
		$this->setThumbnail();
	}

	function getImageId(){
		global $db, $kfm_db_prefix;
		$sql="SELECT id, caption FROM ".$kfm_db_prefix."files_images WHERE file_id='".$this->id."'";
		$res = $db->query($sql);
		if(!$res->numRows()){ // Create an image entry
			$sql="INSERT INTO ".$kfm_db_prefix."files_images (file_id, caption) VALUES ('".$this->id."','".$this->name."')";
			$this->caption = $this->name;
			$db->exec($sql);
			return $db->lastInsertId($kfm_db_prefix.'files_images','id');
		}else{ // get information
			$row = $res->fetchRow();
			$this->caption = $row['caption'];
			return $row['id'];
		}
	}
	function setCaption($caption){
		global $db, $kfm_db_prefix;
		$sql = 'UPDATE '.$kfm_db_prefix.'files_images SET caption="'.$caption.'" WHERE file_id="'.$this->id.'"';
		$db->exec($sql);
		$this->caption = $caption;
	}
	function setThumbnail($width=64,$height=64){
		$thumbname=$this->id.' '.$width.'x'.$height.' '.$this->name;
		if(!isset($this->info['mime'])||!in_array($this->info['mime'],array('image/jpeg','image/gif','image/png')))return false;
		$this->thumb_url=WORKURL.$thumbname;
		$this->thumb_path=str_replace('//','/',WORKPATH.$thumbname);
		if(!file_exists($this->thumb_path))$this->createThumb($width,$height);
	}
	function delete(){
		global $db, $kfm_db_prefix;
		parent::delete();
		$this->deleteThumbs();
		$sql = 'DELETE FROM '.$kfm_db_prefix.'files_images WHERE file_id='.$this->id;
		$db->exec($sql);
		return !$this->hasErrors();
	}
	function createThumb($width=64,$height=64){
		$this->deleteThumbs();
		$ratio = min($width/$this->width, $height/$this->height);
		$thumb_width = $this->width*$ratio;
		$thumb_height = $this->height*$ratio;
		if(!$this->useImageMagick($this->path,'resize '.$thumb_width.'x'.$thumb_height,$this->thumb_path))return;
		{ # else use GD
			$load='imagecreatefrom'.$this->type;
			$save='image'.$this->type;
			if(!function_exists($load)||!function_exists($save))return $this->error('server cannot handle image of type "'.$this->type.'"');
			$im=$load($this->path);
			$thumb=imagecreatetruecolor($thumb_width,$thumb_height);
			imagealphablending($thumb,false);
			imagecopyresampled($thumb,$im,0,0,0,0,$thumb_width,$thumb_height,$this->width,$this->height);
			imagesavealpha($thumb,true);
			$save($thumb,$this->thumb_path,($this->type=='jpeg'?100:9));
			imagedestroy($thumb); 
			imagedestroy($im);
		}
	}
	function resize($new_width, $new_height=-1){
		if(!$this->isWritable()){
			$this->error('Image is not writable, so cannot be resized');
			return false;
		}
		$this->deleteThumbs();
		if($new_height==-1)$new_height = $this->height*$new_width/$this->width;
		if(!$this->useImageMagick($this->path,'resize '.$new_width.'x'.$new_height,$this->path))return;
		{ # else use GD
			$load='imagecreatefrom'.$this->type;
			$save='image'.$this->type;
			$im = $load($this->path);
			$imresized=imagecreatetruecolor($new_width,$new_height);
			imagealphablending($imresized,false);
			imagecopyresampled($imresized,$im,0,0,0,0,$new_width,$new_height,$this->width,$this->height);
			imagesavealpha($thumb,true);
			$save($imresized,$this->path,($this->type=='jpeg'?100:9));
			imagedestroy($imresized); 
			imagedestroy($im);
		}
	}
	function rotate($direction){
		if(!$this->isWritable()){
			$this->error('Image is not writable, so cannot be rotated');
			return false;
		}
		$this->deleteThumbs();
		if(!$this->useImageMagick($this->path,'rotate -'.$direction,$this->path))return;
		{ # else use GD
			$load='imagecreatefrom'.$this->type;
			$save='image'.$this->type;
			$im=$load($this->path);
			$im=imagerotate($im,$direction,0);
			$save($im,$this->path,($this->type=='jpeg'?100:9));
			imagedestroy($im);
		}
	}
	function deleteThumbs(){
		$icons=glob(WORKPATH.$this->id.' [0-9]*x[0-9]*.*');
		foreach($icons as $f)unlink($f);
	}
	function useImageMagick($from,$action,$to){
		$retval=true;
		$arr=array();
		exec(IMAGEMAGICK_PATH.' "'.$from.'" -'.$action.' "'.$to.'"',$arr,$retval);
		return $retval;
	}
}
?>
