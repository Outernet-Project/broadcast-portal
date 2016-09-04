// Generated by CoffeeScript 1.10.0
(function(window, $) {
  $.win = $(window);
  $.body = $('body');
  $.htmlBody = $('html, body');
  $.afterNCalls = function(count, fn) {
    return function() {
      count -= 1;
      if (count < 1) {
        return fn.apply(this, [].slice.call(arguments, 0));
      }
    };
  };
  return $.fn.scrollTo = function(cb) {
    var el;
    el = $(this);
    $.htmlBody.animate({
      scrollTop: el.offset().top
    }, 1000, cb);
    return el;
  };
})(this, this.jQuery);