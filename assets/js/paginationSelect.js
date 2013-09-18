// PaginationSelect CONSTRUCTOR AND PROTOTYPE
var PaginationSelect = function (element, options) {
	this.$element = $(element);
	this.options = $.extend(true, {}, $.fn.paginationSelect.defaults, options);

	this.options.dataOptions.count = _fnPaginationSelectCount( this.options.dataSource );

	var pageIndex = this.options.dataOptions.pageIndex;
	this.renderData(pageIndex);
};

var _fnPaginationSelectCount = function(dataSet) {
	return Object.keys( dataSet ).length;
}

var _fnPaginationSelectUpdatePageCount = function(pageSize, dataCount) {
	return Math.ceil( dataCount / pageSize );
}

var _fnPaginationSelectGetData = function(options) {
	if ( typeof options.filterData == 'undefined' ) {
		var data = options.dataSource;
		var dataCount = options.dataOptions.count;
	} else {
		var data = options.filterData;
		var dataCount = Object.keys(data).length;
	}

	return [data, dataCount];
}

var _fnPaginationSelectGetTemplate = function(template) {
	switch (template) {
		case 'nav':
			var content = '<div class="input-prepend input-append paginationSelectNav"><div class="btn-group">' +
				'<button class="btn paginationSelectPrev"><i class="icon-chevron-left"></i></button>' +
				'</div>' +
				'<input type="text" class="paginationSelectFilter" value="" placeholder="Filter" />' +
				'<div class="btn-group">' +
				'<button class="btn paginationSelectFilterGo">Go</button>' +
				'<button class="btn paginationSelectNext"><i class="icon-chevron-right"></i></button>' +
				'</div>' +
				'</div>';
			return content;
		break;

		case 'pagination':
			var content = '<div class="paginationSelectPagination"><div class="paginationSelectLeft">' +
				'<span class="paginationSelectCurrentPageLabel">Page&nbsp;</span>' +
				'<span class="paginationSelectCurrentPage"></span>' +
				'<span class="paginationSelectPaginationPageCountLabel">&nbsp;of&nbsp;</span>' + 
				'<span class="paginationSelectPageCount"></span>' + 
				'</div><div class="paginationSelectRight">' + 
				'<input type="text" class="paginationSelectGoToPage" value="" placeholder="Page #" />' +
				'<button class="btn paginationSelectGoToPageGo">Go</button>' +
				'</div>';
			return content;
		break;

		case 'optionsContainer':
			var content = '<div class="paginationSelectOptionsContainer"></div>';
			return content;
		break;

		case 'checkbox':
			var content = '<label class="checkbox"><input type="checkbox" value="{VALUE}"{SELECTED} data-pagination-select-id="{ID}"> {CAPTION}</label>';
			return content;
		break;
	}
}

var _fnPaginationSelectBindButtons = function(plugin, container) {
	$(container).find('.paginationSelectNext').bind('click', function(){ plugin.next(event) });
}

