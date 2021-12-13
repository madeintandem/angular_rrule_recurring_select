angular.module('rruleRecurringSelect', ["ui.bootstrap.datetimepicker", "fng.uiBootstrapDateTime", ]).directive('rruleRecurringSelect', ["$timeout", function($timeout) {
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
      var programaticChange = false;

      scope.init = function() {
        scope.showStart = typeof attrs['showStart'] !== "undefined";
        scope.dispStart = attrs['dispStart'];
        scope.showEnd = typeof attrs['showEnd'] !== "undefined";
        scope.compact = typeof attrs['compact'] !== "undefined";
        scope.simplifiedDaily = typeof attrs['simplifiedDaily'] !== "undefined";
        scope.noHourly = typeof attrs['noHourly'] !== "undefined";
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
        } else {
          scope.calculateRRule();
        }          
      };

      scope.initFrequencies = function() {
        scope.frequencies = [];
        if (!scope.noHourly) {
          scope.frequencies.push({name: 'Hourly', rruleType: RRule.HOURLY, type: 'hour'})
        }
        scope.selectedFrequency = { name: 'Daily', rruleType: RRule.DAILY, type: 'day' };
        scope.frequencies.push(
            scope.selectedFrequency,
            { name: 'Weekly', rruleType: RRule.WEEKLY, type: 'week', initFunc: initFromWeeklyRule },
            { name: 'Monthly', rruleType: RRule.MONTHLY, type: 'month', initFunc: initFromMonthlyRule },
            { name: 'Yearly', rruleType: RRule.YEARLY, type: 'year', initFunc: initFromYearlyRule });
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

      scope.initHours = function () {
        var hoursFunc = attrs['hoursFunc'] || 'hoursOfDay';
        const wasHours = scope.hours;
        const hours = scope[hoursFunc]();
        scope.hours = angular.copy(hours);
        if (wasHours) {
          for (const wasHour of wasHours) {
            if (wasHour.selected && wasHour.id) {
              const hour = scope.hours.find((h) => h.id === wasHour.id);
              if (hour) {
                hour.selected = true;
              }
            }
          }
        }
      }

      scope.resetData = function() {
        scope.weekStart = attrs['weekStartDay'] || 'SU';
        scope.defaultUntil = attrs['defaultUntil'];
        scope.weekDays = scope.daysOfWeek();
        scope.initHours();
        scope.initMonthlyDays();
        scope.initMonthlyWeeklyDays();
        scope.initYearlyMonths();  
        scope.selectedYearMonth = 1;
        scope.selectedYearMonthDay = 1;
        scope.interval = 1;
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
        var hoursArray;
        if (typeof scope.$parent.personMedsSlots === "function") {
          hoursArray = scope.$parent.personMedsSlots();
        } else {
          // use the notional four per day
          for (var i = 0 ; i < MedsSessions.length ; i++) {
            var slot = MedsSessions[i];
            hoursArray.push({value: slot.value, name: slot.name, selected: false})
          }
        }
        return hoursArray;
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
        // Don't do this, else we'll lose our selections from the 'other' mode.  It's ok to keep selections
        // from both modes and simply use the ones that apply to the currently-selected mode.
        //scope.resetData();
        scope.calculateRRule();
      };

      scope.toggleSelected = function(day) {
        day.selected = !day.selected;
        scope.calculateRRule();
      };

      scope.setRecurUntil = function() {
        if (!scope.recurEnd.until) {
          var defaultRecurEndBase;
          if (scope.defaultUntil) {
            defaultRecurEndBase = parseInt(scope.defaultUntil);
          } else {
            // Go to the end of the current day
            defaultRecurEndBase = new Date().getTime() + (MS_IN_DAY * 60);
            var ms = defaultRecurEndBase % MS_IN_DAY;
            defaultRecurEndBase = defaultRecurEndBase - ms;
          }
          if (defaultRecurEndBase < scope.minUntil) {
            defaultRecurEndBase = scope.minUntil;
          }
          scope.recurEnd.until = new Date(defaultRecurEndBase);
        }
      };

      scope.freqChanged = function() {
        // There is no need to clear selections when the user switches frequency.  By maintaining selections, they
        // see something sensible when switching from one frequency to another and then back again.  We'll only actually
        // be using the selections from the last-selected frequency...
        //scope.resetData();
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
            scope.setRecurUntil();
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

        if(!_.isUndefined(scope.rule)) {
          programaticChange = true;
          scope.rule = scope.recurrenceRule.toString();
          $timeout(() => {
            // let the watch on scope.rule fire before we reset this variable so it will know that 
            // it has detected a programatic rule change
            programaticChange = false;
          });
        }          
      };

      scope.calculateInterval = function() {
        var interval = parseInt(scope.interval);
        if (!interval) {
          interval = 1;
        }
        return interval;
      };

      function calculateRule(ruleOptions, recurEndObj, doHours) {
        if (doHours) {
          var selectedHours = _(scope.hours).filter(function(hour) {
            return hour.selected;
          }).map(function(v) { return v.value }).value();
          if (selectedHours.length > 0) {
            ruleOptions.byhour = selectedHours;
            ruleOptions.byminute = ruleOptions.bysecond = 0;
          }
        }
        ruleOptions.interval = scope.calculateInterval();
        ruleOptions.wkst = RRule[scope.weekStart];

        angular.extend(ruleOptions, recurEndObj);
        
        scope.recurrenceRule = new RRule(ruleOptions);
      };

      scope.calculateHourlyRRule = function(recurEndObj) {
        var ruleOptions = {
          freq: RRule.HOURLY,
        };
        calculateRule(ruleOptions, recurEndObj, false);
      };

      scope.calculateDailyRRule = function(recurEndObj) {
        var ruleOptions = {
          freq: RRule.DAILY,
        };
        calculateRule(ruleOptions, recurEndObj, true);
      };

      scope.calculateWeeklyRRule = function(recurEndObj) {
        var selectedDays = _(scope.weekDays).filter(function(day) {
          return day.selected;
        }).map(function(v) { return v.value }).value();
        var ruleOptions = {
          freq: RRule.WEEKLY,
          byweekday: selectedDays
        }
        calculateRule(ruleOptions, recurEndObj, true);
      };

      scope.calculateMonthlyRRule = function(recurEndObj) {
        if(scope.selectedMonthFrequency == 'day_of_month') {
          scope.calculateDayOfMonthRRule(recurEndObj);
        } else {
          scope.calculateDayOfWeekRRule(recurEndObj);
        }
      };

      scope.calculateDayOfMonthRRule = function(recurEndObj) {
        var selectedDays = _(scope.monthDays).filter(function(day) {
          return day.selected;
        }).map(function(v) { return v.value }).value();
        var ruleOptions = {
          freq: RRule.MONTHLY,
          bymonthday: selectedDays
        }
        calculateRule(ruleOptions, recurEndObj, true);
      };

      scope.calculateDayOfWeekRRule = function(recurEndObj) {
        var selectedDays = _(scope.monthWeeklyDays).flatten().filter(function(day) {
          return day.selected;
        }).map(function(v) { return v.value }).value();
        var ruleOptions = {
          freq: RRule.MONTHLY,
          byweekday: selectedDays
        }
        calculateRule(ruleOptions, recurEndObj, true);
      };

      scope.calculateYearlyRRule = function(recurEndObj) {
        var selectedMonths = _(scope.yearMonths).flatten().sortBy(function(month){
          return month.value;
        }).filter(function(month) {
          return month.selected;
        }).map(function(v) { return v.value }).value();

        var selectedDays = _(scope.yearMonthDays).flatten().sortBy(function(day){
          return day.value;
        }).filter(function(day) {
          return day.selected;
        }).map(function(v) { return v.value }).value();
        var ruleOptions = {
          freq: RRule.YEARLY,
          bymonth: selectedMonths,
          bymonthday: selectedDays
        }
        calculateRule(ruleOptions, recurEndObj, true);
      };

      function initHours() {
        var ruleSelectedHours = scope.recurrenceRule.options.byhour;

        _.each(scope.hours, function(hour) {
          hour.selected = (_.includes(ruleSelectedHours, hour.value));
        });
      };

      scope.parseRule = function(rRuleString) {
        rRuleString = rRuleString.replace("WKST=0", "WKST=MO");
        scope.recurrenceRule = RRule.fromString(rRuleString);

        scope.interval = scope.recurrenceRule.options.interval;

        scope.selectedFrequency = _.filter(scope.frequencies, function(frequency) {
          return frequency.rruleType == scope.recurrenceRule.options.freq;
        })[0];

        initHours();

        switch(scope.selectedFrequency.type) {
          case 'week':
            scope.initFromWeeklyRule();
            break;
          case 'month':
            scope.initFromMonthlyRule();
            break;
          case 'year':
            scope.initFromYearlyRule();
            break;
        }

        scope.initFromRecurEndRule();
      };

      scope.initFromRecurEndRule = function() {
        scope.recurEnd = {};
        scope.setRecurUntil();
        if (scope.recurrenceRule.options.until) {
          scope.recurEnd.type = 'on';
          // Handle use of timezones in RRule
          if (scope.recurrenceRule.options.until._moment) {
            scope.recurEnd.until = scope.recurrenceRule.options.until._moment.toDate();
          } else {
            scope.recurEnd.until = scope.recurrenceRule.options.until;
          }
        } else if (scope.recurrenceRule.options.count) {
          scope.recurEnd.type = 'after';
          scope.recurEnd.count = scope.recurrenceRule.options.count;
        } else {
          scope.recurEnd.type = 'never';
        }
      };

      function initFromWeeklyRule() {
        var ruleSelectedDays = scope.recurrenceRule.options.byweekday;

        _.each(scope.weekDays, function(weekDay) {
          weekDay.selected = (_.includes(ruleSelectedDays, weekDay.value.weekday));
        });
      };
      scope.initFromWeeklyRule = initFromWeeklyRule;

      function initFromYearlyRule() {
        var ruleMonthDays = scope.recurrenceRule.options.bymonthday;
        _.each(scope.yearMonthDays, function(monthDay) {
          monthDay.selected = (_.includes(ruleMonthDays, monthDay.value));
        });
        if (scope.recurrenceRule.options.bynmonthday.length > 0 && scope.recurrenceRule.options.bynmonthday[0] == -1) {
          scope.yearMonthDays[31].selected = true;
        }

        var ruleMonths = scope.recurrenceRule.options.bymonth;
        _.each(scope.yearMonths, function(month) {
          month.selected = (_.includes(ruleMonths, month.value));
        });
      }
      scope.initFromYearlyRule = initFromYearlyRule;

      function initFromMonthlyRule() {
        if (!_.isEmpty(scope.recurrenceRule.options.bymonthday) || !_.isEmpty(scope.recurrenceRule.options.bynmonthday)) {
          scope.initFromMonthDays();
        } else if (!_.isEmpty(scope.recurrenceRule.options.bynweekday)) {
          scope.initFromMonthWeekDays();
        }          
      };
      scope.initFromMonthlyRule = initFromMonthlyRule;

      scope.initFromMonthDays = function() {
        var ruleMonthDays = scope.recurrenceRule.options.bymonthday;
        scope.selectedMonthFrequency = 'day_of_month';

        _.each(scope.monthDays, function(weekDay) {
          weekDay.selected = (_.includes(ruleMonthDays, weekDay.value));
        });

        if (scope.recurrenceRule.options.bynmonthday.length > 0 && scope.recurrenceRule.options.bynmonthday[0] == -1) {
          scope.monthDays[31].selected = true;
        }
      };

      scope.initFromMonthWeekDays = function() {
        var ruleWeekMonthDays = scope.recurrenceRule.options.bynweekday;
        scope.selectedMonthFrequency = 'day_of_week';

        // reset them so the user's previous selections aren't retained when cancelling.
        // this is excessive and it should be possible to set .selected values to false
        // in the next loop, but I don't understand it and cannot step through so brute-
        // force will have to do for now
        scope.monthWeeklyDays = [];
        _.times(4, function(index) {
          var days = _.map(scope.daysOfWeek(), function(dayOfWeek){
            dayOfWeek.value = dayOfWeek.value.nth(index + 1);
            return dayOfWeek;
          });
          scope.monthWeeklyDays.push(days);
        });

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

      scope.untilDateOptions = {
          "showWeeks": false
      };

      scope.ruleChanged = function() {
        // we only need to do this for changes to the rule made externally to this module.  scope.rule
        // will be changed by the calculateRRule(...) function as a result of various user inputs made
        // internally, but in this case, we don't need to reinitialise the UI as it will already be in sync.
        // (Generally, reinitialising the UI would be pointless yet harmless, but for Monthly mode
        // it is actually destructive as it will lead to selections from the "other" mode being lost.)
        if (!_.isEmpty(scope.rule) && !programaticChange) {
          // first, we will initialise selections for all frequencies that have them.  doing this means that
          // if the user switches frequency, they see selections that make sense for that frequency based
          // upon the value of dtstart contained in scope.rule
          let noFrequencyOpts = RRule.parseString(scope.rule);
          for (const prop in noFrequencyOpts) {
            if (["bysetpos", "bymonth", "bymonthday", "bynmonthday", "byyearday", "byweekno", "byweekday", "bynweekday", "byhour", "byminute", "bysecond", "byeaster"].includes(prop)) {
              delete noFrequencyOpts[prop];
            }
          }
          for (const freq of scope.frequencies) {
            if (freq.initFunc) {
              let opts = angular.copy(noFrequencyOpts);
              opts.freq = freq.rruleType;
              scope.recurrenceRule = new RRule(opts);
              freq.initFunc();
            }
          }
          // and then finally we initialise the rest of the UI according to the currently-selected frequency
          scope.parseRule(scope.rule);
        }
      };

      scope.currentRule = function() {
        return scope.rule;
      };

      scope.$on("reInitHours", function () {
        scope.initHours();
        scope.calculateRRule();
      });

      scope.init();
    }
  }
}]);
