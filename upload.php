<?php
# see license.txt for licensing
include('initialise.php');
$js='';
if($kfm_allow_file_uploads){
	$filename=$_FILES['kfm_file']['name'];
	$tmpname=$_FILES['kfm_file']['tmp_name'];
	$to=$_SESSION['kfm']['currentdir'].'/'.$filename;
	if(!kfm_checkAddr($to))$js='parent.kfm_log("error: banned extension in file name")'; # TODO new string
	else{
		move_uploaded_file($tmpname,$to);
		if(!file_exists($to))$js='parent.kfm_log("error: failure to save tmp file \"'.$tmpname.'\" to location \"'.$to.'\"")'; # TODO new string
		else{
			$imgtype=exif_imagetype($to);
			include('includes/images.php');
			if($imgtype){
				$comment='';
				if($imgtype==1){ # gif
					$file=file_get_contents($to);
					$arr=explode('!',$file);
					$found=0;
					for($i=0;$i<count($arr)&&!$found;++$i){
						$block=$arr[$i];
						if(substr($block,0,2)==chr(254).chr(21)){
							$found=1;
							$comment=substr($block,2,strpos($block,0)-1);
						}
					}
				}
				else{
					$data=exif_read_data($to,0,true);
					if(is_array($data)&&isset($data['COMMENT'])&&is_array($data['COMMENT']))$comment=join("\n",$data['COMMENT']);
				}
				_setCaption($filename,$comment);
			}
		}
	}
}
else $js='parent.kfm_log("error: permission denied for upload to this directory")'; # TODO new string
?>
<html>
	<head>
		<script type="text/javascript">
<?php
if($_POST['onload'])echo $_POST['onload'];
else echo 'parent.x_kfm_loadFiles('.$_SESSION['kfm']['cwd_id'].',parent.kfm_refreshFiles);'.$js;
?>
		</script>
	</head>
	<body>
	</body>
</html>
