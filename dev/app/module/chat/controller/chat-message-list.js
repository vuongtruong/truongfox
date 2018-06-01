define([
    'chat/model/chat-message',
], function(ChatMessageModel) {

    return function($scope, $injector, $rootScope, $site, $modal, gettext, gettextCatalog, $http2, $q, $viewer, $ionicScrollDelegate, socket) {
        $scope.itemModel = ChatMessageModel;
        $scope.items = [];
        $scope.noItems = false;

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
        $scope.scrollBottom = function() {
            $ionicScrollDelegate.$getByHandle('chat-message-list').scrollBottom();
        };
        socket.on('loadConversation', function (threads) {
            var do_scroll = false;
            if(!$scope.items.length)
                do_scroll = true;
            for (var i = threads.length - 1; i >=0; i--) {
                var thread = $.parseJSON(threads[i]);
                $scope.items.unshift(buildMessage(thread));
            }
            if(do_scroll) {
                $scope.scrollBottom();
            }
            $scope.$broadcast('scroll.refreshComplete');
            $rootScope.$broadcast('chat:resetNew', {thread_id: $scope.thread_id});
        });
        socket.emit('loadConversation', {
            user_id: $viewer.get('iUserId'),
            thread_id: $scope.thread_id,
            partner_id: $scope.getPartnerId($scope.thread_id)
        });
        $scope.loadMore = function () {
            socket.emit('loadMore', $scope.thread_id, $scope.items.length);
        };

        socket.on('chat', function (chat) {
            $site.debug && console.log('IM - on chat', chat);
            if(chat.receiver.id != $viewer.get('iUserId'))
                return;
            $scope.items.push(buildMessage(chat));
            $scope.scrollBottom();
        });

        $scope.doResetQuery = function() {

            $scope.canceller && $scope.canceller.resolve('abort');
            $scope.cancelled = true;

            $scope.items = [];
            $scope.noItems = false;

            // reload
            $scope.isProcessingLoad = false;
            socket.emit('loadConversation', {
                user_id: $viewer.get('iUserId'),
                thread_id: $scope.thread_id,
                partner_id: $scope.getPartnerId($scope.thread_id)
            });
        };
        $scope.$on('build-message', function(event, args) {
            $scope.items.push(buildMessage(args));
            $scope.scrollBottom();
        });
        $scope.$on('chat:objChange', function(event, args) {
            $scope.doResetQuery();
        });
    };
});