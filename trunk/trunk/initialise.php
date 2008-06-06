<?php
/**
 * KFM - Kae's File Manager - initialisation
 *
 * @category None
 * @package  None
 * @author   Kae Verens <kae@verens.com>
 * @author   Benjamin ter Kuile <bterkuile@gmail.com>
 * @license  docs/license.txt for licensing
 * @link     http://kfm.verens.com/
 */
define('KFM_BASE_PATH', dirname(__FILE__).'/');

// {{{ load classes and helper functions
require KFM_BASE_PATH.'includes/lang.php';
require KFM_BASE_PATH.'includes/db.php';
require KFM_BASE_PATH.'includes/object.class.php';
require KFM_BASE_PATH.'includes/kfm.class.php';
require KFM_BASE_PATH.'includes/session.class.php';
require KFM_BASE_PATH.'includes/file.class.php';
require KFM_BASE_PATH.'includes/image.class.php';
require KFM_BASE_PATH.'includes/directory.class.php';
require KFM_BASE_PATH.'includes/plugin.class.php';
// }}}
function sql_escape($sql)
{
    global $kfm_db_type;
    $sql = addslashes($sql);
    if ($kfm_db_type=='sqlite'||$kfm_db_type=='sqlitepdo')$sql = str_replace("\\'", "''", $sql);
    return $sql;
}
function kfm_dieOnError($error)
{
    if (!PEAR::isError($error))return;
    echo '<strong>Error</strong><br />'.$error->getMessage().'<br />'.$error->userinfo.'<hr />';
    exit;
}

if (get_magic_quotes_gpc()) {
    // taken from http://www.phpfreaks.com/quickcode/Get-rid-of-magic_quotes_gpc/618.php
    function traverse (&$arr)
    {
        if (!is_array($arr))return;
        foreach ($arr as $key=>$val) {
            if (is_array($arr[$key])) traverse($arr[$key]);
            else $arr[$key] = stripslashes($arr[$key]);
        }
    }
    $gpc = array(&$_GET,&$_POST,&$_COOKIE);
    traverse($gpc);
}
set_include_path(KFM_BASE_PATH.'includes/pear'.PATH_SEPARATOR.get_include_path());
if (!file_exists(KFM_BASE_PATH.'configuration.php')) {
    echo '<em>Missing <code>configuration.php</code>!</em><p>If this is a fresh installation of KFM, then please copy <code>configuration.dist.php</code> to <code>configuration.php</code>, remove the settings you don\'t want to change, and edit the rest to your needs.</p><p>For examples of configuration, please visit http://kfm.verens.com/configuration</p>';
    exit;
}
require_once KFM_BASE_PATH.'configuration.dist.php';
require_once KFM_BASE_PATH.'configuration.php';
// {{{ defines
define('KFM_DB_PREFIX', $kfm_db_prefix);
// }}}

// {{{ check for fatal errors
$m = array();
if (ini_get('safe_mode'))$m[] = 'KFM does not work if you have <code>safe_mode</code> enabled. This is not a bug - please see <a href="http://ie.php.net/features.safe-mode">PHP.net\'s safe_mode page</a> for details';
if (count($m)) {
    echo '<html><body><p>There are errors in your configuration or server. If the messages below describe missing variables, please check the supplied <code>configuration.php.dist</code> for notes on their usage.</p><ul>';
    foreach($m as $a)echo '<li>'.$a.'</li>';
    echo '</li></ul></body></html>';
    exit;
}
// }}}

