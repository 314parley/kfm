<?php
require 'php-api/txt-db-api.php';
error_reporting(E_ALL);
class btk_database{
	var $sql;
	var $php_api = false;
	var $mysql = false;
	var $last_inserted_id = false;
	var $result = false;
	function __construct(){
		if(func_num_args()==0){
			$this->php_api();
		}elseif(func_num_args()==1 && substr(func_get_arg(0),0,6=='sqlite')){
			return new PDO(func_get_arg(0));
		}else if(false){
			// mysql support
		}else{
			return false;
		}
	}
	
	function php_api(){
		global $rootdir;
		if (!file_exists(DB_DIR ."kfm_database")) {
			$db = new Database(ROOT_DATABASE);
			$db->executeQuery("CREATE DATABASE kfm_database");
		}
		if (!file_exists(DB_DIR . "kfm_database/parameters.txt")) {
			$db = new Database("kfm_database");
			$db->executeQuery("CREATE TABLE parameters (name str, value str)");
			$db->executeQuery("INSERT INTO parameters (name, value) VALUES ('version','0.5.1')");
		}
		if (!file_exists(DB_DIR . "kfm_database/directories.txt")) {
			$db = new Database("kfm_database");
			$db->executeQuery("CREATE TABLE directories (id inc, name str, physical_address str, parent str)");
			$db->executeQuery("INSERT INTO directories VALUES (1,'','".addslashes($rootdir)."','0')");
		}
		if (!file_exists(DB_DIR . "kfm_database/files.txt")) {
			$db = new Database("kfm_database");
			$db->executeQuery("CREATE TABLE files (id inc, name str, directory str)");
		}
		$this->php_api = true;
	}
	function prepare($sql){
		$this->sql = $sql;
		return $this;
	}
	function execute(){
		$this->query($this->sql);
	}
	function exec($sql){
		$this->query($sql);	
	}
	function query($sql){
		if($this->php_api){
			$is_select = (strtoupper(substr($sql,0,6))=='INSERT');
			$db= new Database('kfm_database');
			$this->result = $db->executeQuery($sql);
			if($is_select) $this->last_inserted_id = $db->getLastInsertId ();
			return $this;
		}else if(false){
			// mysql	
		}else{
			return false;
		}
	}
	function lastInsertId(){
		return $this->last_inserted_id;
	}
	function fetchAll(){
		$data = array();
		$data_row = array();
		$colnames = $this->result->getColumnNames();
		while($this->result->next()){
			foreach($colnames as $col)$data_row[$col] = $this->result->getCurrentValueByName($col);
			$data[] = $data_row;
		}
		return $data;
	}
	function fetch(){
		$result_data = $this->fetchAll();
		if(count($result_data)){
			return $result_data[0];
		}else{
			return array();
		}	
	}
}

//$db = new btk_database();
//$q = $db->prepare("select id,physical_address,name from directories where id='1'");
//$q->execute();
//$dirsdb=$q->fetchAll();
//print_r($dirsdb);

?>
