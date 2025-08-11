export const getTitleApp = (title: string) => {
  console.log("Getting title for:", title);

  if (title.includes("noon-iraq")) {
    return "Noon Iraq";
  } else if (title.includes("alghad")) {
    return "Alghad";
  } else if (title.includes("almalak")) {
    return "Almalak";
  } else {
    return "Noon Iraq";
  }
};
