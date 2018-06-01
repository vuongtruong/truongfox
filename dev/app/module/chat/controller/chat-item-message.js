define([
    'global/base/ItemController'
], function (Ctrl) {
    return function ($scope, $http2, $site, $injector, gettext, gettextCatalog, $location, $modal, socket, $chat) {
        $injector.invoke(Ctrl, this, {$scope: $scope});
        $scope.onItemSetting = $scope._setting($scope, function () {
            var btns = [];
            btns.push({
                text: gettextCatalog.getString('Delete'),
                action: function () {
                    socket.emit('chat_delete', $scope.thread_id, $scope.item.getId());
                },
                destructive: true
            });
            return btns;
        });
        $scope.canDelete = function () {
            return (Date.now() - $scope.item.getTimestamp() < $chat.storage.configs.iTimeToDeleteMessage) && (!$scope.item.isDeleted()) && $scope.item.isViewer();
        };
        $scope.onHoldItem = function() {
            // check if user can delete message
            if($scope.canDelete())
                return $scope.onItemSetting();
            return false;
        };

        socket.on('chat_delete', function(key) {
            if($scope.item.time_stamp == key) {
                $scope.item.deleted = true;
            }
        });

    };

});
