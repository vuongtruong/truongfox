define([
    'chat/model/chat',
    'global/base/ListController'
], function(ChatModel, Ctrl) {

    return function($scope, $injector, $interval, $chat, $q, $http2, $site, $modal, gettext, gettextCatalog, $viewer, socket) {
        $injector.invoke(Ctrl, this, {
            $scope: $scope
        });

        $.extend($scope, {
            isFirstLoad: true,
            noMoreText: null,
            enableLoadMore: false,
            itemModel: ChatModel,
            apiService: 'chat/getUsers',
            getQueryData: function() {
                return $scope.$parent.chatListData;
            },
            isReadyToLoad: false,
            isFinishedLoading: 0
        });

        $scope.loadMore = function() {
            if(!$scope.isReadyToLoad)
                return;
            $scope.isReadyToLoad = false;
            $scope.$qMore = $q.defer();

            $scope.listData =  $scope.getQueryData();
            if($scope.chatId && $chat.storage.aUsers.indexOf($scope.chatId)) {
                $chat.storage.aUsers.push($scope.chatId);
            }
            $http2.post($scope.apiService, {aUsers:$chat.storage.aUsers})
            .success($scope.loadMoreSuccess)
            .error($scope.loadMoreError)
            .finally($scope.loadMoreFinish);
            $http2.post('chat/getFriendList', {aUsers:$chat.storage.aUsers})
                .success($scope.loadMoreSuccess)
                .finally($scope.loadMoreFinish);
        };
        $scope.$on('chat:buildThreads', function() {
            $scope.isReadyToLoad = true;
            // Build Threads
            // $scope.items = [];
            $scope.loadMore();
        });
        $scope.loadMoreFinish = function() {
            if(++$scope.isFinishedLoading >= 2) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (!$scope.enableLoadMore) {
                    $scope.canLoadMore = false;
                }
                $scope.noItems = ($scope.getTotalShow() == 0);
                $scope.onLoadMoreEnd();
                if ($scope.isFirstLoad) {
                    $scope.isFirstLoad = false;
                }
            }
        };

        $scope.loadMoreSuccess = function(data) {
            $.each(data, function(key, user) {
                if(user.iItemId == $viewer.get('iUserId'))
                    return;
                user.bIsHidden = false;
                var aBuiltThread = $.extend({sThreadId:$viewer.get('iUserId') + ':' + user.iItemId}, ChatModel, user);
                var matches = $.grep($scope.items, function(item) {
                    return (item.iItemId === aBuiltThread.iItemId);
                });
                if (!matches.length) {
                    $scope.items.push(aBuiltThread);
                }
                $chat.storage.aThreads.push({aBuiltThread: aBuiltThread});
            });
        };

        $scope.onLoadMoreEnd = function() {
            if ($scope.isFirstLoad && $scope.chatId) {
                $scope.showChatById($scope.chatId);
            }
        };

        $scope.getTotalShow = function() {
            var showCnt = 0;
            for (var i = 0; i < $scope.items.length; i++) {
                if (!$scope.items[i].isHidden()) {
                    showCnt++;
                }
            }
            return showCnt;
        };

        $scope.$parent.onSearch = function() {
            $scope.listData = $scope.getQueryData();
            var regEx = new RegExp($scope.listData.sSearch, 'i');

            for (var i = 0; i < $scope.items.length; i++) {
                $scope.items[i].setHidden(!regEx.test($scope.items[i].getTitle()));
            }
            $scope.noItems = ($scope.getTotalShow() == 0);
        };

        $scope.getItemById = function(id) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].getId() == id) {
                    return $scope.items[i];
                }
            }
            return null;
        };

        $scope.showChatById = function(id) {
            var obj = $scope.getItemById(id);
            if (obj) {
                $scope.showChat(obj);
            }
        };
        $scope.updatePromise = $interval($scope.loadMore, 30e3);

        $scope.$on('$destroy', function() {
            $interval.cancel($scope.updatePromise);
        });

        $scope.$on('chat:updateUnread', function() {
            $scope.items.sort($scope.sortRule);
        });

        $scope.$on('chat:onClick', function(e, data) {
            if (typeof(data.id) != 'undefined') {
                $scope.showChatById(data.id);
            }
        });
        $scope.$on('chat:updateNew', function (e, data) {
            var updateNewInterval = setInterval(function() {
                if($scope.isFinishedLoading) {
                    clearInterval(updateNewInterval);
                    $.grep($scope.items, function(item) {
                        if(item.sThreadId === data.thread.thread_id) {
                            item.iTotalNew = data.total;
                        }
                        return true;
                    })
                }
            }, 500);
        });
        $scope.$on('chat:updateNewOnChat', function (e, data) {
            $.grep($scope.items, function(item) {
                if(item.sThreadId === data.chat.thread_id) {
                    item.iTotalNew++;
                }
                return true;
            })
        });
        $scope.$on('chat:resetNew', function(e, data) {
            $.grep($scope.items, function(item) {
                if(item.sThreadId === data.thread_id) {
                    item.iTotalNew = 0;
                }
                return true;
            })
        });
    };
});