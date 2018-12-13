<?php
session_start();

include_once "../tempfunc.php";
$arr = array('a' => $_POST['id']);


$PERSON = new Suspect();
$PERSON->Setdata($_SESSION['tokens'][$_POST['id']]);
$testdata = $PERSON->Puller('characters','','online');
echo json_encode($testdata,true);