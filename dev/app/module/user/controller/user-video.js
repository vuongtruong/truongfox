define([
    'global/base/BaseController',
], function(Ctrl) {
    return function($scope, $injector, $state) {

        $injector.invoke(Ctrl, this, {
            $scope: $scope
        });
        
        // var iUserId  = $state.params.iUserId;
        // option to fetch photos list
        $scope.searchVideos =  {
            // iParentId: $scope.item.getId(),
            // sParentType: 'profile_photo',
            bIsUserProfile: 1,
            iUserId: $scope.item.getId(),
            iInDetails: 1,
            iPage: 1,
            sSearch: '',
            iCategory: 0,
            iLimit: 20,
            sOrder: 'creation_date',
        };

        return $scope;
    };
});