<?php
function _add_file_to_db($filename,$directory_id){
	global $db,$kfm_db_prefix;
	$sql="insert into ".$kfm_db_prefix."files (name,directory) values('".addslashes($filename)."',".$directory_id.")";
	return $db->query($sql);
}
function _createEmptyFile($filename){
	if(!kfm_checkAddr($_SESSION['kfm']['currentdir'].'/'.$filename))return 'error: filename not allowed';
	return(touch($_SESSION['kfm']['currentdir'].'/'.$filename))?kfm_loadFiles($_SESSION['kfm']['cwd_id']):'error: could not write file "'.$filename.'"';
}
function _downloadFileFromUrl($url,$filename){
	if(!kfm_checkAddr($_SESSION['kfm']['currentdir'].'/'.$filename))return 'error: filename not allowed';
	if(substr($url,0,4)!='http')return 'error: url must begin with http';
	$file=file_get_contents(str_replace(' ','%20',$url));
	if(!$file)return 'error: could not download file "'.$url.'"';
	return(file_put_contents($_SESSION['kfm']['currentdir'].'/'.$filename,$file))?kfm_loadFiles($_SESSION['kfm']['cwd_id']):'error: could not write file "'.$filename.'"';
}
function _extractZippedFile($id){
	$file=new File($id);
	$dir=$file->directory.'/';
	{ # try native system unzip command
		$res=-1;
		$arr=array();
		exec('unzip -o "'.$dir.$file->name.'" -x -d "'.$dir.'"',$arr,$res);
	}
	if($res){ # try PHP unzip command
		return 'error: unzip failed';
		$zip=zip_open($dir.$file->name);
		while($zip_entry=zip_read($zip)){
			$entry=zip_entry_open($zip,$zip_entry);
			$filename=zip_entry_name($zip_entry);
			$target_dir=$dir.substr($filename,0,strrpos($filename,'/'));
			$filesize=zip_entry_filesize($zip_entry);
			if(is_dir($target_dir)||mkdir($target_dir)){
				if($filesize>0){
					$contents=zip_entry_read($zip_entry,$filesize);
					file_put_contents($dir.$filename,$contents);
				}
			}
		}
	}
	return kfm_loadFiles($_SESSION['kfm']['cwd_id']);
}
function _getFileAsArray($filename){
	return explode("\n",rtrim(file_get_contents($filename)));
}
function _getFileDetails($fid){
	$file=new File($fid);
	if(!file_exists($file->path))return;
	$details=array(
		'filename'=>$file->name,
		'mimetype'=>$file->mimetype,
		'filesize'=>$file->size2str(),
		'tags'=>$file->getTags()
	);
	if($file->isImage()){
		$im = new Image($file);
		$details['caption'] = $im->caption;
	}
	return $details;
}
function _getFileUrl($fid){
	$file= new File($fid);
	return $file->getUrl();
}
function _getTagName($id){
	global $db,$kfm_db_prefix;
	$q=$db->query("select name from ".$kfm_db_prefix."tags where id=".$id);
	$r=$q->fetchRow();
	if(count($r))return array($id,$r['name']);
	return array($id,'UNKNOWN TAG '.$id);
}
function _getTextFile($fid){
	$file=new File($fid);
	if(!kfm_checkAddr($file->name))return;
	if(in_array($file->getExtension(),$GLOBALS['kfm_editable_extensions'])){
		if(!$file->isWritable()) return 'error: '.$file->name.' is not writable'; # TODO: new string
		$cp_supported = array('php', 'javascript', 'java', 'perl', 'html', 'css', 'php');
		$lang_indicator = str_replace(
			array('php', 'js', 'java', 'pl', 'html', 'css', 'asp'),
			$cp_supported,
			$file->getExtension());
		if(!in_array($lang_indicator, $cp_supported)) $lang_indicator = 'text';
		return array('content'=>$file->getContent(),'name'=>$file->name, 'id'=>$file->id, 'lang'=>$lang_indicator);
	}
	return 'error: "'.$file->name.'" cannot be edited (restricted)'; # TODO: new string
}
function _loadFiles($rootid=1){
	global $db,$kfm_db_prefix;
	$q=$db->query("select * from ".$kfm_db_prefix."directories where id=".$rootid);
	$dirdata=$q->fetchRow();
	$reqdir=count($dirdata)?$dirdata['physical_address'].'/':$GLOBALS['rootdir'];
	$root=str_replace($GLOBALS['rootdir'],'',$reqdir);
	if(!kfm_checkAddr($root))return;
	$reqdir=$GLOBALS['rootdir'].$root;
	if(!is_dir($reqdir))return 'error: "'.$reqdir.'" is not a directory'; # TODO: new string
	if($handle=opendir($reqdir)){
		$q=$db->query("select * from ".$kfm_db_prefix."files where directory=".$rootid);
		$filesdb=$q->fetchAll();
		$fileshash=array();
		if(is_array($filesdb))foreach($filesdb as $r)$fileshash[$r['name']]=$r['id'];
		$files=array();
		while(false!==($filename=readdir($handle)))if(strpos($filename,'.')!==0&&is_file($reqdir.'/'.$filename)){
			if(in_array(strtolower($filename), $GLOBALS['kfm_banned_files'])) continue;
			if(!isset($fileshash[$filename])){
				kfm_add_file_to_db($filename,$rootid);
				$fileshash[$filename]=$db->lastInsertId();
			}
			$writable = is_writable(str_replace('//','/',$reqdir.'/'.$filename))?true:false;
			$files[]=array('name'=>$filename,'parent'=>$rootid,'id'=>$fileshash[$filename], 'writable'=>$writable);
		}
		closedir($handle);
		{ # update session data
			$_SESSION['kfm']['currentdir']=$reqdir;
			$_SESSION['kfm']['cwd_id']=$rootid;
		}
		return array('reqdir'=>$root,'files'=>$files,'uploads_allowed'=>$GLOBALS['kfm_allow_file_uploads']);
	}
	return 'couldn\'t read directory';
}
function _moveFiles($files,$dir_id){
	global $db,$kfm_db_prefix;
	$q=$db->query("select id,physical_address,name from ".$kfm_db_prefix."directories where id=".$dir_id);
	if(!($dirdata=$q->fetchRow()))return 'error: no data for directory id "'.$dir_id.'"'; # TODO: new string
	$to=$dirdata['physical_address'].'/';
	if(!kfm_checkAddr($to))return 'error: illegal directory "'.$to.'"'; # TODO: new string
	foreach($files as $fid){
		$q=$db->query("select ".$kfm_db_prefix."directories.physical_address as da,".$kfm_db_prefix."files.name as fn
			from ".$kfm_db_prefix."files,".$kfm_db_prefix."directories where ".$kfm_db_prefix."directories.id=".$kfm_db_prefix."files.directory and ".$kfm_db_prefix."files.id=".$fid);
		if(!($filedata=$q->fetchRow()))return 'error: no data for file id "'.$file.'"'; # TODO: new string
		$dir=$filedata['da'];
		$file=$filedata['fn'];
		if(!kfm_checkAddr($dir.'/'.$file))return;
		rename($dir.'/'.$file,$to.'/'.$file);
		$q=$db->query("update ".$kfm_db_prefix."files set directory=".$dir_id." where id=".$fid);
	}
	return kfm_loadFiles($_SESSION['kfm']['cwd_id']);
}
function _renameFile($fid,$newfilename,$refreshFiles=true){
	global $db,$kfm_db_prefix;
	$file=new File($fid);
	if(!file_exists($file->path))return;
	$filename=$file->name;
	if(!kfm_checkAddr($filename)||!kfm_checkAddr($newfilename))return 'error: cannot rename "'.$filename.'" to "'.$newfilename.'"'; # TODO: new string
	$newfile=$_SESSION['kfm']['currentdir'].'/'.$newfilename;
	if(file_exists($newfile))return 'error: a file of that name already exists'; # TODO: new string
	rename($_SESSION['kfm']['currentdir'].'/'.$filename,$newfile);
	$db->query("update ".$kfm_db_prefix."files set name='".addslashes($newfilename)."' where id=".$fid);
	if($refreshFiles)return kfm_loadFiles($_SESSION['kfm']['cwd_id']);
}
function _renameFiles($files,$template){
	$prefix=preg_replace('/\*.*/','',$template);
	$postfix=preg_replace('/.*\*/','',$template);
	$precision=strlen(preg_replace('/[^*]/','',$template));
	for($i=1;$i<count($files)+1;++$i){
		$num=str_pad($i,$precision,'0',STR_PAD_LEFT);
		$ret=_renameFile($files[$i-1],$prefix.$num.$postfix,false);
		if($ret)return $ret; # error detected
	}
	return kfm_loadFiles($_SESSION['kfm']['cwd_id']);
}
function _resize_bytes($size){
   $count = 0;
   $format = array("B","KB","MB","GB","TB","PB","EB","ZB","YB");
   while(($size/1024)>1 && $count<8)
   {
       $size=$size/1024;
       $count++;
   }
   $return = number_format($size,0,'','.')." ".$format[$count];
   return $return;
}
function _rm($id){
	if(is_array($id)){
		foreach($id as $f)kfm_rm($f,1);
	}
	else{
		$file = new File($id);
		if($file->isImage()){
			$im = new Image($file->id);
			if(!$im->delete()) return $im->getErrors();
		}else{
			if(!$file->delete()) return $file->getErrors();
		}
		return kfm_loadFiles($_SESSION['kfm']['cwd_id']);
	}
}
function _saveTextFile($fid,$text){
	$f = new File($fid);
	$f->setContent($text);
	return $f->hasErrors()?$f->getErrors():'file saved';
	/*
	if(kfm_checkAddr($filename))file_put_contents($_SESSION['kfm']['currentdir'].'/'.$filename,$text);
	return kfm_loadFiles($_SESSION['kfm']['cwd_id']);*/
}
function _search($keywords,$tags){
	global $db,$kfm_db_prefix;
	$valid_files=array();
	if($tags){ # tags
		$arr=explode(',',$tags);
		foreach($arr as $tag){
			$tag=ltrim(rtrim($tag));
			if($tag){
				$q=$db->query("select id from ".$kfm_db_prefix."tags where name='".addslashes($tag)."'");
				$r=$q->fetchRow();
				if(count($r)){
					if(count($valid_files))$constraints=' and (file_id='.join(' or file_id=',$valid_files).')';
					$q2=$db->query("select file_id from ".$kfm_db_prefix."tagged_files where tag_id=".$r['id'].$constraints);
					$rs2=$q2->fetchAll();
					if(count($rs2)){
						$valid_files=array();
						foreach($rs2 as $r2)$valid_files[]=$r2['file_id'];
					}
					else $valid_files=array(0);
				}
			}
		}
	}
	{ # keywords
		$constraints='';
		if(count($valid_files))$constraints=' and (id='.join(' or id=',$valid_files).')';
		$q=$db->query("select id,name,directory from ".$kfm_db_prefix."files where name like '%".addslashes($keywords)."%'".$constraints." order by name");
		$files=$q->fetchAll();
	}
	return array('reqdir'=>'search results','files'=>$files,'uploads_allowed'=>0); # TODO: new string
}
function _tagAdd($recipients,$tagList){
	global $db,$kfm_db_prefix;
	if(!is_array($recipients))$recipients=array($recipients);
	$arr=explode(',',$tagList);
	$tagList=array();
	foreach($arr as $v){
		$v=ltrim(rtrim($v));
		if($v)$tagList[]=$v;
	}
	if(count($tagList))foreach($tagList as $tag){
		$q=$db->query("select id from ".$kfm_db_prefix."tags where name='".addslashes($tag)."'");
		$r=$q->fetchRow();
		if(count($r)){
			$tag_id=$r['id'];
			$db->query("delete from ".$kfm_db_prefix."tagged_files where tag_id=".$tag_id." and (file_id=".join(' or file_id=',$recipients).")");
		}
		else{
			$q=$db->query("insert into ".$kfm_db_prefix."tags set name='".addslashes($tag)."'");
			$tag_id=$db->lastInsertId();
		}
		foreach($recipients as $file_id)$db->query("insert into ".$kfm_db_prefix."tagged_files (tag_id,file_id) values(".$tag_id.",".$file_id.")");
	}
	return _getFileDetails($recipients[0]);
}
function _viewTextFile($fileid){
	global $kfm_viewable_extensions, $kfm_highlight_extensions, $kfm_editable_extensions;
	$file = new File($fileid);
	$ext = $file->getExtension();
	$buttons_to_show=1; # boolean values - 1=Close, 2=Edit
	if(in_array($ext, $kfm_editable_extensions) && $file->isWritable())$buttons_to_show+=2;
	if(in_array($ext, $kfm_viewable_extensions)){
		$code=file_get_contents($file->path);
		if(array_key_exists($ext,$kfm_highlight_extensions)){
			require_once('Text/Highlighter.php');
			require_once('Text/Highlighter/Renderer/Html.php');
			$renderer=new Text_Highlighter_Renderer_Html(array('numbers'=>HL_NUMBERS_TABLE,'tabsize'=>4));
			$hl=&Text_Highlighter::factory($kfm_highlight_extensions[$ext]);
			$hl->setRenderer($renderer);
			$code = $hl->highlight($code);
		}else if($ext == 'txt'){
			$code = nl2br($code);
		}
		return array('id'=>$fileid, 'content'=>$code, 'buttons_to_show'=>$buttons_to_show,'name'=>$file->name);
	}else{
		return "error: viewing file is not allowed"; # TODO: new string
	}
}

?>
