;(function ($) {
    var S2 = jQuery.fn.select2.amd;

    //select2 中文
    S2.define('select2/i18n/zh_CN', [], function () {
        // English
        return {
            errorLoading: function () {
                return '加载失败...';
            },
            inputTooLong: function (args) {
                var overChars = args.input.length - args.maximum;
                var message = '请删除' + overChars + '个字符';
                return message;
            },
            inputTooShort: function (args) {
                var remainingChars = args.minimum - args.input.length;

                var message = '请输入' + remainingChars + '个或更多字符';

                return message;
            },
            loadingMore: function () {
                return '加载更多内容…';
            },
            maximumSelected: function (args) {
                var message = '你最多选择' + args.maximum + '项';
                return message;
            },
            noResults: function () {
                return '找不到结果';
            },
            searching: function () {
                return '查找中…';
            }
        };
    });

    //自定义插件
    S2.define('select2s/dropdown', [
        'jquery',
        'select2/utils',
        'select2/dropdown'
    ], function ($, Utils, _Dropdown) {
        function Dropdown($element, options) {
            this.$element = $element;
            this.options = options;

            Dropdown.__super__.constructor.__super__.constructor.call(this);
        }

        Utils.Extend(Dropdown, _Dropdown);

        Dropdown.prototype.render = function () {
            var $dropdown = $(
                '<span class="select2-dropdown select2s-dropdown">' +
                '<span class="select2-results"></span>' +
                '</span>'
            );

            $dropdown.attr('dir', this.options.get('dir'));

            this.$dropdown = $dropdown;

            return $dropdown;
        };

        return Dropdown;
    });

    S2.define('select2s/dropdown/attachBody', [
        'jquery',
        'select2/utils',
        'select2/dropdown/attachBody'
    ], function ($, Utils, _AttachBody) {

        function AttachBody(decorated, $element, options) {
            this.$dropdownParent = options.get('dropdownParent') || $(document.body);

            decorated.call(this, $element, options);
        }

        Utils.Extend(AttachBody, _AttachBody);

        AttachBody.prototype._resizeDropdown = function () {
            var css = {
                right: '-' + this.$container.outerWidth(false) + 'px',
                width: this.$container.outerWidth(false) + 'px'
            };

            if (this.options.get('dropdownAutoWidth')) {
                css.minWidth = css.width;
                css.position = 'relative';
                css.width = 'auto';
            }

            this.$dropdown.css(css);
        };


        return AttachBody;
    });

    S2.define('select2s/results', [
        'jquery',
        'select2/utils',
        'select2/results'
    ], function ($, Utils, _Results) {
        function Results($element, options, dataAdapter) {
            this.$element = $element;
            this.data = dataAdapter;
            this.options = options;

            Results.__super__.constructor.__super__.constructor.call(this);
        }

        Utils.Extend(Results, _Results);

        Results.prototype.append = function (data) {
            this.hideLoading();

            var $options = [];

            if (data.results == null || data.results.length === 0) {
                if (this.$results.children().length === 0) {
                    this.trigger('results:message', {
                        message: 'noResults'
                    });
                }

                return;
            }

            data.results = this.sort(data.results);

            var grouping = this.options.get('grouping');
            var $options = grouping.apply(this, [data.results]);

            this.$results.append($options);
        };

        Results.prototype.option = function (data) {
            var option = document.createElement('li');
            option.className = 'select2-results__option';

            var attrs = {
                'role': 'treeitem',
                'aria-selected': 'false'
            };

            if (data.disabled) {
                delete attrs['aria-selected'];
                attrs['aria-disabled'] = 'true';
            }

            if (data.id == null) {
                delete attrs['aria-selected'];
            }

            if (data._resultId != null) {
                option.id = data._resultId;
            }

            if (data.title) {
                option.title = data.title;
            }

            if (data.children) {
                attrs.role = 'group';
                attrs['aria-label'] = data.text;
                delete attrs['aria-selected'];
            }

            for (var attr in attrs) {
                var val = attrs[attr];

                option.setAttribute(attr, val);
            }

            if (data.children) {
                var $option = $(option);

                var $parentContainer = $('<ul></ul>', {
                    'class': 'select2-results__group select2-results__options select2-results__options--nested'
                });
                var child = $.extend({}, data);
                delete child.children;
                var $child = this.option(child);
                $parentContainer.append($child);

                var $children = [];

                for (var c = 0; c < data.children.length; c++) {
                    var child = data.children[c];

                    var $child = this.option(child);

                    $children.push($child);
                }

                var $childrenContainer = $('<ul></ul>', {
                    'class': 'select2-results__options select2-results__options--nested'
                });

                $childrenContainer.append($children);


                $option.append($parentContainer);
                $option.append($childrenContainer);

                $.data($parentContainer, 'data', data);
            } else {
                this.template(data, option);
            }

            $.data(option, 'data', data);

            return option;
        };

        return Results;
    });

    S2.define('select2s/defaults', [
        'jquery',
        'require',

        './results',

        'select2/selection/single',
        'select2/selection/multiple',
        'select2/selection/placeholder',
        'select2/selection/allowClear',
        'select2/selection/search',
        'select2/selection/eventRelay',

        'select2/utils',
        'select2/translation',
        'select2/diacritics',

        'select2/data/select',
        'select2/data/array',
        'select2/data/ajax',
        'select2/data/tags',
        'select2/data/tokenizer',
        'select2/data/minimumInputLength',
        'select2/data/maximumInputLength',
        'select2/data/maximumSelectionLength',

        './dropdown',
        'select2/dropdown/search',
        'select2/dropdown/hidePlaceholder',
        'select2/dropdown/infiniteScroll',
        './dropdown/attachBody',
        'select2/dropdown/minimumResultsForSearch',
        'select2/dropdown/selectOnClose',
        'select2/dropdown/closeOnSelect',

        'select2/i18n/en'
    ], function ($, require,
                 ResultsList,
                 SingleSelection, MultipleSelection, Placeholder, AllowClear,
                 SelectionSearch, EventRelay,
                 Utils, Translation, DIACRITICS,
                 SelectData, ArrayData, AjaxData, Tags, Tokenizer,
                 MinimumInputLength, MaximumInputLength, MaximumSelectionLength,
                 Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
                 AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,
                 EnglishTranslation) {
        function Defaults() {
            this.reset();
        }

        Defaults.prototype.apply = function (options) {
            options = $.extend(true, {}, this.defaults, options);

            if (options.dataAdapter == null) {
                if (options.ajax != null) {
                    options.dataAdapter = AjaxData;
                } else if (options.data != null) {
                    options.dataAdapter = ArrayData;
                } else {
                    options.dataAdapter = SelectData;
                }

                if (options.minimumInputLength > 0) {
                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MinimumInputLength
                    );
                }

                if (options.maximumInputLength > 0) {
                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumInputLength
                    );
                }

                if (options.maximumSelectionLength > 0) {
                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumSelectionLength
                    );
                }

                if (options.tags) {
                    options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
                }

                if (options.tokenSeparators != null || options.tokenizer != null) {
                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Tokenizer
                    );
                }

                if (options.query != null) {
                    var Query = require(options.amdBase + 'compat/query');

                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Query
                    );
                }

                if (options.initSelection != null) {
                    var InitSelection = require(options.amdBase + 'compat/initSelection');

                    options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        InitSelection
                    );
                }
            }

            if (options.resultsAdapter == null) {
                options.resultsAdapter = ResultsList;

                if (options.ajax != null) {
                    options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        InfiniteScroll
                    );
                }

                if (options.placeholder != null) {
                    options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        HidePlaceholder
                    );
                }

                if (options.selectOnClose) {
                    options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        SelectOnClose
                    );
                }
            }

            if (options.dropdownAdapter == null) {
                if (options.multiple) {
                    options.dropdownAdapter = Dropdown;
                } else {
                    var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

                    options.dropdownAdapter = SearchableDropdown;
                }

                if (options.minimumResultsForSearch !== 0) {
                    options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        MinimumResultsForSearch
                    );
                }

                if (options.closeOnSelect) {
                    options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        CloseOnSelect
                    );
                }

                if (
                    options.dropdownCssClass != null ||
                    options.dropdownCss != null ||
                    options.adaptDropdownCssClass != null
                ) {
                    var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

                    options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        DropdownCSS
                    );
                }

                options.dropdownAdapter = Utils.Decorate(
                    options.dropdownAdapter,
                    AttachBody
                );
            }

            if (options.selectionAdapter == null) {
                if (options.multiple) {
                    options.selectionAdapter = MultipleSelection;
                } else {
                    options.selectionAdapter = SingleSelection;
                }

                // Add the placeholder mixin if a placeholder was specified
                if (options.placeholder != null) {
                    options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        Placeholder
                    );
                }

                if (options.allowClear) {
                    options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        AllowClear
                    );
                }

                if (options.multiple) {
                    options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        SelectionSearch
                    );
                }

                if (
                    options.containerCssClass != null ||
                    options.containerCss != null ||
                    options.adaptContainerCssClass != null
                ) {
                    var ContainerCSS = require(options.amdBase + 'compat/containerCss');

                    options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        ContainerCSS
                    );
                }

                options.selectionAdapter = Utils.Decorate(
                    options.selectionAdapter,
                    EventRelay
                );
            }

            if (typeof options.language === 'string') {
                // Check if the language is specified with a region
                if (options.language.indexOf('-') > 0) {
                    // Extract the region information if it is included
                    var languageParts = options.language.split('-');
                    var baseLanguage = languageParts[0];

                    options.language = [options.language, baseLanguage];
                } else {
                    options.language = [options.language];
                }
            }

            if ($.isArray(options.language)) {
                var languages = new Translation();
                options.language.push('en');

                var languageNames = options.language;

                for (var l = 0; l < languageNames.length; l++) {
                    var name = languageNames[l];
                    var language = {};

                    try {
                        // Try to load it with the original name
                        language = Translation.loadPath(name);
                    } catch (e) {
                        try {
                            // If we couldn't load it, check if it wasn't the full path
                            name = this.defaults.amdLanguageBase + name;
                            language = Translation.loadPath(name);
                        } catch (ex) {
                            // The translation could not be loaded at all. Sometimes this is
                            // because of a configuration problem, other times this can be
                            // because of how Select2 helps load all possible translation files.
                            if (options.debug && window.console && console.warn) {
                                console.warn(
                                    'Select2: The language file for "' + name + '" could not be ' +
                                    'automatically loaded. A fallback will be used instead.'
                                );
                            }

                            continue;
                        }
                    }

                    languages.extend(language);
                }

                options.translations = languages;
            } else {
                var baseTranslation = Translation.loadPath(
                    this.defaults.amdLanguageBase + 'en'
                );
                var customTranslation = new Translation(options.language);

                customTranslation.extend(baseTranslation);

                options.translations = customTranslation;
            }

            return options;
        };

        Defaults.prototype.reset = function () {
            function stripDiacritics(text) {
                // Used 'uni range + named function' from http://jsperf.com/diacritics/18
                function match(a) {
                    return DIACRITICS[a] || a;
                }

                return text.replace(/[^\u0000-\u007E]/g, match);
            }

            function matcher(params, data) {
                // Always return the object if there is nothing to compare
                if ($.trim(params.term) === '') {
                    return data;
                }

                // Do a recursive check for options with children
                if (data.children && data.children.length > 0) {
                    // Clone the data object if there are children
                    // This is required as we modify the object to remove any non-matches
                    var match = $.extend(true, {}, data);

                    // Check each child of the option
                    for (var c = data.children.length - 1; c >= 0; c--) {
                        var child = data.children[c];

                        var matches = matcher(params, child);

                        // If there wasn't a match, remove the object in the array
                        if (matches == null) {
                            match.children.splice(c, 1);
                        }
                    }

                    // If any children matched, return the new object
                    if (match.children.length > 0) {
                        return match;
                    }

                    // If there were no matching children, check just the plain object
                    return matcher(params, match);
                }

                var original = stripDiacritics(data.text).toUpperCase();
                var term = stripDiacritics(params.term).toUpperCase();

                // Check if the text contains the term
                if (original.indexOf(term) > -1) {
                    return data;
                }

                // If it doesn't contain the term, don't return anything
                return null;
            }

            this.defaults = {
                amdBase: './',
                amdLanguageBase: './i18n/',
                closeOnSelect: true,
                debug: false,
                dropdownAutoWidth: false,
                escapeMarkup: Utils.escapeMarkup,
                language: EnglishTranslation,
                matcher: matcher,
                minimumInputLength: 0,
                maximumInputLength: 0,
                maximumSelectionLength: 0,
                minimumResultsForSearch: 0,
                selectOnClose: false,
                sorter: function (data) {
                    return data;
                },
                grouping: function (results) {
                    var $options = [];
                    for (var d = 0; d < results.length; d++) {
                        var $option = this.option(results[d]);
                        $options.push($option);
                    }
                    return $options
                },
                templateResult: function (result) {
                    return result.text;
                },
                templateSelection: function (selection) {
                    return selection.text;
                },
                theme: 'default',
                width: 'resolve'
            };
        };

        Defaults.prototype.set = function (key, value) {
            var camelKey = $.camelCase(key);

            var data = {};
            data[camelKey] = value;

            var convertedData = Utils._convertData(data);

            $.extend(this.defaults, convertedData);
        };

        var defaults = new Defaults();

        return defaults;
    });

    S2.define('select2s/options', [
        'require',
        'jquery',
        './defaults',
        'select2/utils',
        'select2/options'
    ], function (require, $, Defaults, Utils, _Options) {
        function Options(options, $element) {
            this.options = options;

            if ($element != null) {
                this.fromElement($element);
            }

            this.options = Defaults.apply(this.options);

            if ($element && $element.is('input')) {
                var InputCompat = require(this.get('amdBase') + 'compat/inputData');

                this.options.dataAdapter = Utils.Decorate(
                    this.options.dataAdapter,
                    InputCompat
                );
            }
        }

        Utils.Extend(Options, _Options);

        return Options;
    });

    S2.define('select2s/core', [
        'jquery',
        './options',
        'select2/utils',
        'select2/keys',
        'select2/core'
    ], function ($, Options, Utils, KEYS, _Select2) {
        var Select2 = function ($element, options) {
            if ($element.data('select2') != null) {
                $element.data('select2').destroy();
            }

            this.$element = $element;

            this.id = this._generateId($element);

            options = options || {};

            this.options = new Options(options, $element);

            Select2.__super__.constructor.__super__.constructor.call(this);

            // Set up the tabindex

            var tabindex = $element.attr('tabindex') || 0;
            $element.data('old-tabindex', tabindex);
            $element.attr('tabindex', '-1');

            // Set up containers and adapters

            var DataAdapter = this.options.get('dataAdapter');
            this.dataAdapter = new DataAdapter($element, this.options);

            var $container = this.render();

            this._placeContainer($container);

            var SelectionAdapter = this.options.get('selectionAdapter');
            this.selection = new SelectionAdapter($element, this.options);
            this.$selection = this.selection.render();

            this.selection.position(this.$selection, $container);

            var DropdownAdapter = this.options.get('dropdownAdapter');
            this.dropdown = new DropdownAdapter($element, this.options);
            this.$dropdown = this.dropdown.render();

            this.dropdown.position(this.$dropdown, $container);

            var ResultsAdapter = this.options.get('resultsAdapter');
            this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
            this.$results = this.results.render();

            this.results.position(this.$results, this.$dropdown);

            // Bind events

            var self = this;

            // Bind the container to all of the adapters
            this._bindAdapters();

            // Register any DOM event handlers
            this._registerDomEvents();

            // Register any internal event handlers
            this._registerDataEvents();
            this._registerSelectionEvents();
            this._registerDropdownEvents();
            this._registerResultsEvents();
            this._registerEvents();

            // Set the initial state
            this.dataAdapter.current(function (initialData) {
                self.trigger('selection:update', {
                    data: initialData
                });
            });

            // Hide the original select
            $element.addClass('select2-hidden-accessible');
            $element.attr('aria-hidden', 'true');

            // Synchronize any monitored attributes
            this._syncAttributes();

            $element.data('select2', this);
        };

        Utils.Extend(Select2, _Select2);

        return Select2;
    });

    S2.define('jquery.select2s', [
        'jquery',
        'jquery-mousewheel',

        './select2s/core',
        './select2s/defaults'
    ], function ($, _, Select2, Defaults) {
        if ($.fn.select2s == null) {
            // All methods that should return the element
            var thisMethods = ['open', 'close', 'destroy'];

            $.fn.select2s = function (options) {
                options = options || {};

                if (typeof options === 'object') {
                    this.each(function () {
                        var instanceOptions = $.extend(true, {}, options);

                        var instance = new Select2($(this), instanceOptions);
                    });

                    return this;
                } else if (typeof options === 'string') {
                    var ret;
                    var args = Array.prototype.slice.call(arguments, 1);

                    this.each(function () {
                        var instance = $(this).data('select2');

                        if (instance == null && window.console && console.error) {
                            console.error(
                                'The select2(\'' + options + '\') method was called on an ' +
                                'element that is not using Select2.'
                            );
                        }

                        ret = instance[options].apply(instance, args);
                    });

                    // Check if we should be returning `this`
                    if ($.inArray(options, thisMethods) > -1) {
                        return this;
                    }

                    return ret;
                } else {
                    throw new Error('Invalid arguments for Select2: ' + options);
                }
            };
        }

        if ($.fn.select2s.defaults == null) {
            $.fn.select2s.defaults = Defaults;
        }

        return Select2;
    });


    // Autoload the jQuery bindings
    // We know that all of the modules exist above this, so we're safe
    var select2 = S2.require('jquery.select2s');

    // Return the Select2 instance for anyone who is importing it.
    return select2;
})(jQuery);