$(function () {
  $('#value').bootstrapSwitch();

  $('#save').on('click', function () {
    var checked = $('#value').is(':checked');
    $.ajax('/flag/' + $('#name').text(), {
      method: 'PUT',
      data: {
        value: checked,
      },
    }).then(function () {
      window.location = '/';
    }, function () {
      alert('Failed!');
    });
  });
});
