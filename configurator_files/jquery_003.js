(function ($) {
  $.organicTabs = function (menuContainer, tabContainer) {
    var base = this;
    base.$nav = $(menuContainer).first();
    base.$el = $(tabContainer).first();
    base.isAnimating = false;
    base.animateSpeed = 100;

    base.init = function () {
      $(".hide").css({
        "position":"relative",
        "top":0,
        "left":0,
        "display":"none"
      });

      base.$nav.delegate("li > a", "click", function (e) {
        e.preventDefault();
        var curTabPage = base.$nav.find("a.current-item").attr("href"),
          $newTab = $(this),
          newTabPage = $newTab.attr("href");
        // check if there is anything to do
        if (base.isAnimating || newTabPage == curTabPage || newTabPage == "#" || base.$el.find(newTabPage).length == 0) return;
        // block multiple tab clicks
        base.isAnimating = true;
        // get heights (overflow set to hidden to return non-zero height)
        var newHeight = base.$el.find(newTabPage).css({'overflow':'hidden'}).height();
        var curHeight = base.$el.find(curTabPage).css({'overflow':'hidden'}).height();
        base.$el.find(newTabPage).css({'overflow':'visible'});
        base.$el.find(curTabPage).css({'overflow':'visible'});
        // adjust container height
        base.$el.height(curHeight);
        // fade out existing tab
        base.$el.find(curTabPage).fadeOut(base.animateSpeed, function () {
          // fade in new tab
          base.$el
            .animate({height:newHeight}, {duration:base.animateSpeed, queue:false})
            .css({'overflow':'visible'})
            .find(newTabPage)
            .fadeIn(
            {
              duration:base.animateSpeed,
              queue:false,
              complete:function () {
                base.isAnimating = false;
                base.$el.css("height", "auto");
              }
            });
          // highlight correct tab
          base.$nav.find("li a").removeClass("current-item");
          $newTab.addClass("current-item");
        });
      });
    };
    base.init();
  };
})(jQuery);
