define([
    'global/validator',
    'global/base/BaseController',
], function(Validator, Ctrl) {
    return function($state, $injector, $scope, $ionicPopup,$http2, $site, $modal, gettext, gettextCatalog, $location, $window, $q) {

        $injector.invoke(Ctrl, this, {
            $scope: $scope
        });

        $scope.form = {};
        $scope.formData = {};
        $scope.dataReady = false;
        $scope.isProcessing = false;
        $scope.haveNewPhoto = false;

        $scope.loadInit = function(){
            var sendData= {
                iVideoId: $state.params.iVideoId
            };

            // fetch form data by individual apis, may need improvement
            $q.all([
                $http2.post('video/formadd',{
                    bPrivacyNoCustom: true
                }),
                $http2.get('video/detail', sendData),
            ]).then(function(data){

                //check for error in any request, need to better verify
                for (i = 0; i < data.length; ++i) {
                    if (data[i].error_code){
                        $modal.alert(gettextCatalog.getString('Can not get data from server'));
                        return $scope.goBack();
                    }
                }
                $scope.form.categoryOptions = data[0].data.category_options;
                $scope.form.viewOptions = data[0].data.view_options;
                var formData = data[1].data;
                $scope.formData.title           =  formData.sTitle;
                $scope.formData.description     =  formData.sDescription;
                $scope.formData.iCategoryId     =  formData.iCategoryId;
                $scope.formData.iVideoId        =  formData.iVideoId;
                $scope.formData.privacy       =  formData.iPrivacy;
                $scope.formData.tags            =  formData.sTags;
                $scope.formData.photoPath       =  formData.sVideoImage;
                $scope.dataReady = true;
            });
        };

        // implement do save
        $scope.doSave = function(){

            if($scope.isProcessing)
                return true;

            if(!$scope.formData.title){
                $modal.alert(gettextCatalog.getString('Video title is required'));
                return ;
            }

            $scope.isProcessing = true;

            if ($scope.haveNewPhoto) {
                $scope.saveWithPhoto();
            } else {
                $scope.save();
            }

        };

        $scope.save = function() {
            var success = function(data) {
                if(data.error_code){
                    $modal.alert(data.error_message);
                    return ;
                }else{
                    $modal.toast(data.message);
                    $scope.goBack();
                }
            };

            var error = function(error) {
                console.error('doSaveWithPhoto', arguments);
            };
            $http2.post('video/edit', $scope.formData)
                .success(success)
                .error(error)
                .finally(function(){
                    $scope.isProcessing  = false;
                });
        };

        $scope.saveWithPhoto = function() {
            var success = function(data) {
                console.log(data);
                if(data.error_code){
                    $modal.alert(data.error_message);
                    return ;
                }else{
                    $modal.toast(data.message);
                    $scope.goBack();
                }
            };

            var error = function(error) {
                console.error('doSaveWithPhoto', arguments);
            };
            console.log($scope.formData.photoPath);
            console.log($scope.formData);
            $http2.upload('video/edit', $scope.formData.photoPath ,$scope.formData).then(success, error);
        };

        $scope.onAddPhoto = $scope._setting($scope, function() {

            return [{
                text: gettextCatalog.getString('Take Photo'),
                action: function() {
                    $scope.doAddPhoto('CAMERA');
                }
            }, {
                text: gettextCatalog.getString('Select From Gallery'),
                action: function() {
                    $scope.doAddPhoto('PHOTOLIBRARY');
                }
            }];
        });

        $scope.doAddPhoto = function(sourceType) {

            sourceType = sourceType || 'PHOTOLIBRARY';

            var getSuccess = function(fileURI) {
                $scope.doAddPhotoSuccess(fileURI);
            };

            var getFail = function(msg) {
                console.warn(msg);
                if (msg == 20) { // PERMISSION_DENIED_ERROR = 20
                    $modal.alert(gettextCatalog.getString('Illegal Access'));
                }
            };

            navigator.camera.getPicture(getSuccess, getFail, {
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType[sourceType],
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true,
                targetWidth: $site.imgTargetSize,
                targetHeight: $site.imgTargetSize
            });
        };

        $scope.doAddPhotoSuccess = function(fileURI) {

            $scope.formData.photoPath = fileURI;
            $scope.haveNewPhoto = true;
            $scope.$$phase || $scope.$apply();
        };

        $scope.onRemovePhoto = function() {

            $scope.formData.photoPath = null;
        };

        $scope.loadInit();
    };
});
