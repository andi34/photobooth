<?php

// WARNING!
// Do not modify this file directly.
// Please use the admin panel (http://localhost/admin) to change your personal configuration.
//
$config = array();

// G E N E R A L
// possible language values: de, el, en, es, fr, pl, it
$config['language'] = 'en';
$config['adminpanel_view'] = 'basic';
$config['dev'] = false;
$config['start_screen_title'] = 'Photobooth';
$config['start_screen_subtitle'] = NULL;
// possible thumb_size values: '360px', '540px', '900px', '1080px', '1260px'
$config['thumb_size'] = '540px';
$config['show_error_messages'] = true;
$config['auto_reload_on_error'] = true;
$config['use_qr'] = true;
$config['webserver_ip'] = null;
$config['wifi_ssid'] = 'Photobooth';
$config['use_download'] = true;
$config['download_thumbs'] = false;
// control time in milliseconds until Photobooth reloads automatically
$config['time_to_live'] = '90000';
$config['image_preview_before_processing'] = true;
$config['db_file'] = 'db';


// F R O N T P A G E
$config['show_fork'] = true;
$config['is_event'] = true;
$config['event']['textLeft'] = 'We';
// possible event symbol values: 'fa-camera-retro', 'fa-birthday-cake', 'fa-gift', 'fa-tree', 'fa-snowflake-o', 'fa-heart-o', 
//                               'fa-heart', 'fa-heartbeat', 'fa-apple', 'fa-anchor', 'fa-glass', 'fa-gears', 'fa-users'
$config['event']['symbol'] = 'fa-heart-o';
$config['event']['textRight'] = 'OpenSource';
$config['force_buzzer'] = false;


// P I C T U R E S
// control countdown timer in seconds
$config['cntdwn_time'] = '5';
$config['no_cheese'] = false;
// control time for cheeeeese! in milliseconds
$config['cheese_time'] = '1000';
$config['pictureRotation'] = '0';
$config['polaroid_effect'] = false;
$config['polaroid_rotation'] = '0';
$config['use_filter'] = true;
$config['default_imagefilter'] = 'plain';
$config['disabled_filters'] = array();
$config['take_frame'] = false;
$config['take_frame_path'] = '../resources/img/frames/frame.png';
// specify key id (e.g. 13 is the enter key) to use that key to take a picture (photo_key)
// use for example https://keycode.info to get the key code
$config['photo_key'] = null;
// possible file_naming values: 'dateformatted', 'numbered', 'random'
$config['file_naming'] = 'dateformatted';
// picture_permissions example values: '0644' (rw-r--r--), '0666' (rw-rw-rw-), '0600' (rw-------)
$config['picture_permissions'] = '0644';
$config['keep_images'] = true;
$config['preserve_exif_data'] = false;
$config['allow_delete'] = true;


// C O L L A G E
$config['use_collage'] = true;
// control countdown timer between collage pictures in seconds
$config['collage_cntdwn_time'] = '3';
$config['continuous_collage'] = true;
// possible collage_layout values: '2x2', '2x4', '2x4BI'
$config['collage_layout'] = '2x2';
$config['collage_background'] = '../resources/img/frames/DefaultCollageBackground.png';
// specify key id (e.g. 13 is the enter key) to use that key to take a collage (collage_key)
// use for example https://keycode.info to get the key code
$config['collage_key'] = null;
$config['take_collage_frame'] = false;
$config['take_collage_frame_always'] = false;
$config['take_collage_frame_path'] = '../resources/img/frames/frame.png';


// G A L L E R Y
$config['show_gallery'] = true;
$config['newest_first'] = true;
$config['use_slideshow'] = true;
$config['gallery_pictureTime'] = '3000';
$config['pswp_animateTransitions'] = false;
$config['pswp_fullscreenEl'] = false;
$config['pswp_counterEl'] = true;
$config['pswp_history'] = true;
// show_date only works if file_naming = 'dateformatted' in general section
$config['show_date'] = true;
$config['gallery']['date_format'] = 'd.m.Y - G:i';
$config['gallery_db_check_enabled'] = true;
$config['gallery_db_check_time'] = '10';
$config['allow_delete_from_gallery'] = true;
$config['scrollbar'] = false;
$config['gallery_bottom_bar'] = true;
$config['pswp_clickToCloseNonZoomable'] = false;
$config['pswp_closeOnScroll'] = false;
$config['pswp_closeOnOutsideClick'] = false;
$config['pswp_preventSwiping'] = false;
$config['pswp_pinchToClose'] = true;
$config['pswp_closeOnVerticalDrag'] = true;
$config['pswp_tapToToggleControls'] = true;
$config['pswp_zoomEl'] = false;
$config['pswp_loop'] = true;
$config['pswp_bgOpacity'] = 1;


// P R E V I E W
// Please read https://github.com/andi34/photobooth/wiki/FAQ#how-to-use-a-live-stream-as-background-at-countdown
// possible preview_mode values: none, device_cam, url, gphoto
$config['preview_mode'] = 'none';
$config['preview_gphoto_bsm'] = true;
$config['previewCamTakesPic'] = false;
$config['previewCamFlipHorizontal'] = true;
// possible ipCamPreviewRotation values: '0deg', '90deg', -90deg', '180deg', '45deg', '-45deg'
$config['ipCamPreviewRotation'] = '0deg';
$config['ipCamURL'] = null;
$config['videoWidth'] = '1280';
$config['videoHeight'] = '720';
// possible camera_mode values: "user", "environment"
$config['camera_mode'] = 'user';
$config['previewCamBackground'] = false;


