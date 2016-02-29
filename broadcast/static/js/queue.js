// Generated by CoffeeScript 1.10.0
(function(window, $, templates) {
  'use strict';
  var handles, loadData, queues;
  queues = $('.queue');
  handles = $('.handles a.handle');
  loadData = function(url, container) {
    var res;
    res = $.get(url);
    res.done(function(data) {
      return container.html(data);
    });
    res.fail(function() {
      return container.html(templates.queueLoadError);
    });
    return res;
  };
  return handles.on('click', function(e) {
    var container, elem, target, url;
    e.preventDefault();
    elem = $(this);
    target = elem.data('target');
    container = queues.filter('.' + target);
    if (container.hasClass('hidden')) {
      url = elem.attr('href');
      queues.addClass('hidden');
      container.removeClass('hidden');
      return loadData(url, container);
    }
  });
})(this, this.jQuery, this.templates);