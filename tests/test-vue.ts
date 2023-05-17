import { Selector, RequestLogger } from 'testcafe';

// This sample tests to confirm tests are not working as expected on running with '--native-automation'

fixture `Test somethings I found`
  .page `http://localhost:8081/`;

test('checkbox.checked', async (t) => {
  const foo2Checkbox = Selector('input[type="checkbox"]#foo-checkbox-2', { timeout: 0 });
  for (let i = 0; i < 2; i++) {
    await t
      .click(foo2Checkbox)
      .expect(foo2Checkbox.checked)
      .ok()
    // NOTE that this sample checkbox test seems working though, it does NOT work in my project which is very big vue app.
    // e.g.
    // - In this sample it shows 'true' (boolean) and 'true' (string), or false (boolean) and false (string)
    // - In my project it shows 'false' false (boolean) and 'true' (string), or false (boolean) and false (string)
    //   which means 'checked' is always false no matter click

    // console.log(await foo2Checkbox.checked);
    // console.log(await foo2Checkbox.getAttribute('aria-checked'));
    await t
      .click(foo2Checkbox)
      .expect(foo2Checkbox.checked)
      .notOk();
    // console.log(await foo2Checkbox.checked);
    // console.log(await foo2Checkbox.getAttribute('aria-checked'));
  }
});

test.only('ctrl+a', async (t) => {
  const textField = Selector('.ctrl-a input');
  await t.expect(textField.value).eql('foo is bar');
  await t.click(textField);
  await t.pressKey('ctrl+a delete');
  await t.expect(textField.value).eql('');
});

const postLogger = RequestLogger(
  /\/api\/v0\/foo/,
  { logRequestBody: true, stringifyRequestBody: true },
);
test('post body', async (t) => {
  await t.click(Selector('button').withExactText('POST'));

  const [request] = postLogger.requests;
  await t.expect(postLogger.contains(record => record.response.statusCode === 404)).ok()
  await t.expect(request.request.method).eql('post');
  await t.expect(request.request.body).eql('{"foo":"bar","number":1,"object":{"a":1,"b":"2"}}');
}).requestHooks(postLogger);

test('service worker', async (t) => {
  await t.click(Selector('button').withExactText('RUN WORKER'))
  await t.expect(Selector('.worker-message').innerText).eql('bar', { timeout: 60000 });
})
