describe("ActivityChart Directive", function() {
  var scope, element, directiveScope, compile, httpBackend;

  var scopedApp = angular.module('testApp', ['rruleRecurringSelect']);

  beforeEach(module('testApp'));
  beforeEach(module('rruleTemplates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend, $templateCache) {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe("without a rule passed in", function() {
    beforeEach(function() {
      element = compile('<rrule_recurring_select></rrule_recurring_select>')(scope);
      scope.$digest();
      directiveScope = element.isolateScope();
    });

    describe("#init", function() {
      it("sets up the frequencies", function() {
        expect(_.pluck(directiveScope.frequencies, 'name')).to.eql(['Daily', 'Weekly', 'Monthly', 'Yearly']);
      });

      it("sets the daily frequency as the default", function() {
        expect(directiveScope.selectedFrequency.name).to.equal('Daily');
      });
    });
  });

  // describe("with a rule passed in ", function() {
  //   describe("every 2 days for 4 times", function() {
  //     beforeEach(function() {
  //       scope.rule = "FREQ=DAILY;INTERVAL=2;COUNT=4";
  //       element = compile('<rrule_recurring_select rule="rule"></rrule_recurring_select>')(scope);
  //       scope.$digest();
  //       directiveScope = element.isolateScope();
  //     });
  //   });
  // });
});
