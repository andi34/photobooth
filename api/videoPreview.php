<?php
header('Content-Type: application/json');

require_once('../lib/config.php');

$cmd = sprintf($config['start_preview']['cmd'], $filename);
exec($cmd, $output, $returnValue);

if ($returnValue) {
    die(json_encode([
        'error' => 'GPhoto returned with an error code',
        'cmd' => $cmd,
        'returnValue' => $returnValue,
        'output' => $output,
    ]));
}