// {{{ API - for programmers only
if (file_exists(KFM_BASE_PATH.'api/config.php')) require KFM_BASE_PATH.'api/config.php';
if (file_exists(KFM_BASE_PATH.'api/cms_hooks.php')) require KFM_BASE_PATH.'api/cms_hooks.php';
else require KFM_BASE_PATH.'api/cms_hooks.php.dist';
// }}}
// {{{ variables
// structure
$kfm->defaultSetting('kfm_url','/');
$kfm->defaultSetting('user_root_folder','');
$kfm->defaultSetting('startup_folder','');
$kfm->defaultSetting('hidden_panels',array('logs','file_details','directory_properties'));
$kfm->defaultSetting('log_level', 0);
$kfm->defaultSetting('file_handler','download');
//display
$kfm->defaultSetting('time_format', '%T');
$kfm->defaultSetting('date_format', '%x');
$kfm->defaultSetting('theme', false); // must be overwritten
$kfm->defaultSetting('listview',0);
$kfm->defaultSetting('preferred_languages',array('en','de','da','es','fr','nl','ga'));
// directory
$kfm->defaultSetting('root_folder_name','root');
$kfm->defaultSetting('allow_files_in_root',1);
$kfm->defaultSetting('allow_directory_create',1);
$kfm->defaultSetting('allow_directory_delete',1);
$kfm->defaultSetting('allow_directory_edit',1);
$kfm->defaultSetting('allow_directory_move',1);
$kfm->defaultSetting('folder_drag_action',3);
$kfm->defaultSetting('default_directories',array());
$kfm->defaultSetting('default_directory_permission',755);
$kfm->defaultSetting('banned_folders',array('/^\./'));
$kfm->defaultSetting('allowed_folders',array());
//files
$kfm->defaultSetting('allow_file_create',1);
$kfm->defaultSetting('allow_file_delete',1);
$kfm->defaultSetting('allow_file_edit',1);
$kfm->defaultSetting('allow_file_move',1);
$kfm->defaultSetting('show_files_in_groups_of', 10);
$kfm->defaultSetting('files_name_length_displayed',20);
$kfm->defaultSetting('files_name_length_in_list', 0);
$kfm->defaultSetting('banned_extensions',array('asp','cfm','cgi','php','php3','php4','php5','phtm','pl','sh','shtm','shtml'));
$kfm->defaultSetting('banned_files',array('thumbs.db','/^\./'));
$kfm->defaultSetting('allowed_files',array());

$kfm->defaultSetting('startup_selected_files', array()); // maybe should just be a get setting
//image
$kfm->defaultSetting('use_imagemagick',1);
//upload
$kfm->defaultSetting('allow_file_upload',1);
$kfm->defaultSetting('only_allow_image_upload',0);
$kfm->defaultSetting('use_multiple_file_upload',1);
$kfm->defaultSetting('default_upload_permission',644);
$kfm->defaultSetting('banned_upload_extensions',array());
// plugins
$kfm->defaultSetting('disabled_plugins',array());
// depricated
$kfm->defaultSetting('allow_image_manipulation',1); // this is plugin management
$kfm->defaultSetting('show_disabled_contextmenu_links',1); // Should be depricated
$kfm->defaultSetting('return_file_id_to_cms',0); // Should be deprecated in favour of plugin
$kfm->defaultSetting('allow_multiple_file_returns',0); // Should be deprecated in favour of plugin
$kfm->defaultSetting('slideshow_delay',4);



