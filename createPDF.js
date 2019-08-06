const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// const FONTS_URL = 'https://aplanet-static.ams3.digitaloceanspaces.com/fonts';
const FONTS_URL = 'public/fonts';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const BODY_COL_WIDTH = 445;
const TEXT_COLOR = '#444444';

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

  this.addPage({
    margin: 0,
    size: 'A4'
  });
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
  const childrenKpis = kpi.kpis;

  this.rect(0, this.y, 90, 22).fill(kpi.color);

  this
      .fill('#FFFFFF')
      .font(fontsSource.bold, 16)
      .text(kpi.code, 0, this.y, { 
        width: 82,
        align: 'right'
      })
      .fill(TEXT_COLOR)
      .font(fontsSource.bold, 18)
      .text(kpi.slug.replace(/[-]/g, ' '), 100, this.y - 24, {
        width: BODY_COL_WIDTH - 82
      })
      .moveDown(0.5);

  // this.font(fontsSource.regular, 14);

  if (childrenKpis.length) {
    for (let i = 0, len = childrenKpis.length; i < len; i++) {
      const childKpiCode = childrenKpis[i].code;
      const epigraphKey = childKpiCode.slice(childKpiCode.indexOf('.')+1);
      const epigraphName = `${epigraphKey}. ${childrenKpis[i].name}`.replace(/[-]/g, ' ');
    
      this
        .fill(kpi.color)
        .font(fontsSource.bold, 14)
        .text(epigraphName.slice(0, epigraphKey.length+1), {
          continued: true
        })
        .fill(TEXT_COLOR)
        .font(fontsSource.regular)
        .text(epigraphName.slice(epigraphKey.length+1), {
          lineBreak: false
        })
        .moveDown();
    }

    this.moveDown();
  }
}

const createPDF = data => {
  const doc = new PDFDocument({
    autoFirstPage: false,
    size: 'A4'
  });

  const fileName = 'example.pdf'; // @TODO Compose dynamically file name according the creator

  const pageSetupOpts = {
    margins: {
      top: 35,
      bottom: 50,
      left: 0,
      right: 50
    },
    size: 'A4'
  };

  const kpis = {
    gri100: getKpiByGroup.call(data, '1'),
    gri200: getKpiByGroup.call(data, '2'),
    gri300: getKpiByGroup.call(data, '3'),
    gri400: getKpiByGroup.call(data, '4'),
    gri900: getKpiByGroup.call(data, '9'),
  };

  // console.log('GRI 100 is ', kpis.gri100.length);
  // console.log('GRI 200 is ', kpis.gri200.length);
  // console.log('GRI 300 is ', kpis.gri300.length);
  // console.log('GRI 400 is ', kpis.gri400.length);
  // console.log('GRI 900 is ', kpis.gri900.length);


  doc.pipe(fs.createWriteStream(`${__dirname}/public/${fileName}`))
  //doc.pipe(blobStream());

  if (kpis.gri100.length) {
    drawGroupCover.call(doc, kpis.gri100, 'GRI 100 UNIVERSAL');

    doc.addPage(pageSetupOpts);

    for (let i = 0, len = kpis.gri100.length; i < len; i++) {
      drawItem.call(doc, kpis.gri100[i]);
    }
  }

  if (kpis.gri200.length) {
    drawGroupCover.call(doc, kpis.gri200, 'GRI 200 ECONOMIC');

    doc.addPage(pageSetupOpts);

    for (let i = 0, len = kpis.gri200.length; i < len; i++) {
      drawItem.call(doc, kpis.gri200[i]);
    }
  }

  if (kpis.gri300.length) {
    drawGroupCover.call(doc, kpis.gri300, 'GRI 300 ENVIRONMENTAL');

    doc.addPage(pageSetupOpts);

    for (let i = 0, len = kpis.gri300.length; i < len; i++) {
      drawItem.call(doc, kpis.gri300[i]);
    }
  }

  if (kpis.gri400.length) {
    drawGroupCover.call(doc, kpis.gri400, 'GRI 400 SOCIAL');

    doc.addPage(pageSetupOpts);

    for (let i = 0, len = kpis.gri400.length; i < len; i++) {
      drawItem.call(doc, kpis.gri400[i]);
    }
  }

  if (kpis.gri900.length) {
    drawGroupCover.call(doc, kpis.gri900, 'GRI 900 CUSTOM');

    doc.addPage(pageSetupOpts);

    for (let i = 0, len = kpis.gri900.length; i < len; i++) {
      drawItem.call(doc, kpis.gri900[i]);
    }
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



