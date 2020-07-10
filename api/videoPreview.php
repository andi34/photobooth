<?php
header('Content-Type: application/json');

require_once('../lib/config.php');

$cmd = sprintf($config['start_preview']['cmd'], $filename);
