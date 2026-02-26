export const getTitleApp = (title: string) => {
  if (title.includes("alghad-dashboard")) {
    return "Alghad";
  } else if (title.includes("almalak-dashboard")) {
    return "Almalak";
  } else {
    return "Noon Iraq";
  }
};
