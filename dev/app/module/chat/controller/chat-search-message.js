define([
    'chat/model/chat-message',
    'global/base/ListController'
], function(ChatMessageModel, ListController) {

    return function($scope, $injector, $rootScope, $site, $modal, gettext, gettextCatalog, $http2, $q, $viewer, $ionicScrollDelegate, socket) {
        $injector.invoke(ListController, this, {
            $scope: $scope
        });
        $scope.itemModel = ChatMessageModel;
        $scope.searchText = '';
        $scope.enableLoadMore = true;

        $scope.prepareItem = function(input) {
            var item = $.extend({}, $scope.itemModel, input);

            // parse Url
            var patt = /(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]/ig,
                match = patt.exec(item.text);
            if (match !== null) {
                $http2.get('chat/getLink',{
                    'sUrl': match[0],
                }).success(function(data) {
                    if(typeof data.link !== 'undefined') {
                        item.setLink(data.link);
                    }
                });
            }

            // process attachment
            var iAttachmentId = item.getAttachmentId();
            if(iAttachmentId) {
                $http2.get('chat/getAttachment',{
                    'iAttachmentId': iAttachmentId
                }).success(function(data) {
                    if(typeof data.error_code !== 'undefined' && data.error_code > 0)
                        return;
                    item.setAttachment(data);
                });
            }

            return item;
        };

        var buildMessage = function(message) {
            if (typeof(message) == 'string') {
                message = JSON.parse(message);
            }
            if(message.thread_id != $scope.thread_id)
                return false;
            return $scope.prepareItem(message);
        };

        // socket emit search message
        $scope.searchMessage = function() {
            if($scope.searchText.length < 3)
                return;
            $scope.items = [];
            socket.emit('search_message', $scope.thread_id, $scope.searchText, 0);
        };
        
        $scope.loadMore = function() {
            if($scope.searchText < 3) {
                $scope.canLoadMore = false;
                return;
            }
            $scope.noItems = false;
            socket.emit('search_message', $scope.thread_id, $scope.searchText, $scope.items.length);
        };

        // socket on search message
        socket.on('search_message', function (result, index) {
            if(index == 0)
                $scope.items = [];
            for (var i = 0; i < result.length; i++) {
                var message = JSON.parse(result[i]);
                $scope.items.push(buildMessage(message));
            }
            $scope.noItems = !$scope.items.length;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.canLoadMore = result.length > 0;
        });
    };
});