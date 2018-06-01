define([
    'forum/model/post',
    'global/base/BaseController',
    'moment'
], function(PostModel, BaseController, Moment) {

    return function($scope, $injector, $state, $http2, $site, gettext, gettextCatalog, $modal, $location, $ionicScrollDelegate, $ionicModal, $history) {

        $scope.Moment = Moment;

        $injector.invoke(BaseController, this, {
            $scope: $scope
        });

        $scope.post = {};
        $scope.thread = {};

        $scope.sendData = {
            iPostId: $state.params.iPostId
        };

        $scope.getItem = function() {

            $http2.get('forum/postdetail', $scope.sendData).success($scope.getItemSuccess).error($scope.getItemError);
        };

        $scope.getItemSuccess = function(data) {

            if (data.error_code) {
                $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
                return $scope.goBack();
            }

            $.extend($scope.post, PostModel, data);

            $scope.dataReady = true;

        };

        $scope.getItemError = function() {

            console.error('getItem', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
            $scope.goBack();
        };

        $scope.getItem();
    };
});