define([
    'global/viewer',
    'global/base/Model',
    'global/site'
],function(Viewer, Model, Site){
    return Model.extend({
        idAttribute: 'iVideoId',
        sModelType: 'v',
        bShowRate: false,
        user: {},
        getUrl: function() {
            return '#/app/v/' + this.getId();
        }
    });
});