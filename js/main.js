(function () {
	var OAUTH2_CLIENT_ID = "1024901973369-mm2s2c06p9bs2m6d7ac187p4ofd7od2l.apps.googleusercontent.com";
	var OAUTH2_SCOPES = ['https://www.googleapis.com/auth/youtube'];

	googleApiClientReady = function() {
		gapi.auth.init(function() {
			window.setTimeout(checkAuth, 1);
		});
	}

	function checkAuth() {
		gapi.auth.authorize({
			client_id: OAUTH2_CLIENT_ID,
			scope: OAUTH2_SCOPES,
			immediate: true
		}, handleAuthResult);
	}

	function handleAuthResult(authResult) {
		if (authResult && !authResult.error) {
			loadAPIClientInterfaces();
		} 
		else {
			$('#login-link').click(function() {
				gapi.auth.authorize({
					client_id: OAUTH2_CLIENT_ID,
					scope: OAUTH2_SCOPES,
					immediate: false
				}, handleAuthResult);
			});
		}
	}

	function loadAPIClientInterfaces() {
		$('.beforeLogin').addClass('hidden');
		$('.afterLogin').removeClass('hidden');
		gapi.client.load('youtube', 'v3', function() {
			afterAPILoaded();
		});
	}
	function afterAPILoaded() {
		window.ya = window.ya || {};
		var view = new window.ya.View();
		var controller = new window.ya.Controller(view);
	}
})();