PaginationSelect.prototype = {
	constructor: PaginationSelect,

	renderData: function(pageIndex) {
		var self = this;
		var pageSize = self.options.pageSize;
		
		var dataArray = _fnPaginationSelectGetData(self.options);
		var data = dataArray[0];
		var dataCount = dataArray[1];

		var maxPages = _fnPaginationSelectUpdatePageCount(pageSize, dataCount);
		var items = (pageIndex === 1) ? $(data).splice(0, pageSize) : $(data).splice(pageIndex * pageSize - pageSize, pageSize);

		var container = self.options.container;

		// Fetch templates
		var navTemplate = _fnPaginationSelectGetTemplate('nav');
		var optionsContainerTemplate = _fnPaginationSelectGetTemplate('optionsContainer');
		var paginationTemplate = _fnPaginationSelectGetTemplate('pagination');

		// Build options
		var optionsTemplate = '';
		for(index = 0; index < items.length; index++) {
			var _optionTemplate = _fnPaginationSelectGetTemplate('checkbox');
			_optionTemplate = _optionTemplate.replace('{VALUE}', items[index].value);
			_optionTemplate = _optionTemplate.replace('{CAPTION}', items[index].title);
			_optionTemplate = _optionTemplate.replace('{ID}', index);
			if ( typeof items[index].selected !== 'undefined' && items[index].selected == 1 ) {
				_optionTemplate = _optionTemplate.replace('{SELECTED}', ' checked="checked"');
			} else {
				_optionTemplate = _optionTemplate.replace('{SELECTED}', '');
			}
			optionsTemplate += _optionTemplate;
		}

		// Create layout
		$(container).html(navTemplate);
		$(container).append(optionsContainerTemplate + paginationTemplate);
		$(container).find('.paginationSelectOptionsContainer').html(optionsTemplate);

		$(container).find('.paginationSelectCurrentPage').html(pageIndex);
		$(container).find('.paginationSelectPageCount').html(maxPages);

		// Functions
		if ( pageIndex === maxPages ) {
			$(container).find('.paginationSelectNext').prop('disabled', true);
			$(container).find('.paginationSelectNext').prop('disabled', true);
		}

		if ( (pageIndex + 1) > maxPages ) {
			$(container).find('.paginationSelectNext').prop('disabled', true);
		} else {
			$(container).find('.paginationSelectNext').bind('click', function(event){ self.next() });
		}

		if ( (pageIndex - 1) == 0 ) {
			$(container).find('.paginationSelectPrev').prop('disabled', true);
		} else {
			$(container).find('.paginationSelectPrev').bind('click', function(event){ self.prev() });
		}

		$(container).find('.paginationSelectFilterGo').bind('click', function(event){ self.filter() });

		$(container).find('.paginationSelectGoToPageGo').bind('click', function(event){ self.goToPage() });

		$(container + ' input[type="checkbox"]').bind('click', function(event){ self.clickCheckbox(event) });

		self.options.dataOptions.currentPage = pageIndex;
	},

	next: function() {
		var self = this;
		var pageIndex = self.options.dataOptions.currentPage;
		pageIndex = pageIndex + 1;
		
		self.renderData(pageIndex);
	},

	prev: function() {
		var self = this;
		var pageIndex = self.options.dataOptions.currentPage;
		pageIndex = pageIndex - 1;
		
		self.renderData(pageIndex);
	},

	goToPage: function(page) {
		var self = this;
		var pageIndex = page || parseInt( $(self.options.container).find('.paginationSelectGoToPage').val() );
		if (!page || isNaN(page)) return;

		self.renderData(pageIndex);
	},

	filter: function() {
		var self = this;
		pageIndex = 0;
		var data = self.options.dataSource;
		var filterData = [];
		var filterText = $( self.options.container ).find('.paginationSelectFilter').val();

		if (filterText !== '') {
			for(index = 0; index < Object.keys(data).length; index++) {
				var string = data[index].title.toString();
				if (string.indexOf(filterText) >= 0) {
					filterData.push( data[index] );
				}
			}
		} else {
			filterData = data;
		}

		self.options.filterData = filterData;
		
		self.renderData(pageIndex);
	},

	checked: function() {
		return this._getCheckbox(true);
	},

	unchecked: function() {
		return this._getCheckbox(false);
	},

	items: function() {
		return this._getCheckbox(undefined, true);
	},

	clickCheckbox: function(event) {
		var event = event || window.event;
		var self = this;
		var target = event.target;
		self.options.dataSource[ event.target.getAttribute('data-pagination-select-id') ].selected = (event.target.checked) ? 1 : 0;
	},

	// Private funcs
	_getCheckbox: function(isChecked, isAll) {
		var self = this;
		var results = [];
		var data = self.options.dataSource;

		for(index = 0; index < Object.keys(data).length; index++) {
			if ( isChecked === data[index].selected || isAll ) results.push( data[index] );
		}
		return results;
	}
};

// PaginationSelect PLUGIN DEFINITION
$.fn.paginationSelect = function (option, more) {
	var $this = $(this);
	var data = $this.data('paginationSelect');
	var options = typeof option === 'object' && option;

	if (!data) $this.data('paginationSelect', (data = new PaginationSelect(this, options)));
	if (typeof option === 'string') return data[option]();
	return this;
};

$.fn.paginationSelect.defaults = {
	dataOptions: { pageIndex: 1, pageCount: 1, count: 0, currentPage: 0 },
	pageSize: 5,
	//loadingHTML: '<div class="progress progress-striped active" style="width:50%;margin:auto;"><div class="bar" style="width:100%;"></div></div>',
	dataSource: null,
	container: null,
	filterData: undefined
};

$.fn.paginationSelect.Constructor = PaginationSelect;


/*

TODO:

1 - Make sure that retrieving checked / unchecked / items when in filtering mode works as it should.
2 - Make sure that checking and unchecking items works as it should (via data attr) when in filtering mode
3 - Write tests

*/