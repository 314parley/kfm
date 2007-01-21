<?php
	$db->query("create table ".$kfm_db_prefix."parameters(name text, value text)");
	$db->query("create table ".$kfm_db_prefix."directories(
		id INTEGER PRIMARY KEY,
		name text,
		physical_address text,
		parent integer not null
	)");
	$db->query("create table ".$kfm_db_prefix."files(
		id INTEGER PRIMARY KEY,
		name text,
		directory integer not null,
		foreign key (directory) references ".$kfm_db_prefix."directories(id)
	)");
	$db->query("create table ".$kfm_db_prefix."files_images(
		id INTEGER PRIMARY KEY,
		caption text,
		file_id integer not null,
		width integer default 0,
		height integer default 0,
		foreign key (file_id) references ".$kfm_db_prefix."files(id)
	)");
	$db->query("create table ".$kfm_db_prefix."files_images_thumbs(
		id INTEGER PRIMARY KEY,
		image_id integer not null,
		width integer default 0,
		height integer default 0,
		foreign key (image_id) references ".$kfm_db_prefix."files_images(id)
	)");
	$db->query("create table ".$kfm_db_prefix."tags(
		id INTEGER PRIMARY KEY,
		name text
	)");
	$db->query("create table ".$kfm_db_prefix."tagged_files(
		file_id INTEGER,
		tag_id  INTEGER,
		foreign key(file_id) references ".$kfm_db_prefix."files(id),
		foreign key(tag_id) references ".$kfm_db_prefix."tags(id)
	)");

	$db->query("insert into ".$kfm_db_prefix."parameters values('version','".KFM_VERSION."')");
	$db->query("insert into ".$kfm_db_prefix."directories values(1,'','".rtrim(addslashes($rootdir),' /')."',0)");
?>
