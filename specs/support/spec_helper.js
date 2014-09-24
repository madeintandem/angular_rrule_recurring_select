var spies;
var stubs;

function spyOn(object, method) {
  var spy = sinon.spy(object, method);
  spies.push(spy);
  return spy;
}

function stub(object, method, retVal) {
   var stub = sinon.stub(object, method).returns(retVal);
   stubs.push(stub);
   return stub;
}

beforeEach(function() {
  spies = [];
  stubs = [];
});

afterEach(function() {
  _(spies).each(function(spy) {
    spy.restore();
  });

  _(stubs).each(function(stub) {
    stub.restore();
  });
});
