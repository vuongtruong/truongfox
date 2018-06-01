cordova.define("com.younetco.plugin.NativeControl", function(require, exports, module) {

    function NativeControl(){}

    NativeControl.prototype.showMenu = function(){
        cordova.exec(null, null, 'NativeControl', 'showPrimarySlidingMenu', []);
    };

    NativeControl.prototype.hideMenu = function(){

        cordova.exec(null,null,'NativeControl', 'hidePrimarySlidingMenu',[]);
    };

    NativeControl.prototype.toggleMenu = function(){
        cordova.exec(null,null,'NativeControl', 'togglePrimarySlidingMenu',[]);
    };

    NativeControl.prototype.lockMenu = function(){
        cordova.exec(null,null,'NativeControl', 'lockPrimaryMenu',[]);
    };

    NativeControl.prototype.unlockMenu = function(){
        cordova.exec(null,null,'NativeControl', 'unlockPrimaryMenu',[]);
    };

    NativeControl.prototype.setActiveMenu = function(module){
        cordova.exec(null,null,'NativeControl', 'setActiveItem',[module]);
    };
    NativeControl.prototype.setActiveMenu = function(module){
        cordova.exec(null,null,'NativeControl', 'setActivePrimaryMenu',[module]);
    };

    NativeControl.prototype.setActiveItem =  function(item){
        cordova.exec(null,null,'NativeControl', 'setActiveItem',[item]);
    }

    /**
     *
     * @param array[Object{
     *  icon: string,
     *  label: string,
     *  path: string,
     *  type: string, item or devider
     * },]items
     */
    NativeControl.prototype.updateMenuItems = function(items){
        cordova.exec(null,null,'NativeControl', 'updateMenuItems', items);
    }

    /**
     *
     * @param Object {image: string, icon: string, label: string, path: string}viewer
     */
    NativeControl.prototype.updateMenuViewer =  function(viewer){
        cordova.exec(null,null,'NativeControl','updateMenuViewer', [viewer]);
    }

    NativeControl.install = function () {
        return window.nativeControl = new NativeControl();
    };

//    alert("code show native control");
    cordova.addConstructor(NativeControl.install);
});