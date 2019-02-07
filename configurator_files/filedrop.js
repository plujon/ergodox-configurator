$(function ($) {
  var filedrop = {
    dropImage:AWS_UPLOAD_HTTP_PATH + 'img/drop_target.png',
    dropTarget:WEB_ROOT_ABS + "api/image/upload",
    dropLoaderImage:AWS_UPLOAD_HTTP_PATH + 'img/ajax-loader.gif',
    imgSize:0,
    imgDir:"",
    additionalOptionsTemplate:null,
    iframeCount:0,

    init:function () {
      if(document.getElementById("tpl-additional-options") != null) this.additionalOptionsTemplate = Handlebars.compile(document.getElementById("tpl-additional-options").innerHTML);
    },

    iframeUpload:function (iframeId, form) {
      var context = this;
      form.setAttribute("target", iframeId);
      form.setAttribute("action", context.dropTarget);
      form.setAttribute("method", "post");
      form.setAttribute("enctype", "multipart/form-data");
      form.setAttribute("encoding", "multipart/form-data");
      form.submit();
    },

    dropLink:function ($dropzone, url) {
      var context = this;
      context.dropStart($dropzone);
      $.post(context.dropTarget, {html:"", text:url, size:context.imgSize, dir:context.imgDir}, function (response) {
        context.dropFinished($dropzone, response);
      }, "json");
    },

    dropStart:function ($dropzone) {
      $('.img-cover').hide();
      $dropzone.removeClass("active");
      $dropzone.find('.img-drop').hide();
      $dropzone.find('.img-loader').show();
    },

    dropDelete:function ($dropzone) {
      var context = this;
      $dropzone.find(".img-drop").attr("src", context.dropImage);
      $dropzone.data("delete", "1");
      $dropzone.find('.img-drop').show();
      $dropzone.find('.img-loader').hide();
    },

    dropUndelete:function ($dropzone) {
      var context = this;
      if ($dropzone.data("file") != '') $dropzone.find(".img-drop").attr("src", $dropzone.data("file"));
      else $dropzone.find(".img-drop").attr("src", context.dropImage);
      $dropzone.data("delete", "0");
      $dropzone.find('.img-drop').show();
      $dropzone.find('.img-loader').hide();
    },

    dropFinished:function ($dropzone, response) {
      var context = this;
      if (response.url) {
        $dropzone.find(".img-drop").attr("src", response.url);
        $dropzone.data("delete", "0").data("file", response.url);
        if(context.imgDir == "img_comment/")
        {
        	var TheTextBox = document.getElementById("body");
        	TheTextBox.value = TheTextBox.value + " " + response.url + " ";
        }
      }
      $dropzone.find('.img-drop').show();
      $dropzone.find('.img-loader').hide();
    },

    dropzone:function ($dropzone, $optionsTrigger, initialImage) {
      var context = this;
      var width = $dropzone.width(), height = $dropzone.height();
      context.imgSize = $dropzone.data("size");
      context.imgDir = $dropzone.data("dir");

      // setup iframe for cross brower upload
      var iframeId = 'upload-iframe-' + (context.iframeCount++);
      $('body').append('<iframe src="" frameborder="0" id="' + iframeId + '" name="' + iframeId + '" width="0" height="0" style="display: none; visibility: hidden;"></iframe>');
      $('#' + iframeId).load(function (e) {
        if ($(this).contents().text() != "") context.dropFinished($dropzone, $.parseJSON($(this).contents().text()));
      });

      // setup dropzone
      $dropzone
        .append($('<div class="img-loader" style="width:' + width + 'px;height:' + height + 'px;position:absolute;"><img style="width:16px;height:16px;position:absolute;top:' + ((height - 16) / 2) + 'px;left:' + ((width - 16) / 2) + 'px;" src="' + context.dropLoaderImage + '"></div>').hide())
        .append($('<img class="img-cover" style="width:' + width + 'px;height:' + height + 'px;position:absolute;" src="' + context.dropImage + '">').hide())
        .append('<img class="img-drop" width="' + width + '" height="' + height + '" src="' + (initialImage == "" ? context.dropImage : initialImage) + '"/>')
        .data("file", initialImage)
        .data("delete", "0");
      $dropzone.find(".img-drop").on("dragstart", function (e) {
        e.preventDefault();
      });
      $dropzone.filedrop({
        fallback_id:"",
        url:context.dropTarget,
        paramname:"pic",
        withCredentials:false,
        data:{size:context.imgSize, dir:context.imgDir},
        error:function (err, file) {
          console.log(err);
          switch (err) {
            case 'BrowserNotSupported':
              break;
            case 'TooManyFiles':
              break;
            case 'FileTooLarge':
              break;
            case 'FileTypeNotAllowed':
            default:
              break;
          }
        },
        allowedfiletypes:['image/jpeg', 'image/png', 'image/gif'],
        maxfiles:1,
        maxfilesize:20,
        dragOver:function () {
          context.throttle(function () {
            $dropzone.addClass("active");
          }, "dropzone", 250);
        },
        dragLeave:function () {
          $dropzone.removeClass("active");
        },
        docEnter:function () {
          $('.img-cover').show();
        },
        docLeave:function () {
          $('.img-cover').hide();
        },
        drop:function () {
          context.dropStart($dropzone);
        },
        uploadFinished:function (i, file, response, time) {
          context.dropFinished($dropzone, response);
        },
        beforeSend:function (file, i, done) {
          done();
        },
        dragLink:function (html, text) {
          $.post(context.dropTarget, {html:html, text:text, size:context.imgSize, dir:context.imgDir}, function (response) {
            context.dropFinished($dropzone, response);
          }, "json");
        }
      });

      // setup additional options modal
      $optionsTrigger.click(function (e) {
        e.preventDefault();
        $.colorbox({
          html:context.additionalOptionsTemplate,
          close:"",
          onComplete:function () {
            var $cbox = $("#cboxContent");
            if ($dropzone.data("delete") == "1") $cbox.find('#filedrop-none').attr("checked", "checked");
            $cbox.find('.form-cancel').click(function (e) {
              e.preventDefault();
              $.colorbox.close();
            });
            $cbox.find('.btn-submit').click(function (e) {
              e.preventDefault();
              context.dropStart($dropzone);
              if ($cbox.find("#filedrop-none").attr('checked')) {
                context.dropDelete($dropzone);
              } else if ($cbox.find("#filedrop-file").val() != "") {
                context.iframeUpload(iframeId, $cbox.find("form")[0]);
              } else if ($cbox.find("#filedrop-url").val() != "") {
                context.dropLink($dropzone, $cbox.find("#filedrop-url").val());
              } else {
                context.dropUndelete($dropzone);
              }
              $.colorbox.close();
            })
          }
        });
      });
    },

    isThrottled:[],
    throttle:function (fn, throttleid, duration) {
      var context = this;
      if (typeof context.isThrottled[throttleid] == "undefined") context.isThrottled[throttleid] = false;
      if (!context.isThrottled[throttleid]) {
        fn.call(this);
        context.isThrottled[throttleid] = true;
        setTimeout(function () {
          context.isThrottled[throttleid] = false
        }, duration);
      }
    }
  };

  $.extend(window.JC.massdrop, {
    filedrop:filedrop
  });
  window.JC.massdrop.filedrop.init();
});

