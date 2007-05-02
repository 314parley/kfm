<?php
function _createDirectory($parent,$name){
	$dir = new kfmDirectory($parent);
	$dir->createSubdir($name);
	if($dir->hasErrors()) return $dir->getErrors();
	return kfm_loadDirectories($parent);
}
function _deleteDirectory($id,$recursive=0){
	$dirdata=_getDirectoryDbInfo($id);
	$parent=$dirdata['parent'];
	if(!count($dirdata))return array('type'=>'error','msg'=>4); # directory not in database
	$abs_dir=_getDirectoryParents($id);
	$directory=str_replace($GLOBALS['rootdir'],'',$abs_dir);
	if(!kfm_checkAddr($directory))return array('type'=>'error','msg'=>1,'name'=>$directory); # illegal name
	if(!$recursive){
		$ok=1;
		if($handle=opendir($abs_dir))while(false!==($file=readdir($handle)))if(strpos($file,'.')!==0)$ok=0;
		if(!$ok)return array('type'=>'error','msg'=>2,'name'=>$directory,'id'=>$id); # directory not empty
	}
	kfm_rmdir($id);
	if(file_exists($abs_dir))return array('type'=>'error','msg'=>3,'name'=>$directory); # failed to delete directory
	return kfm_loadDirectories($parent);
}
function _getDirectoryDbInfo($id){
	global $kfmdb,$kfm_db_prefix;
	if(!isset($_GLOBALS['cache_directories'][$id])){
		$q=$kfmdb->query("select * from ".$kfm_db_prefix."directories where id=".$id);
		$_GLOBALS['cache_directories'][$id]=$q->fetchRow();
	}
	return $_GLOBALS['cache_directories'][$id];
}
function _getDirectoryParents($pid,$type=1){
	# type is 1:absolute, 2:relative to domain
	if($pid<2)return $GLOBALS['rootdir'];
	$db=_getDirectoryDbInfo($pid);
	return _getDirectoryParents($db['parent'],$type).$db['name'].'/';
}
function _getDirectoryProperties($dir){
	if(strlen($dir))$properties=kfm_getDirectoryProperties(preg_replace('/[^\/]*\/$/','',$dir));
	else $properties=array('allowed_file_extensions'=>array());
	$full_dir=$GLOBALS['rootdir'].$dir.'/.directory_properties';
	if(!is_dir($full_dir)&&is_writable($full_dir))mkdir($full_dir);
	else{
		if(file_exists($full_dir.'/allowed_file_extensions'))$properties['allowed_file_extensions']=kfm_getFileAsArray($full_dir.'/allowed_file_extensions');
	}
	return $properties;
}
function _loadDirectories($pid){
	global $kfmdb,$kfm_db_prefix, $kfm_banned_folders;
	$dir = new kfmDirectory($pid);
	$pdir=str_replace($GLOBALS['rootdir'],'',$dir->path);
	$directories = $dir->getSubdirs();
	sort($directories);
	return array('parent'=>$pid,'reqdir'=>$pdir,'directories'=>$directories,'properties'=>kfm_getDirectoryProperties($pdir.'/'));
}
function _moveDirectory($from,$to){
	global $kfmdb,$kfm_db_prefix;
	$f_r=_getDirectoryDbInfo($from);
	$t_r=_getDirectoryDbInfo($to);
	unset($_GLOBALS['cache_directories'][$from]);
	$f_add=_getDirectoryParents($from);
	$f_name=$f_r['name'];
	$t_add=_getDirectoryParents($to);
	if(strpos($t_add,$f_add)===0)return 'error: cannot move a directory into its own sub-directory'; # TODO: new string
	if(file_exists($t_add.'/'.$f_name))return 'error: "'.$t_add.'/'.$f_name.'" already exists'; # TODO: new string
	rename($f_add,$t_add.'/'.$f_name);
	if(!file_exists($t_add.'/'.$f_name))return 'error: could not move directory "'.$f_add.'" to "'.$t_add.'/'.$f_name.'"'; # TODO: new string
	$kfmdb->exec("update ".$kfm_db_prefix."directories set parent=".$to." where id=".$from) or die('error: '.print_r($kfmdb->errorInfo(),true));
	return _loadDirectories(1);
}
function _recursivelyRemoveDirectory($dir){
	if($handle=opendir($dir)){
		while(false!==($item=readdir($handle))){
			if($item!='.'&&$item!='..'){
				$uri=$dir.'/'.$item;
				if(is_dir($uri))_recursivelyRemoveDirectory($uri);
				else unlink($uri);
			}
		}
		closedir($handle);
		rmdir($dir);
	}
}
function _renameDirectory($fid,$newname){
	global $kfmdb,$kfm_db_prefix;
	$dirdata=_getDirectoryDbInfo($fid);
	$dir=_getDirectoryParents($dirdata['parent']);
	$name=$dirdata['name'];
	if(!file_exists($dir.$name))return;
	if(!kfm_checkAddr($name)||!kfm_checkAddr($newname))return 'error: cannot rename "'.$name.'" to "'.$newname.'"'; # TODO: new string
	if(file_exists($dir.$newname))return 'error: a directory of that name already exists'; # TODO: new string
	rename($dir.$name,$dir.$newname);
	$kfmdb->query("update ".$kfm_db_prefix."directories set name='".addslashes($newname)."' where id=".$fid);
	return _loadDirectories($dirdata['parent']);
}
function _rmdir($pid){
	global $kfmdb,$kfm_db_prefix;
	{ # remove db entries
		$q=$kfmdb->query("select id from ".$kfm_db_prefix."files where directory=".$pid);
		$files=$q->fetchAll();
		foreach($files as $r){
			$f=new File($r['id']);
			$f->delete();
		}
		$q=$kfmdb->query("select id from ".$kfm_db_prefix."directories where parent=".$pid);
		$dirs=$q->fetchAll();
		foreach($dirs as $r)_rmdir($r['id']);
	}
	_recursivelyRemoveDirectory(_getDirectoryParents($pid));
	$kfmdb->exec("delete from ".$kfm_db_prefix."directories where id=".$pid);
}
?>
