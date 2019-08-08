(function (document) {
  fetch('static/2020-07_aplanet-gri-202007.pdf')
    .then((response) => response.blob())
    .then((blob) => {
      const iframe = document.querySelector('iframe');
      const pdfBlob = new Blob([blob], {type: 'application/pdf'});

      iframe.src = URL.createObjectURL(pdfBlob);
    })
    .catch(err => console.error(err));
})(document);