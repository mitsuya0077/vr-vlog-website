(() => {
  const destinations = new Map([
    ["#privacy", "/privacy/"],
    ["#contact", "/support/#contact"],
  ]);
  const mobileSections = [
    "#capture", "#samples", "#features", "#howto", "#log", "#make-vlog",
    "#ar", "#avatar", "#vroid-hub", "#liltoon", "#perfect-sync", "#editing",
    "#support", "#free-access", "#android-beta",
  ];
  for (const fragment of mobileSections) {
    destinations.set(fragment, `/mobile/${fragment}`);
  }

  function followLegacyLink() {
    const path = destinations.get(location.hash);
    if (!path) return;

    const target = new URL(path, location.origin);
    target.search = location.search;
    location.replace(target.href);
  }

  followLegacyLink();
  addEventListener("hashchange", followLegacyLink);
})();
