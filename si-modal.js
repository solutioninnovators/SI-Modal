/**
 * SI Modal - Simple, responsive jQuery modal windows
 * Developed by Mike Spooner (thetuningspoon) for Solution Innovators
 *
 * BASIC USAGE
 * $(function() {
 *      $modal = new SiModal({
 *          triggerClass: 'modal', // Class on the <a> or <form> element that should trigger the modal window to open
 *          speed: 200, // Speed of animation
 *      });
 * }
 *
 *
 * EVENTS
 * The following events are triggered on the anchor or form element that triggered the modal to open:
 *
 * modal-opened - Triggered when a modal window is first opened.
 * modal-closed - Triggered any time a modal window is closed.
 * modal-saved - Triggered when the contents of a modal window is loaded or reloaded and the data-modal-saved attribute is present somewhere on the page (good for triggering an ajax refresh on the parent page after the modal is saved).
 * modal-autoclosed - Triggered when a modal window is automatically closed due to the presence of the data-modal-autoclose attribute somewhere on the page.
 *
 *
 * The following events may be triggered by an external script:
 *
 * modal-close - Trigger a 'modal-close' event on the <body> tag of the parent window to close its modal
 *
 *
 *
 * ATTRIBUTES
 * Add the following data attributes to your trigger anchor or form element:
 *
 * data-modal-close - Use a selector to specify any element(s) in the child modal window that should immediately close the window when clicked on (e.g. a cancel button)
 *
 * data-modal-window-class - Add one or more (space-separated) classes that you wish to add to the outer modal window wrapper element. Good for adding alternate size options, e.g. modal_small
 *
 */

