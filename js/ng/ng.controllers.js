'use strict';

angular.module('app.controllers', [])

/**
 *  Main Controller
 */
.controller('SmartAppController', function($scope) {
})

/**
 * This is the main controller which governs the CustomList model changes and callbacks.
 */
.controller('CustomListController', function($scope, $modal) {
	$scope.defaultItem  = 'Apple';	// Default selection from the list
	$scope.selectedMode = 2;		// The selection mode - edit / display

	/**
	 *	The CustomList data model. The data should be passed as an array of following objects.
	 *	{
	 *		icon:<value>,
	 *		name:<value>,
	 *		shortcut:<value>
	 *	}
	 */
	$scope.listOfFruits = [
		{icon:"img/banana.png", name:"Banana", shortcut:"Ctrl+B"},
		{icon:"img/apple.png", name:"Apple", shortcut:"Ctrl+A"},
		{icon:"img/blackberry.png", name:"Black Berry", shortcut:"Ctrl+L"},
		{icon:"img/grapes.png", name:"Grapes", shortcut:"Ctrl+G"},
		{icon:"img/peach.png", name:"Peach", shortcut:"Ctrl+P"},
		{icon:"img/strawberry.png", name:"Strawberry", shortcut:"Ctrl+S"}
	];

	//$scope.displayDefaultAction = function() {
	//	// Todo Display Alert box with the default label
	//	console.log('User clicked on default item ' + $scope.defaultItem);
	//};

	/**
	 * This method invokes once the corresponding callback received.
	 * This is called for all the selections (in edit or normal modes) being made at the CustomList
	 * @param data
	 */
	$scope.onCloseEventHandler = function(data) {
		//console.log('onClose event triggerred ' + $scope.defaultItem + ', ' + data + ', ' + $scope.selectedMode);
		if ($scope.selectedMode === 2) {
			$scope.defaultItem 	= data;			// Update the new default item during edit mode
			$scope.selectedMode	= 1;			// Set to display mode
		} else
			$scope.showModal(data);				// Display the selection in display mode
	};

	/**
	 *	This method invokes the modal dialog with the selected value.
	 *
	 * @param displayText
	 */
	$scope.showModal = function (displayText) {

		$scope.opts = {
			backdrop: true,
			backdropClick: true,
			dialogFade: false,
			keyboard: true,
			templateUrl: 'myModalContent.html',
			controller: ModalInstanceController,
			resolve: {} // empty storage
		};

		$scope.opts.resolve.item = function () {
			return angular.copy({name: displayText}); // pass name to Dialog
		};

		var modalInstance = $modal.open($scope.opts);

		modalInstance.result.then(function () {
			//on ok button press
		}, function () {
			//on cancel button press
			console.log("Modal Closed");
		});
	};
});

/**
 * Controller function for the modal dialog.
 * It's important this function should be outside of the normal application module. Hence, declared after the normal
 * definitions.
 *
 * @param $scope
 * @param $modalInstance
 * @param item
 * @constructor
 */
var ModalInstanceController = function($scope, $modalInstance, item) {
	$scope.item = item;

	$scope.ok = function () {
		$modalInstance.close();
	};

	//$scope.cancel = function () {
	//	$modalInstance.dismiss('cancel');
	//};
};

