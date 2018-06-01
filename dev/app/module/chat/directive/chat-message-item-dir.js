define([
    'text!tpl/chat/chat-message-item-dir.html'
], function() {

    return function() {

        return {
            restrict: 'E',
            template: require('text!tpl/chat/chat-message-item-dir.html'),
            controller: 'ChatItemMessageCtrl'
        };
    };
});