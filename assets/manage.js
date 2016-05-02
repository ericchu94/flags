$(function () {
  $('#value').bootstrapSwitch();

  $('#save').on('click', function () {
    var checked = $('#value').is(':checked');
    $.ajax('/flag/' + $('#name').text(), {
      method: 'PUT',
      data: checked,
    }).then(function () {
      window.location = '/';
    }, function () {
      alert('Failed!');
    });
  });
});
