define([
    'global/base/BrowseController'
], function(BrowseController) {

    return function($scope, $injector, $site, $location) {

        $injector.invoke(BrowseController, this, {
            $scope: $scope
        });

        $scope.searchVideos = {
            iItemId: $scope.item.getId(),
            sModule: $scope.item.getType(),
            sView: 'all',
            iPage: 1,
            sSearch: '',
            iCategory: 0,
            iLimit: 20,
            sOrder: 'creation_date'
        };

        $scope.searchVideosApi = 'ultimatevideo/fetch_videos';

        $scope.onAddVideoClick = function() {
            var path = 'app/ultimatevideo/add/video/' + $scope.item.getType() + '/' + $scope.item.getId();
            $location.path(path);
        };

        $scope.$on('ultimatevideo:deleted', function(e, data) {
            $scope.item.iTotalUltimatevideos--;
        });
        $scope.videoItemOptions = ['watch_later', 'favorite', 'add_to_playlist'];
        return $scope;
    };
});
