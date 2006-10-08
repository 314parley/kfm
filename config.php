<?php
# see license.txt for licensing
session_start();
{ # configuration

	# where are the files located on the hard-drive, relative to the website's root directory?
	# In the default example, the user-files are at http://kfm.verens.com/sandbox/UserFiles/
	# Note that this is the actual file-system location of the files.
	$kfm_userfiles='/sandbox/UserFiles/';
	
	# what should be added to the server's root URL to find the URL of the user files?
	# Note that this is usually the same as $kfm_userfiles, but could be different in the case
	#   that the server uses mod_rewrite or personal web-sites, etc
	$kfm_userfiles_output='/sandbox/UserFiles/';
	

	# 1 = users are allowed to upload files
	# 0 = user are not allowed upload files
	$kfm_allow_file_uploads=1;

	# use this array to ban dangerous files from being uploaded.
	$kfm_banned_extensions=array('php','cfm','asp','cgi','pl');

	# this array tells KFM what extensions indicate files which may be edited online
	$kfm_editable_extensions=array('css','html','txt','xhtml','xml');

	# 0 = only errors will be logged
	# 1 = everything will be logged
	$kfm_log_level=0;

	# use this array to show the order in which language files will be checked for
	$kfm_preferred_languages=array('en','de','da','es','fr','nl','ga');

	# themes are located in ./themes/
	# to use a different theme, replace 'default' with the name of the theme's directory.
	$kfm_theme='default';

}
# the rest of this is code. if you're not a developer, then stop reading now, and close your text editor.
{ # variables
	$rootdir=str_replace('//','/',$_SERVER['DOCUMENT_ROOT'].$kfm_userfiles.'/');
	if(!file_exists($rootdir.'.files'))mkdir($rootdir.'.files');
	if(!isset($_SESSION['kfm']))$_SESSION['kfm']=array(
		'currentdir'=>$rootdir,
		'currentdirpart'=>'/',
		'cwd_id'=>1,
		'language'=>''
	);
	define('LSQUIGG','{');
	define('RSQUIGG','}');
}
{ # sqlite db
	$db_defined=0;
	if(class_exists('PDO')&&extension_loaded('pdo_sqlite')){
		if(!file_exists($rootdir.'.files/db'))include('scripts/db.create.php'); # initialise database
		try{
			$db=@new PDO('sqlite:'.$rootdir.'.files/db');
			$db_defined=1;
		}
		catch(PDOException $e){
		}
	}
	if(!$db_defined){
		require 'btk_database.class.php';
		$db = new btk_database();
	}
}
{ # languages
	$kfm_language='';
	{ # find available languages
		if($handle=opendir('lang')){
			$files=array();
			while(false!==($file=readdir($handle)))if(is_file('lang/'.$file))$files[]=$file;
			closedir($handle);
			sort($files);
			$kfm_available_languages=array();
			foreach($files as $f)$kfm_available_languages[]=str_replace('.js','',$f);
		}
		else{
			echo 'error: missing language files';
			exit;
		}
	}
	{ # check for URL parameter "lang"
		if(isset($_GET['lang'])&&$_GET['lang']&&in_array($_GET['lang'],$kfm_available_languages)){
			$kfm_language=$_GET['lang'];
			$_SESSION['kfm']['language']=$kfm_language;
		}
	}
	{ # check session for language selected earlier
		if(
			$kfm_language==''&&
			isset($_SESSION['kfm']['language'])&&
			$_SESSION['kfm']['language']!=''&&
			in_array($_SESSION['kfm']['language'],$kfm_available_languages)
		)$kfm_language=$_SESSION['kfm']['language'];
	}
	{ # check the browser's http headers for preferred languages
		if($kfm_language==''){
			$langs=explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE']);
			foreach($langs as $lang)if(in_array($lang,$kfm_available_languages)){
				$kfm_language=$lang;
				break;
			}
		}
	}
	{ # check the kfm_preferred_languages
		if($kfm_language=='')foreach($kfm_preferred_languages as $lang)if(in_array($lang,$kfm_available_languages)){
			$kfm_language=$lang;
			break;
		}
	}
	{ # still no language chosen? use the first available one then
		if($kfm_language=='')$kfm_language=$kfm_available_languages[0];
	}
}
{ # common functions
	function kfm_checkAddr($addr){
		return (
			strpos($addr,'..')===false&&
			!in_array(preg_replace('/.*\./','',$addr),$GLOBALS['kfm_banned_extensions'])
		);
	}
	if(!function_exists('mime_content_type')){
		function mime_content_type($f){
			# windows users, please install this first: http://gnuwin32.sourceforge.net/packages/file.htm
			return shell_exec(trim('file -bi '.escapeshellarg($f)));
		}
	}
}
?>