define('KFM_VERSION', rtrim(file_get_contents(KFM_BASE_PATH.'docs/version.txt')));
if (!isset($_SERVER['DOCUMENT_ROOT'])) { // fix for IIS
    $_SERVER['DOCUMENT_ROOT'] = preg_replace('/\/[^\/]*$/', '', str_replace('\\', '/', $_SERVER['SCRIPT_FILENAME']));
}
$rootdir = strpos($kfm_userfiles_address, './')===0?KFM_BASE_PATH.$kfm_userfiles_address:$kfm_userfiles_address.'/';
if (!is_dir($rootdir))mkdir($rootdir, 0755);
if (!is_dir($rootdir)) {
    echo 'error: "'.htmlspecialchars($rootdir).'" could not be created';
    exit;
}
$rootdir = realpath($rootdir).'/';
define('KFM_DIR', dirname(__FILE__));
if (!defined('GET_PARAMS')) define('GET_PARAMS', '');
define('IMAGEMAGICK_PATH', isset($kfm_imagemagick_path)?$kfm_imagemagick_path:'/usr/bin/convert');
$cache_directories = array();
$kfm_errors        = array();
$kfm_messages      = array();
// }}}
// {{{ work directory
if ($kfm_workdirectory[0]=='/') {
    $workpath = $kfm_workdirectory;
} else {
    $workpath = $rootdir.$kfm_workdirectory;
}
$workurl = $kfm_userfiles_output.$kfm_workdirectory;
$workdir = true;
if (substr($workpath, -1)!='/') $workpath.='/';
if (substr($workurl, -1)!='/') $workurl.='/';
define('WORKPATH', $workpath);
define('WORKURL', $workurl);
if (is_dir($workpath)) {
    if (!is_writable($workpath)) {
        echo 'error: "'.htmlspecialchars($workpath).'" is not writable';
        exit;
    }
} else {
    // Support for creating the directory
    $workpath_tmp = substr($workpath, 0, -1);
    if (is_writable(dirname($workpath_tmp)))mkdir($workpath_tmp, 0755);
    else{
        echo 'error: could not create directory <code>"'.htmlspecialchars($workpath_tmp).'"</code>. please make sure that <code>'.htmlspecialchars(preg_replace('#/[^/]*$#', '', $workpath_tmp)).'</code> is writable by the server';
        exit;
    }
}
// }}}
// {{{ database
$db_defined            = 0;
$kfm_db_prefix_escaped = str_replace('_', '\\\\_', KFM_DB_PREFIX);
$port                  = ($kfm_db_port=='')?'':':'.$kfm_db_port;
switch($kfm_db_type) {
case 'mysql': // {{{
    include_once 'MDB2.php';
    $dsn   = 'mysql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host.$port.'/'.$kfm_db_name;
    $kfmdb = &MDB2::connect($dsn);
    if (PEAR::isError($kfmdb)) {
        $dsn   = 'mysql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host;
        $kfmdb = &MDB2::connect($dsn);
        kfm_dieOnError($kfmdb);
        $kfmdb->query('CREATE DATABASE '.$kfm_db_name.' CHARACTER SET UTF8');
        $kfmdb->disconnect();
        $dsn   = 'mysql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host.'/'.$kfm_db_name;
        $kfmdb = &MDB2::connect($dsn);
        kfm_dieOnError($kfmdb);
    }
    $kfmdb->setFetchMode(MDB2_FETCHMODE_ASSOC);
	 $kfmdb->setOption('portability',MDB2_PORTABILITY_ALL ^ MDB2_PORTABILITY_EMPTY_TO_NULL);
    if (!$db_defined) {
        $res = &$kfmdb->query("show tables like '".$kfm_db_prefix_escaped."%'");
        kfm_dieOnError($res);
        if (!$res->numRows())include KFM_BASE_PATH.'scripts/db.mysql.create.php';
        else $db_defined = 1;
    }
    break;
 // must be overwritten// }}}
case 'pgsql': // {{{
    include_once 'MDB2.php';
    $dsn   = 'pgsql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host.$port.'/'.$kfm_db_name;
    $kfmdb = &MDB2::connect($dsn);
    if (PEAR::isError($kfmdb)) {
        $dsn   = 'pgsql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host;
        $kfmdb = &MDB2::connect($dsn);
        kfm_dieOnError($kfmdb);
        $kfmdb->query('CREATE DATABASE '.$kfm_db_name);
        $kfmdb->disconnect();
        $dsn   = 'pgsql://'.$kfm_db_username.':'.$kfm_db_password.'@'.$kfm_db_host.'/'.$kfm_db_name;
        $kfmdb = &MDB2::connect($dsn);
        kfm_dieOnError($kfmdb);
    }
    $kfmdb->setFetchMode(MDB2_FETCHMODE_ASSOC);
	 $kfmdb->setOption('portability',MDB2_PORTABILITY_ALL ^ MDB2_PORTABILITY_EMPTY_TO_NULL);
    if (!$db_defined) {
        $res = &$kfmdb->query("SELECT tablename from pg_tables where tableowner = current_user AND tablename NOT LIKE E'pg\\\\_%' AND tablename NOT LIKE E'sql\\\\_%' AND tablename LIKE E'".$kfm_db_prefix_escaped."%'");
        kfm_dieOnError($res);
        if ($res->numRows()<1)include KFM_BASE_PATH.'scripts/db.pgsql.create.php';
        else $db_defined = 1;
    }
    break;
// }}}
case 'sqlite': // {{{
    include_once 'MDB2.php';
    $kfmdb_create = false;
    define('DBNAME', $kfm_db_name);
    if (!file_exists(WORKPATH.DBNAME))$kfmdb_create = true;
    $dsn   = array('phptype'=>'sqlite', 'database'=>WORKPATH.DBNAME, 'mode'=>'0644');
    $kfmdb = &MDB2::connect($dsn);
    kfm_dieOnError($kfmdb);
    $kfmdb->setFetchMode(MDB2_FETCHMODE_ASSOC);
	 $kfmdb->setOption('portability',MDB2_PORTABILITY_ALL ^ MDB2_PORTABILITY_EMPTY_TO_NULL);
    if ($kfmdb_create)include KFM_BASE_PATH.'scripts/db.sqlite.create.php';
    $db_defined = 1;
    break;
// }}}
case 'sqlitepdo': // {{{
    $kfmdb_create = false;
    define('DBNAME', $kfm_db_name);
    if (!file_exists(WORKPATH.DBNAME)) $kfmdb_create = true;
    $dsn   = array('type'=>'sqlitepdo', 'database'=>WORKPATH.DBNAME, 'mode'=>'0644');
    $kfmdb = new DB($dsn);
    if ($kfmdb_create)include KFM_BASE_PATH.'scripts/db.sqlite.create.php';
    $db_defined = 1;
    break;
// }}}
default: // {{{
    echo "unknown database type specified ($kfm_db_type)";
    exit;
    // }}}
}
if (!$db_defined) {
    echo 'failed to connect to database';
    exit;
}
$kfm->db = &$kfmdb; // Add database as reference to the kfm object
// }}}
// {{{ get kfm parameters and check for updates
$kfm_parameters = array();
$rs = db_fetch_all("select * from ".KFM_DB_PREFIX."parameters");
foreach($rs as $r)$kfm_parameters[$r['name']] = $r['value'];
if ($kfm_parameters['version']!=KFM_VERSION && file_exists(KFM_BASE_PATH.'scripts/update.'.KFM_VERSION.'.php')) require KFM_BASE_PATH.'scripts/update.'.KFM_VERSION.'.php';
// }}}
// {{{ JSON
if (!function_exists('json_encode')) { // php-json is not installed
    include_once 'JSON.php';
    include_once KFM_BASE_PATH.'includes/json.php';
}
// }}}
// {{{ start session
$session_id  = (isset($_GET['kfm_session']))?$_GET['kfm_session']:'';
$kfm_session = new kfmSession($session_id);
if ($kfm_session->isNew) {
    $kfm_session->setMultiple(array(
    'cwd_id'=>1,
    'language'=>'',
	 'user_id'=>1,
    'username'=>'',
    'password'=>'',
    'loggedin'=>0,
    'theme'=>false
    ));
}
if (isset($_GET['logout'])||isset($_GET['log_out'])) $kfm_session->set('loggedin',0);
// }}}
// {{{ check authentication
if (isset($use_kfm_security) && !$use_kfm_security)$kfm_session->set('loggedin', 1);
if (!$kfm_session->get('loggedin') && (!isset($kfm_api_auth_override)||!$kfm_api_auth_override)) {
    $err = '';
    if (isset($_POST['username'])&&isset($_POST['password'])) {
		$res=db_fetch_row('SELECT id, username, password, status FROM '.KFM_DB_PREFIX.'users WHERE username="'.$_POST['username'].'" AND password="'.sha1($_POST['password']).'"');
		if(count($res)){
            $kfm_session->setMultiple(array('user_id'=>$res['id'],'username'=>$_POST['username'], 'password'=>$_POST['password'],'user_status'=>$res['status'], 'loggedin'=>1));
		}else $err = '<em>Incorrect Password. Please try again, or check your <code>configuration.php</code>.</em>';
		/*
        if ($_POST['username']==$kfm_username && $_POST['password']==$kfm_password) {
            $kfm_session->setMultiple(array('username'=>$_POST['username'], 'password'=>$_POST['password'], 'loggedin'=>1));
        }
		*/
    }
   if (!$kfm_session->get('loggedin')) {
		if(file_exists(KFM_BASE_PATH.'login.php'))include(KFM_BASE_PATH.'login.php');
      else include KFM_BASE_PATH.'includes/login.php';
		exit;
	}
}
$uid=$kfm_session->get('user_id');
$kfm->user_id=$uid;
$kfm->user_status=$kfm_session->get('user_status');
$kfm->username=$kfm_session->get('username');
$kfm->user_name=&$kfm->username;
$kfm->session= &$kfm_session;
// }}}
// {{{ Read settings
function setting_array($str){
	return preg_split('/,\s*/',trim($str,' ,'));
}
$settings=array();
$admin_settings=db_fetch_all('SELECT name, value, usersetting FROM '.KFM_DB_PREFIX.'settings WHERE user_id=1');
foreach($admin_settings as $setting){
	$settings[$setting['name']]=$setting['value'];
	if($setting['usersetting'])$kfm->addUserSetting($setting['name']);
}
if($uid!=1){
	$user_settings=db_fetch_all('SELECT name, value FROM '.KFM_DB_PREFIX.'settings WHERE user_id='.$uid.' AND usersetting=1');
	foreach($user_settings as $setting){
		$settings[$setting['name']]=$setting['value'];
	}
}
if(isset($settings['disabled_plugins'])){
	$kfm->defaultSetting('disabled_plugins',setting_array($settings['disabled_plugins']));
	unset($settings['disabled_plugins']); // it does not have to be set again
}
// }}}
// {{{ Setting plugins
$h=opendir(KFM_BASE_PATH.'plugins');
while(false!==($file=readdir($h))){
	if(!is_dir(KFM_BASE_PATH.'plugins/'.$file))continue;
	if($file[0]!='.' && substr($file,0,9)!='disabled_'){
		//if(in_array($file, $kfm->setting('disabled_plugins')))continue;
		if(file_exists(KFM_BASE_PATH.'plugins/'.$file.'/plugin.php')) include(KFM_BASE_PATH.'plugins/'.$file.'/plugin.php');
	}
}
closedir($h);
foreach($kfm->plugins as $key=>$plugin){
	$kfm->sdef['disabled_plugins']['options'][]=$plugin->name;
	if(in_array($plugin->name,$kfm->setting('disabled_plugins'))){
		$kfm->plugins[$key]->disabled=true;
		continue;
	}
	if(count($plugin->settings)){
		$kfm->addSdef($plugin->name, array('type'=>'group_header'));
		foreach($plugin->settings as $psetting){
			$kfm->addSdef($psetting['name'], $psetting['definition'],$psetting['default']);
		}
	}
}
// }}}
// {{{ Apply settings
foreach($kfm->sdef as $sname=>$sdef){
	if(isset($settings[$sname])){
		switch($sdef['type']){
			case 'array':
			case 'select_list':
				$value=setting_array($settings[$sname]);
				break;
			default:
				$value=$settings[$sname];
				break;
		}
		$kfm->defaultSetting($sname, $value);
	}
}
// }}}
// {{{ (user) root folder
$kfm_root_dir = kfmDirectory::getInstance(1);
if ($kfm->user_id!=1 && $kfm->setting('user_root_folder')){
	$kfm->defaultSetting('user_root_folder',str_replace('username',$kfm->username,$kfm->setting('user_root_folder')));
    $dirs   = explode(DIRECTORY_SEPARATOR, trim($kfm->setting('user_root_folder'), ' '.DIRECTORY_SEPARATOR));
    $subdir = $kfm_root_dir;
    foreach ($dirs as $dirname) {
        $subdir = $subdir->getSubdir($dirname);
        if(!$subdir) die ('Error: Root directory cannot be found.');
        $kfm_root_folder_id = $subdir->id;
    }
    $user_root_dir = $subdir;
} else {
    $user_root_dir = $kfm_root_dir;
}
$kfm_root_folder_id = $user_root_dir->id;
$kfm->setting('root_folder_id',$user_root_dir->id);
// }}}
// {{{ Setting themes
$h=opendir(KFM_BASE_PATH.'themes');
while(false!==($file=readdir($h))){
	if($file[0]!='.' || substr($file,0,9)=='disabled_'){
		$kfm->themes[]=$file;
		$kfm->sdef['theme']['options'][$file]=$file;
	}
}
closedir($h);
// }}}
// {{{ Setting the theme
if(isset($_GET['theme']))$kfm_session->set('theme',$_GET['theme']);
if($kfm_session->get('theme'))$kfm->defaultSetting('theme',$kfm_session->get('theme'));
else if($kfm->setting('theme')) $kfm_session->set('theme',$kfm->setting('theme'));
else{
	if(in_array('default',$kfm->themes)){
		$kfm->defaultSetting('theme','default');
		$kfm_session->set('theme','default');
	}else{
		if(!count($kfm->themes)) kfm_error('No themes available');
		else{
			$kfm->defaultSetting('theme',$kfm->themes[0]);
			$kfm_session->set('theme',$kfm->themes[0]);
		}
	}
}
// }}}
// {{{ languages
$kfm_language = '';
// {{{  find available languages
if ($handle = opendir(KFM_BASE_PATH.'lang')) {
    $files = array();
    while(false!==($file = readdir($handle)))if (is_file(KFM_BASE_PATH.'lang/'.$file))$files[] = $file;
    closedir($handle);
    sort($files);
    $kfm_available_languages = array();
    foreach($files as $f)$kfm_available_languages[] = str_replace('.js', '', $f);
} else {
    echo 'error: missing language files';
    exit;
}
// }}}
// {{{  check for URL parameter "lang"
if (isset($_GET['lang'])&&$_GET['lang']&&in_array($_GET['lang'], $kfm_available_languages)) {
    $kfm_language = $_GET['lang'];
    $kfm_session->set('language', $kfm_language);
}
// }}}
// {{{  check session for language selected earlier
    if (
        $kfm_language==''&&
        !is_null($kfm_session->get('language'))&&
        $kfm_session->get('language')!=''&&
        in_array($kfm_session->get('language'), $kfm_available_languages)
    )$kfm_language = $kfm_session->get('language');
