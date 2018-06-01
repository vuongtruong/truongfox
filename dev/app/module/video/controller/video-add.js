define([
    'global/validator',
    'global/base/BaseController',
], function(Validator, Ctrl) {
    return function($file, $injector, $scope, $ionicPopup,$viewer,$http2, $site, $modal, gettext, gettextCatalog, $location, $window, $state) {
        /**
         * check require permission
         */
        //$site.requirePerm('video.create');

        /**
         * extend base controllers
         */
        $injector.invoke(Ctrl, this, {
            $scope: $scope
        });

        $scope.dataReady = false;
        $scope.form =  {};
        $scope.isProcessing = false;

        $scope.formData = {
            sVideoSource: '',
            sPath: '',
            url: '',
            type: '',
            title: '',
            description: "",
            default_image: "",
            embed_code: "",
            parent_id: $viewer.get('iUserId') ,
            parent_type: 'user',
            tags: "",
            category: 0,
            privacy: '0',
            search: 1
        };

        if(typeof $state.params.sParentType != 'undefined'){
            $scope.formData.sModule = $state.params.sParentType;
            $scope.formData.iItemId =  $state.params.iParentId;
            $scope.formData.sSubjectType = $state.params.sParentType;
            $scope.formData.iSubjectId =  $state.params.iParentId;
        }

        $scope.loadInit = function(){

            $http2.post('video/formadd', {
                bPrivacyNoCustom: true
            })
                .success(function(data) {
                    if(data.error_code){
                        $modal.alert(data.error_message);
                        $scope.goBack();
                    }else{
                        $scope.dataReady = true;
                        $scope.form.categoryOptions  =  data.category_options;
                        $scope.form.viewOptions  = data.view_options;
                        $scope.form.bCanUpload = data.bCanUploadVideo;
                        $scope.formData.privacy =  data.default_privacy_setting;
                    }

                }).error(function() {

            });
        };
        // implement do save
        $scope.doSave =  function(){

            if($scope.isProcessing)
                return true;

            if(!$scope.formData.title){
                $modal.alert(gettextCatalog.getString('Video title is required'));
                return ;
            }

            if($scope.formData.sVideoSource == 'url'){
                if($scope.formData.url){
                    $scope.doCreateVideoFromUrl();
                }else{
                    $modal.alert(gettextCatalog.getString('Please select video'));
                }
            }
            else{
                if($scope.formData.sPath){

                    $scope.doCreateVideoFromDevice();
                }else{
                    $modal.alert(gettextCatalog.getString('Please select video'));
                }

            }
        };

        $scope.doCreateVideoFromUrl = function(){

            if($scope.isProcessing){
                return true;
            }

            $scope.isProcessing = true;

            $http2.post('video/create', $scope.formData)
                .success(function(data){
                    if (data.error_code) {
                        $modal.alert(data.error_message);
                        return ;
                    }else{
                        $modal.toast(data.message);
                        $scope.isProcessing =  false; // release blocking status
                        $scope.goBack();
                    }
                })
                .error(function(){
                    console.log(arguments);
                })
                .finally(function(){
                    $scope.isProcessing = false;
                });
        };

        $scope.doCreateVideoFromDevice = function(){

            if($scope.isProcessing){
                return true;
            }

            $scope.isProcessing = true;

            $http2.upload(
                'video/upload',
                $scope.formData.sPath,
                $scope.formData,
                'video')
                .then(function(data){
                    console.log('upload result');
                    console.log(data);
                    $scope.isProcessing =  false; // release blocking status
                    if(data.error_code){
                        $modal.alert(data.error_message);
                        return ;
                    }else{

                        var postData = {
                            iVideoId: data.iVideoId
                        };
                        var settings = {
                            timeout: 0
                        };
                        // $http2.post('video/convert', postData, settings); // why have to call convert ?
                        $modal.toast(data.message);
                        $scope.goBack();
                    }
                }, function(error){
                    $scope.isProcessing = false;

                    if (error.code == FileTransferError.ABORT_ERR) {
                        return $modal.toast(gettextCatalog.getString('Canceled'));
                    }

                    $modal.alert(gettextCatalog.getString('Can not upload video'));
                });
        };

        $scope.doParseUrl = function(){
            if (!$scope.formData.url) {
                return;
            }
            var data = {
                'url': $scope.formData.url
            };
            var success = function(data) {
                if(data.error_code) {
                    $modal.alert(data.error_message);
                } else {
                    $scope.formData.title = data.title;
                    $scope.formData.description = data.description;
                    $scope.formData.default_image = data.default_image;
                    $scope.formData.embed_code = data.embed_code;
                    $scope.formData.sPath = '';
                    $scope.formData.sVideoSource = 'url';
                }
            };
            var error = function(error) {
                console.log(error)
            };
            $http2.get('video/parse_url', data)
                .success(success)
                .error(error)
                .finally(function(){});
        };

        $scope.doSelectFromUrl = function(){
            $scope.formData.url = "";

            $modal.prompt(gettextCatalog.getString('Paste your video URL'), function(result) {
                $scope.$$phase || $scope.$apply();

                if (result.buttonIndex == 2) {
                    return true;
                }
                if (!result.input1) {
                    return false;
                }
                if (!Validator.isUrl(result.input1)) {
                    return $modal.alert(gettextCatalog.getString('Invalid Video URL'));
                }

                var data = {
                    'url': result.input1
                };
                var success = function(data) {
                    if(data.error_code) {
                        $modal.alert(data.error_message);
                    } else {
                        $scope.formData.title = data.title;
                        $scope.formData.description = data.description;
                        $scope.formData.default_image = data.default_image;
                        $scope.formData.embed_code = data.embed_code;
                        $scope.formData.sPath = '';
                        $scope.formData.url = result.input1;
                        $scope.formData.sVideoSource = 'url';
                    }
                };
                var error = function(error) {
                    console.log(error)
                };
                $http2.get('video/parse_url', data)
                    .success(success)
                    .error(error)
                    .finally(function(){});

            }, gettextCatalog.getString('Video URL'), [gettextCatalog.getString('OK'), gettextCatalog.getString('Cancel')]);
        };

        $scope.doRemoveSelectFromUrl =  function(){
            $scope.formData.url = '';
            $scope.formData.sPath = '';
            $scope.formData.sVideoSource  = '';
        };

        $scope.doRemoveSelectFromDevice =  function(){
            $scope.formData.url = '';
            $scope.formData.sPath = '';
            $scope.formData.sVideoSource  = '';
        };

        $scope.doSelectFromDevice = function(){
            navigator.camera.getPicture(function(fileURI){
                // success handler                
                $scope.formData.sPath = fileURI;
                $scope.formData.url = '';
                $scope.formData.sVideoSource = 'device';

                $scope.$$phase || $scope.$apply();
            }, function(msg) {
                if (msg == 20) { // PERMISSION_DENIED_ERROR = 20
                    $modal.alert(gettextCatalog.getString('Illegal Access'));
                }
            }, {
                quality : 50,
                destinationType : Camera.DestinationType.FILE_URI,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                mediaType : Camera.MediaType.VIDEO
            });
        };

        $scope.loadInit();
    };
});
