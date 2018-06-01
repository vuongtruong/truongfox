define([
    'global/validator',
    'text!tpl/location/location-list-modal.html'
], function(Validator, locationListModalTpl) {

    return function($scope, $ionicPopup, $ionicActionSheet, $ionicModal, $http2, $site, gettextCatalog, $modal) {

        $scope.attachmentItem = {};
        $scope.attachmentData = {};

        $scope.isAttached = function() {

            if (!$.isEmptyObject($scope.attachmentItem)) {
                $modal.alert(gettextCatalog.getString('Cannot contain more than one item. Please remove the current selection before adding another item.'));
                return true;
            };

            return false;
        };

        $scope.onAddPhoto = function(sourceType) {

            if ($scope.isProcessingAttach) {
                return;
            }

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

            $scope.attachmentItem = {
                sPaths: $scope.attachmentItem.sPaths || [],
                sType: 'photo'
            };

            $scope.attachmentItem.sPaths.push(fileURI);

            $scope.$$phase || $scope.$apply();
        };

        $scope.removeAttachmentPhoto = function(path) {

            for (var i = $scope.attachmentItem.sPaths.length - 1; i >= 0; i--) {
                if ($scope.attachmentItem.sPaths[i] == path) {
                    $scope.attachmentItem.sPaths.splice(i, 1);
                }
            };

            if (!$scope.attachmentItem.sPaths.length) {
                $scope.attachmentItem = {};
            }
        };

        $scope.onAddVideo = $scope._setting($scope, function () {

            var btns = [];

            btns.push({
                text: gettextCatalog.getString('Select Video URL'),
                action: $scope.onAddVideoFromURL
            });

            btns.push({
                text: gettextCatalog.getString('Upload Video'),
                action: $scope.onAddVideoFromDevice
            });

            return btns;
        });

        $scope.onAddVideoFromURL = function(){
            $modal.prompt(gettextCatalog.getString('Paste your video URL'), function(result) {
                $scope.$$phase || $scope.$apply();

                if (result.buttonIndex === 2) {
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
                        $scope.attachmentItem.sTitle = data.title;
                        $scope.attachmentItem.sDescription = data.description;
                        $scope.attachmentItem.sThumb = data.default_image;
                        $scope.attachmentItem.embed_code = data.embed_code;
                        $scope.attachmentItem.sType = 'video';
                        $scope.attachmentItem.sPath = '';
                        $scope.attachmentItem.url = result.input1;
                        $scope.attachmentItem.sVideoSource = 'url';
                        $scope.isProcessing = false;
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

        $scope.onAddVideoFromDevice = function() {

            if ($scope.isAttached() || $scope.isProcessingAttach) {
                return;
            }

            var getSuccess = function(fileURI) {
                $scope.addVideoFromDeviceSuccess(fileURI);
            };

            var getFail = function(msg) {
                if (msg == 20) { // PERMISSION_DENIED_ERROR = 20
                    $modal.alert(gettextCatalog.getString('Illegal Access'));
                }
            };

            navigator.camera.getPicture(getSuccess, getFail, {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                mediaType: Camera.MediaType.VIDEO
            });
        };

        $scope.addVideoFromDeviceSuccess = function(fileURI) {

            $scope.attachmentItem = {
                sPath: fileURI,
                sType: 'video_upload'
            };

            $scope.$$phase || $scope.$apply();
        };

        $scope.onAddLocation = function() {
            $scope.locationListModal && $scope.locationListModal.remove();

            $scope.locationListModal = $ionicModal.fromTemplate(locationListModalTpl, {
                scope: $scope
            });
            $scope.locationListModal.show();
        };

        $scope.hideLocationListModal = function() {

            $scope.locationListModal.hide();
        };

        $scope.addLocationSuccess = function(location) {

            $scope.hideLocationListModal();

            $scope.attachmentItem = $.extend(location, {
                sType: 'location'
            });
        };

        $scope.onAddLink = function() {

            if ($scope.isAttached() || $scope.isProcessingAttach) {
                return;
            }

            $modal.prompt('http://www.example.com', function(result) {
                if (result.buttonIndex == 2) {
                    return true;
                }
                if (!result.input1) {
                    return false;
                }
                $scope.attachmentData.sLink = result.input1;
                $scope.addLink();
            }, gettextCatalog.getString('Attach Link'), [gettextCatalog.getString('OK'), gettextCatalog.getString('Cancel')]);
        };

        $scope.addLink = function() {

            $scope.isProcessingAttach = true;

            // prepare url
            if (!$scope.attachmentData.sLink.match(/^[a-zA-Z]{1,5}:\/\//)) {
                $scope.attachmentData.sLink = 'http://' + $scope.attachmentData.sLink;
            }

            $http2.post('link/preview', $scope.attachmentData)
                .success($scope.addLinkSuccess)
                .error($scope.addLinkError)
                .finally(function() {
                    $scope.attachmentData = {};
                    $scope.isProcessingAttach = false;
                });
        };

        $scope.addLinkSuccess = function(data) {

            if (data.error_code) {
                return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
            }

            if (data.message) {
                $modal.toast(data.message);
            }

            $scope.attachmentItem = $.extend(data, {
                sTitle: data.sTitle || data.sLink,
                sDescription: data.sDescription || '',
                sType: 'core_link'
            });
        };

        $scope.addLinkError = function() {

            console.warn('addLinkError', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
        };

        $scope.removeAttachment = function() {

            $scope.attachmentItem = {};
        };

        switch ($scope.attachmentContext.action) {
            case 'camera':
                $scope.onAddPhoto('CAMERA');
                break;
            case 'location':
                $scope.onAddLocation();
                break;
        }

        $scope.$on('$destroy', function() {
            $scope.locationListModal && $scope.locationListModal.remove();
        });

        $scope.onAddUltimateVideo = $scope._setting($scope, function () {
            var btns = [];

            btns.push({
                text: gettextCatalog.getString('Select Video URL'),
                action: $scope.onSelectFromURL
            });

            btns.push({
                text: gettextCatalog.getString('Upload Video'),
                action: $scope.onSelectFromDevice
            });

            return btns;
        });

        $scope.onSelectFromURL = function () {
            $modal.prompt(gettextCatalog.getString('Paste your video URL'), function (result) {
                if (result.buttonIndex === 2) {
                    return true;
                }
                if (!result.input1) {
                    return false;
                }

                if (!$scope.extractCode(result.input1)) {
                    return $modal.alert(gettextCatalog.getString('Not Supported Video URL'));
                }

                // Get video information
                $http2.post('ultimatevideo/validateUrl', {
                    sVideoCode: $scope.attachmentItem.sVideoCode,
                    sVideoSource: $scope.attachmentItem.sVideoSource
                })
                    .success(function (data) {
                        if (data.error_code) {
                            $modal.alert(data.error_message);
                        } else {
                            // set title and description
                            $scope.attachmentItem.sTitle = data.title;
                            $scope.attachmentItem.sDescription = data.description;
                            $scope.attachmentItem.sThumb = data.image;
                            $scope.attachmentItem.sType = 'ultimatevideo';
                            $scope.isProcessing = false; // release blocking status
                        }
                    })
                    .error(function () {
                        $site.debug > 2 && console.log(arguments);
                    })
                    .finally(function () {
                        $scope.isProcessing = false;
                    });


                // reset spath video from device
                $scope.attachmentItem.sPath = '';
                $scope.attachmentItem.sUrl = result.input1;
            }, gettextCatalog.getString('Video URL'), [gettextCatalog.getString('OK'), gettextCatalog.getString('Cancel')]);
        };

        $scope.onSelectFromDevice = function () {
            navigator.camera.getPicture(function (fileURI) {
               // success handler
               $scope.attachmentItem.sPath = fileURI;
               $scope.attachmentItem.sType = 'ultimatevideo_upload';
               $scope.attachmentItem.sUrl = '';
               $scope.attachmentItem.sVideoSource = 'Uploaded';

            }, function (msg) {
                // PERMISSION_DENIED_ERROR = 20
                if (parseInt(msg) === 20) {
                    $modal.alert(gettextCatalog.getString('Illegal Access'));
                }
            }, {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                mediaType: Camera.MediaType.VIDEO
            });
        };

        $scope.extractCode = function (url) {
            var videoid;
            videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
            if (videoid) {
                $scope.attachmentItem.sVideoSource = 'Youtube';
                $scope.attachmentItem.sVideoCode = videoid[1];
                return true;
            }

            videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?vimeo.com\/(\d+)($|\/)/);
            if (videoid) {
                $scope.attachmentItem.sVideoSource = 'Vimeo';
                $scope.attachmentItem.sVideoCode = videoid[1];
                return true;
            }

            videoid = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
            if (videoid) {
                $scope.attachmentItem.sVideoSource = 'Dailymotion';
                $scope.attachmentItem.sVideoCode = videoid[2];
                return true;
            }

            videoid = url.match(/http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$/);
            if (videoid) {
                $scope.attachmentItem.sVideoSource = 'Facebook';
                $scope.attachmentItem.sVideoCode = videoid[2];
                return true;
            }

            var ext = url.substr(url.lastIndexOf('.') + 1);
            if (ext.toUpperCase() === 'MP4') {
                $scope.attachmentItem.sVideoSource = 'VideoURL';
                $scope.attachmentItem.sVideoCode = url;
                return true;
            }
            var code = url.match(/(<iframe.*? src=(\"|\'))(.*?)((\"|\').*)/);
            if (code && code.length > 2) {
                $scope.attachmentItem.sVideoSource = 'Embed';
                $scope.attachmentItem.sVideoCode = code[3];
                return true;
            }
            return false;
        };
    };
});