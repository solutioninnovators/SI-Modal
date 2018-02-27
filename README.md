# SI Modal - Simple, responsive jQuery modal windows
Developed by Mike Spooner (thetuningspoon) for Solution Innovators

SI Modal enables opening any page or submitting any form to a responsive modal window.

## Usage

1. Load si-modal.js and si-modal.css in the head section of your page
2. Add the "modal" class to any `<a>` link or `<form>` element
3. You may override the default si-modal.css styles in your own css file (recommended), or modify the file directly.
4. Initialize the function somewhere in your javascript:

```
$(function() {
      $modal = new SiModal({
          triggerClass: 'modal', // Class on the <a> or <form> element that should trigger the modal window to open
          speed: 200, // Speed of animation
      });
}
```

You may initialize the module more than once using a different triggerClass if you want to use different options for different modals.

Please see the comments in si-modal.js for options