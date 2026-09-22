const path = window.location.pathname.replace(/\/+$/, "") || "/";
if (path === "/explore/guns" || path.startsWith("/explore/guns/")) {
  void import("./gun-guide").then(({ showGunGuide }) =>
    showGunGuide(path, window.location.search),
  );
} else {
  void import("./main");
}
