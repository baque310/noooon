export const getTitleApp = (title: string) => {
  console.log("Getting title for:", title);

  if (title.includes("dashboard.noon-iraq")) {
    return "Noon Iraq";
  } else if (title.includes("alghad-dashboard")) {
    return "Alghad";
  } else if (title.includes("almalak-dashboard")) {
    return "Almalak";
  } else {
    return "Noon Iraq";
  }
};