// K E Y I N G
$config['chroma_keying'] = false;
// possible chroma_size values: '1000px', '1500px', '2000px', '2500px'
$config['chroma_size'] = '1500px';
$config['use_live_keying'] = false;
// possible chroma_keying_variant values: 'marvinj', 'seriouslyjs'
$config['chroma_keying_variant'] = 'marvinj';
$config['keying_background_path'] = 'resources/img/background';
$config['live_keying_show_all'] = false;


// P R I N T
$config['cups_button'] = false;
$config['use_print_result'] = false;
$config['use_print_gallery'] = false;
$config['use_print_chromakeying'] = false;
$config['auto_print'] = false;
$config['auto_print_delay'] = '1000';
$config['printing_time'] = '5000';
$config['print_key'] = null;
$config['print_qrcode'] = false;
$config['print_frame'] = false;
$config['print_frame_path'] = '../resources/img/frames/frame.png';
$config['crop_onprint'] = false;
$config['crop_width'] = '1000';
$config['crop_height'] = '500';
$config['textonprint']['enabled'] = false;
$config['textonprint']['line1'] = 'line 1';
$config['textonprint']['line2'] = 'line 2';
$config['textonprint']['line3'] = 'line 3';
$config['textonprint']['locationx'] = '2250';
$config['textonprint']['locationy'] = '1050';
$config['textonprint']['rotation'] = '40';
$config['textonprint']['font_path'] = '../resources/fonts/GreatVibes-Regular.ttf';
$config['textonprint']['font_size'] = '100';
$config['textonprint']['linespace'] = '100';


// E -  M A I L
// Please read https://github.com/andi34/photobooth/wiki/FAQ#ive-trouble-setting-up-e-mail-config-how-do-i-solve-my-problem
//
// If send_all_later is enabled, a checkbox to save the current mail address for later in {mail_file}.txt is visible
$config['mail']['enabled'] = false;
$config['mail']['send_all_later'] = false;
$config['mail']['subject'] = null; 	// if empty, default translation is used
$config['mail']['text'] = null;		// if empty, default translation is used
$config['mail']['host'] = 'smtp.example.com';
$config['mail']['username'] = 'photobooth@example.com';
$config['mail']['password'] = 'yourpassword';
$config['mail']['fromAddress'] = 'photobooth@example.com';
$config['mail']['fromName'] = 'Photobooth';
$config['mail']['file'] = 'mail-adresses';
$config['mail']['secure'] = 'tls';
$config['mail']['port'] = '587';


// S T A N D A L O N E   S L I D E S H O W
$config['slideshow_refreshTime'] = '60';
$config['slideshow_pictureTime'] = '3000';
$config['slideshow_randomPicture'] = true;
$config['slideshow_use_thumbs'] = false;


// R E M O T E   B U Z Z E R
$config['remotebuzzer_enabled'] = false;
// remotebuzzer_collagetime controls the time to distinguish picture from collage in seconds
$config['remotebuzzer_collagetime'] = '2';
$config['remotebuzzer_port'] = 14711;
$config['remotebuzzer_pin'] = 40;


// S Y N C  T O  U S B  S T I C K
$config['synctodrive']['enabled'] = false;
$config['synctodrive']['target'] = 'photobooth'; //Default target for the sync script
$config['synctodrive']['interval'] = 300;


// A U T H E N T I C A T I O N
$config['login_enabled'] = false;
$config['login_username'] = 'Photo';
$config['login_password'] = NULL;
$config['protect_admin'] = true;
$config['protect_index'] = false;


// U S E R   I N T E R F A C E
// possible index_style values: "classic", "modern", "custom"
$config['index_style'] = 'modern';
$config['toggle_fs_button'] = false;
$config['font_size'] = '16px';
$config['colors']['countdown'] = '#ffffff';
$config['colors']['background_countdown'] = '#214852';
$config['colors']['cheese'] = '#ffffff';
$config['background_image'] = null;
$config['background_admin'] = null;
$config['background_chroma'] = null;
$config['rounded_corners'] = false;
$config['colors']['primary'] = '#0a6071';
$config['colors']['secondary'] = '#214852';
$config['colors']['font'] = '#79bad9';
$config['colors']['button_font'] = '#ffffff';
$config['colors']['start_font'] = '#ffffff';
$config['colors']['panel'] = '#2d4157';
$config['colors']['hover_panel'] = '#446781';
$config['colors']['border'] = '#eeeeee';
$config['colors']['box'] = '#f8f9fc';
$config['colors']['gallery_button'] = '#ffffff';


// J P E G   Q U A L I T Y
$config['jpeg_quality_image'] = 100;
$config['jpeg_quality_chroma'] = 100;
$config['jpeg_quality_thumb'] = 60;


// C O M M A N D S
$config['take_picture']['cmd'] = null;
$config['take_picture']['msg'] = null;
$config['print']['cmd'] = null;
$config['print']['msg'] = null;
$config['exiftool']['cmd'] = null;
$config['exiftool']['msg'] = null;
$config['preview']['cmd'] = null;
$config['preview']['killcmd'] = null;
$config['nodebin']['cmd'] = null;


// F O L D E R S
$config['folders']['data'] = 'data';
$config['folders']['images'] = 'data/images';
$config['folders']['keying'] = 'data/keying';
$config['folders']['print'] = 'data/print';
$config['folders']['qrcodes'] = 'data/qrcodes';
$config['folders']['thumbs'] = 'data/thumbs';
$config['folders']['tmp'] = 'data/tmp';
$config['folders']['archives'] = 'archives';


// R E S E T
$config['reset']['remove_images'] = true;
$config['reset']['remove_mailtxt'] = false;
$config['reset']['remove_config'] = false;
