if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}
var Localize = function(options) {
  this.init(options);
};
jQuery.extend(Localize.prototype, {
  lang: 'en',
  defLang: null,
  cache: {},
  loadedFunc: null,

  options: {
    language: null,
    skipLanguage: null,
    pathPrefix: '',
    timeout: 500,
    callBack: null
  },

  _normaliseLang: function(lang) {
    lang = lang.replace(/_/, '-').toLowerCase();
    if (lang.length > 3) {
      lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
    }
    return lang;
  },

  _saveCahe: function(file, data) {
    var d = {};
    d[file] = data;
    if(!this.cache[this.lang]) {
      this.cache[this.lang] = {};
    }
    jQuery.extend(this.cache[this.lang], d);
    return this;
  },

  _loadLanguages: function(files, n) {
    var self = this, file;
    if(files[n]) {
      file = files[n].split('.')[0];
      if(!(self.cache[self.lang] && self.cache[self.lang][file])) {
        self._loadLanFile(file)
        .done(function(data) {
          self._saveCahe(file, data);
          self._loadLanguages(files, n+=1);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
          self._loadLanguages(files, n+=1);
        });
      } else {
        self._loadLanguages(files, n+=1);
      }
    } else {
      if( typeof(self.loadedFunc) === 'function' ) {
        self.loadedFunc();
      }
    }
  },

  _loadLanFile: function(file) {
    var filePath = this.options.pathPrefix + '/' + this.lang + '/' + file + '.json';
    var defer = jQuery.Deferred();
    jQuery.ajax({
      url: filePath,
      timeout: this.options.timeout,
      dataType: 'json',
      type: 'post',
      success: defer.resolve,
      error: defer.reject
    });
    return defer;
  },

  _getValueForKey: function(word, key, data) {
    var keys, value;
    value = data[this.lang];
    keys = key.split('.');
    keys.push(word);
    for(var i=0, l=keys.length; i<l; i+=1) {
      key = keys[i];
      value = (value !== null && value[key])? value[key] : null;
    }
    return value;
  },

  _dispatchEvent: function(callBack, value) {
    if( typeof(callBack) === 'function' ) {
      callBack(value);
    }
    return this;
  },

  // Initialize
  init: function(options) {
    var self = this, o;
    if( jQuery.isPlainObject( options ) ) {
      self.options = jQuery.extend({}, self.options, options);
    }
    o = self.options;
    if(o.language) {
      self.lang = self._normaliseLang(o.language);
    }
    if(o.skipLanguage) {
      self.defLang = self._normaliseLang(o.skipLanguage);
    }
  },

  // set language
  language: function(lang) {
    if(lang) {
      this.lang = this._normaliseLang(lang);
    }
  },
  skipLanguage: function(lang) {
    if(lang) {
      this.defLang = this._normaliseLang(lang);
    }
  },

  // load lang file
  load: function(files, func) {
    var self = this;
    if(!Array.isArray(files)) {
      files = [files];
    }
    this.loadedFunc = func;
    this._loadLanguages(files, 0);
  },

  // reset Cache
  reset: function(lang) {
    if(this.cache[lang]) {
      delete this.cache[lang];
    } else if(!lang) {
      this.cache = {};
    }
  },

  // transrate
  transrate: function(word, pkg, callBack) {
    var self = this, o = self.options, file, value;

    callBack = typeof(callBack) === 'function'? callBack : o.callBack;

    if(this.lang !== this.defLang) {
      file = pkg.split('.')[0];
      if(self.cache[self.lang] && self.cache[self.lang][file]) {
        // use Cache
        value = self._getValueForKey(word, pkg, self.cache);
        value = value || word;
        self._dispatchEvent(callBack, value);
        return value;
      } else {
        // Load Language
        this._loadLanFile(file)
        .done(function(data) {
          // SUCCESS
          self._saveCahe(file, data);
          value = self._getValueForKey(word, pkg, self.cache);
          self._dispatchEvent(callBack, value || word);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          // ERROR
          console.log(jqXHR, textStatus, errorThrown);
          self._dispatchEvent(callBack, word);
        });
      }
    } else {
      self._dispatchEvent(callBack, word);
      return word;
    }
  }

});
