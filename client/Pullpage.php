<?php
session_start();
include_once "../tempfunc.php";
$keyarray = array("characters", "current_user", "questions");
$_SESSION['tokens'] = array("cZgp4KhLrKyH8Cy5UCZxsTexVOwftjmKaQY3EbYooemBbIaGA7W-yDi41oA-4_clvmmkhrlovGHOQdG4KbzuYLKnB9_UVFP0xOuXCs4Um1Sf0HOzNXw8z65NOkryYs5HNyU9F8MbudBIKvNI0VrFxWrCbblJPgeHmPINrsYcjcqnJ5ITqPT4xHyyFiGpy-duhS5__rHIIlx96qa1wqTE_diT7d20NLiBKUTKahDPXHyJMUxa_bTtEWxIFtYQkybYs1tcrnoI5gZP1y2HGVl9gNFf7K6FuRTXX8JEof7zLX7W6MXUpmMlrulKCiblOr9nbHSFTfRrEo0587ZtwNKjCQ_pp7pyiO0NTp6b1HL1GZNKUbEMmQCLl1sph2QZUZzf_pKidWxFTALi-KLG_nh4Pg2","9t_59U8WMfLQTHqwmy-CJLn61Q1i1r61QjMbhGE9uK6Cq-laOgkHYRlCK943XLAfpTs2_HmZKvnvxqTbgq9u6_AHzKjWx0zlaGZhGztlJCkGr9aUaC4VhX5PpBLwN2ScYlMvKFu-K5AFjnYJVHX2u8abSHBTrq08kcNe3Kg4o6B74k46dySa6HkZo9HK_pAV_w1q6hGvb-iN3I3xqOh5d6hCDihycqwPjypCZGCkA6FzdVM4cjFZSqflJvu3ww7xLiWO4Q5hNcdZ7Irpe8o4QF0XYri-4x_43TfppvIeTEM1","CGh3SakAASfDU7yiweDbOGCv_LehJB22dFIrwNgweglnABGBu2pslXB163YSotpiRKDci23EOGhlVxHpHVUT9r4YdrGd1V50G3GjXwBNF3-jaLu2GOSf6SqjQjZ4zlLTCdmYeVYPCQBdusLdAzvnJoDm9Stywzb0rEAs6mb8xKW1tYy3lbuqx_PV5Y6hJleuKxewdIKUvcvlSbqUKeOPpb_56GsEd4UMAdKO3TXc68AzbuYUs24fhnbxa_q-IYZMtzrWX6UPMZhQ1IC-8TuH6xmAO1vKxsd_nODcVsvnhjKtaEAa4ova60xTK5-Cn3gl_Pvuv03nCTPDcm6QeMtmQWZtUMqL8jeyCFOkFdimO2fQbgAvq4GkPEdeXrtobu4YiPsBKK0QcVckbG1AF-zvkQ2","Tp3XiPsHE3uXUMs2IKWXY0IT7dlc7QjLFksNd0IwwqdQXED2Zgf0UIQC9zuRtHxpEQ5G0uAFo6n0_f10RxPf5-7aZDo7TtqLTypy1dxvmLoSe3shvcI0Rq5SPrBwoHhxaOEXeVmgRcKFllpzTjZBiOeScsISlCDZ86IHU2wBWe3T44wYz9ZV3jPnwCxUDGozkSWpzUr9cVN0vhmOW3FfdzMrpPURBzhmqbYJfg3a1GVCaDce9T9xE9fNoMEtEvttaaIhYYV8oXvqZeWTDiUIo2sWrF9G3apLjHV5S4drZPk1","KBPJ8UsP0xkt-VPAlmOxsRroPtVObOj1JpjHJuIQpJcX4biYsqpKTon2OQZ781zNrQcQZY13nh_4T-Bm14CUHNiBlLFUsfE-eGOx4obNJKgmDafpshusr-yk1l2mut8xIM4WTkRx8iVNhExk2Eg2NVxC5t4lD3R7Y4zCeScAsChCKUqbbvctxwYc3L64o1ioOBMG-KuIcn_-P566XivOeXVEmna6dqQW1GSzqy8B_cm71hxdZE1_JELqN73Oyd9GD9jtbxc60czb1DR6ke9vP36Hu_eOF82NgeYDiHgWnYY1");
if (in_array($_GET['scope'], $keyarray)) {
    $db = new DBconn();
switch ($_GET['scope']){
    case "characters":
        $PERSON = new pullclass("Portrait");
        foreach ($_SESSION['tokens'] as $key=>$value){
            $returnData[$key] = $PERSON->_Return("",$value,"1");
        }
        break;
    case "current_user":
        $PERSON = new pullclass("Portrait");
        $returnData['level'] = $db->userLevelDispenser($_SESSION["characterOwnerHash"]);
        $temp = $PERSON->_Return("",$_SESSION["refresh_token"],"1");
        $returnData["name"] = $temp['name'];
        unset($temp['name']);
        $returnData["img"] = $temp;
        break;
    case "questions":
        $returnData = $db->questionPuller($_SESSION["tokens"][0]);
        break;
}
    echo json_encode($returnData, true);
} else {
    $PERSON = new pullclass($_GET['scope']);

    $returnData = $PERSON->_Return($_SESSION['tokens'][$_GET['id']], $_GET['param1'], $_GET['param2'], $_GET['param3']);


    if (empty($returnData)) {
        echo json_encode("empty", true);
    } else {

        echo json_encode($returnData, true);
    }
}