const getThemeColor = () => {
  let currentTheme = localStorage.getItem("theme");
  let systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
    
  if (currentTheme === "system") currentTheme = systemTheme;
  let mainColor, subColor, mainHoverColor, mainImageFilter, subImageFilter;
  if (currentTheme === "dark" || !currentTheme) {
    mainColor = "#000137";
    subColor = "white";
    mainHoverColor = "#282f5f";
    mainImageFilter =
      "invert(6%) sepia(63%) saturate(3693%) hue-rotate(232deg) brightness(91%) contrast(117%)";
    subImageFilter =
      "invert(100%) sepia(0%) saturate(0%) hue-rotate(73deg) brightness(104%) contrast(101%)";
  } else {
    mainColor = "white";
    subColor = "#000137";
    mainHoverColor = "#282f5f";
    mainImageFilter =
      "invert(100%) sepia(0%) saturate(0%) hue-rotate(73deg) brightness(104%) contrast(101%)";
    subImageFilter =
      "invert(6%) sepia(63%) saturate(3693%) hue-rotate(232deg) brightness(91%) contrast(117%)";
  }

  document.documentElement.style.setProperty("--main-color", mainColor);
  document.documentElement.style.setProperty(
    "--main-hover-color",
    mainHoverColor
  );
  document.documentElement.style.setProperty("--sub-color", subColor);
  document.documentElement.style.setProperty(
    "--main-image-filter",
    mainImageFilter
  );
  document.documentElement.style.setProperty(
    "--sub-image-filter",
    subImageFilter
  );

  document.body.style.visibility = "visible";
  return {
    mainColor,
    subColor,
    mainHoverColor,
    mainImageFilter,
    subImageFilter,
  };
};

export default getThemeColor;
