(function (app) {
    'use strict';

    app.controller('executetestCtrl', executetestCtrl);

    executetestCtrl.$inject = ['$scope', '$rootScope', 'apiService', 'notificationService', '$filter', '$http', '$modal'];

    function executetestCtrl($scope, $rootScope, apiService, notificationService, $filter, $http, $modal) {

        $scope.projectid = '';
        $scope.moduleid = '';
        $scope.projectname = '';
        $scope.ProjectsList = '';
        $scope.RefMaster = $rootScope.ReferenceMasterData;
        $rootScope.buglist = $scope.BugsList;
        $scope.steps = {};
        $scope.testcasecount = 0;
        $scope.issuecount = 0;

        $scope.testViewPopup = testViewPopup;
        function testViewPopup(bug) {
            for (var i = 0; i < $scope.TestCasesList.length; i++) {
                if ($scope.TestCasesList[i].id == bug.testcase_id) {
                    $scope.testcase_id = $scope.TestCasesList[i].testcase_id;
                }
            }
            var modalInstance = $modal.open({
                templateUrl: 'Scripts/Bugs/ViewBugDetail.html',
                controller: 'ViewBugDetailCtrl',
                scope: $scope,
                resolve: {
                    bug: function () { return bug },
                    testcase_id: function () { return $scope.testcase_id },
                }
            })
        }
        /////////////
        //$scope.GetBugID = function GetBugID() {
        //    apiService.post('api/Issue/GenerateBugID/' + $scope.testcase.projectid + '/' + $scope.testcase.moduleid, null, GetBugIDComplete, GetBugIDFailed);
        //};

        //function GetBugIDComplete(response) {
        //    $scope.issueid = '';
        //    $scope.issueid = response.data;
        //    $scope.x = true;
        //}

        //function GetBugIDFailed(response) {
        //    notificationService.displayError('Module Load Failed. Please try again !');
        //}
        //////////////
        LoadMaster();

        function LoadMaster() {
            //apiService.get('api/MasterData/GetProjectsList', null, ProjectsListLoadComplete, ProjectsListLoadFailed);
            apiService.get('api/Projects/GetProjectsDetailsData/' + $rootScope.user_id, null, ProjectsLoadComplete, ProjectsLoadFailed);
        }
        function ProjectsLoadComplete(response) {
            $scope.projectsList = response.data;
        }

        function ProjectsLoadFailed(response) {
            notificationService.displayError("Unable to Get Projects List");
        }

        $scope.GetModulesList = GetModulesList;
        function GetModulesList() {
            $scope.testphaseid = '';
            var projectid = $scope.projects.id;
            if (projectid == null || projectid == undefined)
            { projectid = '0'; }
            apiService.get('api/Projects/GetModules/' + projectid, null, GetModulesListComplete, GetModulesListFailed);

            var projectid = $scope.projects.id;
            if (projectid == null || projectid == undefined)
            { projectid = '0'; }
            apiService.post('api/TestCase/GetTestCasesList/' + projectid, null, GetTestCaseListComplete, GetTestCaseListFailed);
            apiService.get('api/Issue/GetBugs/' + projectid, null, BugsListLoadComplete, BugsListLoadFailed);
        };

        function GetModulesListComplete(response) {
            $scope.ModuleList = response.data;
        }

        function GetModulesListFailed(response) {
            notificationService.displayError('Module Load Failed. Please try again !');
        }

        function GetTestCaseListComplete(response) {
            $scope.TestCasesList = response.data;
        }

        function GetTestCaseListFailed(response) {
            notificationService.displayError('Test Case Load Failed. Please try again !');
        }

        function BugsListLoadComplete(response) {
            $scope.BugsList = response.data;
            for (var i = 0; i < $scope.BugsList.length; i++) {
                $scope.BugsList[i].assign_to = response.data[i].assign_to[0];
                $scope.BugsList[i].issue_type = response.data[i].issue_type[0];
                $scope.BugsList[i].issue_Category = response.data[i].issue_Category[0];
                $scope.BugsList[i].priority = response.data[i].priority[0];
                $scope.BugsList[i].severity = response.data[i].severity[0];
                $scope.BugsList[i].logged_by = response.data[i].logged_by[0];
                $scope.BugsList[i].status = response.data[i].status[0];
            }
        }

        function BugsListLoadFailed(response) {
            notificationService.displayError('Bugs Load Failed. Please try again !');
        }

        $scope.SaveTestStep = function SaveTestStep(steps) {
            $scope.teststep = {
                'teststep_id': steps.id,
                'testcycle': $scope.testcycleid,
                'testphase': $scope.testphaseid,
                'status': steps.status,
                'actual_result': steps.actual_result,
                'added_by': $rootScope.userid
            };
            if ($scope.teststep.actual_result == '' || $scope.teststep.actual_result == null || $scope.teststep.actual_result == undefined)
            {
                if ($scope.teststep.status == 32 || $scope.teststep.status == 34 || $scope.teststep.status == 35) {
                    notificationService.displayError('please enter actual result');
                }

                else if ($scope.teststep.status == 33) {
                    apiService.post('api/TestCase/UpdateTestStepStatus/', $scope.teststep, UpdateStepStatusComplete, UpdateStepStatusFailed);
                }
            }
            else {
                apiService.post('api/TestCase/UpdateTestStepStatus/', $scope.teststep, UpdateStepStatusComplete, UpdateStepStatusFailed);
            }
        };

   function UpdateStepStatusComplete(response) {
            notificationService.displaySuccess('Status Updated Successfully !');
            GetModulesList();
        }

        function UpdateStepStatusFailed(response) {
            notificationService.displayError('Test Phase is missing!');
        }

        $scope.OpenBugLogPopup = OpenBugLogPopup;
        function OpenBugLogPopup(steps, testcase, module_name) {
            var count = 0;
            if ($scope.testphaseid == null || $scope.testphaseid == undefined || $scope.testphaseid == '') {
                notificationService.displayError('Test Phase is missing!');
            }
            for (var i = 0; i < $scope.projectsList.length; i++) {
                if ($scope.projectsList[i].id == $scope.projects.id) {
                    if ($scope.projectsList[i].status == 31) {
                        count = count + 1;
                    }
                }
            }
            if (count == 0) {
                var modalInstance= $modal.open({
                    templateUrl: 'Scripts/Bugs/logissue.html',
                    controller: 'logissueCtrl',
                    scope: $scope,
                    resolve: {
                        testcaseid: function () { return steps.testcase_id },
                        step_id: function () { return steps.id },
                        projectid: function () { return $scope.projects.id },
                        testphaseid: function () { return $scope.testphaseid },
                        projectname: function () { return $scope.projects.project_name },
                        moduleid: function () { return testcase.module_id },
                        modulename: function () { return module_name }
                    }
                })
                modalInstance.result.then(function () {
                    GetModulesList();
                })
            }
            else {
                notificationService.displayError("Project has Closed..! Not allowed to add Bugs");
            }
        }
    }
})(angular.module('common.core'));