const main = async () => {
  const m = await import("zengin-code");
  const zenginCode = m.default;

  const bankList = Object.entries(zenginCode).map(([code, { name }]) => ({
    code,
    name,
  }));

  console.log(bankList);
};

main();