function SiModal(options) {

    // Default configuration options if none specified
    var defaults = {
        triggerClass: 'modal', // Class on the <a> or <form> element that should trigger the modal window to open
        speed: 200, // Speed of animation
        closeOnEscapeKeyPress: true,
    };
    var config = $.extend({}, defaults, options); // Merge the defaults and user specified options into config

    var $modalWindow = $("<div class='modal-window'><div class='modal-scrollWrap'><iframe class='modal-iframe' frameborder='0' name='modal'></iframe></div><div class='modal-exit'>X</div></div>");

    var isChild = window !== top; // Is this modal the child of another modal?
    var $triggerEl; // Stores the anchor or form element that triggered the modal to open

    if(isChild) {
        var $parentDoc = $(parent.document);
        var $parentModal = $parentDoc.find('.modal-window');
    }

    $('body').on('submit', '.' + config.triggerClass, function (event) {
        openModal($(this), event);
    });

    $('body').on('click', '.' + config.triggerClass + ':not(form)', function (event) {
        openModal($(this), event);
    });

    $('body').on('click', '.' + config.triggerClass + ',.modal-window', function (event) {
        event.stopPropagation();
    });

    // Allow modal to be closed by triggering a 'modal-close' event on the body tag of the parent window
    $('body').on('modal-close', function() {
        closeModal();
    });

    // Close the modal when the escape key is clicked and the focus is outside of the window
    $(document).keyup(function(e) {
        if(config.closeOnEscapeKeyPress && e.keyCode == 27) { // escape key maps to keycode `27`
            closeModal();
        }
    });


    function openModal($trigger, event) {
        $triggerEl = $trigger;

        $('html').addClass('modal-noScroll');

        if(isChild) {
            $parentModal.addClass('modal-parent');
        }

        $('body').append($modalWindow);

        // Add custom classes to wrapper element
        $modalWindow.addClass($triggerEl.attr('data-modal-window-class'));

        if($trigger.is('form')) { // This is a form submit
            $trigger.append('<input type="hidden" name="modal" value="1" />'); // We can't modify the action attribute's URL directly because it would get overwritten if the form uses the GET method, so we add a hidden field instead, which is converted to a get param on submit
            $trigger.attr('target', 'modal');
        }
        else {
            if($trigger.is('a')) event.preventDefault(); // Prevent browser from redirecting to anchor link

            var src = $trigger.attr('href');
            if (src) {
                $('.modal-iframe').attr('src', buildUrl(src, 'modal', '1')); // Add modal=1 to url
            }
        }

        // Show the dimmed background immediately so the user knows the modal is loading
        var $modalDim = $("<div id='modal-dim'></div>");
        $('body').append($modalDim);
        $modalDim.fadeIn(config.speed);

        // Show the loading spinner
        var $spinner = $('<i class="modal-spinner fa fa-spin fa-circle-o-notch"></i>');
        $modalDim.append($spinner);
        $spinner.fadeIn();

        // We need to do this because some browsers can't calculate the natural height of an element if it is display: none
        $modalWindow.show().css('visibility', 'hidden');

        // Bind events once the iframe has finished loading
        $('.modal-iframe').on('load', function() {
            var $iframe = $(this);
            var $iframeContents = $iframe.contents();
            var $iframeBody = $iframeContents.find('body');

            $iframeBody.css('height', 'auto'); // Set the iframe's body height to auto so we can use it to inform the max-height of the outer modal
            $modalWindow.css('max-height', $iframeBody.height()); // Set the max height of the modal equal to the height of the interior iframe body

            // Show the modal window now that it's ready
            $spinner.fadeOut();
            if($modalWindow.css('visibility') == 'hidden') {
                $modalWindow.hide().css('visibility', 'visible').fadeIn(config.speed);
            }

            this.contentWindow.focus(); // Set focus to the newly opened iframe (this doesn't work if you used the cached $iframe jquery object)

            // Force the top page to reload if the user has been logged out (@todo: move this out of si-modal.js/handle it in a more global manner, e.g. use the get parameter to trigger autoclose on logout)
            if($iframeContents.find('body.template_Login').length) {
                location.reload();
            }

            // If the data-modal-autoclose attribute is present anywhere in the iframe, close the modal (Used for closing the modal after a successful save)
            if($iframeContents.find('*[data-modal-autoclose="true"]').length) {

                // Delay the close slightly so that the user has time to see any feedback that was displayed on the page
                setTimeout(function() {
                    closeModal();
                }, 500);

                $triggerEl.trigger('modal-autoclosed'); // trigger modal-autoclosed event on the anchor or form element that triggered opening the modal
            }

            // If the data-modal-saved attribute is present anywhere in the iframe, trigger the modal-saved event on the anchor or form element that triggered the modal. This allows our parent page to respond to the event.
            if($iframeContents.find('*[data-modal-saved="true"]').length) {
                $triggerEl.trigger('modal-saved');
            }

            // Close the modal when the exit button is clicked
            $modalWindow.on('click', '.modal-exit', function () {
                closeModal();
            });

            // Close the modal immediately when any element that matches the data-modal-close selector is clicked on (e.g. a cancel button)
            $iframeContents.find($triggerEl.attr('data-modal-close')).on('click', function(e) {
                e.preventDefault();
                closeModal();
            });

            // Close the modal when escape key is clicked and the focus is inside the window
            $iframeContents.find('body').on('keyup', function (e) {
                if (config.closeOnEscapeKeyPress && e.keyCode == 27) { // escape key maps to keycode `27`
                    closeModal();
                }
            });
        });

        $trigger.trigger('modal-opened');
    }

    function closeModal() {
        $modalWindow.fadeOut(config.speed);
        $('#modal-dim').fadeOut(config.speed);

        $('html').removeClass('modal-noScroll');

        if(isChild) {
            $parentModal.removeClass('modal-parent');
        }

        setTimeout(function () {
            $modalWindow.remove();
            $('#modal-dim').remove();
        }, config.speed);

        $triggerEl.trigger('modal-closed');
    }

    function buildUrl(base, key, value) {
        var sep = (base.indexOf('?') > -1) ? '&' : '?';
        return base + sep + key + '=' + value;
    }

}