// see license.txt for licensing
var a,b=['Link','Image','Flash'],c,d=['Browser','Upload'];
for(a in b)for(c in d)FCKConfig[b[a]+d[c]+'URL']=FCKConfig.BasePath+'plugins/kfm/browser.php?Type='+b[a];
