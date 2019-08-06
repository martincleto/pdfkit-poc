const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// const FONTS_URL = 'https://aplanet-static.ams3.digitaloceanspaces.com/fonts';
const FONTS_URL = 'public/fonts';
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const fontsSource = {
  regular: `${FONTS_URL}/OpenSans-Regular.ttf`,
  italic: `${FONTS_URL}/OpenSans-Italic.ttf`,
  bold: `${FONTS_URL}/OpenSans-Bold.ttf`,
  boldItalic: `${FONTS_URL}/OpenSans-BoldItalic.ttf`,
  extraBold: `${FONTS_URL}/OpenSans-ExtraBold.ttf`,
  extraBoldItalic: `${FONTS_URL}/OpenSans-ExtraBoldItalic.ttf`,
};

const getKpiByGroup = function(key) {
  return this.filter(kpi => kpi.code.startsWith(key));
};

const drawGroupCover = function(group, title) {
  const coverBgColor = group[0].color;
  const sep = title.lastIndexOf(' ');
  const titleText = [
    title.substr(0, sep),
    title.substr(sep+1)
  ];

  this.addPage();
  this.rect(0, 0, A4_WIDTH, A4_HEIGHT).fill(coverBgColor);
  this.rect(0, 206, A4_WIDTH, 164).fill('#FFFFFF');
  this
      .fill(coverBgColor)
      .moveTo(20, 200)
      .font(fontsSource.extraBold, 58)
      .text(titleText[0], 36, 220)
      .text(titleText[1], 36, 280);

  // this.image('public/images/aplanetW.png', 240, 775, { width: 110 });
};

const drawItem = function(kpi) {
  //this.rect(0, 0, A4_WIDTH, 50).fill(kpi.color);

  this
      .font(fontsSource.regular, 18)
      .text(`x: ${this.x} - y: ${this.y}`)
      .text(kpi.code)
      .text(kpi.slug)
      .moveDown()
}

const createPDF = data => {
  const doc = new PDFDocument({
    autoFirstPage: false,
    size: 'A4',
    margin: 0
  });

  const fileName = 'example.pdf'; // @TODO Compose dynamically file name according the creator

  const kpis = {
    gri100: getKpiByGroup.call(data, '1'),
    gri200: getKpiByGroup.call(data, '2'),
    gri300: getKpiByGroup.call(data, '3'),
    gri400: getKpiByGroup.call(data, '4'),
    gri900: getKpiByGroup.call(data, '9'),
  };

  console.log('GRI 100 is ', kpis.gri100.length);
  console.log('GRI 200 is ', kpis.gri200.length);
  console.log('GRI 300 is ', kpis.gri300.length);
  console.log('GRI 400 is ', kpis.gri400.length);
  console.log('GRI 900 is ', kpis.gri900.length);


  doc.pipe(fs.createWriteStream(`${__dirname}/public/${fileName}`))
  //doc.pipe(blobStream());

  if (kpis.gri100.length) {
    drawGroupCover.call(doc, kpis.gri100, 'GRI 100 UNIVERSAL');

    doc.addPage();

    doc
      .fill('#444444')
      

    for (let i = 0, len = kpis.gri100.length; i < len; i++) {
      drawItem.call(doc, kpis.gri100[i]);
    }
  }

  if (kpis.gri200.length) {
    drawGroupCover.call(doc, kpis.gri200, 'GRI 200 ECONOMIC');
  }

  if (kpis.gri300.length) {
    drawGroupCover.call(doc, kpis.gri300, 'GRI 300 ENVIRONMENTAL');
  }

  if (kpis.gri400.length) {
    drawGroupCover.call(doc, kpis.gri400, 'GRI 400 SOCIAL');
  }

  if (kpis.gri900.length) {
    drawGroupCover.call(doc, kpis.gri900, 'GRI 900 CUSTOM');
  }

  doc.end();
};

module.exports = () => {
  return fetch('http://localhost:5000/static/_mockData.json')
    .then(res => res.json())
    .then(json => {
      createPDF(json);
    })
    .catch(err => console.error(err));
};



