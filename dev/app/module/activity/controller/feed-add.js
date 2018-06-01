define([
    'global/base/BaseController'
], function(BaseController) {

    return function($scope, $injector, $state, $http2, $site, $modal, gettext, gettextCatalog, $viewer, $q, $timeout, $globalData) {

        $injector.invoke(BaseController, this, {
            $scope: $scope
        });

        $scope.text_what_s_on_your_mind_ = gettextCatalog.getString("What's on your mind...");

        $timeout(function() {
            Typeahead.create($('#composer_textarea').get(0), {});
            $scope.dataReady = true;
        }, 500);

        // init original values
        $scope.viewOptions = [];
        $scope.enabledEmoticon = false;
        $scope.statusData = {
            iPrivacy: 0,
            sSubjectType: $state.params.itemType || 'user',
            iSubjectId: $state.params.itemId || $viewer.get('iUserId')
        };
        $scope.isInMyProfile = (!$state.params.itemType || ($state.params.itemType == 'user' && $state.params.itemId == $viewer.get('iUserId')));

        var limitedModules = ['event', 'fevent', 'pages', 'directory'];

        $scope.attachmentContext = {
            action: $state.params.action || '',
            bCanAddVideo: false,
            bCanUploadVideo: false,
            bCanAddUltimatevideo: false,
            bCanUploadUltimatevideo: false,
            enableLocation: limitedModules.indexOf($state.params.itemType) == -1,
            enableMultiPhotos: false,
            parentType: ''
        };

        $scope.getForm = function() {

            $q.all([
                $http2.post('feed/formstatus'), //get video upload options
                $http2.post('privacy/privacy', { // get privacy list default = 0
                    bPrivacyNoCustom: true
                })
            ]).then(function (data) {
                for (i = 0; i < data.length; ++i) {
                    if (data[i].error_code){
                        return;
                    }
                }
                // assign data to item
                $scope.attachmentContext.bCanAddVideo = data[0].data.bCanAddVideo || false;
                $scope.attachmentContext.bCanUploadVideo = data[0].data.bCanUploadVideo || false;
                $scope.attachmentContext.bCanAddUltimatevideo = data[0].data.bCanAddUltimatevideo || false;
                $scope.attachmentContext.bCanUploadUltimatevideo = data[0].data.bCanUploadUltimatevideo || false;
                if (limitedModules.indexOf($state.params.itemType) == -1 && data[0].data.bCanUploadMultiPhotos) {
                    $scope.attachmentContext.enableMultiPhotos = true;
                }
                
                $scope.viewOptions = data[1].data;
                if ($scope.viewOptions.legnth) {
                    $scope.statusData.iPrivacy = $scope.viewOptions[0].sValue;
                }
            });
        };

        $scope.getForm();

        $scope.isValidData = function(bAlert) {

            if (!$scope.statusData.sContent) {
                bAlert && $modal.alert(gettextCatalog.getString('Please enter your message'));
                return false;
            }

            return true;
        };

        $scope.onSave = function() {

            var val = $('#input_hidden_user_status').val();
            $scope.statusData.body_html = val;
            $scope.statusData.sContent  = val;

            if ($scope.isProcessing || !$scope.isValidData(true)) {
                return;
            }

            switch ($scope.attachmentItem.sType) {
                case 'core_link':
                    $scope.saveWithCoreLink();
                    break;
                case 'location':
                    $scope.saveWithLocation();
                    break;
                case 'photo':
                    $scope.doSaveWithPhoto();
                    break;
                case 'ultimatevideo':
                    $scope.doSaveWithUltimatevideoURL();
                    break;
                case 'ultimatevideo_upload':
                    $scope.doSaveWithUltimatevideoUpload();
                    break;
                case 'video':
                    $scope.saveWithVideoURL();
                    break;
                case 'video_upload':
                    $scope.saveWithVideoUpload();
                    break;
                default:
                    $scope.save();
            }
        };

        $scope.saveWithCoreLink = function() {

            $scope.statusData.aAttachment = {
                uri: $scope.attachmentItem.sLink,
                title: $scope.attachmentItem.sTitle,
                description: $scope.attachmentItem.sDescription,
                thumb: $scope.attachmentItem.sDefaultImage,
                type: 'link'
            };

            $scope.save();
        };

        $scope.save = function() {

            $scope.isProcessing = true;

            $http2.post('feed/post', $scope.statusData)
                .success($scope.doSaveSuccess)
                .error($scope.doSaveError)
                .finally(function() {
                    $scope.isProcessing = false;
                });
        };

        $scope.doSaveSuccess = function(data) {

            if (data.error_code) {
                return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
            }

            if (data.message) {
                $modal.toast(data.message);
            }

            $globalData.set('hasNewFeed', true);
            $scope.goBack();
        };

        $scope.doSaveError = function() {

            console.error('feed/post', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
        };

        $scope.saveWithLocation = function() {

            if ($scope.isProcessing) {
                return;
            }

            $scope.isProcessing = true;

            var postData = {
                sLocation: $scope.attachmentItem.getTitle(),
                fLatitude: $scope.attachmentItem.getCoords().lat,
                fLongitude: $scope.attachmentItem.getCoords().lng,
                iUserId: $scope.statusData.iSubjectId,
                sStatus: $scope.statusData.sContent,
                iPrivacy: $scope.statusData.iPrivacy
            };

            $http2.post('user/checkin', postData)
                .success($scope.doSaveSuccess)
                .error($scope.doSaveError)
                .finally(function() {
                    $scope.isProcessing = false;
                });
        };

        $scope.doSaveWithPhoto = function() {
            $scope.photoIds = [];
            $scope.uploadPhoto(0);
        };

        $scope.uploadPhoto = function(index) {
            var success = function(data) {
                if (data.error_code) {
                    return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
                }

                $scope.photoIds.push(data.iPhotoId);

                if (index < $scope.attachmentItem.sPaths.length - 1) {
                    $scope.uploadPhoto(index + 1);
                } else {
                    $scope.postFeedPhotos();
                }
            };

            var error = function(error) {
                console.error('photo/upload', arguments);

                if (error.code == FileTransferError.ABORT_ERR) {
                    return $modal.toast(gettextCatalog.getString('Canceled'));
                }

                $modal.alert(gettextCatalog.getString('Can not upload file. Please try again later'));
            };

            var sendData = {
                isPostStatus: true
            };

            if ($scope.statusData.sSubjectType != 'user') {
                sendData.sModule = $scope.statusData.sSubjectType,
                sendData.iItemId = $scope.statusData.iSubjectId
            }

            $http2.upload('photo/upload', $scope.attachmentItem.sPaths[index], sendData).then(success, error);
        };

        $scope.postFeedPhotos = function() {
            $scope.statusData.aAttachment = {
                ids: $scope.photoIds.join(),
                type: 'photo'
            };

            $scope.save();
        };

        $scope.saveWithVideoURL = function () {
            if ($scope.isProcessing) {
                return true;
            }

            $scope.isProcessing = true;

            var postData = $.extend($scope.attachmentItem, {
                iSubjectId: $scope.statusData.iSubjectId,
                sSubjectType: $scope.statusData.sSubjectType,
                status_info: $scope.statusData.sContent,
                privacy: $scope.statusData.iPrivacy
            });

            $http2.post('video/shareFeed', postData)
                .success(function (data) {
                    $scope.doSaveSuccess(data);
                })
                .error(function () {
                    $site.debug > 2 && console.log(arguments);
                })
                .finally(function () {
                    $scope.isProcessing = false;
                });
        };

        $scope.saveWithVideoUpload = function() {

            var postData = {
                iSubjectId: $scope.statusData.iSubjectId,
                sSubjectType: $scope.statusData.sSubjectType,
                sContent: $scope.statusData.sContent,
                privacy: $scope.statusData.iPrivacy,
                title: $scope.attachmentItem.sTitle || 'Untitled',
                isPostStatus: 1
            };

            var error = function(error) {
                if (error.code === FileTransferError.ABORT_ERR) {
                    return $modal.toast(gettextCatalog.getString('Canceled'));
                }

                $modal.alert(gettextCatalog.getString('Can not upload file. Please try again later'));
            };

            $http2.upload('video/upload', $scope.attachmentItem.sPath, postData, 'video').then($scope.doSaveSuccess, error);
        };

        // open privacy select list
        $scope.onPrivacySelect = $scope._setting($scope, function(){
            var iconCheckBox = ionic.Platform.isAndroid() ? 'ion-android-checkbox' : 'ion-ios-checkmark';
            var iconCheckBoxBlank = ionic.Platform.isAndroid() ? 'ion-android-checkbox-outline-blank' : 'ion-ios-circle-outline';

            var privacyBtns = [];

            $scope.viewOptions.forEach(function(item,i){
                privacyBtns.push({
                    // check the check mark to show current selected privacy
                    text: ($scope.statusData.iPrivacy == item.sValue ? '<i class="icon ' + iconCheckBox + '"></i> ' : '<i class="icon ' + iconCheckBoxBlank + '"></i> ') + item.sPhrase,
                    action: $scope._setPrivacy(item.sValue)
                });
            });

            return privacyBtns;
        });

        $scope._setPrivacy = function(iPrivacy) {
            return function(){
                $scope.statusData.iPrivacy = iPrivacy;
            }
        };

        $scope.doSaveWithUltimatevideoURL = function () {
            if ($scope.isProcessing) {
                return true;
            }

            $scope.isProcessing = true;

            var postData = $.extend($scope.attachmentItem, {
                iItemId: $scope.statusData.iSubjectId,
                sModule: $scope.statusData.sSubjectType,
                sDescription: $scope.statusData.sContent,
                iPrivacy: $scope.statusData.iPrivacy
            });

            $http2.post('ultimatevideo/create', postData)
                .success(function (data) {
                    $scope.doSaveSuccess(data);
                })
                .error(function () {
                    $site.debug > 2 && console.log(arguments);
                })
                .finally(function () {
                    $scope.isProcessing = false;
                });
        };

        $scope.doSaveWithUltimatevideoUpload = function () {
            if ($scope.isProcessing) {
                return true;
            }

            // $modal.alert(JSON.stringify($scope.data));
            $scope.isProcessing = true;

            var postData = $.extend($scope.attachmentItem, {
                iItemId: $scope.statusData.iSubjectId,
                sModule: $scope.statusData.sSubjectType,
                sDescription: $scope.statusData.sContent,
                iPrivacy: $scope.statusData.iPrivacy,
                sTitle: $scope.attachmentItem.sTitle || 'Untitled'
            });

            $http2.upload(
                'ultimatevideo/create',
                $scope.attachmentItem.sPath,
                postData,
                'video')
                .then(function (data) {
                    $scope.doSaveSuccess(data);
                }, function (error) {
                    $scope.isProcessing = false;

                    if (parseInt(error.code) === FileTransferError.ABORT_ERR) {
                        return $modal.toast(gettextCatalog.getString('Canceled'));
                    }

                    $modal.alert(gettextCatalog.getString('Can not upload video'));
                });
        };
    };
});