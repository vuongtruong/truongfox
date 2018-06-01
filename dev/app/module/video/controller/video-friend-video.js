define([
    'global/base/BrowseController',
    'text!tpl/video/video-search.html'
], function(BrowseController, searchTemplate) {
    return function($scope, $injector, $site) {
        
        /**
         * check require permission
         */
        $site.requirePerm('pf_video_view');
        $scope.canCreateVideo =  $site.getPerm('pf_video_share');

        /**
         * init data load
         */
        $scope.dataReady = false;
        
        $injector.invoke(BrowseController, this, {
            $scope: $scope
        });

        $scope.searchTemplate = searchTemplate;
        
        $scope.searchVideos = {
            sView: 'friend',
            iPage: 1,
            sSearch: '',
            iCategory: 0,
            iLimit: 20,
            sOrder: 'latest',
        };
    };
});
