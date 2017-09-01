<?php
 header("Access-Control-Allow-Origin: *");
  $keyword = ($_GET['keyword']);
  $floor = ($_GET['floor']);
  echo file_get_contents('http://pathadvisor.ust.hk/phplib/search.php?keyword='.$keyword.'&floor='.$floor);
?>
