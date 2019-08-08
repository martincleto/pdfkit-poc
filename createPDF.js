const fetch = require('node-fetch');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// const FONTS_URL = 'https://aplanet-static.ams3.digitaloceanspaces.com/fonts';
const FONTS_URL = 'public/fonts';
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const BODY_COL_WIDTH = 445;
const PAGE_TOP_MARGIN = 35;
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
  return this.filter(kpi => kpi.code.startsWith(key)).pop() || { children: []};
};

const composeChapterTitle = group => `GRI ${group.code} ${group.slug}`.toUpperCase();

const drawChapterCover = function(group, title, logo) {
  const coverBgColor = group.color;
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
  
  this.image('public/images/aplanetW.png', 170, 775, { width: 110 });
  this.image('public/images/aplanetW.png', 300, 775, { width: 110 });
};

const drawSection = function(groupCategory) {
  const sectionTitle = `${groupCategory.code} ${groupCategory.slug}`.replace(/[-]/g, ' ');

  this.addPage({
    margins: {
      top: PAGE_TOP_MARGIN,
      bottom: 50,
      left: 0,
      right: 50
    },
    size: 'A4'
  });

  this.rect(0, this.y - PAGE_TOP_MARGIN, A4_WIDTH, 90).fill(groupCategory.color);

  this
    .fill('#FFFFFF')
    .font(fontsSource.extraBold, 26)
    .text(sectionTitle, 35, this.y - 10)
    .moveDown(1.8)

  for (let i = 0, len = groupCategory.children.length; i < len; i++) {
    drawItem.call(this, groupCategory.children[i]);
  }
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

  if (childrenKpis.length) {
    for (let i = 0, len = childrenKpis.length; i < len; i++) {
      const childKpiCode = childrenKpis[i].code;
      const epigraphKey = childKpiCode.slice(childKpiCode.indexOf('.')+1);
      const epigraphName = `${epigraphKey}. ${childrenKpis[i].slug}`.replace(/[-]/g, ' ');
    
      this
        .fill(kpi.color)
        .font(fontsSource.bold, 14)
        .text(epigraphName.slice(0, epigraphKey.length+1), {
          continued: true
        })
        .fill(TEXT_COLOR)
        .font(fontsSource.regular)
        .text(epigraphName.slice(epigraphKey.length+1))
        .fill(TEXT_COLOR)
        .font(fontsSource.bold, 12)
        .text(childrenKpis[i].kpi_value)
        .moveDown();
    }

    this.moveDown();
  }
};

const drawChapter = function(group, title, logo) {
  drawChapterCover.call(this, group, title, logo);

  const groupCategories = group.children;

  for (let i = 0, len = groupCategories.length; i < len; i++) {
    drawSection.call(this, groupCategories[i]);
  }
};

const createPDF = data => {
  const report = data.report;
  const fileName = `${report.period}_${report.slug}.pdf`;
  const organizationLogo = report.organization_logo;

  console.time(`${fileName} generated in`);

  const tree = report.category_tree;

  const doc = new PDFDocument({
    autoFirstPage: false,
    size: 'A4'
  });

  const kpis = {
    gri100: getKpiByGroup.call(tree, '1'),
    gri200: getKpiByGroup.call(tree, '2'),
    gri300: getKpiByGroup.call(tree, '3'),
    gri400: getKpiByGroup.call(tree, '4'),
    gri900: getKpiByGroup.call(tree, '9'),
  };

  doc.pipe(fs.createWriteStream(`${__dirname}/public/${fileName}`));

  console.info(`Generating ${fileName} ...`);

  let chapterTitle;

  if (kpis.gri100.children.length) {
    chapterTitle = composeChapterTitle(kpis.gri100);
    drawChapter.call(doc, kpis.gri100, chapterTitle, organizationLogo);
  }

  if (kpis.gri200.children.length) {
    chapterTitle = composeChapterTitle(kpis.gri200);
    drawChapter.call(doc, kpis.gri200, chapterTitle, organizationLogo);
  }

  if (kpis.gri300.children.length) {
    chapterTitle = composeChapterTitle(kpis.gri300);
    drawChapter.call(doc, kpis.gri300, chapterTitle, organizationLogo);
  }

  if (kpis.gri400.children.length) {
    chapterTitle = composeChapterTitle(kpis.gri400);
    drawChapter.call(doc, kpis.gri400, chapterTitle, organizationLogo);
  }

  if (kpis.gri900.children.length) {
    chapterTitle = composeChapterTitle(kpis.gri900);
    drawChapter.call(doc, kpis.gri900, chapterTitle, organizationLogo);
  }

  doc.end();

  console.timeEnd(`${fileName} generated in`);
};

module.exports = () => {
  return fetch('http://localhost:5000/static/data.json')
    .then(res => res.json())
    .then(json => {
      createPDF(json);
    })
    .catch(err => console.error(err));
};



