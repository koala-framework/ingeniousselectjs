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
    var resizePuffer = 100; //Timeout in ms
    var styles = {
        select: 'width:100%;z-index:0;',
        selectWrapper: 'position: relative',
        selectOverlay: 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;',
        optionsWrapper: 'display:none;position:absolute;overflow:auto;z-index:2;',
        optionsWrapperOption: 'white-space:nowrap;cursor:pointer;'
    };

    $.fn.ingeniousselect = function(settings) {
        var resized = false;
        var resizeTimeout;

        if (typeof settings !== 'object') {
            settings = {};
        } else if (settings.prefix && settings.prefix.indexOf('-') != (settings.prefix.length - 1)) {
            settings.prefix = settings.prefix+'-';
        }

        settings = $.extend({
            prefix: 'ingeniousSelect-',
            minDeviceWidth: 768
        }, settings);

        var setOptionsWrapperPosition = function($select) {
            //Box oben oder unten anzeigen
            var optionsWrapper = $select.parent().find('.'+settings.prefix+'optionsWrapper');
            var selectOffset = $select.offset();

            if ((selectOffset.top + optionsWrapper.height() + $select.height() + scrollBarOffset - window.scrollY) > $(window).height() &&
                (selectOffset.top - window.scrollY) > $(window).height()/2) {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--bottom');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--top');
                $(optionsWrapper).css('bottom', '100%');
                $(optionsWrapper).css('top', 'auto');
            } else {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--top');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--bottom');
                $(optionsWrapper).css('top', '100%');
                $(optionsWrapper).css('bottom', 'auto');
            }
            //links oder rechtsbündig mit select
            if (selectOffset.left <= $(window).width()/2) {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--rightAlign');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--leftAlign');
                $(optionsWrapper).css('left', '0');
                $(optionsWrapper).css('right', 'auto');
            } else {
                optionsWrapper.removeClass(settings.prefix+'optionsWrapper--leftAlign');
                optionsWrapper.addClass(settings.prefix+'optionsWrapper--rightAlign');
                $(optionsWrapper).css('right', '0');
                $(optionsWrapper).css('left', 'auto');
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
            } else if ( optionsWrapper.hasClass(settings.prefix+'optionsWrapper--top') &&
                (selectWrapper.offset().top  - optionsWrapper.height()) < $(window).height() ) {
                var maxHeight = selectWrapper.offset().top - window.scrollY;
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

        var setOptionsAndGroupsForWrapper = function($select) {
            var optionsWrapper = $select.parent().find('.'+settings.prefix+'optionsWrapper');

            //Optionen bzw Gruppen neu vom Select holen und in den wrapper schieben
            optionsWrapper.html('');

            if ($select.find('optgroup').length) {
                $select.find('optgroup').each(function(index, optgroup) {
                    var optionGroup = $( "<div/>", {
                        class: settings.prefix + 'optionsWrapper__group ' + optgroup.className
                    });
                    var optionGroupText = $( "<div/>", {
                        class: settings.prefix + 'optionsWrapper__group__text',
                        text: optgroup.label
                    });
                    optionGroupText.appendTo( optionGroup.appendTo( optionsWrapper ) );
                    setOptions($select, $(optgroup), optionGroup);
                });
            } else {
                setOptions($select, $select, optionsWrapper);
            }
        };

        var setOptions = function($select, $parent, addToNode) {
            $parent.find('option').each(function(index, element) {
                var $element = $(element);
                var className = [settings.prefix + 'optionsWrapper__option' + ' ' + element.className];
                if ($element.attr('value') === $select.val()) {
                    className.push(settings.prefix+'optionsWrapper__option--selected');
                }
                if ($element.attr('disabled')) {
                    className.push(settings.prefix + 'optionsWrapper__option--disabled');
                }

                $( "<div/>", {
                    class: className.join(' '),
                    text: $element.text(),
                    'data-value': $element.attr('value'),
                    style: styles.optionsWrapperOption
                }).appendTo( addToNode );
            });
        };

        var useNativeSelect = function(selects) {
            if ($(selects[0]).parent().data('hasClickEvent') === false) {
                return;
            } else {
                $(selects[0]).parent().data('hasClickEvent', false);
            }

            selects.each(function(index, select) {
                $(select).parent().off('click.ingeniousselect');
                var selectWrapper = $(select).parent();

                if (!selectWrapper.hasClass(settings.prefix+'selectWrapper--useNative')) {
                    selectWrapper.addClass(settings.prefix+'selectWrapper--useNative');
                    selectWrapper.find('.'+settings.prefix+'selectOverlay').css('z-index', '-1');
                }
            });
        };

        var useIngeniousSelect = function(selects) {
            if ($(selects[0]).parent().data('hasClickEvent') === true) {
                return;
            } else {
                $(selects[0]).parent().data('hasClickEvent', true);
            }


            selects.each(function(index, select) {
                addClickHandler(select);
                var selectWrapper = $(select).parent();

                if (selectWrapper.hasClass(settings.prefix+'selectWrapper--useNative')) {
                    selectWrapper.removeClass(settings.prefix+'selectWrapper--useNative');
                    selectWrapper.find('.'+settings.prefix+'selectOverlay').css('z-index', '1');
                }
            });
        };

        var onResize = (function() {
            if (!resized) {
                resized = true;
                resizeTimeout = setTimeout((function () {
                    clearTimeout(resizeTimeout);

                    if ($(window).width() < settings.minDeviceWidth) {
                        useNativeSelect(this);
                    } else {
                        useIngeniousSelect(this);
                    }
                    resized = false;
                }).bind(this), resizePuffer);
            }
        }).bind(this);

        var addClickHandler = function(select) {
            $(select).parent().data('hasClickEvent', true);

            $(select).parent().on('click.ingeniousselect', function(e) {
                if (select.disabled) return false;
                setOptionsAndGroupsForWrapper($(select));
                setOptionsWrapperPosition($(select));

                //Optionen sichtbar/unsichtbar schalten
                var $optionsWrapper = $(select).parent().find('.'+settings.prefix+'optionsWrapper');
                if ($optionsWrapper.hasClass(settings.prefix+'optionsWrapper--visible')) {
                    hideSelect($(select));
                    if ($(e.target).hasClass(settings.prefix + 'optionsWrapper__option')
                        && $(e.target).data('value') != $(select).val())
                    {
                        $(select).val($(e.target).data('value'));
                        $(select).trigger('change');
                    }
                } else {
                    hideSelect($(select));
                    showSelect($(select));
                }
            });
        };

        this.each(function(index, select) {
            if (!$(select).data('ingenousselect-initialized')) {
                //Select holen und Div-Struktur entsprechend anpassen
                select.style = styles.select;
                $(select).addClass(settings.prefix+'select');
                $(select).wrap('<div class="'+settings.prefix+'selectWrapper" style="'+styles.selectWrapper+'"></div>');
                $(select).parent().append('<div class="'+settings.prefix+'selectOverlay" style="'+styles.selectOverlay+'">'+
                    '</div><div class="'+settings.prefix+'optionsWrapper" style="'+styles.optionsWrapper+'"></div>');
                $(select).data('ingenousselect-initialized', true);
            } else {
                console.warn('This selectelement ist already initialized. Every selectelement can only be initialized once.', select);
            }
        });

        $(window).resize((function() {
            onResize();
        }).bind(this));
        onResize();

        //Initial Css laden und Clickhandler zum schließen der Selects bei Klick auf KEIN Select
        if (!initialized) {
            initialized = true;
            $(window).on('click', function(e) {
                var closestSelect = $(e.target).closest('.' + settings.prefix + 'selectWrapper');
                var targetSelectId = e.target.getAttribute('for');

                if (!closestSelect.length && !targetSelectId) {
                    hideSelect();
                }
            });
        }

        return this;
    };
}));
