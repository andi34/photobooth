<?php

$data = $_POST;
if(isset($data['type'])){
  $my_config = '../my.config.inc.php';
  if (file_exists($my_config)) {
    require_once('../my.config.inc.php');
  } else {
    require_once('../config.inc.php');
  }

  if($data['type'] == 'reset') {

    // empty folders
    foreach($config['folders'] as $folder){
      if(is_dir('../'.$folder)) {
        $files = glob('../'.$folder.'/*.jpg');
        foreach($files as $file){ // iterate files
          if(is_file($file)){
            unlink($file); // delete file
          }
        }
      }
    }

    // delete data.txt
    if(is_file('../data.txt')){
      unlink('../data.txt'); // delete file
    }

    echo json_encode('success');

  }

  if($data['type'] == 'config') {
    $file = 'config.json';

    if(!file_exists($file)) {
      fopen($file, 'w');
    }

    if(isset($data['gallery']['cookie_isset'])) {
        $username = $data['login']['login_username'];

        $random1 = $data['login']['login_random1'];

        $hash = md5($random1.$username);

        if ($data['gallery']['cookie_isset'] == 'true') {
            $time = time() + (86400 * 30);
            setcookie('take_images', $hash, $time, "/"); // 86400 = 1 day => 30 days
        } elseif ($data['gallery']['cookie_isset'] == 'false') {
            setcookie('take_images', $hash, 0, "/"); // should delete it
        }
    }

    foreach($config as $k=>$conf){
      if(is_array($conf)) {
        foreach($conf as $sk => $sc) {
          if(isset($data[$k][$sk]) && !empty($data[$k][$sk])) {
            if($data[$k][$sk] == 'true') {
              $config[$k][$sk] = true;
            } else {
              $config[$k][$sk] = $data[$k][$sk];
            }
          }
        }
      } else {
        if(isset($data[$k]) && !empty($data[$k])) {
          if($data[$k] == 'true') {
            $config[$k] = true;
          } else {
            $config[$k] = $data[$k];
          }
        } else {
          $config[$k] = false;
        }
      }
    }

    file_put_contents($file, json_encode($config,true));
    echo json_encode('success');
  }
}
