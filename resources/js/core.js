/* globals initPhotoSwipeFromDOM i18n */

const photoBooth = (function () {
    // vars
    const Photobooth = {},
        loader = $('#loader'),
        startPage = $('#start'),
        wrapper = $('#wrapper'),
        timeToLive = config.time_to_live,
        gallery = $('#gallery'),
        resultPage = $('#result'),
        webcamConstraints = {
            audio: false,
            video: {
                width: config.videoWidth,
                height: config.videoHeight,
                facingMode: config.camera_mode,
            }
        },
        videoView = $('#video--view').get(0),
        videoPreview = $('#video--preview').get(0),
        previewVideoPlayer = null,
        videoSensor = document.querySelector('#video--sensor');

    let timeOut,
        nextCollageNumber = 0,
        currentCollageFile = '',
        imgFilter = config.default_imagefilter;

    const modal = {
        open: function (selector) {
            $(selector).addClass('modal--show');
        },
        close: function (selector) {
            if ($(selector).hasClass('modal--show')) {
                $(selector).removeClass('modal--show');

                return true;
            }

            return false;
        },
        toggle: function (selector) {
            $(selector).toggleClass('modal--show');
        },
        empty: function (selector) {
            modal.close(selector);

            $(selector).find('.modal__body').empty();
        }
    };

    Photobooth.reloadPage = function () {
        window.location.reload();
    }

    // timeOut function
    Photobooth.resetTimeOut = function () {
        clearTimeout(timeOut);

        timeOut = setTimeout(function () {
            Photobooth.reloadPage();
        }, timeToLive);
    }

    // reset whole thing
    Photobooth.reset = function () {
        loader.removeClass('open');
        loader.removeClass('error');
        modal.empty('#qrCode');
        $('.qrbtn').removeClass('active').attr('style', '');
        $('.loading').text('');
        gallery.removeClass('gallery--open');
        gallery.find('.gallery__inner').hide();
        $('.spinner').hide();
        $('.send-mail').hide();
        $('#video--view').hide();
        $('#video--preview').hide();
        $('#video--sensor').hide();
        $('#ipcam--view').hide();
        Photobooth.resetMailForm();
        $('#loader').css('background', config.colors.background_countdown);
        $('#loader').css('background-color', config.colors.background_countdown);
    }

    // init
    Photobooth.init = function () {
        Photobooth.reset();

        initPhotoSwipeFromDOM('#galimages');

        resultPage.hide();
        startPage.addClass('open');
        if (config.previewCamBackground) {
            Photobooth.startVideo('preview');
        }
    }

    Photobooth.openNav = function () {
        $('#mySidenav').addClass('sidenav--open');
    }

    Photobooth.closeNav = function () {
        $('#mySidenav').removeClass('sidenav--open');
    }

    Photobooth.toggleNav = function () {
        $('#mySidenav').toggleClass('sidenav--open');
    }

    Photobooth.startRemotePreview = function () {
        $.ajax({
            method: 'POST',
            url: 'api/videoPreview.php',
            data: {},
            success: () => {},
            error: (jqXHR, textStatus) => {
                console.log('An error occurred', textStatus);
            },
        });

        document.getElementById("remoteVideo").src = "http://localhost:8090/video-stream.mjpeg";
    }

    Photobooth.stopRemotePreview = function () {
        window.clearInterval(Photobooth.previewVideoPlayer);
    }

    Photobooth.startVideo = function (mode) {

        if (config.previewCamBackground) {
            Photobooth.stopVideo('preview');
        }

        if (!navigator.mediaDevices) {
            return;
        }

        const getMedia = (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || false);

        if (!getMedia) {
            return;
        }

        if (config.previewCamFlipHorizontal) {
            $('#video--view').addClass('flip-horizontal');
            $('#video--preview').addClass('flip-horizontal');
        }

        getMedia.call(navigator.mediaDevices, webcamConstraints)
            .then(function (stream) {
                if (mode === 'preview') {
                    $('#video--preview').show();
                    videoPreview.srcObject = stream;
                    Photobooth.stream = stream;
                    wrapper.css('background-image', 'none');
                    wrapper.css('background-color', 'transparent');
                } else {
                    $('#video--view').show();
                    videoView.srcObject = stream;
                }
                Photobooth.stream = stream;
            })
            .catch(function (error) {
                console.log('Could not get user media: ', error)
            });
    }

    Photobooth.stopVideo = function (mode) {
        if (Photobooth.stream) {
            const track = Photobooth.stream.getTracks()[0];
            track.stop();
            if (mode === 'preview') {
                $('#video--preview').hide();
            } else {
                $('#video--view').hide();
            }
        }
    }

    Photobooth.thrill = function (photoStyle) {
        Photobooth.closeNav();
        Photobooth.reset();

        if (config.previewCamBackground) {
            wrapper.css('background-color', config.colors.panel);
        }

        if (currentCollageFile && nextCollageNumber) {
            photoStyle = 'collage';
        }

        Photobooth.startRemotePreview();
        if (config.previewFromCam) {
            Photobooth.startVideo('view');
        }

        if (config.previewFromIPCam) {
            $('#ipcam--view').show();
            $('#ipcam--view').addClass('streaming');
        }

        loader.addClass('open');
        //Photobooth.startCountdown(nextCollageNumber ? config.collage_cntdwn_time : config.cntdwn_time, $('#counter'), () => {
        //    Photobooth.cheese(photoStyle);
        //});
    }

    // Cheese
    Photobooth.cheese = async function (photoStyle) {
        if (config.dev) {
            console.log(photoStyle);
        }

        $('#counter').empty();
        $('.cheese').empty();

        if (photoStyle === 'photo') {
            $('.cheese').text(await i18n('cheese'));
        } else {
            $('.cheese').text(await i18n('cheeseCollage'));
            $('<p>').text(`${nextCollageNumber + 1} / ${config.collage_limit}`).appendTo('.cheese');
        }

        if (config.previewFromCam && config.previewCamTakesPic && !Photobooth.stream && !config.dev) {
            console.log('No preview by device cam available!');

            if (config.previewFromIPCam) {
                $('#ipcam--view').removeClass('streaming');
                $('#ipcam--view').hide();
            }

            Photobooth.errorPic({
                error: 'No preview by device cam available!'
            });
        } else {
            setTimeout(() => {
                Photobooth.takePic(photoStyle);
            }, config.cheese_time);
        }
    }

    // take Picture
    Photobooth.takePic = function (photoStyle) {
        if (config.dev) {
            console.log('Take Picture:' + photoStyle);
        }

        if (config.previewFromCam) {
            if (config.previewCamTakesPic && !config.dev) {
                videoSensor.width = videoView.videoWidth;
                videoSensor.height = videoView.videoHeight;
                videoSensor.getContext('2d').drawImage(videoView, 0, 0);
            }
            Photobooth.stopVideo('view');
        }

        if (config.previewFromIPCam) {
            $('#ipcam--view').removeClass('streaming');
            $('#ipcam--view').hide();
        }

        const data = {
            filter: imgFilter,
            style: photoStyle,
            canvasimg: videoSensor.toDataURL('image/jpeg'),
        };

        if (photoStyle === 'collage') {
            data.file = currentCollageFile;
            data.collageNumber = nextCollageNumber;
        }

        loader.css('background', config.colors.panel);
        loader.css('background-color', config.colors.panel);

        jQuery.post('api/takePic.php', data).done(async function (result) {
            console.log('took picture', result);
            $('.cheese').empty();
            if (config.previewCamFlipHorizontal) {
                $('#video--view').removeClass('flip-horizontal');
                $('#video--preview').removeClass('flip-horizontal');
            }

            // reset filter (selection) after picture was taken
            imgFilter = config.default_imagefilter;
            $('#mySidenav .activeSidenavBtn').removeClass('activeSidenavBtn');
            $('#' + imgFilter).addClass('activeSidenavBtn');

            if (result.error) {
                Photobooth.errorPic(result);
            } else if (result.success === 'collage' && (result.current + 1) < result.limit) {
                currentCollageFile = result.file;
                nextCollageNumber = result.current + 1;

                $('.spinner').hide();
                $('.loading').empty();
                $('#video--sensor').hide();

                if (config.continuous_collage) {
                    setTimeout(() => {
                        Photobooth.thrill('collage');
                    }, 1000);
                } else {
                    $('<a class="btn" href="#">' + await i18n('nextPhoto') + '</a>').appendTo('.loading').click((ev) => {
                        ev.preventDefault();

                        Photobooth.thrill('collage');
                    });
                    const abortmsg = await i18n('abort');
                    $('.loading').append($('<a class="btn" style="margin-left:2px" href="./">').text(abortmsg));
                }
            } else {
                currentCollageFile = '';
                nextCollageNumber = 0;

                Photobooth.processPic(photoStyle, result);
            }

        }).fail(function (xhr, status, result) {
            Photobooth.errorPic(result);
        });
    }

    // Show error Msg and reset
    Photobooth.errorPic = function (data) {
        setTimeout(async function () {
            $('.spinner').hide();
            $('.loading').empty();
            $('.cheese').empty();
            $('#video--view').hide();
            $('#video--sensor').hide();
            loader.addClass('error');
            const errormsg = await i18n('error');
            $('.loading').append($('<p>').text(errormsg));
            if (config.show_error_messages || config.dev) {
                $('.loading').append($('<p class="text-muted">').text(data.error));
            }
            const reloadmsg = await i18n('reload');
            $('.loading').append($('<a class="btn" href="./">').text(reloadmsg));
        }, 500);
    }

    Photobooth.processPic = async function (photoStyle, result) {
        const tempImageUrl = config.folders.tmp + '/' + result.file;

        $('.spinner').show();
        $('.loading').text(photoStyle === 'photo' ? await i18n('busy') : await i18n('busyCollage'));

        if (photoStyle === 'photo' && config.image_preview_before_processing) {
            const preloadImage = new Image();
            preloadImage.onload = () => {
                $('#loader').css('background-image', `url(${tempImageUrl})`);
                $('#loader').addClass('showBackgroundImage');
            }
            preloadImage.src = tempImageUrl;
        }

        $.ajax({
            method: 'POST',
            url: 'api/applyEffects.php',
            data: {
                file: result.file,
                filter: imgFilter,
                isCollage: photoStyle === 'collage',
            },
            success: (data) => {
                console.log('picture processed', data);

                if (data.error) {
                    Photobooth.errorPic(data);
                } else {
                    Photobooth.renderPic(data.file);
                }
            },
            error: (jqXHR, textStatus) => {
                console.log('An error occurred', textStatus);

                Photobooth.errorPic({
                    error: 'Request failed: ' + textStatus,
                });
            },
        });
    }

    // Render Picture after taking
    Photobooth.renderPic = function (filename) {
        // Add QR Code Image
        const qrCodeModal = $('#qrCode');
        modal.empty(qrCodeModal);
        $('<img src="api/qrcode.php?filename=' + filename + '"/>').on('load', async function () {
            const body = qrCodeModal.find('.modal__body');

            $(this).appendTo(body);
            $('<p>').css('max-width', this.width + 'px').html(await i18n('qrHelp')).appendTo(body);
        });

        // Add Print Link
        $(document).off('click touchstart', '.printbtn');
        $(document).on('click', '.printbtn', function (e) {
            e.preventDefault();
            e.stopPropagation();

            Photobooth.printImage(filename, () => {
                $('.printbtn').blur();
            });
        });

        resultPage.find('.deletebtn').off('click').on('click', (ev) => {
            ev.preventDefault();

            Photobooth.deleteImage(filename, (data) => {
                if (data.success) {
                    Photobooth.reloadPage();
                } else {
                    console.log('Error while deleting image');
                }
            })
        });

        // Add Image to gallery and slider
        Photobooth.addImage(filename);

        const imageUrl = config.folders.images + '/' + filename;

        const preloadImage = new Image();
        preloadImage.onload = () => {
            resultPage.css({
                'background-image': `url(${imageUrl}?filter=${imgFilter})`,
            });
            resultPage.attr('data-img', filename);

            startPage.hide();
            resultPage.show();

            $('.resultInner').addClass('show');
            loader.removeClass('open');

            $('#loader').css('background-image', 'url()');
            $('#loader').removeClass('showBackgroundImage');

            Photobooth.resetTimeOut();
        };

        preloadImage.src = imageUrl;
    }

    // add image to Gallery
    Photobooth.addImage = function (imageName) {
        const thumbImg = new Image();
        const bigImg = new Image();
        let thumbSize = '';
        let bigSize = '';

        let imgtoLoad = 2;

        thumbImg.onload = function () {
            thumbSize = this.width + 'x' + this.height;
            if (--imgtoLoad == 0) { allLoaded(); }
        }

        bigImg.onload = function () {
            bigSize = this.width + 'x' + this.height;
            if (--imgtoLoad == 0) { allLoaded(); }
        }

        bigImg.src = config.folders.images + '/' + imageName;
        thumbImg.src = config.folders.thumbs + '/' + imageName;

        function allLoaded() {
            const linkElement = $('<a>').html(thumbImg);

            linkElement.attr('data-size', bigSize);
            linkElement.attr('href', config.folders.images + '/' + imageName);
            linkElement.attr('data-med', config.folders.thumbs + '/' + imageName);
            linkElement.attr('data-med-size', thumbSize);

            if (config.newest_first) {
                linkElement.prependTo($('#galimages'));
            } else {
                linkElement.appendTo($('#galimages'));
            }

            $('#galimages').children().not('a').remove();
        }
    }

    // Open Gallery Overview
    Photobooth.openGallery = function () {
        if (config.scrollbar) {
            gallery.addClass('scrollbar');
        }

        gallery.addClass('gallery--open');

        setTimeout(() => gallery.find('.gallery__inner').show(), 300);
    }

    Photobooth.resetMailForm = function () {
        $('#send-mail-form').trigger('reset');
        $('#mail-form-message').html('');
    };

    // Countdown Function
    Photobooth.startCountdown = function (start, element, cb) {
        let count = 0;
        let current = start;

        function timerFunction() {
            element.text(current);
            current--;

            element.removeClass('tick');

            if (count < start) {
                window.setTimeout(() => element.addClass('tick'), 50);
                window.setTimeout(timerFunction, 1000);
            } else {
                cb();
            }
            count++;
        }
        timerFunction();
    }

    Photobooth.printImage = function (imageSrc, cb) {
        modal.open('#print_mesg');

        setTimeout(function () {
            $.ajax({
                url: 'api/print.php?filename=' + encodeURI(imageSrc),
            }).done(function (data) {
                if (config.dev) {
                    console.log(data)
                }

                setTimeout(function () {
                    modal.close('#print_mesg');
                    cb();
                }, 5000);
            });
        }, 1000);
    }

    Photobooth.deleteImage = function (imageName, cb) {
        $.ajax({
            url: 'api/deletePhoto.php',
            method: 'POST',
            data: {
                file: imageName,
            },
            success: (data) => {
                cb(data);
            }
        });
    }

    Photobooth.toggleMailDialog = function (img) {
        const mail = $('.send-mail');

        if (mail.hasClass('mail-active')) {
            Photobooth.resetMailForm();
            mail.removeClass('mail-active').fadeOut('fast');
        } else {
            $('#mail-form-image').val(img);

            mail.addClass('mail-active').fadeIn('fast');
        }
    }

    //Filter
    $('.imageFilter').on('click', function () {
        Photobooth.toggleNav();
    });

    $('.sidenav > div').on('click', function () {
        $('.sidenav > div').removeAttr('class');
        $(this).addClass('activeSidenavBtn');

        imgFilter = $(this).attr('id');
        const result = {file: $('#result').attr('data-img')};
        if (config.dev) {
            console.log('Applying filter', imgFilter, result);
        }
        Photobooth.processPic(imgFilter, result);
    });

    // Take Picture Button
    $('.takePic, .newpic').on('click', function (e) {
        e.preventDefault();

        Photobooth.thrill('photo');
        $('.newpic').blur();
    });

    // Take Collage Button
    $('.takeCollage, .newcollage').on('click', function (e) {
        e.preventDefault();

        Photobooth.thrill('collage');
        $('.newcollage').blur();
    });

    $('#mySidenav .closebtn').on('click', function (e) {
        e.preventDefault();

        Photobooth.closeNav();
    });

    // Open Gallery Button
    $('.gallery-button').on('click', function (e) {
        e.preventDefault();

        Photobooth.closeNav();
        Photobooth.openGallery($(this));
    });

    // Close Gallery Overview
    $('.gallery__close').on('click', function (e) {
        e.preventDefault();

        gallery.find('.gallery__inner').hide();
        gallery.removeClass('gallery--open');
    });

    $('.mailbtn').on('click touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const img = resultPage.attr('data-img');

        Photobooth.toggleMailDialog(img);
    });

    $('#send-mail-form').on('submit', function (e) {
        e.preventDefault();

        const message = $('#mail-form-message');
        message.empty();

        const form = $(this);
        const oldValue = form.find('.btn').html();

        form.find('.btn').html('<i class="fa fa-spinner fa-spin"></i>');

        $.ajax({
            url: 'api/sendPic.php',
            type: 'POST',
            data: form.serialize(),
            dataType: 'json',
            cache: false,
            success: async function (result) {
                if (result.success) {
                    if (result.saved) {
                        message.fadeIn().html('<span style="color:green">' + await i18n('mailSaved') + '</span>');
                    } else {
                        message.fadeIn().html('<span style="color:green">' + await i18n('mailSent') + '</span>');
                    }
                } else {
                    message.fadeIn().html('<span style="color:red">' + result.error + '</span>');
                }
            },
            error: async function () {
                message.fadeIn('fast').html('<span style="color: red;">' + await i18n('mailError') + '</span>');
            },
            complete: function () {
                form.find('.btn').html(oldValue);
            }
        });
    });

    $('#send-mail-close').on('click', function () {
        Photobooth.resetMailForm();
        $('.send-mail').removeClass('mail-active').fadeOut('fast');
    });

    $('#result').on('click', function () {
        if (!modal.close('#qrCode')) {
            $('.resultInner').toggleClass('show');
        }
    });

    // Show QR Code
    $('.qrbtn').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        modal.toggle('#qrCode');
    });

    $('.homebtn').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        Photobooth.reloadPage();
    });

    $('#cups-button').on('click', function (ev) {
        ev.preventDefault();

        const url = `http://${location.hostname}:631/jobs/`;
        const features = 'width=1024,height=600,left=0,top=0,screenX=0,screenY=0,resizable=NO,scrollbars=NO';

        window.open(url, 'newwin', features);
    });

    // Go Fullscreen
    $('#fs-button').on('click', function (e) {
        e.preventDefault();
        if (!document.fullscreenElement) {
            document.body.requestFullscreen();
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        $('#fs-button').blur();
    });

    $(document).on('keyup', function (ev) {
        if (config.photo_key && parseInt(config.photo_key, 10) === ev.keyCode) {
            Photobooth.thrill('photo');
        }

        if (config.collage_key && parseInt(config.collage_key, 10) === ev.keyCode) {
            if (config.use_collage) {
                Photobooth.thrill('collage');
            } else {
                if (config.dev) {
                    console.log('Collage key pressed. Please enable collage in your config. Triggering photo now.');
                }
                Photobooth.thrill('photo');
            }
        }
    });

    // clear Timeout to not reset the gallery, if you clicked anywhere
    $(document).on('click', function () {
        if (!startPage.is(':visible')) {
            Photobooth.resetTimeOut();
        }
    });

    // Disable Right-Click
    if (!config.dev) {
        $(this).on('contextmenu', function (e) {
            e.preventDefault();
        });
    }

    return Photobooth;
})();

// Init on domready
$(function () {
    photoBooth.init();
});
