'use strict';

// ============================================================================
// 	APPLICATION DIRECTIVES DECLARATION
// 	- Main Directives
// ============================================================================
angular.module('app.directives', [])

/**
 * CustomSelect list controller directive definition.
 */
.directive('customSelect', function($timeout, $window, $sce) {
	return {
		restrict: 'A',					// Can be used only as an attribute
		replace: true,

		// Isolate scope definitions. This allows the same control can be used multiple times in a single Angular application.
		scope: {
			// Models
			defaultItem		: '=',		// Default element - Direct model binding / two-way binding
			listModel		: '=',		// CUstom List Elements - Direct model binding / two-way binding
			selectedMode	: '=',		// Selected mode: 1 = normal, 2 = settings - Direct model binding / two-way binding

			// Callbacks
			onClose         : '&'		// on close callback - Behaviour binding / Method binding
		},

		// The template will generate the component layout and the style application
		template:
		'<span class="customSelect inlineBlock">' +
			'<div class="btn-group">' +
				'<a id="customSelectBaseButton" class="btn btn-default" ng-click="displayDefaultAction(selectedItem.name)">' +
					'<img src={{selectedItem.icon}} />&nbsp;{{selectedItem.name}}' +
				'</a>' +
				'<a class="btn btn-default" data-toggle="dropdown" href="javascript:void(0);">' +
					'<div class="row btn-group">' +
						'<span id="btnSettings" class="col-sm-12 col-md-12 col-lg-12 fa fa-cog" ng-click="setMode(2);' +
						' displayHideList($event)"></span>' +
						'<span id="btnCaret" class="col-sm-12 col-md-12 col-lg-12 fa fa-caret-down" ng-click="setMode(1);' +
						' displayHideList($event)"></span>' +
					'</div>' +
				'</a>' +
			'</div>' +
			'<div class="customListContainer">' +
				// Normal display mode elements
				'<div ng-repeat="item in filteredModel" class="customSelectItem" ng-if="!isEditingMode()" ng-click="displaySelectedItem(item.name)">' +
					'<span>' +
						'&nbsp;&nbsp;&nbsp;<img src={{item.icon}} />&nbsp;&nbsp;&nbsp;' +
						'<strong>{{item.name}}</strong>' +
						'&nbsp;&nbsp;&nbsp;&nbsp;<span class="pull-right">{{item.shortcut}}&nbsp;&nbsp;&nbsp;</span>' +
					'</span>' +
				'</div>' +

				// Editing mode elements
				'<div ng-repeat="item in filteredModel" class="editSelectItem" ng-if="isEditingMode()" ng-click="displayCustomAction(item.name)">' +
					'<span>' +
						'&nbsp;&nbsp;&nbsp;<img src={{item.icon}} />&nbsp;&nbsp;&nbsp;' +
						'<strong>{{item.name}}</strong>' +
						'&nbsp;&nbsp;&nbsp;&nbsp;<span class="pull-right">{{item.shortcut}}&nbsp;&nbsp;&nbsp;</span>' +
					'</span>' +
				'</div>' +
			'</div>' +
		'</span>',

		// The actions and behaviour implementation to the defined HTML control
		link: function($scope, element, attrs) {
			$scope.selectedItem    = null;							// Selected item
			$scope.elemCaretButton = null;							// Display button element
			$scope.elemEditButton  = null;							// Edit button element
			$scope.selectedMode	   = null;							// Mode of operation; 1: normal, 2: Edit
			$scope.isItemGotChanged= false;							// Dirty reading status

			/**
			 * This method invokes as soon as a list selection changes at the edit mode. With the help of this,
			 * the default selected element excludes from the current selection list.
			 * @returns {Array}
			 */
			$scope.applyFilter = function() {
				$scope.filteredModel   = [];							// Filtered list model which will occupy the list

				var i = 0;

				if ( typeof $scope.listModel === 'undefined' ) {
					return [];											// The list is empty
				}

				for ( i = $scope.listModel.length - 1; i >= 0; i-- ) {
					if ($scope.listModel[i].name === $scope.defaultItem)
						continue;										// Remove the default item from the list model
					else {
						$scope.filteredModel.push($scope.listModel[i]);	// Add everything else to the list model
					}
				}
			};

			/**
			 * Returns the selected element (collection) from the data model.
			 */
			$scope.getSelectedItem = function() {
				var j = 0;
				if (typeof $scope.defaultItem !== 'undefined') {
					for (j = $scope.listModel.length - 1; j >= 0; j-- ) {
						if ($scope.listModel[j].name === $scope.defaultItem) {
							$scope.selectedItem = $scope.listModel[j];	// Add everything else to the list model
						}
					}
				}
			};

			/**
			 * Set the working mode
			 * 	1 - Display mMode
			 * 	2 - Edit Mode
			 *
			 * @param mode
			 */
			$scope.setMode = function(mode) {
				$scope.selectedMode = mode;
			};

			/**
			 * Checks whether the editing mode is enabled
			 * @returns {boolean}
			 */
			$scope.isEditingMode = function() {
				return $scope.selectedMode === 2;
			};

			/**
			 * This show/hide list elements based on click event.
			 * @param e
			 */
			$scope.displayHideList = function(e) {

				// Extract the customlist base layer
				$scope.checkBoxLayer = element.children()[1];

				// Extract the two buttons
				$scope.elemEditButton 	= element.children()[0];	// Edit button
				$scope.elemCaretButton 	= element.children()[1];	// Display button

				// Dispose the CustomSelect List - All the settings have to be set to default
				if ( angular.element( $scope.checkBoxLayer ).hasClass( 'show' )) {
					$scope.disposeCustomList();

					// close callback
					if ($scope.isItemGotChanged)
						$scope.onClose( { data: element } );
				} else {
					// Open the CustomSelect List. - Based on the selection mode, the theme will get change
					angular.element( $scope.checkBoxLayer ).addClass( 'show' );
					angular.element( document ).bind( 'click', $scope.externalClickListener );

					if ($scope.selectedMode == 2) {
						console.log('*** Edit Mode Selected! Applying theme changes');
						angular.element( $scope.elemEditButton ).addClass( 'buttonClicked' );
						angular.element(document.getElementById('customSelectBaseButton')).addClass('editModeBaseButton');
					} else {
						angular.element( $scope.elemCaretButton ).addClass( 'buttonClicked' );
						console.log('*** Display Mode Selected! ' + $scope.elemCaretButton);
					}
				}
			};

			// If any clicks observe outside of the list, the list should be automatically closed.
			// The onClose callback will not fire here as it may cause stack overrun due to unnecessary recursive calling
			$scope.externalClickListener = function( e ) {
				$scope.disposeCustomList();
			};

			/**
			 * Disposes the customlist and revert back the style changes made.
			 */
			$scope.disposeCustomList = function() {
				angular.element( $scope.checkBoxLayer.previousSibling ).removeClass( 'buttonClicked' );
				angular.element( $scope.checkBoxLayer ).removeClass( 'show' );
				angular.element( document ).unbind( 'click', $scope.externalClickListener );

				// If in edit mode
				if ($scope.selectedMode === 2) {
					angular.element(document.getElementById('customSelectBaseButton')).removeClass('editModeBaseButton');
					angular.element(document.getElementById('customSelectBaseButton')).addClass('button');
					console.log('*** Disposing list - theme set to default ');
				}

				$scope.selectedMode = 1;			// Set to default value
			};

			/**
			 * Set a callback to display the default action when the user clicks on the Base Button
			 * @param selectedName
			 */
			$scope.displayDefaultAction = function(selectedName) {
				console.log('Selected item: ' + selectedName + ', ' + $scope.selectedMode);
				$scope.onClose({
					data: selectedName
					//mode: $scope.selectedMode
				});
			};

			/**
			 * Set a callback to display the selected item in a modal window
			 * @param selectedName
			 */
			$scope.displaySelectedItem = function(selectedName) {
				console.log('Selected item: ' + selectedName);
				$scope.onClose({
					data: selectedName
					//mode: $scope.selectedMode
				});
				$scope.disposeCustomList();
			};

			/**
			 * Set a callback to display the selected item in a modal window and changes the default selection to the
			 * new value
			 * @param selectedName
			 */
			$scope.displayCustomAction = function(selectedName) {
				if ($scope.defaultItem !== selectedName) {
					$scope.isItemGotChanged = true;

					$scope.defaultItem = selectedName;
					$scope.getSelectedItem();
					$scope.applyFilter();

					$scope.onClose({
						data: $scope.defaultItem
						//mode: $scope.selectedMode
					});
					$scope.disposeCustomList();
				}
			};

			/**
			 * Watch for data model changes and execute related methods
			 */
			$scope.$watch('listModel', function(newVal) {
				console.log('<CustomList> Data model change detected');
				$scope.applyFilter();
				$scope.getSelectedItem();
			});
		}
	};
});