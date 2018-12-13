
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../CSS/style.css">
    </head>
    <body>
        <header>
            <div id="header">
                <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
            <?php
            session_start();
            include_once 'Functions.php';
            include_once '../tempfunc.php';
            $portrait = new pullclass("Portrait");
            $db = new questions();
            header('Location: evidence.html');
            exit;
            ?>
            </div>
        </header>
        <div id="questions">
            <p>blub</p>
            <?php
            $_SESSION['tokens'] = array("cZgp4KhLrKyH8Cy5UCZxsTexVOwftjmKaQY3EbYooemBbIaGA7W-yDi41oA-4_clvmmkhrlovGHOQdG4KbzuYLKnB9_UVFP0xOuXCs4Um1Sf0HOzNXw8z65NOkryYs5HNyU9F8MbudBIKvNI0VrFxWrCbblJPgeHmPINrsYcjcqnJ5ITqPT4xHyyFiGpy-duhS5__rHIIlx96qa1wqTE_diT7d20NLiBKUTKahDPXHyJMUxa_bTtEWxIFtYQkybYs1tcrnoI5gZP1y2HGVl9gNFf7K6FuRTXX8JEof7zLX7W6MXUpmMlrulKCiblOr9nbHSFTfRrEo0587ZtwNKjCQ_pp7pyiO0NTp6b1HL1GZNKUbEMmQCLl1sph2QZUZzf_pKidWxFTALi-KLG_nh4Pg2","9t_59U8WMfLQTHqwmy-CJLn61Q1i1r61QjMbhGE9uK6Cq-laOgkHYRlCK943XLAfpTs2_HmZKvnvxqTbgq9u6_AHzKjWx0zlaGZhGztlJCkGr9aUaC4VhX5PpBLwN2ScYlMvKFu-K5AFjnYJVHX2u8abSHBTrq08kcNe3Kg4o6B74k46dySa6HkZo9HK_pAV_w1q6hGvb-iN3I3xqOh5d6hCDihycqwPjypCZGCkA6FzdVM4cjFZSqflJvu3ww7xLiWO4Q5hNcdZ7Irpe8o4QF0XYri-4x_43TfppvIeTEM1","CGh3SakAASfDU7yiweDbOGCv_LehJB22dFIrwNgweglnABGBu2pslXB163YSotpiRKDci23EOGhlVxHpHVUT9r4YdrGd1V50G3GjXwBNF3-jaLu2GOSf6SqjQjZ4zlLTCdmYeVYPCQBdusLdAzvnJoDm9Stywzb0rEAs6mb8xKW1tYy3lbuqx_PV5Y6hJleuKxewdIKUvcvlSbqUKeOPpb_56GsEd4UMAdKO3TXc68AzbuYUs24fhnbxa_q-IYZMtzrWX6UPMZhQ1IC-8TuH6xmAO1vKxsd_nODcVsvnhjKtaEAa4ova60xTK5-Cn3gl_Pvuv03nCTPDcm6QeMtmQWZtUMqL8jeyCFOkFdimO2fQbgAvq4GkPEdeXrtobu4YiPsBKK0QcVckbG1AF-zvkQ2","Tp3XiPsHE3uXUMs2IKWXY0IT7dlc7QjLFksNd0IwwqdQXED2Zgf0UIQC9zuRtHxpEQ5G0uAFo6n0_f10RxPf5-7aZDo7TtqLTypy1dxvmLoSe3shvcI0Rq5SPrBwoHhxaOEXeVmgRcKFllpzTjZBiOeScsISlCDZ86IHU2wBWe3T44wYz9ZV3jPnwCxUDGozkSWpzUr9cVN0vhmOW3FfdzMrpPURBzhmqbYJfg3a1GVCaDce9T9xE9fNoMEtEvttaaIhYYV8oXvqZeWTDiUIo2sWrF9G3apLjHV5S4drZPk1","KBPJ8UsP0xkt-VPAlmOxsRroPtVObOj1JpjHJuIQpJcX4biYsqpKTon2OQZ781zNrQcQZY13nh_4T-Bm14CUHNiBlLFUsfE-eGOx4obNJKgmDafpshusr-yk1l2mut8xIM4WTkRx8iVNhExk2Eg2NVxC5t4lD3R7Y4zCeScAsChCKUqbbvctxwYc3L64o1ioOBMG-KuIcn_-P566XivOeXVEmna6dqQW1GSzqy8B_cm71hxdZE1_JELqN73Oyd9GD9jtbxc60czb1DR6ke9vP36Hu_eOF82NgeYDiHgWnYY1");

            $len=count($_SESSION['tokens'],1);
            for($x=0;$x<$len;$x++)
            {
                ?>
                <div id="<?=$x?>" class="Profilepic">

                    <p><?php
                        $tempPic = $portrait->_Return("", $_SESSION['tokens'][$x], true);
                        echo  '<img src="' . $tempPic[px64x64] . '">        <span class="char-name">'."$tempPic[Name]</span><br>";
                        echo"character".$x." ";
                        ?></p>
                </div>

                <?php

            }
            $random = $db->questionPuller($_SESSION["tokens"][0]);
            ?>
        </div>
        <div id="evidence">
            <ul id="nav">
                <li><a href="content">content</a></li>
            </ul>
            <div class="allcontent">
                <div class="fancy">
                    <button id="WALLET"  class="collapsible frontbutton">WALLET</button>
                    <div class="content">

                    </div>

                </div><!--WALLET -->
                <div class="fancy">
                    <button id="ASSETS" class="collapsible frontbutton">ASSETS</button>
                    <div class="content">

                    </div>

                </div><!--ASSETS -->
                <div class="fancy">
                    <button id="LOGIN" class="collapsible frontbutton">LOGIN</button>
                    <div class="content">

                    </div>

                </div><!--LOGIN -->
                <div class="fancy">
                    <button id="TITELS" class="collapsible frontbutton">TITELS</button>
                    <div class="content">

                    </div>


                </div><!--TITELS -->
                <div class="fancy">
                    <button id="BOOKMARKS" class="collapsible frontbutton">BOOKMARKS</button>
                    <div class="content">

                    </div>


                </div><!--BOOKMARKS-->
                <div class="fancy">
                    <button id="BLUEPINTS" class="collapsible frontbutton">BLUEPRINTS</button>
                    <div class="content">

                    </div>


                </div><!--BLUEPRINTS-->
                <div class="fancy">
                    <button id="MAIL" class="collapsible frontbutton">MAIL</button>
                    <div class="content">

                    </div>

            </div><!--MAIL-->
        </div>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.12/handlebars.min.js"></script>
        <script type="text/javascript" src="js/base.js"></script>
        <script type="text/javascript" src="js/templates.js"></script>
        <script type="text/javascript" src="js/global.js"></script>
        <script type="text/javascript" src="js/login.js"></script>
        <script type="text/javascript" src="js/wallet.js"></script>
        <script type="text/javascript" src="js/people.js"></script>
        <script type="text/javascript" src="js/assets.js"></script>
        <script type="text/javascript" src="js/bookmarks.js"></script>
        <script type="text/javascript" src="js/mail.js"></script>
        <script type="text/javascript" src="js/titles.js"></script>
        <script type="text/javascript" src="js/blueprints.js"></script>
        <script type="text/javascript" src="js/index.js"></script>

    </body>
</html>


