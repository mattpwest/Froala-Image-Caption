/*!
 * Froala Image Caption Plugin
 *
 * Originally written by Matt Dziuban (http://mattdziuban.com) for Froala v1.2.3 - v1.2.6 (http://editor.froala.com)
 * Updated by Matt Van Der Westhuizen (https://chaotik.co.za) for Froala v2.4.1
 */
(function ($) {
    $.extend($.FroalaEditor.POPUP_TEMPLATES, {
        'imageCaptionPlugin.popup': '[_BUTTONS_][_CUSTOM_LAYER_]'
    });

    $.FroalaEditor.DEFAULTS = $.extend($.FroalaEditor.DEFAULTS, {
        imageCaption: {
            debug: true,
            popupButtons: ['imageBack', '|']
        }
    });

    $.FroalaEditor.PLUGINS.imageCaptionPlugin = function(currentEditor) {
        var editor = currentEditor;
        var opts = editor.opts.imageCaption;

        function _init() {
            _log('Image Caption Plugin initialized with options: ', opts);
        }

        function _initPopup () {
            // Popup buttons.
            var popup_buttons = '';

            // Create the list of buttons.
            if (editor.opts.imageCaption.popupButtons.length > 0) {
                popup_buttons += '<div class="fr-buttons">';
                popup_buttons += editor.button.buildList(editor.opts.imageCaption.popupButtons);
                popup_buttons += '</div>';
            }

            // Load popup template.
            var templateHtml = '<div class="fr-image-caption-layer fr-layer fr-active" id="fr-image-caption-layer-' + editor.id + '">' +
                                  '<div class="fr-input-line">' +
                                    '<input id="fr-image-caption-layer-text-' + editor.id + '" type="text" placeholder="' + editor.language.translate("Caption Text") + '" tabIndex="1">' +
                                  '</div>' +
                                  '<div class="fr-action-buttons">' +
                                    '<button type="button" class="fr-command fr-submit" data-cmd="imageSetCaption" tabIndex="2" role="button">'
                                      + editor.language.translate("Update") +
                                    '</button>' +
                                  '</div>' +
                                '</div>';
            var template = {
                buttons: popup_buttons,
                custom_layer: templateHtml
            };

            // Create popup.
            var $popup = editor.popups.create('imageCaptionPlugin.popup', template);

            // Assign refresh handler.
            editor.popups.onRefresh('imageCaptionPlugin.popup', function () {
                console.log ('refresh');

                var $popup = editor.popups.get('imageCaptionPlugin.popup');
                var $image = $(editor.image.get()[0]);

                if ($image) {
                    $popup.find('input').val($image.parent().find('.caption').text()).trigger('change');
                }
            });

            // Assign hide handler.
            editor.popups.onHide('imageCaptionPlugin.popup', function () {
                console.log ('hide');
            });

            return $popup;
        }

        function showPopup () {
            var $popup = editor.popups.get('imageCaptionPlugin.popup');

            if (!$popup) {
                $popup = _initPopup();
            }

            editor.popups.setContainer('imageCaptionPlugin.popup', editor.$sc);

            editor.popups.refresh('imageCaptionPlugin.popup');

            // Use the image.edit plugin's popup as the base position for the caption popup
            var $base = editor.popups.get('image.edit');

            var left = $base.position().left + $base.outerWidth() / 2;
            var top = $base.position().top;

            // Show the custom popup
            editor.popups.show('imageCaptionPlugin.popup', left, top, $base.outerHeight());
        }

        function hidePopup () {
            editor.popups.hide('imageCaptionPlugin.popup');
        }

        function setImageCaption() {
            var $image = $(editor.image.get()[0]);
            var $popup = editor.popups.get('imageCaptionPlugin.popup');
            var $input = $popup.find('input');
            var captionText = $input.val();

            // Insert / update content
            if ($.trim(captionText) === '') {
                if ($image.closest('.thumbnail').length > 0)
                    $image.closest('.thumbnail').parent().parent().html($image.get(0).outerHTML);
            } else {
                if ($image.closest('.thumbnail').length > 0) {
                    $image.closest('.thumbnail').find('.caption').text(captionText);
                } else {
                    var classes = '' + this.getImageClass($image.attr('class'));
                    var refId = 'img-' + (new Date()).getTime();
                    var captionHtml =
                        '<span class="post-caption-container ' + classes + '" id="' + refId + '">' +
                          '<span class="thumbnail">' +
                            $image.attr('data-ref-id', '#' + refId).get(0).outerHTML + //.replace('>', 'contenteditable="true">') +
                            '<span class="caption pull-center" style="width:' + ($image.width() - 18) + 'px" contenteditable="false">' + captionText +
                            '</span>' +
                          '</span>' +
                        '</span>';

                    $image.parent().html(captionHtml);
                }
            }

            // Hide this popup and show the original image editing popup
            editor.popups.hide('imageCaptionPlugin.popup');
            editor.popups.show('image.edit');
        }

        function getImageClass(cls) {
            if (!cls)
                return 'fr-fi';
            var classes = cls.split(' ');
            if (classes.indexOf('fr-fir') >= 0)
                return 'fr-fir';
            if (classes.indexOf('fr-fil') >= 0)
                return 'fr-fil';
            return 'fr-fi';
        }

        function _log() {
            if (!opts.debug) {
                return;
            }

            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }

        return {
            _init: _init,
            showPopup: showPopup,
            hidePopup: hidePopup,
            setImageCaption: setImageCaption,
            getImageClass: getImageClass
        }
    };

    $.FroalaEditor.DefineIcon('header', {NAME: 'header', template: 'font_awesome'});
    $.FroalaEditor.RegisterCommand('imageCaption', {
        title: 'Caption',
        icon: 'header',
        undo: true,
        focus: true,
        showOnMobile: true,
        refreshAfterCallback: true,
        callback: function() {
            console.log('imageCaption button pressed...');
            this.imageCaptionPlugin.showPopup();
        },
        refresh: function($btn) {
            console.log('imageCaption button state changed: ', this.selection.element());
        }
    });

    $.FroalaEditor.RegisterCommand('imageSetCaption', {
        title: 'Update',
        undo: true,
        focus: false,
        showOnMobile: true,
        refreshAfterCallback: false,
        callback: function() {
            console.log('imageCaption button pressed...');
            this.imageCaptionPlugin.setImageCaption();
        },
        refresh: function($btn) {
            console.log('imageCaption button state changed: ', this.selection.element());
        }
    });

    $.FroalaEditor.DefineIcon('popupClose', { NAME: 'times', template: 'font_awesome' });
    $.FroalaEditor.RegisterCommand('popupClose', {
        title: 'Close',
        icon: 'times',
        undo: false,
        focus: false,
        callback: function () {
            this.imageCaptionPlugin.hidePopup();
        }
    });
})(jQuery);
