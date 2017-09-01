<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-type:application/json");
  $floor = ($_GET['floor']);
  echo file_get_contents('http://pathadvisor.ust.hk/phplib/get_map_data_2.php?floor='.$floor.'&MapCoorX=0&MapCoorY=0&offsetX=10000&offsetY=10000');
?>
