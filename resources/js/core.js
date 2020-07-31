"use strict";

/* globals initPhotoSwipeFromDOM i18n */
var photoBooth = function () {
  // vars
  var api = {},
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
      facingMode: config.camera_mode
    }
  },
      videoView = $('#video--view').get(0),
      videoPreview = $('#video--preview').get(0),
      videoSensor = document.querySelector('#video--sensor');
  var timeOut,
      takingPic = false,
      nextCollageNumber = 0,
      currentCollageFile = '',
      imgFilter = config.default_imagefilter;
  var modal = {
    open: function open(selector) {
      $(selector).addClass('modal--show');
    },
    close: function close(selector) {
      if ($(selector).hasClass('modal--show')) {
        $(selector).removeClass('modal--show');
        return true;
      }

      return false;
    },
    toggle: function toggle(selector) {
      $(selector).toggleClass('modal--show');
    },
    empty: function empty(selector) {
      modal.close(selector);
      $(selector).find('.modal__body').empty();
    }
  };

  api.reloadPage = function () {
    window.location.reload();
  }; // timeOut function


  api.resetTimeOut = function () {
    clearTimeout(timeOut);
    timeOut = setTimeout(function () {
      api.reloadPage();
    }, timeToLive);
  }; // reset whole thing


  api.reset = function () {
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
    api.resetMailForm();
    $('#loader').css('background', config.colors.background_countdown);
    $('#loader').css('background-color', config.colors.background_countdown);
  }; // init


  api.init = function () {
    api.reset();
    initPhotoSwipeFromDOM('#galimages');
    resultPage.hide();
    startPage.addClass('open');

    if (config.previewCamBackground) {
      api.startVideo('preview');
    }
  };

  api.openNav = function () {
    $('#mySidenav').addClass('sidenav--open');
  };

  api.closeNav = function () {
    $('#mySidenav').removeClass('sidenav--open');
  };

  api.toggleNav = function () {
    $('#mySidenav').toggleClass('sidenav--open');
  };

  api.startVideo = function (mode) {
    if (config.previewCamBackground) {
      api.stopVideo('preview');
    }

    if (!navigator.mediaDevices) {
      return;
    }

    var getMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || false;

    if (!getMedia) {
      return;
    }

    if (config.previewCamFlipHorizontal) {
      $('#video--view').addClass('flip-horizontal');
      $('#video--preview').addClass('flip-horizontal');
    }

    getMedia.call(navigator.mediaDevices, webcamConstraints).then(function (stream) {
      if (mode === 'preview') {
        $('#video--preview').show();
        videoPreview.srcObject = stream;
        api.stream = stream;
        wrapper.css('background-image', 'none');
        wrapper.css('background-color', 'transparent');
      } else {
        $('#video--view').show();
        videoView.srcObject = stream;
      }

      api.stream = stream;
    })["catch"](function (error) {
      console.log('Could not get user media: ', error);
    });
  };

  api.stopVideo = function (mode) {
    if (api.stream) {
      var track = api.stream.getTracks()[0];
      track.stop();

      if (mode === 'preview') {
        $('#video--preview').hide();
      } else {
        $('#video--view').hide();
      }
    }
  };

  api.thrill = function (photoStyle) {
    api.closeNav();
    api.reset();
    takingPic = true;

    if (config.dev) {
      console.log('Taking photo:', takingPic);
    }

    if (config.previewCamBackground) {
      wrapper.css('background-color', config.colors.panel);
    }

    if (currentCollageFile && nextCollageNumber) {
      photoStyle = 'collage';
    }

    if (config.previewFromCam) {
      api.startVideo('view');
    }

    if (config.previewFromIPCam) {
      $('#ipcam--view').show();
      $('#ipcam--view').addClass('streaming');
    }

    loader.addClass('open');
    api.startCountdown(nextCollageNumber ? config.collage_cntdwn_time : config.cntdwn_time, $('#counter'), function () {
      api.cheese(photoStyle);
    });
  }; // Cheese


  api.cheese = function (photoStyle) {
    if (config.dev) {
      console.log(photoStyle);
    }

    $('#counter').empty();
    $('.cheese').empty();

    if (photoStyle === 'photo') {
      var cheesemsg = i18n('cheese');
      $('.cheese').text(cheesemsg);
    } else {
      var _cheesemsg = i18n('cheeseCollage');

      $('.cheese').text(_cheesemsg);
      $('<p>').text("".concat(nextCollageNumber + 1, " / ").concat(config.collage_limit)).appendTo('.cheese');
    }

    if (config.previewFromCam && config.previewCamTakesPic && !api.stream && !config.dev) {
      console.log('No preview by device cam available!');

      if (config.previewFromIPCam) {
        $('#ipcam--view').removeClass('streaming');
        $('#ipcam--view').hide();
      }

      api.errorPic({
        error: 'No preview by device cam available!'
      });
    } else {
      setTimeout(function () {
        api.takePic(photoStyle);
      }, config.cheese_time);
    }
  }; // take Picture


  api.takePic = function (photoStyle) {
    if (config.dev) {
      console.log('Take Picture:' + photoStyle);
    }

    if (config.previewFromCam) {
      if (config.previewCamTakesPic && !config.dev) {
        videoSensor.width = videoView.videoWidth;
        videoSensor.height = videoView.videoHeight;
        videoSensor.getContext('2d').drawImage(videoView, 0, 0);
      }

      api.stopVideo('view');
    }

    if (config.previewFromIPCam) {
      $('#ipcam--view').removeClass('streaming');
      $('#ipcam--view').hide();
    }

    var data = {
      filter: imgFilter,
      style: photoStyle,
      canvasimg: videoSensor.toDataURL('image/jpeg')
    };

    if (photoStyle === 'collage') {
      data.file = currentCollageFile;
      data.collageNumber = nextCollageNumber;
    }

    loader.css('background', config.colors.panel);
    loader.css('background-color', config.colors.panel);
    jQuery.post('api/takePic.php', data).done(function (result) {
      console.log('took picture', result);
      $('.cheese').empty();

      if (config.previewCamFlipHorizontal) {
        $('#video--view').removeClass('flip-horizontal');
        $('#video--preview').removeClass('flip-horizontal');
      } // reset filter (selection) after picture was taken


      imgFilter = config.default_imagefilter;
      $('#mySidenav .activeSidenavBtn').removeClass('activeSidenavBtn');
      $('#' + imgFilter).addClass('activeSidenavBtn');

      if (result.error) {
        api.errorPic(result);
      } else if (result.success === 'collage' && result.current + 1 < result.limit) {
        currentCollageFile = result.file;
        nextCollageNumber = result.current + 1;
        $('.spinner').hide();
        $('.loading').empty();
        $('#video--sensor').hide();

        if (config.continuous_collage) {
          setTimeout(function () {
            api.thrill('collage');
          }, 1000);
        } else {
          $('<a class="btn" href="#">' + i18n('nextPhoto') + '</a>').appendTo('.loading').click(function (ev) {
            ev.preventDefault();
            api.thrill('collage');
          });
          var abortmsg = i18n('abort');
          $('.loading').append($('<a class="btn" style="margin-left:2px" href="./">').text(abortmsg));
        }
      } else {
        currentCollageFile = '';
        nextCollageNumber = 0;
        api.processPic(photoStyle, result);
      }
    }).fail(function (xhr, status, result) {
      api.errorPic(result);
    });
  }; // Show error Msg and reset


  api.errorPic = function (data) {
    setTimeout(function () {
      $('.spinner').hide();
      $('.loading').empty();
      $('.cheese').empty();
      $('#video--view').hide();
      $('#video--sensor').hide();
      loader.addClass('error');
      var errormsg = i18n('error');
      takingPic = false;

      if (config.dev) {
        console.log('Taking photo:', takingPic);
      }

      $('.loading').append($('<p>').text(errormsg));

      if (config.show_error_messages || config.dev) {
        $('.loading').append($('<p class="text-muted">').text(data.error));
      }

      if (config.auto_reload_on_error) {
        var reloadmsg = i18n('auto_reload');
        $('.loading').append($('<p>').text(reloadmsg));
        setTimeout(function () {
          api.reloadPage();
        }, 5000);
      } else {
        var _reloadmsg = i18n('reload');

        $('.loading').append($('<a class="btn" href="./">').text(_reloadmsg));
      }
    }, 500);
  };

  api.processPic = function (photoStyle, result) {
    var tempImageUrl = config.folders.tmp + '/' + result.file;
    $('.spinner').show();
    $('.loading').text(photoStyle === 'photo' ? i18n('busy') : i18n('busyCollage'));
    takingPic = false;

    if (config.dev) {
      console.log('Taking photo:', takingPic);
    }

    if (photoStyle === 'photo' && config.image_preview_before_processing) {
      var preloadImage = new Image();

      preloadImage.onload = function () {
        $('#loader').css('background-image', "url(".concat(tempImageUrl, ")"));
        $('#loader').addClass('showBackgroundImage');
      };

      preloadImage.src = tempImageUrl;
    }

    $.ajax({
      method: 'POST',
      url: 'api/applyEffects.php',
      data: {
        file: result.file,
        filter: imgFilter,
        isCollage: photoStyle === 'collage'
      },
      success: function success(data) {
        console.log('picture processed', data);

        if (data.error) {
          api.errorPic(data);
        } else {
          api.renderPic(data.file);
        }
      },
      error: function error(jqXHR, textStatus) {
        console.log('An error occurred', textStatus);
        api.errorPic({
          error: 'Request failed: ' + textStatus
        });
      }
    });
  }; // Render Picture after taking


  api.renderPic = function (filename) {
    // Add QR Code Image
    var qrCodeModal = $('#qrCode');
    modal.empty(qrCodeModal);
    $('<img src="api/qrcode.php?filename=' + filename + '"/>').on('load', function () {
      var body = qrCodeModal.find('.modal__body');
      $(this).appendTo(body);
      $('<p>').css('max-width', this.width + 'px').html(i18n('qrHelp') + '</br><b>' + config.wifi_ssid + '</b>').appendTo(body);
    }); // Add Print Link

    $(document).off('click touchstart', '.printbtn');
    $(document).on('click', '.printbtn', function (e) {
      e.preventDefault();
      e.stopPropagation();
      api.printImage(filename, function () {
        $('.printbtn').blur();
      });
    });
    resultPage.find('.deletebtn').off('click').on('click', function (ev) {
      ev.preventDefault();
      api.deleteImage(filename, function (data) {
        if (data.success) {
          api.reloadPage();
        } else {
          console.log('Error while deleting image');
        }
      });
    }); // Add Image to gallery and slider

    api.addImage(filename);
    var imageUrl = config.folders.images + '/' + filename;
    var preloadImage = new Image();

    preloadImage.onload = function () {
      resultPage.css({
        'background-image': "url(".concat(imageUrl, "?filter=").concat(imgFilter, ")")
      });
      resultPage.attr('data-img', filename);
      startPage.hide();
      resultPage.show();
      $('.resultInner').addClass('show');
      loader.removeClass('open');
      $('#loader').css('background-image', 'url()');
      $('#loader').removeClass('showBackgroundImage');
      api.resetTimeOut();
    };

    preloadImage.src = imageUrl;
  }; // add image to Gallery


  api.addImage = function (imageName) {
    var thumbImg = new Image();
    var bigImg = new Image();
    var thumbSize = '';
    var bigSize = '';
    var imgtoLoad = 2;

    thumbImg.onload = function () {
      thumbSize = this.width + 'x' + this.height;

      if (--imgtoLoad == 0) {
        allLoaded();
      }
    };

    bigImg.onload = function () {
      bigSize = this.width + 'x' + this.height;

      if (--imgtoLoad == 0) {
        allLoaded();
      }
    };

    bigImg.src = config.folders.images + '/' + imageName;
    thumbImg.src = config.folders.thumbs + '/' + imageName;

    function allLoaded() {
      var linkElement = $('<a>').html(thumbImg);
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
  }; // Open Gallery Overview


  api.openGallery = function () {
    if (config.scrollbar) {
      gallery.addClass('scrollbar');
    }

    gallery.addClass('gallery--open');
    setTimeout(function () {
      return gallery.find('.gallery__inner').show();
    }, 300);
  };

  api.resetMailForm = function () {
    $('#send-mail-form').trigger('reset');
    $('#mail-form-message').html('');
  }; // Countdown Function


  api.startCountdown = function (start, element, cb) {
    var count = 0;
    var current = start;

    function timerFunction() {
      element.text(current);
      current--;
      element.removeClass('tick');

      if (count < start) {
        window.setTimeout(function () {
          return element.addClass('tick');
        }, 50);
        window.setTimeout(timerFunction, 1000);
      } else {
        cb();
      }

      count++;
    }

    timerFunction();
  };

  api.printImage = function (imageSrc, cb) {
    modal.open('#print_mesg');
    setTimeout(function () {
      $.ajax({
        url: 'api/print.php?filename=' + encodeURI(imageSrc)
      }).done(function (data) {
        if (config.dev) {
          console.log(data);
        }

        setTimeout(function () {
          modal.close('#print_mesg');
          cb();
        }, 5000);
      });
    }, 1000);
  };

  api.deleteImage = function (imageName, cb) {
    $.ajax({
      url: 'api/deletePhoto.php',
      method: 'POST',
      data: {
        file: imageName
      },
      success: function success(data) {
        cb(data);
      }
    });
  };

  api.toggleMailDialog = function (img) {
    var mail = $('.send-mail');

    if (mail.hasClass('mail-active')) {
      api.resetMailForm();
      mail.removeClass('mail-active').fadeOut('fast');
    } else {
      $('#mail-form-image').val(img);
      mail.addClass('mail-active').fadeIn('fast');
    }
  }; //Filter


  $('.imageFilter').on('click', function () {
    api.toggleNav();
  });
  $('.sidenav > div').on('click', function () {
    $('.sidenav > div').removeAttr('class');
    $(this).addClass('activeSidenavBtn');
    imgFilter = $(this).attr('id');
    var result = {
      file: $('#result').attr('data-img')
    };

    if (config.dev) {
      console.log('Applying filter', imgFilter, result);
    }

    api.processPic(imgFilter, result);
  }); // Take Picture Button

  $('.takePic, .newpic').on('click', function (e) {
    e.preventDefault();
    api.thrill('photo');
    $('.newpic').blur();
  }); // Take Collage Button

  $('.takeCollage, .newcollage').on('click', function (e) {
    e.preventDefault();
    api.thrill('collage');
    $('.newcollage').blur();
  });
  $('#mySidenav .closebtn').on('click', function (e) {
    e.preventDefault();
    api.closeNav();
  }); // Open Gallery Button

  $('.gallery-button').on('click', function (e) {
    e.preventDefault();
    api.closeNav();
    api.openGallery($(this));
  }); // Close Gallery Overview

  $('.gallery__close').on('click', function (e) {
    e.preventDefault();
    gallery.find('.gallery__inner').hide();
    gallery.removeClass('gallery--open');
  });
  $('.mailbtn').on('click touchstart', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var img = resultPage.attr('data-img');
    api.toggleMailDialog(img);
  });
  $('#send-mail-form').on('submit', function (e) {
    e.preventDefault();
    var message = $('#mail-form-message');
    message.empty();
    var form = $(this);
    var oldValue = form.find('.btn').html();
    form.find('.btn').html('<i class="fa fa-spinner fa-spin"></i>');
    $.ajax({
      url: 'api/sendPic.php',
      type: 'POST',
      data: form.serialize(),
      dataType: 'json',
      cache: false,
      success: function success(result) {
        if (result.success) {
          if (result.saved) {
            message.fadeIn().html('<span style="color:green">' + i18n('mailSaved') + '</span>');
          } else {
            message.fadeIn().html('<span style="color:green">' + i18n('mailSent') + '</span>');
          }
        } else {
          message.fadeIn().html('<span style="color:red">' + result.error + '</span>');
        }
      },
      error: function error() {
        message.fadeIn('fast').html('<span style="color: red;">' + i18n('mailError') + '</span>');
      },
      complete: function complete() {
        form.find('.btn').html(oldValue);
      }
    });
  });
  $('#send-mail-close').on('click', function () {
    api.resetMailForm();
    $('.send-mail').removeClass('mail-active').fadeOut('fast');
  });
  $('#result').on('click', function () {
    if (!modal.close('#qrCode')) {
      $('.resultInner').toggleClass('show');
    }
  }); // Show QR Code

  $('.qrbtn').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    modal.toggle('#qrCode');
  });
  $('.homebtn').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    api.reloadPage();
  });
  $('#cups-button').on('click', function (ev) {
    ev.preventDefault();
    var url = "http://".concat(location.hostname, ":631/jobs/");
    var features = 'width=1024,height=600,left=0,top=0,screenX=0,screenY=0,resizable=NO,scrollbars=NO';
    window.open(url, 'newwin', features);
  }); // Go Fullscreen

  $('#fs-button').on('click', function (e) {
    e.preventDefault();

    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    $('#fs-button').blur();
  }); // Fake buttons

  $('.triggerPic').on('click', function (e) {
    e.preventDefault();
    api.thrill('photo');
  });
  $('.triggerCollage').on('click', function (e) {
    e.preventDefault();
    api.thrill('collage');
  });
  $(document).on('keyup', function (ev) {
    if (config.photo_key && parseInt(config.photo_key, 10) === ev.keyCode) {
      if (!takingPic) {
        $('.closeGallery').trigger('click');
        $('.triggerPic').trigger('click');
      } else if (config.dev && takingPic) {
        console.log('Taking photo already in progress!');
      }
    }

    if (config.collage_key && parseInt(config.collage_key, 10) === ev.keyCode) {
      if (!takingPic) {
        $('.closeGallery').trigger('click');

        if (config.use_collage) {
          $('.triggerCollage').trigger('click');
        } else {
          if (config.dev) {
            console.log('Collage key pressed. Please enable collage in your config. Triggering photo now.');
          }

          $('.triggerPic').trigger('click');
        }
      } else if (config.dev && takingPic) {
        console.log('Taking photo already in progress!');
      }
    }
  }); // clear Timeout to not reset the gallery, if you clicked anywhere

  $(document).on('click', function () {
    if (!startPage.is(':visible')) {
      api.resetTimeOut();
    }
  }); // Disable Right-Click

  if (!config.dev) {
    $(this).on('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  return api;
}(); // Init on domready


$(function () {
  photoBooth.init();
});