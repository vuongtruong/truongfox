define([
    'global/base/BrowseController',
    'text!tpl/ultimatevideo/ultimatevideo-search-video.html'
], function(Ctrl, searchTemplate) {
    return function($scope, $injector) {

        $injector.invoke(Ctrl, this, {$scope: $scope});

        $scope.searchTemplate = searchTemplate;

        $scope.searchVideos = {
            iPage: 1,
            iItemId: $scope.item.getId(),
            sModule: 'groups',
            sView: 'all',
            iAmountOfVideo: 10,
            sOrder: 'creation_date'
        };
        $scope.videoItemOptions = ['watch_later', 'favorite', 'add_to_playlist'];

        return $scope;
    };
});