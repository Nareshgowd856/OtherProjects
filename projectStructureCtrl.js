(function (app) {
    'use strict';
    app.controller('projectStructureCtrl', projectStructureCtrl);
    projectStructureCtrl.$inject = ['$scope', 'apiService', 'membershipService', 'notificationService', '$rootScope', '$location', '$filter', '$modal'];
    function projectStructureCtrl($scope, apiService, membershipService, notificationService, $rootScope, $location, $filter, $modal) {

        $scope.projectMasterList = [];
        $scope.showGrid = true;
        $scope.showform = true;

        $scope.showform = function () {
            $scope.showGrid = false;
            $scope.showform = false;
        };
        $scope.hideForm = function () {
            $route.reload();
            $scope.showGrid = true;
            $scope.showform = true;
        };

        $scope.OnchangeButton = function () {
            var modalInstance = $modal.open({
                templateUrl: 'Scripts/Landing/passwordVerification.html',
                controller: 'passwordVerificationCtrl',
                scope: $scope,
            });
        };

        LoadProjectMasterList();
        function LoadProjectMasterList() {
            apiService.get('api/ProjectMaster/GetProjectMasterList', null, projectMasterLoadComplete, projectMasterLoadFailed);
        };
        function projectMasterLoadComplete(response) {
            $scope.projectMasterList = response.data;
        }

        function projectMasterLoadFailed(response) {
            notificationService.displayError("Unable to Get Project Master Data");
        }


    }
})(angular.module('common.core'));