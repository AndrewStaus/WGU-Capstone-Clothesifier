const apiUrl = 'https://xxlkbgor75nvr7qw256z2xnrdm0ppqai.lambda-url.us-east-2.on.aws'
const $alert = $('.alert');
const alertMessage = document.getElementById('alert-message')

const chart = new Chart(document.getElementById("chart"), {
  type: 'polarArea',
  data: {
    labels: [],
    datasets: [{
      backgroundColor: [
        "rgba(51,122,183,0.6)",
        "rgba(92,184,92,0.6)",
        "rgba(217,83,79,0.6)",
        "rgba(91,192,222,0.6)",
        "rgba(240,173,78,0.6)",
        "rgba(51,122,183,0.6)",
        "rgba(92,184,92,0.6)",
        "rgba(217,83,79,0.6)",
        "rgba(91,192,222,0.6)",
        "rgba(240,173,78,0.6)",
      ]
    }]
  },
  options: {
    legend: {position: 'bottom'},
  }
});

async function selectImage () {
  const photoField = fileSelect.files[0];
  try{
    if (photoField) {
      $alert.hide();
      const dataUri = await dataUriFromFormField(photoField);
    
      const fullImage = document.createElement('img');
      fullImage.addEventListener('load', () => {
        const resizedDataUri = resizeImage(fullImage, 380);
        document.querySelector('#img-preview').src = resizedDataUri;
        base64String = resizedDataUri.replace("data:", "").replace(/^.+,/, "");
        uploadFile(base64String)
      });
      if (dataUri.length > 5){
        fullImage.src = dataUri;
      } else {
        throw new Error('Unable to load image')
      }
    }
  } catch (err) {
    alertMessage.innerHTML = err.message
    $alert.show()
  }
}

function dataUriFromFormField (field) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });
      reader.readAsDataURL(field);
    });
}

function resizeImage (fullImage, newWidth) {
  try{
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const aspect = fullImage.width / fullImage.height;

    canvas.width = newWidth;
    canvas.height = newWidth / aspect;

    ctx.drawImage(fullImage, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  } catch (err) {
    throw new Error('Failed to resize image')
  }
}

async function uploadFile (base64String) {
  clearResults();
  let formData = new FormData();
  formData.append("filedata", base64String)

  $.ajax(apiUrl + '/image', {
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
              
      success: function (response) {
          document.getElementById('result').innerHTML = response.category
          updateFigures(response.confs)
          },
      error: function (response) {
          console.log(response)
          throw new Error('Failed to upload image')
          }
  });
}

function clearResults () {
  $("#table").find("tr:not(:first)").remove();
  document.getElementById('result').innerHTML = 'Loading results...';
}

function updateFigures (json) {
  // update the chart and table
  var table = document.getElementById("table");
  $("#table").find("tr:not(:first)").remove();

  labels = []
  data = []

  var count = 1
  for(property in json){
    // table update
    var row = table.insertRow();
    var pos = row.insertCell(0);
    var name = row.insertCell(1);
    var conf = row.insertCell(2);

    pos.innerHTML = count++;
    name.innerHTML = `${json[property].name}`;
    conf.innerHTML = `${json[property].conf}%`;

    // chart update
    var d = json[property].conf
    var l = json[property].name
    if (d >= 5) {
      labels.push(l)
      data.push(d)
    }
  }
  chart.data.datasets[0].data = data
  chart.data.labels = labels
  chart.update()
}