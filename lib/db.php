<?php
require_once __DIR__ . '/config.php';

define('DB_FILE', $config['foldersAbs']['data'] . DIRECTORY_SEPARATOR . $config['database']['file'] . '.txt');
define('MAIL_FILE', $config['foldersAbs']['data'] . DIRECTORY_SEPARATOR . $config['mail']['file'] . '.txt');

function getImagesFromDB() {
    // get data from db.txt
    if (file_exists(DB_FILE)) {
        return json_decode(file_get_contents(DB_FILE));
    }

    return [];
}

function appendImageToDB($filename) {
    $images = getImagesFromDB();

    if (!in_array($filename, $images)) {
        $images[] = $filename;
        file_put_contents(DB_FILE, json_encode($images));
    }
}

function deleteImageFromDB($filename) {
    $images = getImagesFromDB();

    if (in_array($filename, $images)) {
        unset($images[array_search($filename, $images)]);
        file_put_contents(DB_FILE, json_encode(array_values($images)));
    }

    if (file_exists(DB_FILE) && empty($images)) {
        unlink(DB_FILE);
    }
}

function isImageInDB($filename) {
    $images = getImagesFromDB();

    return in_array($filename, $images);
}

function getDBSize() {
    if (file_exists(DB_FILE)) {
        return (int) filesize(DB_FILE);
    }
    return 0;
}
