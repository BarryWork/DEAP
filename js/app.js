var disableLocalStorage = false;

// logout the current user
function logout() {
    jQuery.get('/code/php/logout.php', function(data) {
        if (data == "success") {
            // user is logged out, reload this page
            location.reload();
        } else {
            alert('something went terribly wrong during logout: ' + data);
        }
    });
}

// can we store data locally?
function storageAvailable(type) {
    if (disableLocalStorage)
        return false;

    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

jQuery(document).ready(function() {
    if (storageAvailable('localStorage')) {
        var firstTime = localStorage.getItem('deap-first-time-load');
	if (firstTime == "1") {
	    jQuery('.starter').hide();
	}
    }
	
    jQuery('.starter').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(e) {
	$(this).remove();
	if (storageAvailable('localStorage')) {
            localStorage.setItem('deap-first-time-load', "1");
	}
    });
    jQuery('span.login__name').text(user_name);
});

function show_updates(){
	$.get("./code/php/getNewsUpdates.php ",function(data){$(".news-updates").append(data)
		if(!$(".news-updates").is(":visible")){
			$(".news-updates").fadeIn()
		} else {
			$(".news-updates").fadeOut()
		}   

	})

}
