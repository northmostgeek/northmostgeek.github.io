/* 文档页多语言切换（zh / en / ja …）
 *
 * 用法：
 *   1. 页面放一个按钮：<button class="lang-toggle" id="langToggle" type="button"></button>
 *   2. 每个语种包一层： <div class="lang lang-zh" lang="zh"> … </div>
 *   3. 引入本脚本并声明语种：
 *      <script src="/assets/js/lang-switch.js" data-langs="zh,en,ja" defer></script>
 *
 * 支持 ?lang=xx 直达链接，切换时会把语种写回地址栏，方便分享。
 */
(function () {
  "use strict";

  var self = document.currentScript || document.querySelector("script[data-langs]");
  if (!self) return;

  // 本脚本成功执行后才启用「只显示当前语种」；加载失败时三语全显，不会白屏
  document.documentElement.classList.add("js");

  var LANGS = (self.getAttribute("data-langs") || "zh,en").split(",");
  var DEFAULT_LANG = self.getAttribute("data-default") || LANGS[0];
  var BUTTON_ID = self.getAttribute("data-button") || "langToggle";
  var button = document.getElementById(BUTTON_ID);

  // 按钮上显示的「下一语种」名称，未知语种直接回落到语种代码
  var NATIVE = {
    zh: "中文",
    en: "English",
    ja: "日本語",
    ko: "한국어",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
  };

  function label(lang) {
    return NATIVE[lang] || lang;
  }

  function current() {
    for (var i = 0; i < LANGS.length; i++) {
      if (document.documentElement.classList.contains("lang-" + LANGS[i])) return LANGS[i];
    }
    return DEFAULT_LANG;
  }

  function setLang(lang, syncUrl) {
    var classes = document.documentElement.classList;
    for (var i = 0; i < LANGS.length; i++) classes.remove("lang-" + LANGS[i]);
    classes.add("lang-" + lang);
    document.documentElement.lang = lang;

    var blocks = document.querySelectorAll(".lang");
    for (var j = 0; j < blocks.length; j++) {
      blocks[j].style.display = blocks[j].classList.contains("lang-" + lang) ? "block" : "none";
    }

    if (button) {
      var next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
      button.textContent = label(next);
      button.setAttribute("aria-label", "Switch language / 切换语言：" + label(next));
    }

    if (syncUrl && history.replaceState) {
      var url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  function detect() {
    var query = new URLSearchParams(location.search).get("lang");
    if (query && LANGS.indexOf(query) !== -1) return query;

    var preferred = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < preferred.length; i++) {
      var tag = (preferred[i] || "").toLowerCase();
      for (var j = 0; j < LANGS.length; j++) {
        if (tag.indexOf(LANGS[j].toLowerCase()) === 0) return LANGS[j];
      }
    }
    return DEFAULT_LANG;
  }

  setLang(detect(), false);

  if (button) {
    button.addEventListener("click", function () {
      setLang(LANGS[(LANGS.indexOf(current()) + 1) % LANGS.length], true);
    });
  }
})();
