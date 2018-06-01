define([
    'comment/model/comment'
], function(Model) {
    return function($scope, $http2, $site, $modal, gettext, gettextCatalog, $timeout) {
        $scope.isProcessingPost = false;
        $scope.data = {
            iItemId: $scope.obj.getId(),
            sItemType: $scope.obj.getType(),
            sParentId: $scope.obj.getParentModuleId(),
            sText: '',
        };

        $scope.onPostComment = function() {
            if ($scope.isProcessingPost)
                return;

            if (!$scope.data.sText) {
                return $modal.alert(gettextCatalog.getString('Please enter your comment'));
            }

            $scope.isProcessingPost = true;

            /**
             * hide keyboard 
             * @link: https://github.com/driftyco/ionic-plugins-keyboard
             */
            $timeout(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    window.cordova.plugins.Keyboard.close();
                }
            }, 100);

            $http2.post('comment/add', $scope.data)
                .success($scope.postSuccess)
                .error(function() {
                    $modal.alert(gettextCatalog.getString('Can not load data from server'));
                })
                .finally(function() {
                    $scope.isProcessingPost = false;
                });
        };

        $scope.postSuccess = function(data) {
            if (data.error_code) {
                $modal.alert(data.error_message);
            } else {
                $modal.toast(gettextCatalog.getString('Comment posted successfully'));
                $scope.data.sText = '';
                $scope.obj.comments.push($.extend({}, Model, data));
                $scope.obj.iTotalComment++;
            }
        };
    };
});
