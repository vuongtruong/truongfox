define([
    'chat/model/chat-message'
],function(ChatMessageModel) {

    return function($rootScope, $interval, $http2, $site, $viewer, $state, $coreSettings, $modal) {

        var $chat = {
            storage: {
                configs: null,
                currentId: null, // current chatting
                lastPingTimeStamp: null,
                muteNotification: true,
                iThreadCount: 0,
                iThreadShow: 0,
                aUsers: [],
                aThreads: []
            }
        };

        // reset data
        localStorage.removeItem('chatUnreadIds');

        $chat.setUnread = function(id) {

            id = parseInt(id);

            if ($chat.isCurrent(id)) {
                return false;
            }

            var unreadIds = JSON.parse(localStorage.getItem('chatUnreadIds')) || [];

            if (unreadIds.indexOf(id) == -1) {
                unreadIds.push(id);
            }

            localStorage.setItem('chatUnreadIds', JSON.stringify(unreadIds));

            $rootScope.$broadcast('chat:updateUnread', unreadIds);
        };

        $chat.removeUnread = function(id) {

            id = parseInt(id);

            var unreadIds = JSON.parse(localStorage.getItem('chatUnreadIds')) || [];

            if (unreadIds.indexOf(id) > -1) {
                unreadIds.splice(unreadIds.indexOf(id), 1);
            }

            localStorage.setItem('chatUnreadIds', JSON.stringify(unreadIds));

            $rootScope.$broadcast('chat:updateUnread', unreadIds);
        };

        $chat.getUnreads = function() {

            return JSON.parse(localStorage.getItem('chatUnreadIds')) || [];
        };

        $chat.setCurrent = function(id) {

            id = parseInt(id);

            $chat.storage.currentId = id;
            $chat.removeUnread(id);
        };

        $chat.removeCurrent = function() {

            delete($chat.storage.currentId);
        };

        $chat.isCurrent = function(id) {

            return $chat.storage.currentId == id;
        };

        $chat.setMuteNotification = function(bool) {

            $chat.storage.muteNotification = bool;

            $rootScope.$broadcast('chat:updateMuteNotification', bool);
        };

        $chat.isMuteNotification = function() {

            return $chat.storage.muteNotification;
        };

        $chat.setVibrateStatus = function(status) {

            localStorage.setItem('chatVibrateStatus', status || 'on');
        };

        $chat.getVibrateStatus = function() {

            return localStorage.getItem('chatVibrateStatus') || 'on';
        };

        return $chat;
    };
});