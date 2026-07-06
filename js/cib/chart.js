import Chart from 'chart.js';

var border = {
  borderColor: 'white',
  borderSkipped: false,
  borderWidth: 6,
  hoverBorderWidth: 6
};
var LABELS = ['green', 'red', 'black', 'blue', 'rebeccapurple'];

new Chart(document.getElementById('chart'), {
  type: 'bar',
  data: {
    labels: ['Dateset 1', 'Dateset 2', 'Dateset 3', 'Dateset 4', 'Dateset 5'],
    datasets: [
    	{
      	label: LABELS[0],
        data: [308.38, 265.49, 272.79, 306.44, 336.44],
        backgroundColor: LABELS[0],
        ...border
      },
      {
      	label: LABELS[1],
        data: [391.4, 427.41, 296.67, 351.51, 380.83],
        backgroundColor: LABELS[1],
        ...border
      },
      {
      	label: LABELS[2],
        data: [386.08, 512.74, 331.05, 380.83, 445.68],
        backgroundColor:LABELS[2],
        ...border
      },
      {
      	label: LABELS[3],
        data: [340.7, 568.65, 454.08, 284.27, 640.98],
        backgroundColor: LABELS[3],
        ...border
      },
      {
      	label: LABELS[4],
        data: [280.79, 595.62, 516.52, 379.53, 735.92],
        backgroundColor:LABELS[4],
        ...border
      }
    ]
  }
});