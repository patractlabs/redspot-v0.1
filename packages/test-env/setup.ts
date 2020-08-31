//@ts-ignore
global.beforeAll(async () => {
  //@ts-ignore
  const redspotConfig = config;

  await redspotConfig.loadApi();
  await redspotConfig.loadKeyring();

  jest.setTimeout(40000)
});
