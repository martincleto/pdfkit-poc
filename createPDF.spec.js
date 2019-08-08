const fs = require('fs');

const moduleCreatePDF = require('./createPDF');

const mockData = require('./public/data.json');

beforeEach(() => {
  fetch.resetMocks();
  fetch.mockResponse(JSON.stringify(mockData));
})

test('must retrieve the data', async () => {
  await moduleCreatePDF()
    .then(() => {
      expect(fetch.mock.calls.length).toEqual(1);
    })
    .catch(error => console.error(error));
});

test('must create a PDF file', async () => {
  await moduleCreatePDF()
    .then(() => {
      expect(fs.existsSync('./public/example.pdf')).toBeTruthy();
    })
    .catch(error => console.error(error));
});
