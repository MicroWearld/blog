(function () {
  // 站点覆盖版(替代主题原版):
  //   --hero-fade-distance / --hero-fade-min  控制「首页 hero」透明度淡出
  //   --hero-blur-distance / --hero-blur-max  控制「文章背景图」滚动模糊:
  //       顶部 100% 清晰 → 随下划渐进模糊 → 达距离后保持高度模糊(不再消失)
  var script = document.currentScript;
  var target = document.getElementById(script.getAttribute("data-hero-id"));
  if (!target) return;
  var cs = getComputedStyle(document.documentElement);
  var isArticleHero = target.id === "hero-background";

  var distance =
    parseFloat(cs.getPropertyValue("--hero-fade-distance")) || 500;
  var minOpacity = parseFloat(cs.getPropertyValue("--hero-fade-min"));
  if (isNaN(minOpacity)) minOpacity = 0;
  minOpacity = Math.max(0, Math.min(1, minOpacity));

  var blurDistance =
    parseFloat(cs.getPropertyValue("--hero-blur-distance")) || 900;
  var blurMax = parseFloat(cs.getPropertyValue("--hero-blur-max"));
  if (isNaN(blurMax)) blurMax = 42;
  var img =
    isArticleHero && target.querySelector("#background-image")
      ? target.querySelector("#background-image")
      : null;

  var ticking = false;
  function update() {
    ticking = false;
    if (isArticleHero && img) {
      // 文章背景:模糊随滚动 0 → blurMax(4px 步进省渲染),永不明消失
      var p = Math.min(1, window.scrollY / blurDistance);
      var blur = Math.round((p * blurMax) / 4) * 4;
      img.style.filter = "blur(" + blur + "px) saturate(1.25)";
      target.style.opacity = 1;
      target.style.visibility = "visible";
      return;
    }
    // 首页 hero:透明度淡出(保留淡影或完全消失由 CSS 变量定)
    var opacity = Math.max(minOpacity, 1 - window.scrollY / distance);
    target.style.opacity = opacity;
    target.style.visibility = opacity === 0 ? "hidden" : "visible";
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
})();
