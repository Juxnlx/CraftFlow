module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Carga variables del archivo .env y las expone como módulo "@env".
      // allowUndefined: false fuerza un error en build si falta una variable,
      // evitando bugs silenciosos en producción.
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: false,
        },
      ],
    ],
  };
};