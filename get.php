<?php
$d = array();
if ($_POST['keyword']=='a') {
    $d['data'][0]['id']     = '1';
    $d['data'][0]['title']  = 'apple';

    $d['data'][1]['id']     = '2';
    $d['data'][1]['title']  = 'ajax';
}
if ($_POST['keyword']=='b') {
    $d['data'][0]['id']     = '3';
    $d['data'][0]['title']  = 'book';

    $d['data'][1]['id']     = '4';
    $d['data'][1]['title']  = 'beyond';
}
if ($_POST['keyword']!='a' && $_POST['keyword']!='b') {
    $d['data'][0]['id']     = '5';
    $d['data'][0]['title']  = '窗前明月光';

    $d['data'][1]['id']     = '6';
    $d['data'][1]['title']  = '疑是地上霜';

    $d['data'][2]['id']     = '7';
    $d['data'][2]['title']  = '举头望明月';

    $d['data'][3]['id']     = '8';
    $d['data'][3]['title']  = '低头思故乡';
}
echo json_encode($d);