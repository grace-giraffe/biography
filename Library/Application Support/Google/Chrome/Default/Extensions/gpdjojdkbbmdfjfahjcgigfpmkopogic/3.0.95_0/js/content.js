// logic loader

((w, d) => {
  var $ = {
    w,
    d,
    b: chrome || browser,
    v: {},
    f: {
      // console.log to background window
      debug: o => {
        if (o && $.v.debug) {
          console.log(o);
        }
      },
      // tag window, write logic
      init: () => {
        var t;
        $.d.b = $.d.getElementsByTagName('BODY')[0];
        // are we on a page?
        if ($.d.b && $.d.URL) {
          // get our domain
          t = $.d.URL.split('/');
          if (t[2]) {
            // are we on Pinterest?
            if (t[2].match(/pinterest\.com$/)) {
              // tag so Pinterest knows the extension is installed
              $.f.debug('Setting tag on Pinterest domain.');
              $.d.b.setAttribute('data-pinterest-extension-installed', $.v.xv);
            } else {
              $.f.debug('Not on Pinterest; no tag set.');
            }
          }
          // we're injecting into all iframes because the bookmarklet grid comes up inside one and we need to tag it if it's a Pinterest domain
          // but we don't want to execute our business logic inside iframes, because there are potentially millions of them on a page
          if ($.w.self === $.w.top) {
            // do we have our business logic?
            if ($.v.logic) {
              // attempt to run
              try {
                eval($.v.logic);
              } catch (err) {
                $.f.debug('Logic could not eval.');
              }
            }
          }
        }
      } 
    }
  };
  // get everything in local storage and then init
  $.b.storage.local.get(null, function(data) {
    for (var i in data) {
      $.v[i] = data[i];
    }
    $.f.init();
  });
})(window, document);
