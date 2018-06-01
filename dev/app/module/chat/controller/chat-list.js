define([
    'chat/controller/chat-list-ipad',
    'chat/model/chat',
    'chat/controller/chat-side-menu-list'
], function(ChatListIpadCtrl, ChatModel, ChatSideMenuListCtrl) {

    return function($scope, $injector, $interval, $chat, $q, $http2, $site, $modal, gettext, gettextCatalog) {
        $injector.invoke(ChatSideMenuListCtrl, this, {
            $scope: $scope
        });

        if (ionic.Platform.isIPad()) {
            $injector.invoke(ChatListIpadCtrl, this, {
                $scope: $scope
            });
        }
    };
});