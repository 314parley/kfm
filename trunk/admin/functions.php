<?php
function form_input($type, $name, $value, $props){
	global $sprefix;
	$str='<input type="'.$type.'" name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" value="'.$value.'"';
	foreach($props as $prop_name=>$prop_value) $str.=' '.$prop_name.'="'.$prop_value.'"';
	$str.=' onblur="change_setting(\''.$name.'\',this.value)"';
	$str.=' />';
	return $str;
}
function form_array($name, $value, $props){
	global $sprefix;
	if(gettype($value)=='array')$value=implode(',',$value);
	$str='<input type="text" name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" value="'.$value.'"';
	$str.=' onblur="change_setting(\''.$name.'\',this.value)"';
	foreach($props as $prop_name=>$prop_value) $str.=' '.$prop_name.'="'.$prop_value.'"';
	$str.=' />';
	return $str;
}
function form_bool($name,$value){
	global $sprefix;
	$checked=$value?'checked="checked"':'';
	$str='<input name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" type="checkbox" '.$checked.' />';
	$str='<select name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" onchange="change_setting(\''.$name.'\',this.value)">';
	$str.='<option value="0"'.($value?'':' selected="selected"').'>no</option>';
	$str.='<option value="1"'.($value?' selected="selected"':'').'>yes</option>';
	$str.='</select>';
	return $str;
}
function form_choice_list($name,$value,$options){
	global $sprefix;
	$str='<select name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" onchange="change_setting(\''.$name.'\',this.value)">';
	foreach($options as $option=>$ovalue){
		$str.='<option value="'.$ovalue.'"'.($ovalue==$value?' selected="selected"':'').'>'.$option.'</option>';
	}
	$str.='</select>';
	return $str;
}
function form_select_list($name,$value,$options){
	global $sprefix;
	$str='';
	foreach($options as $option){
		$ch=in_array($option,$value)?'checked="checked"':'';
		$str.='<input type="checkbox" onclick="setting_select_list(\''.$name.'\',\''.$option.'\',this.checked)" '.$ch.'/>'.$option.'<br />';
	}
	return $str;
}
function form_user_setting($name, $is){
	global $sprefix;
	$checked=$is?'checked="checked"':'';
	$str='<select name="'.$sprefix.$name.'" id="'.$sprefix.$name.'" onchange="change_is_user_setting(\''.$name.'\',this.value)">';
	$str.='<option value="0"'.($is?'':' selected="selected"').'>no</option>';
	$str.='<option value="1"'.($is?' selected="selected"':'').'>yes</option>';
	$str.='</select>';
	return $str;
}
function user_row($id, $username, $status){
	$html='<tr id="user_row_'.$id.'">
		<td>'.$username.'</td>
		<td>
			<span class="button" onclick="delete_user('.$id.',\''.$username.'\')">Delete</span>
			<span class="button" onclick="password_reset('.$id.',\''.$username.'\')">Reset password</span>
		</td>
		<td>
			<select onchange="user_status_change('.$id.',this.value)">
				<option value="1" '.(($status==1)?'selected="selected"':'').'>admin</option>
				<option value="2" '.(($status==2)?'selected="selected"':'').'>user</option>
				<option value="3" '.(($status==3)?'selected="selected"':'').'>blocked</option>
			</select>
		</td>
	</tr>';
	return $html;
}
?>
