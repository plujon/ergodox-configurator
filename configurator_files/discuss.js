// jquery.sew.jasper.min.js
$(function(){var b={primaryStyles:["fontFamily","fontSize","fontWeight","fontVariant","fontStyle","paddingLeft","paddingTop","paddingBottom","paddingRight","marginLeft","marginTop","marginBottom","marginRight","borderLeftColor","borderTopColor","borderBottomColor","borderRightColor","borderLeftStyle","borderTopStyle","borderBottomStyle","borderRightStyle","borderLeftWidth","borderTopWidth","borderBottomWidth","borderRightWidth","line-height","outline"],specificStyle:{"word-wrap":"break-word","overflow-x":"hidden","overflow-y":"auto"},simulator:$('<div id="textarea_simulator"/>').css({position:"absolute",top:0,left:0,visibility:"hidden"}).appendTo(document.body),toHtml:function(a){return a.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>").split(" ").join('<span style="white-space:prev-wrap">&nbsp;</span>')},getCaretPosition:function(){var A=b,p=this,w=p[0],z=p.offset();if($.browser.msie&&$.browser.version<=9){w.focus();var v=document.selection.createRange();$("#hskeywords").val(w.scrollTop);return{left:v.boundingLeft-z.left,top:parseInt(v.boundingTop)-z.top+w.scrollTop+document.documentElement.scrollTop+parseInt(p.getComputedStyle("fontSize"))}}A.simulator.empty();$.each(A.primaryStyles,function(d,c){p.cloneStyle(A.simulator,c)});A.simulator.css($.extend({width:p.width(),height:p.height()},A.specificStyle));var r=(p.val()||p.text()),y=p.getCursorPosition();var x=r.substring(0,y),q=r.substring(y);var t=$('<span class="before"/>').html(A.toHtml(x)),a=$('<span class="focus"/>'),B=$('<span class="after"/>').html(A.toHtml(q));A.simulator.append(t).append(a).append(B);var u=a.offset(),s=A.simulator.offset();return{top:u.top-s.top-w.scrollTop+($.browser.mozilla?0:parseInt(p.getComputedStyle("fontSize"))),left:a[0].offsetLeft-A.simulator[0].offsetLeft-w.scrollLeft}}};$.fn.extend({setCursorPosition:function(a){if(this.length==0){return this}return $(this).setSelection(a,a)},setSelection:function(h,g){if(this.length==0){return this}input=this[0];if(input.createTextRange){var a=input.createTextRange();a.collapse(true);a.moveEnd("character",g);a.moveStart("character",h);a.select()}else{if(input.setSelectionRange){input.focus();input.setSelectionRange(h,g)}else{var j=this.get(0);var a=document.createRange();a.collapse(true);a.setStart(j.childNodes[0],h);a.setEnd(j.childNodes[0],g);var i=window.getSelection();i.removeAllRanges();i.addRange(a)}}return this},getComputedStyle:function(f){if(this.length==0){return}var e=this[0];var a=this.css(f);a=a||($.browser.msie?e.currentStyle[f]:document.defaultView.getComputedStyle(e,null)[f]);return a},cloneStyle:function(f,a){var e=this.getComputedStyle(a);if(!!e){$(f).css(a,e)}},cloneAllStyle:function(h,i){var j=this[0];for(var a in j.style){var g=j.style[a];typeof g=="string"||typeof g=="number"?this.cloneStyle(h,a):NaN}},getCursorPosition:function(){var n=input=this[0];var k=(input.value||input.innerText);if(document.selection){input.focus();var l=document.selection.createRange();var a=document.selection.createRange().text.length;l.moveStart("character",-k.length);return l.text.length-a}else{if(input.selectionStart||input.selectionStart=="0"){return input.selectionStart}else{if(typeof window.getSelection!="undefined"){var o=window.getSelection().getRangeAt(0);var p=o.cloneRange();p.selectNodeContents(n);p.setEnd(o.endContainer,o.endOffset);return p.toString().length}else{if(typeof document.selection!="undefined"&&document.selection.type!="Control"){var m=document.selection.createRange();var j=document.body.createTextRange();j.moveToElementText(n);j.setEndPoint("EndToEnd",m);return j.text.length}}}}return 0},getCaretPosition:b.getCaretPosition})});(function(g,c,j){function a(e,i){this.element=e,this.$element=g(e),this.$itemList=g(a.MENU_TEMPLATE),this.options=g.extend({},h,i),this.reset(),this._defaults=h,this._name=b,this.expression=new RegExp("(?:^|\\b|\\s)"+this.options.token+"([\\w.]*)$"),this.cleanupHandle=null,this.init()}var f=function(k,i){k.text(i.val)},b="sew",d=c.document,h={token:"@",elementFactory:f,values:[],unique:!1,repeat:!0};a.MENU_TEMPLATE="<div class='-sew-list-container' style='display: none; position: absolute;'><ul class='-sew-list'></ul></div>",a.ITEM_TEMPLATE='<li class="-sew-list-item"></li>',a.KEYS=[40,38,13,27,9],a.prototype.init=function(){if(this.options.values.length<1){return}this.$element.bind("keyup",this.onKeyUp.bind(this)).bind("keydown",this.onKeyDown.bind(this)).bind("focus",this.renderElements.bind(this,this.options.values)).bind("blur",this.remove.bind(this))},a.prototype.reset=function(){this.options.unique&&(this.options.values=a.getUniqueElements(this.options.values)),this.index=0,this.matched=!1,this.dontFilter=!1,this.lastFilter=j,this.filtered=this.options.values.slice(0)},a.prototype.next=function(){this.index=(this.index+1)%this.filtered.length,this.hightlightItem()},a.prototype.prev=function(){this.index=(this.index+this.filtered.length-1)%this.filtered.length,this.hightlightItem()},a.prototype.select=function(){this.replace(this.filtered[this.index].val),this.hideList()},a.prototype.remove=function(){this.$itemList.fadeOut("slow"),this.cleanupHandle=c.setTimeout(function(){this.$itemList.remove()}.bind(this),1000)},a.prototype.replace=function(v){var m=this.$element.getCursorPosition(),x=(m===1||this.getText().substr(0,m).match(/^@[^ ]*$/)!=null)?"":" ",q=this.getText(),l=q.substring(0,m);l=l.replace(this.expression,x+this.options.token+v);var p=q.substring(m,q.length),w=p.match(/^\s/)?"":" ",k=l+w+p;this.setText(k),this.$element.setCursorPosition(l.length+1)},a.prototype.hightlightItem=function(){this.$itemList.find(".-sew-list-item").removeClass("selected");var k=this.$itemList.find(".-sew-list-item").parent(),i=this.filtered[this.index].element.addClass("selected"),l=i.position().top;k.scrollTop(k.scrollTop()+l)},a.prototype.renderElements=function(e){g("body").append(this.$itemList);var i=this.$itemList.find("ul").empty();e.forEach(function(l,m){var k=g(a.ITEM_TEMPLATE);this.options.elementFactory(k,l),l.element=k.appendTo(i).bind("click",this.onItemClick.bind(this,l)).bind("mouseover",this.onItemHover.bind(this,m))}.bind(this)),this.index=0,this.hightlightItem()},a.prototype.displayList=function(){if(!this.filtered.length){return}this.$itemList.show();var k=this.$element,i=this.$element.offset(),l=k.getCaretPosition();this.$itemList.css({left:i.left+l.left,top:i.top+l.top})},a.prototype.hideList=function(){this.$itemList.hide(),this.reset()},a.prototype.filterList=function(k){if(k==this.lastFilter){return}this.lastFilter=k,this.$itemList.find(".-sew-list-item").remove();var i=this.options.values,l=this.filtered=i.filter(function(e){var m=new RegExp("\\W*"+this.options.token+e.val+"(\\W|$)");return !this.options.repeat&&this.getText().match(m)?!1:k===""||e.val.toLowerCase().indexOf(k.toLowerCase())>=0||(e.meta||"").toLowerCase().indexOf(k.toLowerCase())>=0}.bind(this));l.length?(this.renderElements(l),this.$itemList.show()):this.hideList()},a.getUniqueElements=function(k){var i=[];return k.forEach(function(l){var m=i.map(function(n){return n.val}).indexOf(l.val)>=0;if(m){return}i.push(l)}),i},a.prototype.getText=function(){return this.$element.val()||this.$element.text()},a.prototype.setText=function(e){this.$element.prop("tagName").match(/input|textarea/i)?this.$element.val(e):(e=g("<span>").text(e).html().replace(/\s/g,"&nbsp"),this.$element.html(e))},a.prototype.onKeyUp=function(l){var i=this.$element.getCursorPosition(),m=this.getText().substring(0,i),k=m.match(this.expression);if(!k&&this.matched){this.matched=!1,this.dontFilter=!1,this.hideList();return}k&&!this.matched&&(this.displayList(),this.lastFilter="\n",this.matched=!0),k&&!this.dontFilter&&this.filterList(k[1])},a.prototype.onKeyDown=function(k){var i=this.$itemList.is(":visible");if(!i||a.KEYS.indexOf(k.keyCode)<0){return}switch(k.keyCode){case 9:case 13:this.select();break;case 40:this.next();break;case 38:this.prev();break;case 27:this.$itemList.hide(),this.dontFilter=!0}k.preventDefault()},a.prototype.onItemClick=function(i,k){this.cleanupHandle&&c.clearTimeout(this.cleanupHandle),this.replace(i.val),this.hideList()},a.prototype.onItemHover=function(k,i){this.index=k,this.hightlightItem()},g.fn[b]=function(e){return this.each(function(){g.data(this,"plugin_"+b)||g.data(this,"plugin_"+b,new a(this,e))})}})(jQuery,window);

// jquery.scrollTo-1.4.3.1-min.js
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

// custom stuff
jQuery(function ($) {
  var discussionPage = {
    $container:$("#DiscussionContainer"),

    commentUsers:{},

    clip: null,

    init:function () {
      this.bindEvents();

      this.generateAutoCompleteList();
      var unique_values = [];
      for (var i in this.commentUsers) unique_values.push(this.commentUsers[i]);
      unique_values = unique_values.sort(function (a, b) {
        return a.val.toLowerCase().localeCompare(b.val.toLowerCase());
      });
      this.$container.find('textarea').sew({
        values:unique_values
      });

      // go to comment if hashed
      if (location.hash && isFinite(parseInt(location.hash.substr(1)))) {
        this.navigateToComment(parseInt(location.hash.substr(1)));
      }
    },

    initComment:function (elem) {
      var pageFunctions = this;
      elem.hover(function () {
        if (!$(this).find('.comment-edit').is(':visible')) {
          $(this).find('.comment-tool').show();
        }
      }, function () {
        $(this).find('.comment-tool').hide();
      })
      elem.find("[data-action='navigate']").click(function (e) {
        e.preventDefault();
        pageFunctions.navigateToComment($(this).data('target'))
      });
      elem.find("[data-action='delete']").click(function (e) {
        e.preventDefault();
        if ($(this).text() == "Delete") {
          $(this).text("Confirm Delete");
        } else {
          pageFunctions.deleteComment($(this).closest('.comment-card').data('id'));
        }
      });
      elem.find("[data-action='edit']").click(function (e) {
        e.preventDefault();
        $(this).closest('.comment-card').find('.comment-tool').hide();
        pageFunctions.editComment($(this).closest('.comment-card').data('id'))
      });
      elem.find("[data-action='reply']").click(function (e) {
        e.preventDefault();
        pageFunctions.setReplyToComment($(this).closest('.comment-card').data('id'))
      });
      elem.find("[data-action='link']").click(function (e) {
        e.preventDefault();
        var id = $(this).closest('.comment-card').data('id');
        pageFunctions.linkComment(id);
        pageFunctions.$container.find('.comment-card').removeClass('highlight');
        $("#comment-" + id).addClass('highlight');
      });
      elem.find("[data-action='highlight']").click(function(e){
        e.preventDefault();
        var id = $(this).closest('.comment-card').data('id');
        pageFunctions.highlightComment(id, true)
      });

      // video embed
      $embeddedImage = elem.find('.embed-image.youtube');
      if ($embeddedImage.length > 0 && $embeddedImage.data("yt") != "") {
        $embeddedImage.prepend('<img style="position: absolute; left: 50%; top: 50%; margin-top: -20px; margin-left: -20px; width: 40px; height: 40px;" src="https://d3jqoivu6qpygv.cloudfront.net/img/embed-play.png">').click(function () {
          $(this).html('<div class="video-container"><iframe class="youtube-player" type="text/html" src="//www.youtube.com/embed/' + $(this).data('yt') + '?showinfo=0&autohide=1&modestbranding=1&autoplay=1&rel=0" frameborder="0" style="border: 1px solid #888; padding: 0;"></iframe></div>');
          $(this).css("float", "none").next().css("padding-left", "0").css("padding-right", "0");
        });
      }
    },

    linkComment:function (id) {
      document.location.href = commentRoot + this.$container.find('#url').val() + "/talk/#" + id;
    },

    highlightComment:function (id, toggle) {
      var $comment = $('#comment-' + id);
      var isHighlighted = parseInt($comment.data("highlight"));
      if (typeof toggle !== "undefined") {
        isHighlighted = (isHighlighted + 1) % 2;
        $comment.data("highlight", isHighlighted);
        $.post(commentRoot + "api/comment", {
          type:"highlight",
          comment_id:id,
          highlighted:isHighlighted
        });
      }
      if (isHighlighted == 1) $comment.addClass("official-highlight");
      else $comment.removeClass("official-highlight");
    },

    unsetReplyToComment:function () {
      var replytoName = this.$container.find(".replyto-name").text().replace(" ", "_");
      $('.replyto-block').remove();
      this.$container.find("[name='replyto']").val("");
      this.$container.find('textarea').attr('placeholder', 'What do you think of this group buy?')[0].focus();
      if (this.commentUsers.hasOwnProperty(replytoName)) delete this.commentUsers[replytoName];
    },

    generateAutoCompleteList:function () {
      var values = $('.comment-card').map(function () {
        return {val:$(this).data('name').replace(" ", "_"), meta:$(this).data('id').toString()};
      }).get();
      for (var i = values.length - 1; i >= 0; i--) this.commentUsers[values[i].val] = values[i];
    },

    setReplyToComment:function (id) {
      var pageFunctions = this;
      var replytoId = id;
      var replytoName = $('#comment-' + id).data('name');
      pageFunctions.unsetReplyToComment();
      $replyto = $('<div class="replyto-block"><div>@ <a href="#" class="replyto-name"></a> (<a href="#" class="replyto-remove">remove</a>)</div><div class="replyto-comment"></div></div>');
      $replyto.find('.replyto-name').text(replytoName).click(function (e) {
        e.preventDefault();
        pageFunctions.navigateToComment(replytoId);
      });
      $replyto.find('.replyto-remove').click(function (e) {
        e.preventDefault();
        pageFunctions.unsetReplyToComment();
      });
      $replyto.find('.replyto-comment').html(this.htmlToPlainText($('#comment-' + id + ' .comment-content').html()));
      this.$container.find('.comment-card').removeClass('highlight');
      $("#comment-" + id).addClass('highlight');
      this.$container.find("[name='replyto']").val(id);
      this.$container.find('textarea').attr('placeholder', 'Respond to ' + replytoName + '\'s post').before($replyto)[0].focus();
    },

    editComment:function (id) {
      var pageFunctions = this;
      var editId = id;
      var $editBox = $('<textarea style="width: 100%" name="body" id="body" class="full"></textarea><div style="float: right; margin-bottom: 13px;"><button style="margin: 0 8px 0px 0px"  class="btn btn-small" type="submit">Save</button> or <a style="padding: 4px 0px 2px 0px" href="#">Discard</a></div>');

      // setup events
      $editBox.find('a').click(function (e) {
        e.preventDefault();
        $('#comment-' + editId + ' .comment-content').show();
        $('#comment-' + editId + ' .comment-embed').show();
        $('#comment-' + editId + ' .comment-edit').html("").hide();
      });
      $editBox.find('button').click(function (e) {
        e.preventDefault();
        $(this).addClass('disabled').attr('disabled', 'disabled');
        $.post(commentRoot + "api/comment", {
          body:$('#comment-' + editId).find('textarea').val(),
          comment_id:editId
        }, function (msg) {
          $('#comment-' + editId).replaceWith(msg.html);
          pageFunctions.initComment($('#comment-' + editId));
        }, 'json');
      });

      // show ui
      $('.comments-list .comment-content').show();
      $('.comments-list .comment-embed').show();
      $('.comments-list .comment-edit').hide();
      $('#comment-' + id + ' .comment-content').hide();
      $('#comment-' + id + ' .comment-embed').hide();
      $('#comment-' + id + ' .comment-edit').html($editBox).show();
      $('#comment-' + id + ' textarea').focus().val(this.htmlToPlainText($('#comment-' + id + ' .comment-content').html()));
    },

    htmlToPlainText:function (html) {
      return html.replace(/<br>/gi, "\n")
        .replace(/<(?:.|\s)*?>/g, "")
        .replace("&quot;", "\"")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&");
    },

    deleteComment:function (id) {
      $.ajax({
        url:commentRoot + "api/comment?comment_id=" + id,
        type:"DELETE",
        success:function (msg) {
          $('#comment-' + msg).remove();
        }
      })
    },

    navigateToComment:function (id) {
      this.$container.find('.comment-card').removeClass('highlight');
      $("#comment-" + id).addClass('highlight');
      jQuery.scrollTo("#comment-" + id, {duration:200, offset:{left:0, top:-100 }, axis:"y"});
    },

    bindEvents:function () {
      var pageFunctions = this;

      // initialize existing comments
      this.$container.find('[id^=comment-]').each(function () {
        pageFunctions.initComment($(this))
      });

      // initialize submit button
      var isPostingComment = false;
      this.$container.find('#addCommentForm').submit(function (e) {
        


		e.preventDefault();
	    
		// special case -- if the form requires a username 
		// delay the submission
	    if( $(this).is('.require-username') ){
			
			$form = $(this);
			JC.massdrop.modalWindows.userNameModal( function(){
			   
			   // after removing this class, we'll pass the 
			   // username check
			   $form.removeClass( 'require-username' ).submit();

			});
		
			return false;
		}
		
		
        if (!isPostingComment) {
          isPostingComment = true;
          $('#addCommentForm').find('button').attr('disabled', 'disabled').addClass('disabled').text('Posting...');
          $.post(commentRoot + "api/comment", $(this).serialize(), function (msg) {
            isPostingComment = false;
            $('#addCommentForm').find('button').removeAttr('disabled').removeClass('disabled').text('Post');
            if (!msg.error) {
              pageFunctions.initComment($(msg.html).prependTo('.comments-list > ul').hide().slideDown(200, function () {
                $(this).removeAttr('style')
              }));
              $('#body').val('');
              $('#discussion-count').text(parseInt($('#discussion-count').text()) + 1);
              pageFunctions.unsetReplyToComment();
              pageFunctions.generateAutoCompleteList();
            }
          }, 'json');

        }
      });

      this.$container.find('textarea').on("change keyup", function () {
        if (pageFunctions.$container.find("[name='replyto']").val() == "") {
          var m = $(this).val().match(/@([^ ]+)/);
          if (m != null && pageFunctions.commentUsers.hasOwnProperty(m[1])) {
            pageFunctions.setReplyToComment(pageFunctions.commentUsers[m[1]].meta);
          }
        }
      });
    }
  };

  $.extend(window.JC.massdrop, {
    discussionPage:discussionPage
  });

  window.JC.massdrop.discussionPage.init();
});
