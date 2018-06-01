define([
    'global/base/Model'
], function(Model) {

    return Model.extend({
        idAttribute: 'iItemId',
        sModelType: 'cometchat',
        getTitle: function() {
            return this.sFullName || '';
        },
        getImageSrc: function() {
            return this.sImage || '';
        },
        getStatus: function() {
            return this.sStatus || 'offline';
        },
        isUnread: function() {

            var unreadIds = JSON.parse(localStorage.getItem('cometchatUnreadIds')) || [];

            return unreadIds.indexOf(parseInt(this.getId())) > -1;
        },
        isHidden: function() {
            return this.bIsHidden || false;
        },
        setHidden: function(bool) {
            this.bIsHidden = bool || false;
        }
    });
});