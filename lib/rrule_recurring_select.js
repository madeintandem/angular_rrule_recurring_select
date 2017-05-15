angular.module('rruleRecurringSelect', []).directive('rruleRecurringSelect', [function() {
  return {
    restrict: 'E',
    scope: {
      rule: "=",
      okClick: "=",
      cancelClick: "=",
      showButtons: "="
    },
    templateUrl: 'template/rrule_recurring_select.html',
    link: function(scope, elem, attrs) {

      var MS_IN_DAY = 1000 * 60 * 60 * 24;

      scope.init = function() {
        scope.showStart = typeof attrs['showStart'] !== "undefined";
        scope.showEnd = typeof attrs['showEnd'] !== "undefined";
        scope.compact = typeof attrs['compact'] !== "undefined";
        scope.initFrequencies();
        scope.initWeekOrdinals();
        scope.selectedMonthFrequency = 'day_of_month';
        scope.hideActions = typeof attrs['hideActions'] !== 'undefined';
        scope.resetData();
        scope.$watch(scope.currentRule, scope.ruleChanged);
        scope.dateOptions = {};
        var minUntil = attrs['minUntil'];
        if (minUntil) {
          scope.dateOptions.minDate = new Date(parseInt(minUntil));
        }
        if(!_.isEmpty(scope.rule)) {
          scope.parseRule(scope.rule);
        }
        else
          scope.calculateRRule();
      };

      scope.initFrequencies = function() {
        scope.frequencies = [
          { name: 'Hourly', rruleType: RRule.HOURLY, type: 'hour' },
          { name: 'Daily', rruleType: RRule.DAILY, type: 'day' },
          { name: 'Weekly', rruleType: RRule.WEEKLY, type: 'week' },
          { name: 'Monthly', rruleType: RRule.MONTHLY, type: 'month' },
          { name: 'Yearly', rruleType: RRule.YEARLY, type: 'year' }
        ];
        scope.selectedFrequency = scope.frequencies[1];
      };

      scope.initMonthlyDays = function() {
        scope.monthDays = [];
        scope.yearMonthDays = [];

        _.times(31, function(index) {
          var day = { day: index + 1, value: index + 1, selected: false };
          scope.monthDays.push(day);
          scope.yearMonthDays.push(day);
        });
        var lastDay = { day: 'Last Day', value: -1, selected: false };
        scope.monthDays.push(lastDay);
        scope.yearMonthDays.push(lastDay);
      };

      scope.initWeekOrdinals = function() {
        scope.weekOrdinals = ['st', 'nd', 'rd', 'th'];
      };

      scope.initMonthlyWeeklyDays = function() {
        scope.monthWeeklyDays = [];

        _.times(4, function(index) {
          var days = _.map(scope.daysOfWeek(), function(dayOfWeek){
            dayOfWeek.value = dayOfWeek.value.nth(index + 1);
            return dayOfWeek;
          });
          scope.monthWeeklyDays.push(days);
        });
      };

      scope.resetData = function() {
        var hoursFunc = attrs['hoursFunc'] || 'hoursOfDay';
        scope.weekStart = attrs['weekStartDay'] || 'SU';
        scope.hours = scope[hoursFunc]();
        scope.defaultUntil = attrs['defaultUntil'];
        scope.weekDays = scope.daysOfWeek();
        scope.initMonthlyDays();
        scope.initMonthlyWeeklyDays();
        scope.initYearlyMonths();
        scope.selectedYearMonth = 1;
        scope.selectedYearMonthDay = 1;
        scope.interval = '';
      };

      scope.daysOfWeek = function() {
        var weekDays = ['SU','MO','TU','WE','TH','FR','SA'];
        var retVal = [];
        var startPos = weekDays.indexOf(scope.weekStart);
        for (var i=startPos; i<7;i++) {
          retVal.push({ name:weekDays[i].slice(0,1), value: RRule[weekDays[i]], selected:false});
        }
        for (i=0; i < startPos; i++) {
          retVal.push({ name:weekDays[i].slice(0,1), value: RRule[weekDays[i]], selected:false});
        }
        return retVal;
      };

      scope.hoursOfDay = function() {
        var hoursArray = [];
        for (var i = 0; i < 24 ; i++) {
          hoursArray.push({value:i, name: i.toString(), selected:false});
        }
        return hoursArray;
      };

      scope.medSlots = function() {
        return [
          { name: 'Morning', value: 7, selected: false },
          { name: 'Lunch', value: 12, selected: false },
          { name: 'Teatime', value: 17, selected: false },
          { name: 'Night', value: 22, selected: false }
        ];
      };

      scope.initYearlyMonths = function() {
        scope.yearMonths = [
          { name: 'Jan', value: 1, selected: false },
          { name: 'Feb', value: 2, selected: false },
          { name: 'Mar', value: 3, selected: false },
          { name: 'Apr', value: 4, selected: false },
          { name: 'May', value: 5, selected: false },
          { name: 'Jun', value: 6, selected: false },
          { name: 'Jul', value: 7, selected: false },
          { name: 'Aug', value: 8, selected: false },
          { name: 'Sep', value: 9, selected: false },
          { name: 'Oct', value: 10, selected: false },
          { name: 'Nov', value: 11, selected: false },
          { name: 'Dec', value: 12, selected: false }
        ];
      };

      scope.selectMonthFrequency = function(monthFrequency) {
        scope.selectedMonthFrequency = monthFrequency;
        scope.resetData();
        scope.calculateRRule();
      };

      scope.toggleSelected = function(day) {
        day.selected = !day.selected;
        scope.calculateRRule();
      };

      scope.calculateRRule = function(recurTypeChange) {

        switch (recurTypeChange) {
          case 'after' :
            delete scope.recurEnd.until;
            scope.recurEnd.count = scope.recurEnd.count || 1;
            break;
          case 'on' :
            delete scope.recurEnd.count;
            delete scope.recurrenceRule.options.count;
            if (!scope.recurEnd.until) {
              var defaultRecurEndBase;
              if (scope.defaultUntil) {
                defaultRecurEndBase = parseInt(scope.defaultUntil);
              } else {
                defaultRecurEndBase = new Date().getTime() + (MS_IN_DAY * 60);
              }
              if (defaultRecurEndBase < scope.minUntil) {
                defaultRecurEndBase = scope.minUntil + ONE_DAY;
              }
              // Go to the beginning of the day to get rid of what you can't see....
              var ms = defaultRecurEndBase % MS_IN_DAY;
              scope.recurEnd.until = new Date(defaultRecurEndBase - ms);
            }
            break;
        }

        var recurEndObj = {};
        if (scope.recurEnd) {
          switch (scope.recurEnd.type) {
            case 'never':
              break;
            case 'after' :
              if (scope.recurEnd.count) {
                recurEndObj.count = scope.recurEnd.count;
              }
              break;
            case 'on':
              if (scope.recurEnd.until) {
                recurEndObj.until = scope.recurEnd.until;
              }
              break;
            default:
              console.log('No support for recurEndType ' + scope.recurEnd.type);
          }
        }

        switch(scope.selectedFrequency.type) {
          case 'hour':
            scope.calculateHourlyRRule(recurEndObj);
            break;
          case 'day':
            scope.calculateDailyRRule(recurEndObj);
            break;
          case 'week':
            scope.calculateWeeklyRRule(recurEndObj);
            break;
          case 'month':
            scope.calculateMonthlyRRule(recurEndObj);
            break;
          case 'year':
            scope.calculateYearlyRRule(recurEndObj);
        }

        if(!_.isUndefined(scope.rule))
          scope.rule = scope.recurrenceRule.toString();
      };

      scope.calculateInterval = function() {
        var interval = parseInt(scope.interval);
        if (!interval)
          interval = 1;
        return interval;
      };

      scope.calculateHourlyRRule = function(recurEndObj) {
        scope.recurrenceRule = new RRule(angular.extend({
          freq: RRule.HOURLY,
          interval: scope.calculateInterval(),
          wkst: RRule[scope.weekStart]
        },recurEndObj));
      };

      scope.calculateDailyRRule = function(recurEndObj) {
        var ruleOptions = {
          freq: RRule.DAILY,
          interval: scope.calculateInterval(),
          wkst: RRule[scope.weekStart]
        };

        var selectedHours = _(scope.hours).select(function(hour) {
          return hour.selected;
        }).pluck('value').value();
        if (selectedHours.length > 0) {
          ruleOptions.byhour = selectedHours;
          ruleOptions.byminute = ruleOptions.bysecond = 0;
        }
        angular.extend(ruleOptions,recurEndObj);
        scope.recurrenceRule = new RRule(ruleOptions);
      };

      scope.calculateWeeklyRRule = function(recurEndObj) {
        var selectedDays = _(scope.weekDays).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule(angular.extend({
          freq: RRule.WEEKLY,
          interval: scope.calculateInterval(),
          wkst: RRule[scope.weekStart],
          byweekday: selectedDays
        },recurEndObj));
      };

      scope.calculateMonthlyRRule = function(recurEndObj) {
        if(scope.selectedMonthFrequency == 'day_of_month')
          scope.calculateDayOfMonthRRule(recurEndObj);
        else
          scope.calculateDayOfWeekRRule(recurEndObj);
      };

      scope.calculateDayOfMonthRRule = function(recurEndObj) {
        var selectedDays = _(scope.monthDays).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule(angular.extend({
          freq: RRule.MONTHLY,
          interval: scope.calculateInterval(),
          wkst: RRule[scope.weekStart],
          bymonthday: selectedDays
        },recurEndObj));
      };

      scope.calculateDayOfWeekRRule = function(recurEndObj) {
        var selectedDays = _(scope.monthWeeklyDays).flatten().select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule(angular.extend({
          freq: RRule.MONTHLY,
          interval: scope.calculateInterval(),
          wkst: RRule[scope.weekStart],
          byweekday: selectedDays
        }, recurEndObj));
      };

      scope.calculateYearlyRRule = function(recurEndObj) {
        var selectedMonths = _(scope.yearMonths).flatten().sortBy(function(month){
          return month.value;
        }).select(function(month) {
          return month.selected;
        }).pluck('value').value();

        var selectedDays = _(scope.yearMonthDays).flatten().sortBy(function(day){
          return day.value;
        }).select(function(day) {
          return day.selected;
        }).pluck('value').value();

        scope.recurrenceRule = new RRule(angular.extend({
          freq: RRule.YEARLY,
          interval: scope.calculateInterval(),
          bymonth: selectedMonths,
          bymonthday: selectedDays
        },recurEndObj));
      };

      scope.parseRule = function(rRuleString) {
        scope.recurrenceRule = RRule.fromString(rRuleString);

        scope.interval = scope.recurrenceRule.options.interval;

        scope.selectedFrequency = _.select(scope.frequencies, function(frequency) {
          return frequency.rruleType == scope.recurrenceRule.options.freq;
        })[0];

        switch(scope.selectedFrequency.type) {
          case 'day':
            scope.initFromDailyRule();
            break;
          case 'week':
            scope.initFromWeeklyRule();
            break;
          case 'month':
            scope.initFromMonthlyRule();
            break;
        }

       scope.initFromRecurEndRule();
      };

      scope.initFromRecurEndRule = function() {
        scope.recurEnd = {};
        if (!scope.recurEnd.until) {
          var defaultRecurEndBase;
          if (scope.defaultUntil) {
            defaultRecurEndBase = parseInt(scope.defaultUntil);
          } else {
            defaultRecurEndBase = new Date().getTime() + (MS_IN_DAY * 60);
          }
          if (defaultRecurEndBase < scope.minUntil) {
            defaultRecurEndBase = scope.minUntil + ONE_DAY;
          }
          // Go to the beginning of the day to get rid of what you can't see....
          var ms = defaultRecurEndBase % MS_IN_DAY;
          scope.recurEnd.until = new Date(defaultRecurEndBase - ms);
        }
        if (scope.recurrenceRule.options.until) {
          scope.recurEnd.type = 'on';
          scope.recurEnd.until = scope.recurrenceRule.options.until;
        } else if (scope.recurrenceRule.options.count) {
          scope.recurEnd.type = 'after';
          scope.recurEnd.count = scope.recurrenceRule.options.count;
        } else {
          scope.recurEnd.type = 'never';
        }
      };

      scope.initFromDailyRule = function() {
        var ruleSelectedHours = scope.recurrenceRule.options.byhour;

        _.each(scope.hours, function(hour) {
          hour.selected = (_.contains(ruleSelectedHours, hour.value));
        });
      };

      scope.initFromWeeklyRule = function() {
        var ruleSelectedDays = scope.recurrenceRule.options.byweekday;

        _.each(scope.weekDays, function(weekDay) {
          weekDay.selected = (_.contains(ruleSelectedDays, weekDay.value.weekday));
        });
      };

      scope.initFromMonthlyRule = function() {
        if(!_.isEmpty(scope.recurrenceRule.options.bymonthday) || !_.isEmpty(scope.recurrenceRule.options.bynmonthday))
          scope.initFromMonthDays();
        else if(!_.isEmpty(scope.recurrenceRule.options.bynweekday))
          scope.initFromMonthWeekDays();
      };

      scope.initFromMonthDays = function() {
        var ruleMonthDays = scope.recurrenceRule.options.bymonthday;
        scope.selectedMonthFrequency = 'day_of_month';

        _.each(scope.monthDays, function(weekDay) {
          weekDay.selected = (_.contains(ruleMonthDays, weekDay.value));
        });

        if(scope.recurrenceRule.options.bynmonthday.length > 0 && scope.recurrenceRule.options.bynmonthday[0] == -1)
          scope.monthDays[31].selected = true;
      };

      scope.initFromMonthWeekDays = function() {
        var ruleWeekMonthDays = scope.recurrenceRule.options.bynweekday;
        scope.selectedMonthFrequency = 'day_of_week';

        _.each(ruleWeekMonthDays, function(ruleArray) {
          var dayIndex = ruleArray[0];
          var weekIndex = ruleArray[1] - 1;

          var week = scope.monthWeeklyDays[weekIndex];
          _.each(week, function(day) {
            if (day.value.weekday == dayIndex) {
              day.selected = true;
              return;
            }
          });
        });
      };

      scope.ruleChanged = function() {
        if (!_.isEmpty(scope.rule)) {
          scope.parseRule(scope.rule);
        }
      };

      scope.currentRule = function() {
        return scope.rule;
      };

      scope.init();
    }
  }
}]);
