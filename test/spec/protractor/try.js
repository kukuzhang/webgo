describe('Say Hello', function() {
  var ptor = protractor.getInstance();

  beforeEach(function() {
    ptor.get('#/game/530646106fd95c5f18255794');
    //var button = ptor.findElement(protractor.By.className('btn-say-hello'));
    //button.click();
  });

  it('says hello', function() {
    var message = ptor.findElement(protractor.By.className('webgo-white'));
    expect(message.getText()).toContain('white');
  });
});
