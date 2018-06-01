define([
    'settings/site',
    'global/base/BrowseController',
    'chat/controller/chat-home-ipad',
    'text!tpl/chat/chat-search-dir.html',
    'text!tpl/chat/chat-detail.html',
    'text!tpl/chat/chat-smile.html',
    'text!tpl/chat/chat-search-message.html'
], function(site, BrowseController, ChatHomeIpadCtrl, searchTemplate, chatDetailTpl) {
    return function($scope, $injector, $http2, $site, $modal, gettext, gettextCatalog, $chat, $state, $viewer, $ionicModal, $location, socket, $ionicPopover, $ionicActionSheet, $timeout, $rootScope, $coreSettings) {
        $injector.invoke(BrowseController, this, {
            $scope: $scope
        });
        $scope.thread_id = '';
        $scope.searchTemplate = searchTemplate;
        $scope.dataReady = false;
        $scope.bIMTwemojiEnable = false;
        $scope.bIMAttachmentEnable = false;

        $scope.chatListData = {
            sAction: 'all',
            user_id: $viewer.get('iUserId')
        };

        $scope.chatId = $state.params.id || 0;

        $scope.userStatus = 'online';

        $scope.getStatus = function() {

            var postData = {
                user_id: $viewer.get('iUserId')
            };

            $http2.post('chat/getstatus', postData)
            .success($scope.getStatusSuccess)
            .error($scope.getStatusError)
            .finally(function() {
                $scope.dataReady = true;
            });
        };

        $scope.getStatusSuccess = function(data) {

            if (data.error_code) {
                console.warn('getStatusSuccess', data);
            }

            $scope.userStatus = data.sStatus;
        };

        $scope.getStatusError = function() {

            console.warn('getStatusError', arguments);
        };

        $scope.onChatSetting = $scope._setting($scope, function() {

            var settingBtns = [];
            if ($chat.isMuteNotification()) {
                settingBtns.push({
                    text: gettextCatalog.getString('Unmute Notification'),
                    action: function() {
                        $chat.setMuteNotification(false);
                    }
                });
            } else {
                settingBtns.push({
                    text: gettextCatalog.getString('Mute Notification'),
                    action: function() {
                        $chat.setMuteNotification(true);
                    }
                });
            }

            if (!ionic.Platform.isIPad()) {
                if ($chat.getVibrateStatus() == 'on') {
                    settingBtns.push({
                        text: gettextCatalog.getString('Disable Vibration'),
                        action: function() {
                            $chat.setVibrateStatus('off');
                        }
                    });
                } else {
                    settingBtns.push({
                        text: gettextCatalog.getString('Enable Vibration'),
                        action: function() {
                            $chat.setVibrateStatus('on');
                        }
                    });
                }
            }

            return settingBtns;
        });

        $scope.doChangeStatusSuccess = function(data) {

            if (data.error_code) {
                return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
            }

            $scope.hideSheet();

            if (data.message) {
                $modal.toast(data.message);
            }

            $scope.userStatus = data.sStatus;
        };

        $scope.doChangeStatusError = function() {

            console.warn('doChangeStatusError', arguments);
            $modal.alert(gettextCatalog.getString('Can not load data from server'));
        };

        $scope.showChat = function(obj) {
            $scope.chatModal && $scope.chatModal.remove();

            $scope.chatObj = obj;

            if(parseInt($viewer.get('iUserId')) < parseInt($scope.chatObj.getId()))
                $scope.thread_id = $viewer.get('iUserId') + ':' + $scope.chatObj.getId();
            else
                $scope.thread_id = $scope.chatObj.getId() + ':' + $viewer.get('iUserId');

            $scope.$broadcast('chat:objChange', obj);
            $scope.chatModal = $ionicModal.fromTemplate(chatDetailTpl, {
                scope: $scope
            });

            $scope.chatModal.show();
        };

        $scope.getPartnerId = function(thread_id) {
            var ids = thread_id.split(':');
            return (ids[0] == $viewer.get('iUserId')) ? ids[1] : ids[0];
        };

        $scope.hideChat = function() {

            $scope.chatModal.remove();
        };

        $scope.getStatus();

        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
            
            $scope.chatModal && $scope.chatModal.remove();
        });

        if (site.template === 'ipad') {
            $injector.invoke(ChatHomeIpadCtrl, this, {
                $scope: $scope
            });
        }

    //    init socket service
        $scope.initSocketService = function() {
            $http2.post('chat/getConfig')
                .success(function (data) {
                    if (data.error_code) {
                        return $modal.alert(data.error_message || 'Can not load data from server');
                    }
                    $chat.storage.configs = data;
                    $scope.bIMTwemojiEnable = $chat.storage.configs.bIMTwemojiEnable;
                    $scope.bIMAttachmentEnable = $chat.storage.configs.bIMAttachmentEnable;
                    // socket io init
                    site.debug && console.log('IM - init chat server', data);
                    socket.init(data.sChatServer);
                    // connect to chat server
                    if (typeof data.sIMToken !== 'undefined') {
                        site.debug && console.log('IM - Connect to chat server with token:', data.sIMToken);
                        socket.emit('host', {
                            token: data.sIMToken
                        });
                    }
                    $viewer.update({sSitePhotoLink:data.sSitePhotoLink});
                    // Define socket event listeners
                    socket.on('host_failed', function(message) {
                        site.debug && console.log('IM - On host_failed. Message:', message);
                        socket.destroy();
                        // Disable chat module. TODO: Replace this by better action if needed
                        $coreSettings.set({'chat_module' : false});
                    });
                    socket.on('connect_successfully', function () {
                        site.debug && console.log('IM - Connect successfully');
                        // clear threads
                        $chat.storage.aUsers = [];
                        // load threads
                        socket.emit('loadThreads', $viewer.get('iUserId'), data.iTotalConversations);
                    });

                    socket.on('loadThreads', function (thread) {
                        site.debug && console.log('IM - On loadThreads', thread);
                        $chat.storage.iThreadCount++;
                        thread = $.parseJSON(thread);
                        if (typeof thread.is_hidden != 'undefined' && thread.is_hidden === '1') {
                            site.debug && console.log('IM - No new count...');
                        } else {
                            $chat.storage.iThreadShow++;
                        }
                        // in case thread to show
                        if (data.iTotalConversations !== '0' && data.iTotalConversations !== '' && $chat.storage.iThreadShow > data.iTotalConversations) {
                            thread.is_hidden = '1';
                        }
                        for (var i in thread.users) {
                            if($.isNumeric(thread.users[i])) {
                                ($chat.storage.aUsers.indexOf(thread.users[i]) === -1) && $chat.storage.aUsers.push(thread.users[i]);
                                if(thread.users[i] !== $viewer.get('iUserId')) {
                                    thread.iUserId = thread.users[i];
                                }
                            }
                        }
                        site.debug && console.log('IM - Chat storage', $chat.storage);
                        socket.emit('update_new', thread.iUserId, thread.thread_id);
                    });

                    socket.on('lastThread', function (thread) {
                        site.debug && console.log('IM - On lastThread', $chat.storage);
                        $scope.$broadcast('chat:buildThreads');
                        if(typeof $chat.storage.refreshInterval === 'undefined') {
                            $chat.storage.refreshInterval = setInterval(function () {
                                $scope.$broadcast('chat:buildThreads');
                            }, 15000);
                        }
                    });

                    socket.on('chat', function (chat) {
                        /*send notifications*/
                        if ((chat.user.id != $viewer.get('iUserId')) && (chat.receiver.id == $viewer.get('iUserId'))) {
                            $chat.setUnread(chat.user.id);
                            if ($chat.getVibrateStatus() == 'on' && (window.isInBackground || $state.current.module != 'chat')) {
                                $modal.vibrate(100);
                                if(typeof navigator.notification !== 'undefined') {
                                    navigator.notification.beep(1);
                                }
                            }
                            // set total new
                            $scope.$broadcast('chat:updateNewOnChat', {chat: chat});
                        }
                    });

                    socket.on('update_new', function (thread, total, is_last) {
                        site.debug && console.log('IM - On update_new', thread, total, is_last);
                        $scope.$broadcast('chat:updateNew', {thread: JSON.parse(thread), total: total, is_last: is_last});
                    });
                })
                .error(function (data) {
                })
                .finally(function() {
                    $scope.dataReady = true;
                });
        };
        $scope.initSocketService();

        //load emojis & init attachment
        $scope.emojis = [];

        $scope.messageData = {
            sMessage: ''
        };

        //load emojis
        $scope.loadEmojis = function() {
            if($scope.emojis != '')
                return;
            $http2.get('chat/getEmojis', {
                bPrivacyNoCustom: true
            })
                .success(function(data) {
                    if(data.error_code){
                        $modal.alert(data.error_message);
                        $scope.goBack();
                    }else{
                        $scope.emojis = data.content;
                    }

                }).error(function() {

            });
        };

        $scope.disableScrollContent = function() {

            var $body = $('body');
            var $content = $('.yn-content');
            var top = $body.scrollTop();

            $content.css({
                'height': (window.innerHeight + top) + 'px',
                'overflow-y': 'hidden',
                'margin-top': '-' + top + 'px'
            });
        };

        $scope.enableScrollContent = function() {
            var $body = $('body');
            var $content = $('.yn-content');
            var top = $content.css('margin-top').match(/\d+/)[0];
            $content.css({
                'height': 'auto',
                'overflow-y': 'visible',
                'margin-top': 'initial'
            });
            $body.scrollTop(top);
        };

        $scope.addEmoticon = function(text) {

            $scope.messageData.sMessage += text;

            var ngInput = angular.element('.input-message');
            ngInput.scrollTop(ngInput[0].scrollHeight);
        };

        $scope.onOrientationChange = function() {

            $scope.smilePopover && $scope.smilePopover.hide();
        };

        window.addEventListener('orientationchange', $scope.onOrientationChange);

        $scope.onSendMessage = function(){
            if($.trim($scope.messageData.sMessage) =='')
                return;
            // identify receiver
            var receiver = {};
            for(var i in $chat.storage.aThreads) {
                var thread = $chat.storage.aThreads[i];
                if(thread.thread_id === $scope.thread_id) {
                    receiver = {
                        id: parseInt(thread.iUserId),
                        name: thread.aBuiltThread.sFullName,
                        photo_link: thread.aBuiltThread.sImage
                    };
                }
            }
            // add message to message list
            var message = {
                text: $scope.messageData.sMessage,
                user: {
                    id: parseInt($viewer.get('iUserId')),
                    name: $viewer.get('sFullName'),
                    photo_link: $viewer.get('sSitePhotoLink')
                },
                receiver: receiver,
                time_stamp: Date.now(),
                thread_id: $scope.thread_id,
                attachment_id: ($scope.iAttachmentId ? $scope.iAttachmentId : ''),
                listing_id: 0,
                deleted: false
            };
            $site.debug && console.log('IM - chat message', message);
            $rootScope.$broadcast('build-message', message);

            // emit chat event
            socket.emit('chat', message);
            $rootScope.$broadcast('chat:resetNew', {thread_id: $scope.thread_id});
            $scope.messageData.sMessage = '';
        };

        $scope.onSendAttachment = function (iAttachmentId) {
            // identify receiver
            var receiver = {};
            for(var i in $chat.storage.aThreads) {
                var thread = $chat.storage.aThreads[i];
                if(thread.thread_id === $scope.thread_id) {
                    receiver = {
                        id: parseInt(thread.iUserId),
                        name: thread.aBuiltThread.sFullName,
                        photo_link: thread.aBuiltThread.sImage
                    };
                }
            }
            // add message to message list
            var message = {
                text: '',
                user: {
                    id: parseInt($viewer.get('iUserId')),
                    name: $viewer.get('sFullName'),
                    photo_link: $viewer.get('sSitePhotoLink')
                },
                receiver: receiver,
                time_stamp: Date.now(),
                thread_id: $scope.thread_id,
                attachment_id: iAttachmentId,
                listing_id: 0,
                deleted: false
            };
            $site.debug && console.log('IM - chat message', message);
            $rootScope.$broadcast('build-message', message);

            // emit chat event
            socket.emit('chat', message);
            $scope.messageData.sMessage = '';
        };
        $scope.loadEmojis();

        /**
         * Upload photo
         */

        $scope.uploadPhotoSuccess = function(data) {
            if (data.error_code) {
                return $modal.alert(data.error_message || gettextCatalog.getString('Can not load data from server'));
            }

            if (!data.path) {
                console.warn('chat/addAttachment', data);
                return $modal.alert(gettextCatalog.getString('Can not upload file. Please try again later'));
            }
            $scope.onSendAttachment(data.id);
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

        $scope.uploadPhoto = function() {
            var success = function(data) {
                $scope.uploadPhotoSuccess(data);
            };

            var error = function(error) {
                console.error('message/attach', arguments);

                if (error.code == FileTransferError.ABORT_ERR) {
                    return $modal.toast(gettextCatalog.getString('Canceled'));
                }

                $modal.alert(gettextCatalog.getString('Can not upload file. Please try again later'));
            };

            $http2.upload('chat/addAttachment', $scope.photoURI, {}).then(success, error);
        };

        $scope.doAddPhoto = function(sourceType) {

            sourceType = sourceType || 'PHOTOLIBRARY';

            var getSuccess = function(fileURI) {
                $scope.photoURI = fileURI;
                $scope.$$phrase || $scope.$apply();
                $scope.uploadPhoto();
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

        $scope.onRemovePhoto = function() {
            $scope.photoURI = null;
        };

    };
});