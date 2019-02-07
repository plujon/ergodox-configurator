/**
 * Function that creates threshold bars on BOTH product single and product detail page
 *  Requires:
 ** Minimum Requirements **
 - element with class="purchase-progress"
 - data attr "data-drop-info" JSON formated-object with the following info:
 "purchases" - # of current purchases
 "thresholds" - array of thresholds, starting with 0 if no minimum purchase
 required, or X for first threshold level (ie. 10)
 "prices" - array of prices, corresponding in order to the thresholds
 "actual" - MSRP of product
 "commits" - number of commits

 ** For elements to be updated on page/card if purchase made **
 - .current-price - price at current threshold
 - .purchased-value - # of current purchases
 - .current-savings - % off, calculated here from current threshold price / MSRP

 ** Card-specific elements **
 - .needed-value - # of purchases needed for NEXT threshold
 - .deal-action-descriptor - copy that updates to "activate" deal or move to next threshold

 ** Page-specific elements **
 - .total-needed-value - # of people needed for LOWEST threshold to be reached
 - .lowest-drop-value - price value at LOWEST threshold
 - .purchase-bar-dependent - class given to any element on the page that contains
 children that must be updated when bar is updated (currently applied to larger containers,
 $.find is used inside to find indiviual items thereafter)
 - .pill - child displaying "Deal is active" that appears at all times in the
 HTML, is shown and hidden via CSS

 It is assumed that the initial values for the above items will be provided by
 the back-end and will already be on the page when it's first requested.
 Their values will be updated only if the # of purchases is updated after the bar has been
 initialized

 ** Initialization **
 new JC.ThresholdBars($selector, {options});
 - $selector is empty element with class="purchase-progress"
 - returns ThresholdBars object, with all methods attached

 Product Card
 - happens automatically in the site.js init() function, regardless of page
 - loops through all ".product-card" elements and looks for ".purchase-progress"
 - if found, initializes ThresholdBars and saves object to parent ".product-card"
 - initializes without {options}
 - each card should have a unique ID that can be identified for later if bar must be updated

 Single Page
 - happens automatically on body class="product_page" pages
 - Finds id="PurchaseBarContainer" and looks for ".purchase-progress"
 - if found, initializes ThresholdBars and saves object to parent "PurchaseBarContainer"
 - initializes with the following {options}
 displaySavings : true // shows the % savings below each threshold on the bar
 markerWidth : 32 // default is 16, the width of the marker circles
 showFlag : true // default false, to show the # of purchases as a flag above the bar
 context : "page" // default "card", "page" activates extra parameters when updating purchase #
 displayDropPrices: true

 ** Updating **
 To update the bar, when a new purchase has been made, the following callback should be run:
 - On Card:
 $("#<ID of Product Card>").data().mdBar.updateBars(<# TOTAL NEW PURCHASES>);
 - On Page:
 $("#PurchaseBarContainer").data().mdBar.updateBars(<# TOTAL NEW PURCHASES>);
 */
