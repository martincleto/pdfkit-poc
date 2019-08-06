const fs = require('fs');

const moduleCreatePDF = require('./createPDF');

const mockData = require('./public/_mockData.json');


beforeEach(() => {
  fetch.resetMocks();
  fetch.mockResponse(JSON.stringify(mockData));
})

test('must retrieve the data', done => {
  moduleCreatePDF().then(() => {
    done();
    expect(fetch.mock.calls.length).toEqual(1);
  });
});

test('must create a PDF file', () => {
  moduleCreatePDF().then(() => {
    expect(fs.existsSync('./public/example.pdf')).toBeTruthy();
  });
});
