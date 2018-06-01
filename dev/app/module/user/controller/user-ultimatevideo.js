define([
    'global/base/BaseController',
], function (Ctrl) {
    return function ($scope, $injector, $state) {

        $injector.invoke(Ctrl, this, {$scope: $scope});

        var iUserId = $state.params.iUserId;
        $scope.searchVideos = {
            iPage: 1,
            iProfileId: iUserId,
            bIsUserProfile: true,
            sView: 'all',
            iAmountOfVideo: 10,
            sOrder: 'creation_date'
        };
        $scope.videoItemOptions = ['watch_later', 'favorite', 'add_to_playlist'];
        return $scope;
    };
});