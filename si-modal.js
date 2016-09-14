/**
 * SI Modal - Simple, responsive jQuery modal windows
 * Developed by Mike Spooner (thetuningspoon) for Solution Innovators
 *
 */

$(document).ready(function() {
		// Config - Feel free to modify these to taste
    var speed = 300; // Animation speed
    var modalTriggerClass = 'modal'; // Class added to <a> or <form> to trigger modal window usage
    var $modalHtml = "<div class='modal-window'><div class='modal-scrollWrap'><iframe class='modal-iframe' frameborder='0' name='modal'></iframe></div><div class='modal-exit'>X</div></div>";

    $('.'+modalTriggerClass).submit(function(event) {
        openModal($(this), event);
    });

    $('.'+modalTriggerClass).not('form').click(function(event) {
        openModal($(this), event);
    });

    $(window).on('click', function() {
        closeModal();
    });

    $('body').on('click', '.modal-exit', function() {
        closeModal();
    });

    $('body').on('click', '.'+modalTriggerClass+',.modal-window', function(event) {
        event.stopPropagation();
    });

    // Close the modal when escape key is clicked
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            closeModal();
        }
    });

    // Close modal when escape key is clicked and focus is inside modal (@todo: not working)
    $('.modal-iframe').contents().find('body').keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            closeModal();
        }
    });

    function openModal($trigger, event) {
        $('body').append($modalHtml);

        if($trigger.is('form')) { // This is a form submit
            $trigger.append('<input type="hidden" name="modal" value="1" />'); // We can't modify the action attribute's URL directly because it would get overwritten if the form uses the GET method, so we add a hidden field instead, which is converted to a get param on submit
            $trigger.attr('target', 'modal');
        }
        else {
            $('body').append($modalHtml);
            if($trigger.is('a')) event.preventDefault(); // Prevent browser from redirecting to anchor link

            var src = $trigger.attr('href');
            if (src) {
                $('.modal-iframe').attr('src', buildUrl(src, 'modal', '1')); // Add modal=1 to url
            }
        }

        $('.modal-window').fadeIn(speed);
        $('body').append("<div id='modal-dim'></div>");
        $('#modal-dim').fadeIn(speed);

        $('.modal-iframe').focus(); // Set focus to the newly opened iframe
    }

    function closeModal() {
        $('.modal-window').fadeOut(speed);
        $('#modal-dim').fadeOut(speed);

        setTimeout(function () {
            $('.modal-window').remove();
            $('#modal-dim').remove();
        }, speed)
    }

    function buildUrl(base, key, value) {
        var sep = (base.indexOf('?') > -1) ? '&' : '?';
        return base + sep + key + '=' + value;
    }
});