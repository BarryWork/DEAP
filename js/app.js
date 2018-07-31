
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

jQuery(document).ready(function() {
    jQuery('.starter').bind('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(e) { $(this).remove(); });
    jQuery('span.login__name').text(user_name);
});
