(function (ya){
	function Controller(view) {
		var self = this;
		this.view = view;
		this.arrayOfCard = [];
		this.view.bind("search",function(action,value) {
			self.handleSearch(action,value);
		});
		this.view.bind("navContainer",function() {
			self.toggleAppsDiv();
		});
		this.view.bind("apps",function(action) {
			self.handleNavAction(action);
		});
		this.view.bind('playerContainer',function(className) {
			self.togglePlayerVisibility(className);
		});
		this.view.bind('loadMore',function(dataObj) {
			self.loadMoreVideos(dataObj);
		});
		this.loadPopular();
		this.view.hideNavContainer();
	}
	Controller.prototype = {
		toggleAppsDiv : function() {
			this.view.toggleVisibility();
		},
		handleSearch : function(action,value) {
			this.view.clearContainer();
			this.arrayOfCard = [];
			this.view.removeDataAttributes();
			this.request4Search(action,value);
		},
		togglePlayerVisibility : function (className) {
			if(className === 'playerContainer') {
				this.view.togglePlayerContainerVisibility();
				this.view.removePlayer();
			}
		},
		handleNavAction : function(action) {
			var self = this;
			this.view.toggleVisibility();
			this.view.clearContainer();
			if(action === "popular") {
				this.loadPopular();
			}
			else{
				var request = gapi.client.youtube.channels.list({
					part : 'contentDetails',
					mine : true
				});
				request.execute(function(response) {
					var playlist = response.result.items[0].contentDetails.relatedPlaylists;
					switch(action) {
						case 'liked' :
						playlistId = playlist.likes;
						break;
						case 'history' :
						playlistId = playlist.watchHistory;
						break;
						case 'later' :
						playlistId = playlist.watchLater;
						break;
						case 'uploads' :
						playlistId = playlist.uploads;
						break;
					}
					self.requestVideoPlaylist(playlistId);
				});
			}
			self.arrayOfCard = [];
			self.view.removeDataAttributes();
		},
		loadPopular : function(pageToken) {
			var self = this,requestOptions = {
				part: 'snippet',
				chart: "mostPopular",
				regionCode: "IN",
				maxResults: 12
			};
			if(pageToken)(requestOptions.pageToken = pageToken);
			var request = gapi.client.youtube.videos.list(requestOptions);
			this.view.toggleLoader("add");
			request.execute(function(response) {
				self.createPlaylist(response.result.items);
				self.setDataAttributes({pageToken : response.nextPageToken});
			});
		},
		request4Search : function(action,value,pageToken){
			var self= this;
			var requestOptions = {
				part: 'snippet',
				q: value,
				maxResults : 12,
				order : 'viewCount'
			};
			if(pageToken)(requestOptions.pageToken = pageToken);
			var request = gapi.client.youtube.search.list(requestOptions);
			this.view.toggleLoader("add");
			request.execute(function(response) {
				if(response.items.length != 0){
					self.createPlaylist(response.items,action);
					self.setDataAttributes({
						query : value,
						pageToken : response.nextPageToken
					});
				}
				else{
					self.view.ShowEmptyMessage();
					self.view.toggleLoader('remove');
					self.view.toggleLoadMoreVisibility("add");
				}
			});
		},
		requestVideoPlaylist : function(playlistId, pageToken) {
			var self=this,requestOptions = {
				playlistId: playlistId,
				part: 'snippet,contentDetails',
				maxResults: 12
			};
			if(pageToken)(requestOptions.pageToken = pageToken);
			var request = gapi.client.youtube.playlistItems.list(requestOptions);
			this.view.toggleLoader("add");
			request.execute(function(response) {
				var playlistItems = response.result.items;
				var token = response.nextPageToken;
				if (playlistItems.length !=0) {
					self.createPlaylist(playlistItems);
					self.setDataAttributes({
						playlistId : playlistId,
						pageToken : response.nextPageToken
					});
				} else {
					self.view.ShowEmptyMessage();
					self.view.toggleLoader('remove');
					self.view.toggleLoadMoreVisibility("add");
				}
			});
		},
		createPlaylist : function(playlistItems,action) {
			var self=this,arrayOfId=[];
			$.each(playlistItems,function(index, item) {
				var id;
				if(action === "search"){ id = item.id.videoId;}
				else{
					(item.hasOwnProperty('contentDetails')) ? id = item.contentDetails.videoId : id = item.id;
				}
				arrayOfId[index] = id;
			});
			self.getVideoDetails(arrayOfId.toString());
		},
		getVideoDetails : function(id){
			var self=this,request = gapi.client.youtube.videos.list({
				part : 'statistics,snippet',
				id : id
			});
			var htmlContent = [];
			request.execute(function(response) {
				$.each(response.result.items,function(index, item) {
					var obj ={
						videoId : item.id,
						title : item.snippet.title,
						time : item.snippet.publishedAt,
						description : item.snippet.description,
						channelName : item.snippet.channelTitle,
						thumb : item.snippet.thumbnails.medium.url,
						viewCount : item.statistics.viewCount,
						likes : item.statistics.likeCount,
						dislikes : item.statistics.dislikeCount
					};
					var date = new Date(obj.time);
					obj.time = date.toDateString();
					htmlContent[index] = obj;
					self.arrayOfCard.push(obj);
				});
				self.prepareContainer(htmlContent);
				self.view.toggleLoader("remove");
			});
		},
		prepareContainer : function(ar) {
			var self = this;
			this.view.addTemplate(ar);
			this.view.bind('viewCount');
			this.view.bind('play',function(id){
				self.addPlayer(id);
			});
			this.view.bind('expand',function(target,index) {
				self.addDetailedCard(target,index);
			});
		},
		addPlayer : function(id) {
			this.view.addPlayer(id);
			this.view.togglePlayerContainerVisibility();
		},
		addDetailedCard : function(target,index){
			var self = this, pos = this.getPositionOfCard(index),len = this.arrayOfCard.length;
			if(pos > len){ pos = len;}
			this.removeDetailedCard();
			this.view.appendExpandedCard(this.arrayOfCard[index-1],pos);
			this.view.adjustTriangle(index);
			this.view.scrollIntoView();
			this.view.bind('playLarge',function(id){
				self.addPlayer(id);
			});
			this.view.bind('remove',function() {
				self.removeDetailedCard();
			});
		},
		getPositionOfCard : function(index){
			while(index%3 != 0) {
				index++;
			}
			return index;
		},
		removeDetailedCard : function() {
			this.view.removeDetailedCard();
		},
		setDataAttributes : function(obj) {
			if(obj.pageToken){
				this.view.setDataAttributes(obj);
				this.view.toggleLoadMoreVisibility("remove");
			}
			else{
				this.view.toggleLoadMoreVisibility("add");
			}
		},
		loadMoreVideos : function(dataObj) {
			var query = dataObj.query,playlistId = dataObj.playlistId,pageToken = dataObj.pageToken;
			if(query){
				this.request4Search("search",query,pageToken);
			}
			else if(playlistId){
				this.requestVideoPlaylist(playlistId,pageToken);	
			}
			else{
				this.loadPopular(pageToken);
			}
		}
	}
	ya.Controller = Controller;
})(window.ya);