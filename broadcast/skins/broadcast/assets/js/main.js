// Generated by CoffeeScript 1.10.0
(function(window, $) {
  var sectionReload, win;
  win = $(window);
  ($('a[data-roca-target]')).rocaLoad();
  ($('*[data-roca-url]')).rocaConfigureContainer();
  ($('#jump-list')).on('click', 'a', function(e) {
    var el, target;
    e.preventDefault();
    el = $(this);
    target = el.attr('href');
    return ($(target)).scrollTo();
  });
  sectionReload = function(e, section) {
    return setTimeout(function() {
      return section.reload();
    }, 7000);
  };
  win.on('upload-submit', sectionReload);
  win.on('beta-signup-submit', sectionReload);
  return win.on('state-update', function(e, data) {
    if (data.forced) {
      return;
    }
    return $.popup($.template('status-update'));
  });
})(this, this.jQuery);
