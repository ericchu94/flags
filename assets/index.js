$(function () {
  function getUrl(suffix) {
    var user = window.location.href.split('/').filter(function (item) {
      return item.length != 0;
    }).pop();
    console.log(user);
    return '/flags/' + user + '/' + suffix;
  }

  $('.value').bootstrapSwitch();

  $('#name').on('keyup', function (event) {
    if (event.keyCode == 13)
      $('#create').click();
  });

  $('#create').on('click', function () {
    $.ajax(getUrl($('#name').val()), {
      method: 'PUT',
    }).then(function () {
      $('#name').val('');
      $('#container').load('/ #flags', function () {
        $('.value').bootstrapSwitch();
      });
    }, function () {
      alert('Failed!');
    });
  });

  $('#container').on('switchChange.bootstrapSwitch', '.value', function (event, state) {
    var name = $(this).parents('.flag').find('.name').text();
    var checked = state;
    $.ajax(getUrl(name), {
      method: 'POST',
      data: {
        value: checked,
      },
    }).then(function () {
      $('#container').load('/ #flags', function () {
        $('.value').bootstrapSwitch();
      });
    }, function () {
      alert('Failed!');
    });
  });

  $('#container').on('click', '.delete', function () {
    var name = $(this).parents('.flag').find('.name').text();
    $.ajax(getUrl(name), {
      method: 'DELETE',
    }).then(function () {
      $('#container').load('/ #flags', function () {
        $('.value').bootstrapSwitch();
      });
    }, function () {
      alert('Failed!');
    });
  });
});