(function () {
  var ThresholdBars;

  ThresholdBars = (function () {
    var templates, helpers;


    templates = {
      tplPBar:Handlebars.compile("<div class='active-wrapper'><div class='active-buys-bar' style='width:{{pLength}}px;'></div><div class='marker-wrapper'><div class='active-buys-marker' style='left: {{pLength}}px'></div></div></div>"),
      tplCBar:Handlebars.compile("<div class='active-wrapper'><div class='active-buys-bar-commits' style='width:{{cLength}}px;'></div><div class='marker-wrapper'></div></div>"),
      tplFlag:Handlebars.compile($('#tpl-progress-flag').html()),
      tplArrow:Handlebars.compile($('#tpl-progress-arrow-container').html()),
      tplThreshold:Handlebars.compile($('#tpl-progress-threshold').html()),
      tplPrettyPrice:Handlebars.compile("<sup>$</sup>{{price}}<sup>{{cents}}</sup>")

    };

    helpers = {
      getPercentage:function (val, actualPrice) {
        return Math.floor(100 - (val / actualPrice) * 100);
      }
    };
    function ThresholdBars($selector, options) {
      var defaults = {
        markerWidth:16,
        displaySavings:false,
        showFlag:false,
        context:"card",
        displayDropPrices: true,
      };

      this.options = $.extend(defaults, options);

      this.$selectors = {
        // plain bar that thresholds are mapped onto, exists in dom
        $bar:$selector,
        // wrapper element for whole component
        $container:$selector.wrap("<div class='purchase-bar-active' />").parent(),
        // area dependent on purchase bar status for content updates
        $updateArea:this.options.context === "card" ? $selector.parents(".product-card") : $(".purchase-bar-dependent"),
        // element added containing threshold dom elements,
        $activeBar:null
      };

      this.barState = null;
      this.purchaseData = null;
      this.init();
    }

    ThresholdBars.prototype.init = function () {
      var $data = this.$selectors.$bar.data("drop-info"),
        barWidth = this.$selectors.$bar.width();
      if (barWidth == 0) barWidth = 225; // this defaults a particular width if the card is hidden

      // save existing data from HTML
      this.purchaseData = {
        actualPrice:$data.actual,
        thresholds:$data.thresholds,
        thresholdNum:$data.thresholds.length,
        prices:$data.prices,
        purchases:$data.purchases,
        commits: $data.commits,
        maxThreshold:$data.thresholds.slice(-1)[0]
      };

      // object will hold specifics about the sale status, is it active, threshold reached, etc
      this.barState = {
        minPurchaseRequired:this.barHelpers.minPurchaseRequired(this.purchaseData.thresholds, this.purchaseData.prices, this.purchaseData.thresholdNum, this.$selectors.$container)
      };

      if (this.barState.minPurchaseRequired) {
        this.purchaseData.thresholdNum++;
      }

      // object holds data about the bar widths
      this.barDimensions = {
        defaultWidth:barWidth,
        // bar will always have a marker at the end, so subtract this from bar length
        // if it has a marker at the start, subtract it as well
        adjustedWidth:this.barState.minPurchaseRequired ? barWidth - this.options.markerWidth / 2 : barWidth - this.options.markerWidth
      };

      // how much space does each threshold have on the bar
      this.barDimensions.thresholdWidth = this.barDimensions.adjustedWidth / (this.purchaseData.thresholdNum - 1);


      this.barDimensions.segmentWidth = 735.0  / this.purchaseData.maxThreshold;


      // calculate the relative positions of each threshold on the $bar, and append the elements
      // save the threshold that corresponds to current sales to thresholdState
      this.thresholdState = this.setThresholdPositions();

      // set the width of the current sales bar, append it to $container
      this.setPurchaseBarWidth();
    };

    ThresholdBars.prototype.barHelpers = {
      // if minimum order required, add a spot for the pre-threshold sales
      // this means the bar starts immediately, no room needs to be deducted for the opening threshold marker
      minPurchaseRequired:function (thresholds, prices, length, $container) {
        if (thresholds[0] !== 0) {
          thresholds.unshift(0);
          prices.unshift(prices[0]); // set the "pre-price" as just the first threshold price
          $container.addClass("minimum-purchase-required");
          return true;
        }
      },

      // saves relevent information about the current, active threshold
      getThresholdData:function (thresholds, prices, i, savings) {
        var thresholdState = {
          currentThreshold:thresholds[i],
          nextThreshold:thresholds[i + 1] || null,
          position:i,
          price:prices[i],
          savings:savings
        };
        return thresholdState;
      }
    };

    // tests if the sale is active
    ThresholdBars.prototype.barIsActive = function () {
      var compareTo = this.barState.minPurchaseRequired ? this.purchaseData.thresholds[1] : this.purchaseData.thresholds[0];
      if (this.purchaseData.purchases >= compareTo) {
        this.barState.barIsActive = true;
        if (this.purchaseData.purchases >= this.purchaseData.maxThreshold) {
          this.barState.barAtMax = true;
        }
        return true;
      }
      this.barState.barIsActive = false;
    };

    // tests if the purchase # equals one of the thresholds, or is at/above the max threshold
    ThresholdBars.prototype.barAtThreshold = function () {
      var thresholdState = this.thresholdState;
      if (this.purchaseData.purchases == thresholdState.currentThreshold || thresholdState.nextThreshold === null) {
        return true;
      }
      this.barState.barAtThreshold = false;
    };

    // creates and positions threshold markers on bar
    ThresholdBars.prototype.setThresholdPositions = function () {
      var purchaseData = this.purchaseData;
      var thresholds = purchaseData.thresholds;
      var thresholdsLen = purchaseData.thresholdNum;
      var thresholdWidth = this.barDimensions.thresholdWidth;
      var prices = purchaseData.prices;
      var purchases = purchaseData.purchases;
      var commits = purchaseData.commits;
      var displaySavings = this.options.displaySavings;
      var displayDropPrices= this.options.displayDropPrices;
      var tplThresholds = [];
      var thresholdState; // price object for current # of active buys, returned
      var i;

      for (i = 0; i < thresholdsLen; i++) {
        var savings = helpers.getPercentage(prices[i], purchaseData.actualPrice);
        var reached = purchases + commits >= thresholds[i]; // if the threshold has been reached with commits and purchases
        var purchases_reached = purchases >= thresholds[i]; // if the threshold has been reached with purchases only

        // sets what the current threshold is, saves relevent information
        if (purchases  >= thresholds[i]) {
          thresholdState = this.barHelpers.getThresholdData(thresholds, prices, i, savings);
          reached = true;
        }

        var ppl;


        // // if this is the last threshold, we can count commits in the number of people needed
        // if( i == thresholds.length - 1){
        //     ppl = thresholds[i] - purchases - commits;
        // }
        // // otherwise, we need straight purchases to reach the threshold
        // else{
        //   ppl = Math.max( 0, thresholds[i] - (purchases) );
        // }


        ppl = thresholds[i];

        // price formatting
        var price_tmp = prices[i] > 0 ? ((prices[i] % 1 == 0) ? prices[i].toString() : prices[i].toFixed(2).toString()) : "";
        if (price_tmp.length >= 6) price_tmp = "<strong style='font-size: 20px; line-height: 33px;'><sup>$</sup>" + price_tmp + "</strong>";
        else if (price_tmp.length > 0) price_tmp = "<strong><sup>$</sup>" + price_tmp + "</strong>";

        price_unformatted = prices[i].toFixed( 2 );
        price_unformatted = price_unformatted.replace( /\.00/, '' );


        tplThresholds.push(templates.tplThreshold({
          index:i,
          ppl:  ppl,
          price:price_tmp,
          position:i * thresholdWidth,
          reached:reached,
          purchases_reached: purchases_reached,
          savings:savings ,
          price_unformatted:  displayDropPrices ? '$' + price_unformatted : ''
        }));

        this.thresholdState = thresholdState;
      }

      this.$selectors.$thresholdContainer = $("<div class='threshold-container' />");

      // if there's no minimum buy, we have to account for the width of the first circle when calculating position
      if (!this.barState.minPurchaseRequired) {
        this.$selectors.$thresholdContainer.css("left", this.options.markerWidth / 2);
      }
      this.$selectors.$thresholdContainer.append($(tplThresholds.join(""))).appendTo(this.$selectors.$container);

      return thresholdState;
    };

    // within the active threshold, what width is available to show purchases
    ThresholdBars.prototype.getAvailableWidth = function () {
      var currentThreshold = this.thresholdState.currentThreshold,
        minPurchaseRequired = this.barState.minPurchaseRequired,
        thresholds = this.purchaseData.thresholds,
        thresholdWidth = this.barDimensions.thresholdWidth,
        markerWidth = this.options.markerWidth,
        buffer = markerWidth,
        availableWidth = thresholdWidth - markerWidth;

      if (minPurchaseRequired) {
        if (currentThreshold === thresholds[0]) {
          return {
            buffer:0,
            availableWidth:thresholdWidth - markerWidth / 2
          };
        }
        else {
          return {
            buffer:markerWidth / 2,
            availableWidth:availableWidth
          };
        }
      }
      return {
        availableWidth:availableWidth,
        buffer:buffer
      };
    };

    // calculates the width of the # of purchases in the current threshold, taking threshold markers into account
    // to get the actual width of the bar, you need to add the sum of the widths of the already fulfilled thresholds
    ThresholdBars.prototype.getPurchaseWidth = function (delta) {
      // each single purchase will be this wide on the bar, at this threshold
      var availableWidth = this.getAvailableWidth();
      var singlePurchaseWidth = availableWidth.availableWidth / delta;

      barLength = ((this.purchaseData.purchases - this.thresholdState.currentThreshold) * singlePurchaseWidth) + availableWidth.buffer;
      return barLength;
    };

    // does the same for commits bar, needs to take into account the purchase bar width as well, because
    // the commits bar is partway under the purchase bar
    ThresholdBars.prototype.getCommitsWidth = function(delta){
      var availableWidth = this.getAvailableWidth();
      var singleCommitWidth = availableWidth.availableWidth / delta;


      console.log( this );

      barLength = ((this.purchaseData.commits + this.purchaseData.purchases - this.thresholdState.currentThreshold) * singleCommitWidth) ;
      return Math.min( barLength, this.barDimensions.thresholdWidth );
    }

    // calculates total width of purchase bar, adds flags and updates classes depending on sale status
    ThresholdBars.prototype.setPurchaseBarWidth = function () {
      var purchaseBarLength;
      var commitsBarLength = 0;
      var thresholdState = this.thresholdState;
      var purchases = this.purchaseData.purchases;
      var commits = this.purchaseData.commits;
      var showFlag = this.options.showFlag;
      var thresholdDelta; // difference between current and next threshold




      // if there are any purchases
      if (purchases || commits ) {
        if (thresholdState.nextThreshold) {
          thresholdDelta = thresholdState.nextThreshold - thresholdState.currentThreshold;


          var offset = this.getPurchaseWidth(thresholdDelta);
          var segmentWidth = this.barDimensions.barWidth / (this.purchaseData.thresholds.slice(-1)[0]);

          purchaseBarLength = this.getPurchaseWidth(thresholdDelta) + (thresholdState.position * this.barDimensions.thresholdWidth);

          // uncomment this to reenable the commits bar
          // commitsBarLength =  this.getCommitsWidth( thresholdDelta ) + (thresholdState.position * this.barDimensions.thresholdWidth);


        }
        else {
          purchaseBarLength = this.barDimensions.defaultWidth;
          commitsBarLength = 0;
        }

        if (this.barAtThreshold()) {
          // have to push the bar back to center it "inside" the threshold marker
          purchaseBarLength -= this.options.markerWidth / 2;
          this.barState.barAtThreshold = true;
          this.$selectors.$container.addClass("at-threshold");
        }



        // append the purchase bar to the container
        this.$selectors.$purchaseBar = $(templates.tplPBar({
          pLength: purchaseBarLength
        })).appendTo(this.$selectors.$container);




        // append the commit sbar to the container
        // this.$selectors.$commitsBar = $(templates.tplCBar({
        //   cLength: commitsBarLength
        // })).appendTo(this.$selectors.$container);

      }

      if (this.barIsActive()) {
        this.$selectors.$updateArea.addClass("active-deal").removeClass("inactive-deal");
        this.$selectors.$container.addClass("active-deal").removeClass("inactive-deal");
      }
      else {
        this.$selectors.$updateArea.addClass("inactive-deal").removeClass("active-deal");
        this.$selectors.$container.addClass("inactive-deal").removeClass("active-deal");
      }



      // Flag is shown regardless of bar
      if (showFlag) {
        var $flag = $(templates.tplFlag({
          purchases:this.purchaseData.purchases,
          commits: this.purchaseData.commits,
          max_drop_reached: this.thresholdState.nextThreshold == null
        }));


        // var $arrow = $( templates.tplArrow({
        // 	max_drop_reached: this.thresholdState.nextThreshold == null
        //   }) );

        $flag.appendTo(this.$selectors.$container);
        // $arrow.appendTo( this.$selectors.$container );



        // $arrow.find('.arrow-down').css({
        //   "left": Math.max( commitsBarLength, purchaseBarLength) - 10
        // });

        // if( !this.barIsActive() ){
        //    $arrow.find( '.arrow-down').css('border-top-color', '#e9e9e9' );
        // }

        if( !this.barIsActive() ){
          $flag.find('*').css({
            'background-color': '#e9e9e9',
            'color': '#666666'
          });
        }


        var $width = $flag.outerWidth()/2;
        if(purchaseBarLength + $width > this.barDimensions.defaultWidth) {
          $flag.css({
            "right": 0
          });

          return false;
        }


        // Use this when commits bar is enabled
        // if( commitsBarLength > $width) {
        //   $flag.css({
        //     "left": commitsBarLength - $width,
        //   });

        // }


        if( purchaseBarLength > $width) {
          $flag.css({
            "left": purchaseBarLength - $width,
          });

        }




      }
    };

    // updates inormation on the page dependent on bar status
    // is only called if updateBars is called
    ThresholdBars.prototype.updateMeta = function () {
      var context = this.options.context,
        $updateArea = this.$selectors.$updateArea,
        purchaseData = this.purchaseData,
        thresholdState = this.thresholdState,
        next = thresholdState.nextThreshold,
        currentPrice = purchaseData.actualPrice,
        currentPurchases = purchaseData.purchases,
        thresholds = purchaseData.thresholds,
        priceParts = (thresholdState.price + "").split(".");

      if (this.barState.barIsActive) {
        $updateArea.find(".deal-action-descriptor").text("for the next deal");
      }
      else {
        $updateArea.find(".deal-action-descriptor").text("to activate deal");
      }

      $updateArea.find(".purchased-value").text(currentPurchases).end()
        .find(".needed-value").text(next - currentPurchases > 0 ? next - currentPurchases : 0).end()
        .find(".current-price").html(templates.tplPrettyPrice({
        price:priceParts[0],
        cents:priceParts[1]
      }));

      $updateArea.find(".current-savings").text(thresholdState.savings + "% off");

      this.$selectors.$thresholdContainer.find(".threshold-marker").each(function (index, item) {

        if (currentPurchases >= thresholds[index]) {
          $(this).addClass("th-reached");
        }
        else {
          $(this).removeClass("th-reached");
        }
      });

      // if we're updating the page...
      if (context === "page") {
        $updateArea.find(".total-needed-value").text(purchaseData.maxThreshold - currentPurchases);
      }
    };

    // updates the purchase bar and sale state if called externally with a new purchase number
    ThresholdBars.prototype.updateBars = function (newP) {
      var thresholdState = this.thresholdState,
        oldPurchases = this.purchaseData.purchases;
      this.purchaseData.purchases = newP;

      // if the context is the page, reload it if we've hit the final threshold
      if (this.options.context === "page") {
        // if we're at the max threshold and the product number decreases...
        if (this.barState.barAtMax) {
          if (newP < this.purchaseData.maxThreshold) {
            location.reload();
            return false;
          }
        }
        else {
          if (newP >= (this.purchaseData.maxThreshold)) {
            location.reload();
            return false;
          }
        }
      }

      if (this.$selectors.$purchaseBar) {
        this.$selectors.$purchaseBar.remove();
        this.$selectors.$container.find(".bar-flag").remove();
      }

      // if we haven't entered into a new threshold, we can just update the width
      if (newP < thresholdState.nextThreshold && newP >= thresholdState.currentThreshold) {
        this.setPurchaseBarWidth();
      }

      else {
        var newThresholdState,
          prices = this.purchaseData.prices,
          thresholds = this.purchaseData.thresholds,
          savings,
          reached = false;
        // we have to figure out which threshold we're in, and calculate relative values again
        for (var i = 0; i < this.purchaseData.thresholdNum; i++) {
          if (newP >= thresholds[i]) {
            savings = helpers.getPercentage(prices[i], this.purchaseData.actualPrice);
            newThresholdState = this.barHelpers.getThresholdData(thresholds, prices, i, savings);
            reached = true;
          }
        }

        this.thresholdState = newThresholdState;

        this.setPurchaseBarWidth();
      }
      this.updateMeta();

    };

    return ThresholdBars;

  })();

  $(function () {
    JC.ThresholdBars = ThresholdBars;
  });
}).call(this);