// }}}
// {{{  check the browser's http headers for preferred languages
if ($kfm_language=='') {
    if (!isset($_SERVER['HTTP_ACCEPT_LANGUAGE']))$_SERVER['HTTP_ACCEPT_LANGUAGE'] = '';
    $langs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
    foreach($langs as $lang)if (in_array(preg_replace('/;.*/','',trim($lang)), $kfm_available_languages)) {
        $kfm_language = preg_replace('/;.*/','',trim($lang));
        break;
    }
}
// }}}
// {{{  check the kfm_preferred_languages
if ($kfm_language=='')foreach($kfm_preferred_languages as $lang)if (in_array($lang, $kfm_available_languages)) {
    $kfm_language = $lang;
    break;
}
// }}}
// {{{  still no language chosen? use the first available one then
    if ($kfm_language=='')$kfm_language = $kfm_available_languages[0];
// }}}
// }}}
// {{{ common functions
function kfm_checkAddr($addr)
{
    return (
        strpos($addr, '..')===false&&
        strpos($addr, '.')!==0&&
        strlen($addr)>0&&
        $addr[strlen($addr)-1]!=' '&&
        strpos($addr, '/.')===false&&
        !in_array(preg_replace('/.*\./', '', $addr), $GLOBALS['kfm_banned_extensions'])
    );
}
function get_mimetype($f)
{
    $mimetypes = array('ez'=>'application/andrew-inset', 'hqx'=>'application/mac-binhex40', 'cpt'=>'application/mac-compactpro', 'doc'=>'application/msword', 'bin'=>'application/octet-stream', 'dms'=>'application/octet-stream', 'lha'=>'application/octet-stream', 'lzh'=>'application/octet-stream', 'exe'=>'application/octet-stream', 'class'=>'application/octet-stream', 'so'=>'application/octet-stream', 'dll'=>'application/octet-stream', 'oda'=>'application/oda', 'pdf'=>'application/pdf', 'ai'=>'application/postscript', 'eps'=>'application/postscript', 'ps'=>'application/postscript', 'smi'=>'application/smil', 'smil'=>'application/smil', 'mif'=>'application/vnd.mif', 'xls'=>'application/vnd.ms-excel', 'ppt'=>'application/vnd.ms-powerpoint', 'wbxml'=>'application/vnd.wap.wbxml', 'wmlc'=>'application/vnd.wap.wmlc', 'wmlsc'=>'application/vnd.wap.wmlscriptc', 'bcpio'=>'application/x-bcpio', 'vcd'=>'application/x-cdlink', 'pgn'=>'application/x-chess-pgn', 'cpio'=>'application/x-cpio', 'csh'=>'application/x-csh', 'dcr'=>'application/x-director', 'dir'=>'application/x-director', 'dxr'=>'application/x-director', 'dvi'=>'application/x-dvi', 'spl'=>'application/x-futuresplash', 'gtar'=>'application/x-gtar', 'hdf'=>'application/x-hdf', 'js'=>'application/x-javascript', 'skp'=>'application/x-koan', 'skd'=>'application/x-koan', 'skt'=>'application/x-koan', 'skm'=>'application/x-koan', 'latex'=>'application/x-latex', 'nc'=>'application/x-netcdf', 'cdf'=>'application/x-netcdf', 'sh'=>'application/x-sh', 'shar'=>'application/x-shar', 'swf'=>'application/x-shockwave-flash', 'sit'=>'application/x-stuffit', 'sv4cpio'=>'application/x-sv4cpio', 'sv4crc'=>'application/x-sv4crc', 'tar'=>'application/x-tar', 'tcl'=>'application/x-tcl', 'tex'=>'application/x-tex', 'texinfo'=>'application/x-texinfo', 'texi'=>'application/x-texinfo', 't'=>'application/x-troff', 'tr'=>'application/x-troff', 'roff'=>'application/x-troff', 'man'=>'application/x-troff-man', 'me'=>'application/x-troff-me', 'ms'=>'application/x-troff-ms', 'ustar'=>'application/x-ustar', 'src'=>'application/x-wais-source', 'xhtml'=>'application/xhtml+xml', 'xht'=>'application/xhtml+xml', 'zip'=>'application/zip', 'au'=>'audio/basic', 'snd'=>'audio/basic', 'mid'=>'audio/midi', 'midi'=>'audio/midi', 'kar'=>'audio/midi', 'mpga'=>'audio/mpeg', 'mp2'=>'audio/mpeg', 'mp3'=>'audio/mpeg', 'aif'=>'audio/x-aiff', 'aiff'=>'audio/x-aiff', 'aifc'=>'audio/x-aiff', 'm3u'=>'audio/x-mpegurl', 'ram'=>'audio/x-pn-realaudio', 'rm'=>'audio/x-pn-realaudio', 'rpm'=>'audio/x-pn-realaudio-plugin', 'ra'=>'audio/x-realaudio', 'wav'=>'audio/x-wav', 'pdb'=>'chemical/x-pdb', 'xyz'=>'chemical/x-xyz', 'bmp'=>'image/bmp', 'gif'=>'image/gif', 'ief'=>'image/ief', 'jpeg'=>'image/jpeg', 'jpg'=>'image/jpeg', 'jpe'=>'image/jpeg', 'png'=>'image/png', 'tiff'=>'image/tiff', 'tif'=>'image/tiff', 'djvu'=>'image/vnd.djvu', 'djv'=>'image/vnd.djvu', 'wbmp'=>'image/vnd.wap.wbmp', 'ras'=>'image/x-cmu-raster', 'pnm'=>'image/x-portable-anymap', 'pbm'=>'image/x-portable-bitmap', 'pgm'=>'image/x-portable-graymap', 'ppm'=>'image/x-portable-pixmap', 'rgb'=>'image/x-rgb', 'xbm'=>'image/x-xbitmap', 'xpm'=>'image/x-xpixmap', 'xwd'=>'image/x-xwindowdump', 'igs'=>'model/iges', 'iges'=>'model/iges', 'msh'=>'model/mesh', 'mesh'=>'model/mesh', 'silo'=>'model/mesh', 'wrl'=>'model/vrml', 'vrml'=>'model/vrml', 'css'=>'text/css', 'html'=>'text/html', 'htm'=>'text/html', 'asc'=>'text/plain', 'txt'=>'text/plain', 'rtx'=>'text/richtext', 'rtf'=>'text/rtf', 'sgml'=>'text/sgml', 'sgm'=>'text/sgml', 'tsv'=>'text/tab-separated-values', 'wml'=>'text/vnd.wap.wml', 'wmls'=>'text/vnd.wap.wmlscript', 'etx'=>'text/x-setext', 'xsl'=>'text/xml', 'xml'=>'text/xml', 'mpeg'=>'video/mpeg', 'mpg'=>'video/mpeg', 'mpe'=>'video/mpeg', 'qt'=>'video/quicktime', 'mov'=>'video/quicktime', 'mxu'=>'video/vnd.mpegurl', 'avi'=>'video/x-msvideo', 'movie'=>'video/x-sgi-movie', 'ice'=>'x-conference/x-cooltalk');
    $extension = preg_replace('/.*\./', '', $f);
    if (isset($mimetypes[$extension]))return $mimetypes[$extension];
    return 'unknown/mimetype';
}
// }}}
// {{{ directory functions
function kfm_add_directory_to_db($name, $parent)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _add_directory_to_db($name, $parent);
}
function kfm_createDirectory($parent, $name)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _createDirectory($parent, $name);
}
function kfm_deleteDirectory($id, $recursive = 0)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _deleteDirectory($id, $recursive);
}
function kfm_getDirectoryDbInfo($id)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _getDirectoryDbInfo($id);
}
function kfm_getDirectoryParents($pid, $type = 1)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _getDirectoryParents($pid, $type);
}
function kfm_getDirectoryParentsArr($pid, $path = array())
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _getDirectoryParentsArr($pid, $path);
}
function kfm_loadDirectories($root, $oldpid = 0)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _loadDirectories($root, $oldpid);
}
function kfm_moveDirectory($from, $to)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _moveDirectory($from, $to);
}
function kfm_renameDirectory($dir, $newname)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _renameDirectory($dir, $newname);
}
function kfm_rmdir($dir)
{
    include_once KFM_BASE_PATH.'includes/directories.php';
    return _rmdir($dir);
}
// }}}
// {{{ file functions
function kfm_copyFiles($files, $dir_id)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _copyFiles($files, $dir_id);
}
function kfm_createEmptyFile($cwd, $filename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _createEmptyFile($cwd, $filename);
}
function kfm_downloadFileFromUrl($url, $filename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _downloadFileFromUrl($url, $filename);
}
function kfm_extractZippedFile($id)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _extractZippedFile($id);
}
function kfm_getFileAsArray($filename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getFileAsArray($filename);
}
function kfm_getFileDetails($filename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getFileDetails($filename);
}
function kfm_getFileUrl($fid, $x = 0, $y = 0)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getFileUrl($fid, $x, $y);
}
function kfm_getFileUrls($farr)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getFileUrls($farr);
}
function kfm_getTagName($id)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getTagName($id);
}
function kfm_getTextFile($filename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _getTextFile($filename);
}
function kfm_moveFiles($files, $dir_id)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _moveFiles($files, $dir_id);
}
function kfm_loadFiles($rootid = 1, $setParent = false)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _loadFiles($rootid, $setParent);
}
function kfm_renameFile($filename, $newfilename)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _renameFile($filename, $newfilename);
}
function kfm_renameFiles($files, $template)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _renameFiles($files, $template);
}
function kfm_resize_bytes($size)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _resize_bytes($size);
}
function kfm_rm($files, $no_dir = 0)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _rm($files, $no_dir);
}
function kfm_saveTextFile($filename, $text)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _saveTextFile($filename, $text);
}
function kfm_search($keywords, $tags)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _search($keywords, $tags);
}
function kfm_tagAdd($recipients, $tagList)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _tagAdd($recipients, $tagList);
}
function kfm_tagRemove($recipients, $tagList)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _tagRemove($recipients, $tagList);
}
function kfm_zip($name, $files)
{
    include_once KFM_BASE_PATH.'includes/files.php';
    return _zip($name, $files);
}
// }}}
// {{{ image functions
function kfm_changeCaption($filename, $newCaption)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _changeCaption($filename, $newCaption);
}
function kfm_getThumbnail($fileid, $width, $height)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _getThumbnail($fileid, $width, $height);
}
function kfm_resizeImage($filename, $width, $height)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _resizeImage($filename, $width, $height);
}
function kfm_resizeImages($files, $width, $height)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _resizeImages($files, $width, $height);
}
function kfm_rotateImage($filename, $direction)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _rotateImage($filename, $direction);
}
function kfm_cropToOriginal($fid, $x1, $y1, $width, $height)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _cropToOriginal($fid, $x1, $y1, $width, $height);
}
function kfm_cropToNew($fid, $x1, $y1, $width, $height, $newname)
{
    include_once KFM_BASE_PATH.'includes/images.php';
    return _cropToNew($fid, $x1, $y1, $width, $height, $newname);
}
// }}}
