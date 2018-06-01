define([
    'global/base/BaseController',
    'quiz/controller/quiz-home-ipad',
    'settings/site'
], function(Controller, QuizHomeIpadCtrl, site) {
    return function($scope, $injector, $site, gettext, gettextCatalog, $modal, $location) {
        /**
         * this is base controller for "browse quizzes", "my quizzes page"
         */

        /**
         * extends base classes
         */
        $injector.invoke(Controller, this, {
            $scope: $scope
        });
        
        if (site.template === 'ipad') {
            $injector.invoke(QuizHomeIpadCtrl, this, {
                $scope: $scope
            });
        }
    };
});