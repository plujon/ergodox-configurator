jQuery(function ($) {
  (function (app, undefined) {
    // private properties
    var functionRouter, pageType = $("body").attr("class") ? $("body").attr("class").match(/\S+_page/g) : [];

    /**
     * Calls functions depending on "_page" class on body element.
     * Called by init() function
     */
    functionRouter = function ($container) {
      var router = {
        product:function () {
          var $bar = $("#PurchaseBarContainer");

		  $( '#main-threshold-bars' ).thresholds();
        },
        poll_single:function () {
          app.modalWindows.loadPollProduct();
        },
        signed_out_page:function () {
          app.signedOutModals.init();
        },
        poll_results:function () {
          app.stickySideBar($(".vote-container"));
        },
        buy:function () {
          app.stickySideBar($(".sticky-sidebar"));
        },
        poll_new:function () {
          app.stickySideBar($(".sticky-sidebar"));
        },
        countdown:function () {
          yepnope({
            load:WEB_ROOT_ABS + "js/vendor/jquery.countdown.min.js",
            callback:function () {
              app.simpleTimer();
            }
          });
        },
        poll:function () {
          $container.find(".simple-poll-results").each(function (index, item) {
            var $chartContainer = $(item),
              $chartItem = $chartContainer.find(".chart-item"),
              isAbsolute = $chartContainer.hasClass("absolute");
            app.chartMaker($chartContainer, {
              isAbsolute:isAbsolute,
              width:$chartItem.width()
            });
          });
        },
        // dynamic forms will work within a given section, where only 1 form can be visible at a time
        // each section has a container class="dynamic-form-container"
        dynamic_form:function () {
          $(".dynamic-form-container").each(function (index, form_container) {
            app.dynamicFormMaker($(form_container));
          });
        },
        signin_required:function () {
          // shows sign in modal to users visiting the page,
          // closable set to false disables closing the modal
          app.signedOutModals.logInModal({ closable:false });
        },
        category_required:function () {
          // shows category modal to users visiting the page,
          // app.signedOutModals.categorySelectModal({width:555}); // width must be explicitly set on category
        },
		talk: function(){
			var $e = $container.find('.talk-scroll');

			$e.talkScroller({
			   category: $e.data('category'),
			   showUnread: $e.data('show-unread')
			});
		}
      };
      return router;
    };

    /**
     * Runs on every page and directs which functions should run via the
     * "_page" class on the body element
     * Also calls any common functions that should run on each page
     * Also runs on any content dynamically loaded via the "loadAjaxContent" function
     *  with a jQuery $container object as the scope to re-run any required functions
     */
    app.init = function ($container) {
      var $container = $container || $("body");
      if (pageType !== null) {
        for (var len = pageType.length, i = 0; i < len; i++) {
          var currentPage = pageType[i].replace("_page", ""),
            routes = functionRouter($container);
          if (routes[currentPage]) {
            routes[currentPage]();
          }
        }
      }
      // Functions to run on all pages
      $container.find(".product-card").each(function (index, item) {
		$(this).find('.threshold-bars').thresholds();
		
		// now we need to position the up arrow
		// on the item-status box
		var width = $(this).find('.purchase-bar').width();
		$(this).find('.active-marker-arrow').css( 'margin-left', Math.max(0,width - 10));
	     
      });
      app.toggleContainer($container);
      app.manageFavourites($container);
      app.loadAjaxContent($container);
      app.initializeToolTips();
      formHelpers.initializeValidatorRules(); // creates custom validators for jquery validation
      formHelpers.initializeFormValidation(); // initializes validation using selector form.validation (default)
      // mobile hide address bar
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
      // colorbox stuff
      app.modalWindows.bindCloseModal();
      $.colorbox.settings.opacity = 0.75;
      $.colorbox.settings.scrolling = true;
      // desktop settings
      if ($.isMobile()) {
        $.colorbox.settings.fixed = false;
        $.colorbox.settings.reposition = false;
        $.colorbox.settings.transition = "none";
        $.colorbox.settings.mobile = true;
      } else {
        $.colorbox.settings.fixed = true;
        $.colorbox.settings.reposition = true;
        $.colorbox.settings.transition = "elastic";
        $.colorbox.settings.mobile = false;
      }
      // flagging content
      $(document).on("click", ".trigger-flag", function (e) {
        e.preventDefault();
        app.modalWindows.flagModal($(this));
      });
      // null links
      $(document).on("click", ".trigger-nothing", function (e) {
        e.preventDefault();
      });



    };



    /**
     * Collection of helper methods for forms
     *
     */
    formHelpers = {
      initializeValidatorRules:function () {
        $.validator.addMethod("postalcode", function (input, element) {
          return !input || input.match(/^[ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/);
        }, "Must be a valid postal code");
        $.validator.addMethod("twitter", function (input, element) {
          return !input || input.match(/^@[A-Za-z0-9_]+$/);
        }, "Must be a valid Twitter handle");
      },

      initializeFormValidation:function ($target) {
        $target = $target || $('form.validate');

        // Helps with fields that are not required but do have associated validators.
        // We don't need confirmation that an empty field is A-OK.
        $target.find('.ignore-empty, .ignore, input[type=text], input[type=password], input[type=email]').blur(function () {
          if ($(this).val() == "") {
            $(this).parent().removeClass("validated");
          }
        });

        // polyfill for placeholder attribute
        $('input, textarea').placeholder();

        // initialize validation plugin
        $target.validate({
          validClass:'validated',
          errorElement:'span',
          onfocusout:function (element) {
            $(element).valid();
          },
          errorPlacement:function (error, element) {
            error.insertAfter(element).addClass('form-messages');
          },
          highlight:function (element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element).closest('.form-field').addClass(errorClass).removeClass(validClass);
          },
          unhighlight:function (element, errorClass, validClass) {
            $(element).removeClass(errorClass);
            $(element).closest('.form-field').removeClass(errorClass);
            if (!$(element).hasClass('ignore-empty') || $(element).val()) {
              $(element).addClass(validClass)
              $(element).closest('.form-field').addClass(validClass);
            }
          }
        });  // end validate
      
	     } // end initializeFormValidation

    };  // end form helpers


  }(window.JC.massdrop = window.JC.massdrop || {}));


  JC.massdrop.init();
});

