;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        root.ingeniousselect = factory(root.jQuery);
    }
}(this, function ($) {
    var initialized = false;
    var scrollBarOffset = 20; //20px für Scrollbar mit einrechnen

    $.fn.ingeniousselect = function(settings) {
        if (typeof settings == 'object' && settings.prefix && settings.prefix.indexOf('-') != (settings.prefix.length - 1)) {
            settings.prefix = settings.prefix+'-';
        } else {
            settings = {};
        }
        settings = $.extend({
            prefix: 'ingeniousSelect-'
        }, settings);

        var setOptionsWrapperPosition = function($select) {
            //Box oben oder unten anzeigen
            var optionsWrapper = $select.parent().find('.'+settings.prefix+'optionsWrapper');
            var selectOffset = $select.offset();

            if ((selectOffset.top + optionsWrapper.height() + $select.height() + scrollBarOffset - window.scrollY) > $(window).height() &&
                (selectOffset.top - window.scrollY) > $(window).height()/2) {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--bottom');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--top');
            } else {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--top');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--bottom');
            }
            //links oder rechtsbündig mit select
            if (selectOffset.left <= $(window).width()/2) {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--rightAlign');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--leftAlign');
            } else {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--leftAlign');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--rightAlign');
            }
        };

        var showSelect = function($select) {
            var selectWrapper = $select.parent();
            var optionsWrapper = $select.parent().find('.'+settings.prefix+'optionsWrapper');
            var overlay = $select.parent().find('.'+settings.prefix+'selectOverlay');

            //checken ob optionen unten kollidieren
            optionsWrapper.css('max-height', '');
            if ( optionsWrapper.hasClass(settings.prefix+'optionsWrapper--bottom') &&
                (optionsWrapper.height() + selectWrapper.offset().top + overlay.height() - window.scrollY) > $(window).height() ) {
                var maxHeight = $(window).height() - (selectWrapper.offset().top - window.scrollY + overlay.height()) - scrollBarOffset;
                optionsWrapper.css('max-height', maxHeight+'px');
            }
            optionsWrapper.addClass(settings.prefix+'optionsWrapper--visible');
            optionsWrapper.slideDown(300);
            selectWrapper.addClass(settings.prefix+'selectWrapper--open');
        };

        var hideSelect = function() {
            $('.'+settings.prefix+'optionsWrapper--visible')
                .removeClass(settings.prefix+'optionsWrapper--visible')
                .slideUp(300);
            $('.'+settings.prefix+'selectWrapper--open').removeClass(settings.prefix+'selectWrapper--open');
        };

        var setOptionsForWrapper = function($select) {
            var optionsWrapper = $select.parent().find('.'+settings.prefix+'optionsWrapper');

            //Optionen neu vom Select holen und in den wrapper schieben
            optionsWrapper.html('');
            $select.find('option').each(function(index, element) {
                $element = $(element);
                if ($element.attr('value') == $select.val()) {
                    optionsWrapper.append('<div class="'+settings.prefix+'optionsWrapper__option '+
                    settings.prefix+'optionsWrapper__option--selected" data-value="'+$element.attr('value')+'">'+$element.text()+'</div>');
                } else {
                    optionsWrapper.append('<div class="'+settings.prefix+'optionsWrapper__option" '+
                    'data-value="'+$element.attr('value')+'">'+$element.text()+'</div>');
                }
            });
        };

        this.each(function(index, select) {
            //Select holen und Div-Struktur entsprechend anpassen
            $(select).addClass(settings.prefix+'select');
            $(select).wrap('<div class="'+settings.prefix+'selectWrapper"></div>');
            $(select).parent().append('<div class="'+settings.prefix+'selectOverlay">'+
            '</div><div class="'+settings.prefix+'optionsWrapper"></div>');

            $(select).parent().on('click', function(e) {
                setOptionsForWrapper($(select));
                setOptionsWrapperPosition($(select));

                //Optionen sichtbar/unsichtbar schalten
                var $optionsWrapper = $(select).parent().find('.'+settings.prefix+'optionsWrapper');
                if ($optionsWrapper.hasClass(settings.prefix+'optionsWrapper--visible')) {
                    hideSelect($(select));
                    if ($(e.target).data('value')) {
                        $(select).val($(e.target).data('value'));
                        $(select).trigger('change');
                    }
                } else {
                    hideSelect($(select));
                    showSelect($(select));
                }
            });
        });

        //Initial Css laden und Clickhandler zum schließen der Selects bei Klick auf KEIN Select
        if (!initialized) {
            initialized = true;
            $(window).on('click', function(e) {
                if (!$(e.target).closest('.'+settings.prefix+'selectWrapper').length) {
                    hideSelect();
                }
            });
        }

        return this;
    };
}));
