(function (a) {
	function View() {
		this.$input = $('.search');
		this.$submit = $('.submit');
		this.$container = $('#container');
		this.$apps = $('.apps');
		this.$toggleAppsDiv = $('.toggleAppsDiv');
		this.$playerContainer = $('.playerContainer');
		this.$more = $('.more');
		this.$loader = $('.loader');
		this.$cardTemplate = Handlebars.compile($('#cardTemplate').html());
		this.largeCard = Handlebars.compile($('#largeCard').html());
		this.noVideos = Handlebars.compile($('#noVideos').html());
	}
	View.prototype={
		bind : function (cmd,callback) {
			var self= this;
			if(cmd === "search") {
				this.$input.on('keypress',function (e) {
					var val = self.$input.val();
					if(val && e.which == 13) {
						callback($(e.target).data('action'),val);
					}
				});
			}
			else if(cmd === "apps") {
				this.$apps.find('button').on('click',function (e) {
					var target = e.target;
					callback(target.id);
				});
			}
			else if(cmd === "navContainer") {
				this.$toggleAppsDiv.on('click',function(e){
					callback();
				});
			}
			else if(cmd === 'play') {
				this.$container.find('button.play').on('click',function(e){
					callback($(e.target).closest('div.card').data('id'));
				});
			}
			else if(cmd === "playerContainer") {
				this.$playerContainer.on('click',function (e){
					callback(e.target.className);
				});
			}
			else if(cmd === "viewCount") {
				this.$container.find('.card').hover(
					function() {
						$(this).find('div.viewCount').removeClass('hidden');
					},	
					function() {
						$(this).find('div.viewCount').addClass('hidden');
					});
			}
			else if(cmd === 'expand') {
				this.$container.find('button.expand').on('click', function(e) {
					var $card = self.$container.find('.card'),$parent = $(e.target).closest($card);
					var index = $card.index($parent) + 1;
					callback($parent,index);
				});
			}
			else if(cmd === 'playLarge') {
				this.$container.find('button.playLarge').on('click',function(e){
					callback($(e.target).closest('div#expanded').data('id'));
				});
			}
			else if(cmd === 'remove') {
				this.$container.find('button.removeDetail').on('click',function(e){
					callback();
				});
			}
			else if(cmd === 'loadMore') {
				this.$more.on('click', function(e) {
					callback($(this).data());
				});
			}
		},
		toggleVisibility : function() {
			this.$apps.toggleClass('hidden');
		},
		clearContainer : function() {
			this.$container.html('');
		},
		addTemplate : function(ar) {
			var content = '',self=this;
			$.each(ar,function(index, item) {
				content += self.$cardTemplate(item);
			});
			this.$container.append(content);
		},
		removeDataAttributes : function() {
			this.$more.removeData();
		},
		addPlayer : function(id) {
			var url = "http://www.youtube.com/embed/"+id+"?autoplay=1";
			this.$playerContainer.find('iframe').attr('src', url);
		},
		togglePlayerContainerVisibility : function () {
			this.$playerContainer.toggleClass('hidden');
		},
		removePlayer : function() {
			this.$playerContainer.find('iframe').attr('src', '');
		},
		appendExpandedCard : function(obj,pos) {
			this.$container.find('.card').eq(pos-1).after(this.largeCard(obj));
			this.$container.find('#expanded').hide().show('slow');
		},
		removeDetailedCard : function() {
			var sef = this;
			this.$container.find('div#expanded').hide('slow', function() {
				$(this).remove();
			});
		},
		adjustTriangle : function(index) {
			var pos = index%3;
			var target = this.$container.find('.triangleLarge');
			if(pos == 0){
				target.css('left', 800);
			}
			else if (pos == 2) {
				target.css('left', 400);
			}
			else{
				target.css('left', 0);
			}
		},
		scrollIntoView : function() {
			var target = this.$container.find('#expanded');
			var position = target.position();
			$('body').animate({
				scrollTop: position.top-80,
				scrollLeft: position.left
			});
		},
		toggleLoader : function(action) {
			var $target = this.$loader;
			(action === "add") ? $target.removeClass('hidden') : $target.addClass('hidden') ;
		},
		ShowEmptyMessage : function() {
			this.$container.append(this.noVideos());
		},
		setDataAttributes : function(obj) {
			var $target = this.$more;
			$target.data(obj);
		},
		toggleLoadMoreVisibility : function(action){
			var target = this.$more;
			(action === "add") ? target.addClass('hidden') : target.removeClass('hidden');
		},
		hideNavContainer : function() {
			var self = this;
			this.$container.on('click', function(event) {
				event.preventDefault();
				self.$apps.addClass('hidden');
			});
		}
	}
	a.ya = a.ya || {};
	ya.View = View;
})(window);