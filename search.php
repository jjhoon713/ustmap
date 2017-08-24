<?php

 header("Access-Control-Allow-Origin: *");

/*
 ini_set('display_errors', 1);
 ini_set('display_startup_errors', 1);
 error_reporting(E_ALL);
*/
  $search = strtolower($_GET['search']);


  $files = ["00","01","02","03","04","05","06","07","08","09","010","011","012",
  "10","11","12","13","14","15","16","17","18",
  "20","21","22","23","24","25",
  "30","31","32","33","34","35","36","37",
  "40","41",
  "50"
];
  $retcnt = 0;
  foreach($files as &$name){
    $fn = fopen("data/".$name,"r");
    $cnt = 0;
    while (($line = fgets($fn)) !== false and $retcnt < 5) {
      $cnt = $cnt + 1;
      if($cnt>4){
      $newnew = explode(";",$line);
      $new = $newnew[1].$newnew[2].$newnew[3];
        if (strpos(strtolower($new), $search) !== false) {

            echo $name.";".$line;
            $retcnt = $retcnt + 1;
        }
      }
    }
    fclose($fn);
  }

 ?>
