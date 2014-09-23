angular.module('rruleRecurringSelect', []).directive('rruleRecurringSelect', [function() {
  return {
    restrict: 'E',
    scope: {
      rule: "=",
    },
    templateUrl: '/template/rrule_recurring_select.html',
    link: function(scope, elem, attrs) {
      scope.init = function() {
        scope.initFrequencies();
        scope.weekDays = scope.daysOfWeek();
        scope.selectedFrequency = scope.frequencies[0];
        scope.selectedMonthFrequency = 'day_of_month';
        scope.initMonthlyDays();
        scope.initMonthlyWeeklyDays();
      };

      scope.initFrequencies = function() {
        scope.frequencies = [
          { name: 'Daily', rruleType: RRule.DAILY, type: 'day' },
          { name: 'Weekly', rruleType: RRule.WEEKLY, type: 'week' },
          { name: 'Monthly', rruleType: RRule.MONTHLY, type: 'month' },
          { name: 'Yearly', rruleType: RRule.YEARLY, type: 'year' }
        ];
      };

      scope.daysOfWeek = function() {
        return [
          { name: 'S', value: RRule.SU, selected: false },
          { name: 'M', value: RRule.MO, selected: false },
          { name: 'T', value: RRule.TU, selected: false },
          { name: 'W', value: RRule.WE, selected: false },
          { name: 'T', value: RRule.TH, selected: false },
          { name: 'F', value: RRule.FR, selected: false },
          { name: 'S', value: RRule.SA, selected: false },
        ];
      };

      scope.initMonthlyDays = function() {
        scope.monthDays = [];

        _.times(31, function(index) {
          scope.monthDays.push({ day: index + 1, value: index + 1, selected: false });
        });

        scope.monthDays.push({ day: 'Last Day', value: -1, selected: false });
      };

      scope.initMonthlyWeeklyDays = function() {
        scope.monthWeeklyDays = [];
        //   byweekday: [RRule.TH.nth(3), RRule.MO.nth(2)]

        _.times(4, function(index) {
          var days = _.map(scope.daysOfWeek(), function(dayOfWeek){
            dayOfWeek.value = dayOfWeek.value.nth(index + 1);
            return dayOfWeek;
          });
          scope.monthWeeklyDays.push(days);
        });
      }

      scope.init();
    }
  }
}]);
