define([
    'global/base/Model'
],function(Model){
    
    return Model.extend({
        idAttribute: 'iCommentId',
        sModelType: 'activity_comment',
        user: {},
        sContent: '',
        getPosterImageSrc: function() {
            return this.sImage || '';
        },
        getPosterTitle: function(){
            return this.sFullName || '';
        },
        getPosterId:function (){
            return this.iUserId || 0;
        },
        getPosterType: function(){
            return 'user';
        },
        getContent: function() {
            return this.sContent || '';
        }
    });
});
