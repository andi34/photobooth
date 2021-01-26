<?php
header('Content-Type: application/json');

require_once '../lib/config.php';
require_once '../lib/db.php';

$os = DIRECTORY_SEPARATOR == '\\' || strtolower(substr(PHP_OS, 0, 3)) === 'win' ? 'windows' : 'linux';

$data = $_POST;
if (!isset($data['type'])) {
    echo json_encode('error');
}

if ($data['type'] == 'reset') {
    if ($config['reset']['remove_images']) {
        // empty folders
        foreach ($config['foldersAbs'] as $folder) {
            if (is_dir($folder)) {
                $files = glob($folder . '/*.jpg');
                foreach ($files as $file) {
                    // iterate files
                    if (is_file($file)) {
                        unlink($file); // delete file
                    }
                }
            }
        }
    }

    if ($config['reset']['remove_mailtxt']) {
        if (is_file(MAIL_FILE)) {
            unlink(MAIL_FILE); // delete file
        }
    }

    if ($config['reset']['remove_config']) {
        // delete personal config
        if (is_file('../config/my.config.inc.php')) {
            unlink('../config/my.config.inc.php');
        }
    }

    // delete db.txt
    if (is_file(DB_FILE)) {
        unlink(DB_FILE); // delete file
    }

    die(json_encode('success'));
}

if ($data['type'] == 'config') {
    $newConfig = [];

    foreach ($config as $k => $conf) {
        if (is_array($conf)) {
            foreach ($conf as $sk => $sc) {
                if (isset($data[$k][$sk])) {
                    if ($data[$k][$sk] == 'true') {
                        $newConfig[$k][$sk] = true;
                    } else {
                        $newConfig[$k][$sk] = $data[$k][$sk];
                    }
                } elseif (isset($defaultConfig[$k][$sk])) {
                    $newConfig[$k][$sk] = false;
                }
            }
        } else {
            if (isset($data[$k]) && !empty($data[$k])) {
                if ($data[$k] == 'true') {
                    $newConfig[$k] = true;
                } else {
                    $newConfig[$k] = $data[$k];
                }
            } else {
                $newConfig[$k] = false;
            }
        }
    }

    if ($newConfig['login_enabled']) {
        if (isset($newConfig['login_password']) && !empty($newConfig['login_password'])) {
            if (!($newConfig['login_password'] === $config['login_password'])) {
                $hashing = password_hash($newConfig['login_password'], PASSWORD_DEFAULT);
                $newConfig['login_password'] = $hashing;
            }
        } else {
            $newConfig['login_enabled'] = false;
        }
    } else {
        $newConfig['login_password'] = null;
    }

    if ($newConfig['preview_mode'] != 'device_cam' && $newConfig['preview_mode'] != 'gphoto') {
        $newConfig['previewCamTakesPic'] = false;
    }

    if ($newConfig['index_style'] === 'custom') {
        if (
            !is_readable('../template/custom.template.php') ||
            !is_readable('../resources/css/custom_style.css') ||
            !is_readable('../resources/css/custom_chromakeying.css') ||
            !is_readable('../resources/css/custom_live_chromakeying.css')
        ) {
            $newConfig['index_style'] = 'default';
        }
    }

    if ($os === 'windows') {
        $newConfig['remotebuzzer']['enabled'] = false;
        $newConfig['synctodrive']['enabled'] = false;
    }

    $content = "<?php\n\$config = " . var_export(arrayRecursiveDiff($newConfig, $defaultConfig), true) . ';';

    if (file_put_contents($my_config_file, $content)) {
        clearCache($my_config_file);

        echo json_encode('success');
    } else {
        echo json_encode('error');
    }
}

/* Kill service daemons after config has changed */
require_once '../lib/services_stop.php';

function arrayRecursiveDiff($aArray1, $aArray2) {
    $aReturn = [];

    foreach ($aArray1 as $mKey => $mValue) {
        if (array_key_exists($mKey, $aArray2)) {
            if (is_array($mValue)) {
                $aRecursiveDiff = arrayRecursiveDiff($mValue, $aArray2[$mKey]);
                if (count($aRecursiveDiff)) {
                    $aReturn[$mKey] = $aRecursiveDiff;
                }
            } else {
                if ($mValue != $aArray2[$mKey]) {
                    $aReturn[$mKey] = $mValue;
                }
            }
        } else {
            $aReturn[$mKey] = $mValue;
        }
    }
    return $aReturn;
}

function clearCache($file) {
    if (function_exists('opcache_invalidate') && strlen(ini_get('opcache.restrict_api')) < 1) {
        opcache_invalidate($file, true);
    } elseif (function_exists('apc_compile_file')) {
        apc_compile_file($file);
    }
}
